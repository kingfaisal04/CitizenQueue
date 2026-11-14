import mongoose from 'mongoose';
import {
  Appointment,
  AppointmentSlot,
  Service,
  School,
  Student,
  Admission,
  AuditLog,
} from '../models/index.js';
import { ApiError } from '../utils/ApiError.js';

export class AppointmentService {
  /**
   * List available booking slots for a service/school on a given date
   */
  static async getAvailableSlots(schoolId, serviceId, date = null) {
    const query = { schoolId, isActive: true };
    if (serviceId) query.serviceId = serviceId;
    if (date) query.date = date;

    const slots = await AppointmentSlot.find(query).sort({ date: 1, time: 1 });

    return slots.map((slot) => ({
      _id: slot._id,
      slotId: slot.slotId,
      schoolId: slot.schoolId,
      serviceId: slot.serviceId,
      date: slot.date,
      time: slot.time,
      capacity: slot.capacity,
      bookedCount: slot.bookedCount,
      remaining: Math.max(0, slot.capacity - slot.bookedCount),
      isAvailable: slot.bookedCount < slot.capacity && slot.isActive,
    }));
  }

  /**
   * Concurrency-safe atomic appointment booking
   */
  static async bookAppointment({
    studentUser = null,
    schoolId,
    serviceId,
    slotId,
    appointmentDate,
    timeSlot,
    purpose = 'CSSPS Admission Reporting & Desk Verification',
    visitorDetails = {},
    ipAddress = null,
    userAgent = null,
  }) {
    // 1. Resolve school & service
    const school = await School.findOne({ schoolId });
    const service = await Service.findOne({ serviceId });

    if (!service) {
      throw ApiError.notFound(`Service with identifier ${serviceId} not found`);
    }

    // 2. Resolve Student details
    let student = null;
    if (studentUser) {
      student = await Student.findOne({ user: studentUser._id });
    }

    const parentName = visitorDetails.parentName || studentUser?.name || 'Parent / Guardian';
    const contactPhone = visitorDetails.contactPhone || studentUser?.phone || student?.guardianPhone || '0240000000';
    const contactEmail = visitorDetails.contactEmail || studentUser?.email || '';
    const studentName = visitorDetails.studentName || student?.fullName || studentUser?.name || 'Candidate';
    const studentIndex = visitorDetails.studentIndex || student?.beceIndexNumber || 'N/A';

    // 3. Prevent duplicate active bookings for the candidate or phone on the same service & date
    const existingBooking = await Appointment.findOne({
      serviceId,
      appointmentDate,
      status: { $in: ['booked', 'checked_in', 'in_progress'] },
      $or: [
        { 'visitor.studentIndex': studentIndex },
        { 'visitor.contactPhone': contactPhone },
      ],
    });

    if (existingBooking) {
      throw ApiError.conflict(
        `An active appointment already exists for ${studentName} (${studentIndex}) on ${appointmentDate}. Reference: ${existingBooking.referenceNumber}`
      );
    }

    // 4. ATOMIC CAPACITY CHECK & INCREMENT ON THE APPOINTMENT SLOT
    // Determine whether slotId is a Mongoose ObjectId or business string
    const isObjectId = mongoose.Types.ObjectId.isValid(slotId);
    const slotQuery = isObjectId
      ? { _id: slotId, isActive: true, $expr: { $lt: ['$bookedCount', '$capacity'] } }
      : { slotId, isActive: true, $expr: { $lt: ['$bookedCount', '$capacity'] } };

    const reservedSlot = await AppointmentSlot.findOneAndUpdate(
      slotQuery,
      { $inc: { bookedCount: 1 } },
      { new: true }
    );

    if (!reservedSlot) {
      throw ApiError.conflict('The selected appointment slot is fully booked or no longer available');
    }

    // 5. Generate secure, human-readable booking reference
    const dateSegment = appointmentDate.replace(/-/g, '');
    const randomSegment = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referenceNumber = `CQ-BK-${dateSegment}-${randomSegment}`;

    // 6. Build official institutional desk checklist
    const checklist = [
      { id: 'chk-cssps', label: 'Original CSSPS Placement Form Verified', verified: false },
      { id: 'chk-bece', label: 'BECE Official Result Slip Verified', verified: false },
      { id: 'chk-medical', label: 'School Medical Examination Form Endorsed', verified: false },
      { id: 'chk-prospectus', label: 'Boarding/Day Prospectus Items Inspected', verified: false },
      { id: 'chk-photo', label: 'Passport Photographs Submitted (4 copies)', verified: false },
      { id: 'chk-id', label: 'Student Enrolment ID Generated & Handed Over', verified: false },
    ];

    // 7. Create Appointment record
    const appointment = new Appointment({
      referenceNumber,
      student: student?._id || null,
      school: school?._id || null,
      schoolId: school?.schoolId || schoolId,
      service: service._id,
      serviceId: service.serviceId,
      serviceName: service.name,
      institutionName: school?.name || service.institutionName || 'Achimota Senior High School',
      location: service.location || 'Administration Block',
      slot: reservedSlot._id,
      slotId: reservedSlot.slotId,
      appointmentDate,
      appointmentTime: timeSlot || reservedSlot.time,
      status: 'booked',
      visitor: {
        parentName,
        contactPhone,
        contactEmail,
        studentName,
        studentIndex,
        notes: visitorDetails.notes || purpose,
      },
      checklist,
      history: [
        {
          timestamp: new Date(),
          action: 'APPOINTMENT_BOOKED',
          performedBy: studentUser?._id || null,
          performerName: studentUser?.name || 'Candidate / Citizen',
        },
      ],
    });

    await appointment.save();

    // 8. If linked to student, link to Admission record
    if (student) {
      await Admission.findOneAndUpdate(
        { student: student._id },
        {
          appointment: appointment._id,
          'stages.6.isCompleted': true,
          'stages.6.completedAt': new Date(),
        }
      );
    }

    // 9. Audit log
    await AuditLog.create({
      user: studentUser?._id || null,
      userName: parentName,
      userRole: studentUser?.role || 'citizen',
      schoolId: school?.schoolId || schoolId,
      action: 'APPOINTMENT_BOOKED',
      targetResource: 'Appointment',
      targetId: appointment._id.toString(),
      details: {
        referenceNumber,
        slotId: reservedSlot.slotId,
        date: appointmentDate,
        time: timeSlot,
      },
      ipAddress,
      userAgent,
    });

    return appointment.toObject();
  }

  /**
   * Safely cancel an appointment and atomically restore slot capacity
   */
  static async cancelAppointment(appointmentId, requestingUser, cancellationReason = 'Cancelled by requester') {
    const isObjectId = mongoose.Types.ObjectId.isValid(appointmentId);
    const appointment = await Appointment.findOne(
      isObjectId ? { _id: appointmentId } : { referenceNumber: appointmentId }
    );

    if (!appointment) {
      throw ApiError.notFound('Appointment record not found');
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      throw ApiError.badRequest(`Cannot cancel an appointment that is already ${appointment.status}`);
    }

    // Verify ownership: Admin can cancel any; student can only cancel their own
    if (['citizen', 'student'].includes(requestingUser.role)) {
      const student = await Student.findOne({ user: requestingUser._id });
      const isOwner =
        (appointment.student && student && appointment.student.toString() === student._id.toString()) ||
        appointment.visitor.contactPhone === requestingUser.phone;
      if (!isOwner) {
        throw ApiError.forbidden('You do not have permission to cancel this appointment');
      }
    }

    // Atomically decrement slot bookedCount to restore availability
    if (appointment.slot) {
      await AppointmentSlot.findByIdAndUpdate(appointment.slot, {
        $inc: { bookedCount: -1 },
      });
    }

    appointment.status = 'cancelled';
    appointment.cancellationReason = cancellationReason;
    appointment.cancelledAt = new Date();
    appointment.history.push({
      timestamp: new Date(),
      action: 'APPOINTMENT_CANCELLED',
      performedBy: requestingUser._id,
      performerName: requestingUser.name,
    });

    await appointment.save();

    // If student has an admission record, reset stage 7 completion
    if (appointment.student) {
      await Admission.findOneAndUpdate(
        { student: appointment.student },
        {
          appointment: null,
          'stages.6.isCompleted': false,
          'stages.6.completedAt': null,
        }
      );
    }

    return appointment.toObject();
  }

  /**
   * Update arrival desk status (checked_in, with_officer, completed, no_show)
   */
  static async updateDeskStatus(appointmentId, officerUser, deskStatus, officerNotes = '') {
    const isObjectId = mongoose.Types.ObjectId.isValid(appointmentId);
    const appointment = await Appointment.findOne(
      isObjectId ? { _id: appointmentId } : { referenceNumber: appointmentId }
    );

    if (!appointment) {
      throw ApiError.notFound('Appointment record not found');
    }

    appointment.status = deskStatus;
    appointment.history.push({
      timestamp: new Date(),
      action: `DESK_STATUS_${deskStatus.toUpperCase()}`,
      performedBy: officerUser._id,
      performerName: officerUser.name,
    });

    await appointment.save();

    // If completed or checked in, advance admission progress
    if (appointment.student) {
      const admission = await Admission.findOne({ student: appointment.student });
      if (admission) {
        if (deskStatus === 'checked_in') {
          admission.stages[7].isCompleted = true; // Stage 8
          admission.stages[7].completedAt = new Date();
          admission.registrationStatus = 'checked_in';
        } else if (deskStatus === 'completed') {
          admission.stages[7].isCompleted = true;
          admission.stages[7].completedAt = new Date();
          admission.stages[8].isCompleted = true; // Stage 9
          admission.stages[8].completedAt = new Date();
          admission.readinessScore = 100;
          admission.registrationStatus = 'completed';
        }
        await admission.save();
      }
    }

    return appointment.toObject();
  }

  /**
   * Verify an item on the appointment physical reporting checklist
   */
  static async toggleChecklistItem(appointmentId, officerUser, itemKey, verified) {
    const isObjectId = mongoose.Types.ObjectId.isValid(appointmentId);
    const appointment = await Appointment.findOne(
      isObjectId ? { _id: appointmentId } : { referenceNumber: appointmentId }
    );

    if (!appointment) {
      throw ApiError.notFound('Appointment record not found');
    }

    let found = false;
    appointment.checklist.forEach((item) => {
      if (item.id === itemKey) {
        item.verified = verified;
        found = true;
      }
    });

    if (!found) {
      appointment.checklist.push({ id: itemKey, label: itemKey, verified });
    }

    appointment.history.push({
      timestamp: new Date(),
      action: `CHECKLIST_${itemKey.toUpperCase()}_${verified ? 'VERIFIED' : 'UNCHECKED'}`,
      performedBy: officerUser._id,
      performerName: officerUser.name,
    });

    await appointment.save();
    return appointment.toObject();
  }
}
