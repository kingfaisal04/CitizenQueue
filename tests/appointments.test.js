import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import {
  School,
  Service,
  AppointmentSlot,
  Appointment,
  User,
  Student,
  Admission,
} from '../models/index.js';
import { generateAccessToken } from '../utils/tokenUtils.js';

describe('Appointments & Capacity Scheduling Concurrency Suite', () => {
  setupTestDB();

  let school, service, slot, studentUser, studentToken, adminUser, adminToken;

  beforeEach(async () => {
    school = await School.create({
      schoolId: 'inst-1',
      name: 'Achimota Senior High School',
      shortName: 'Achimota',
      category: 'Senior High School',
      region: 'Greater Accra',
      city: 'Accra',
      address: 'Achimota Forest Area',
    });

    service = await Service.create({
      serviceId: 'srv-101',
      schoolId: 'inst-1',
      institutionId: 'inst-1',
      institutionName: 'Achimota Senior High School',
      name: 'Fresh SHS Students Admission Completion',
      category: 'Admissions & Enrollment',
      description: 'Official verification of CSSPS placement results slip and house placement.',
      durationMinutes: 20,
      isActive: true,
    });

    // Create a slot with strictly 1 available capacity for concurrency testing
    slot = await AppointmentSlot.create({
      school: school._id,
      schoolId: 'inst-1',
      service: service._id,
      serviceId: 'srv-101',
      slotId: 'slot-srv-101-2026-10-30-0900AM',
      date: '2026-10-30',
      time: '09:00 AM',
      capacity: 1, // Only 1 seat
      bookedCount: 0,
      isActive: true,
    });

    // Create student
    studentUser = await User.create({
      name: 'Kwame Mensah',
      email: 'kwame@example.com',
      phone: '0244112233',
      password: 'Password123!',
      role: 'student',
      school: school._id,
      schoolId: 'inst-1',
    });
    studentToken = generateAccessToken(studentUser);

    const student = await Student.create({
      user: studentUser._id,
      school: school._id,
      schoolId: 'inst-1',
      assignedSchool: 'Achimota Senior High School',
      beceIndexNumber: '101245089',
      fullName: 'Kwame Mensah',
      programme: 'General Science',
      guardianName: 'Guardian',
      guardianPhone: '0244112233',
    });

    await Admission.create({
      student: student._id,
      school: school._id,
      schoolId: 'inst-1',
      beceIndexNumber: '101245089',
      currentStage: 2,
      stages: [
        { stage: 1, title: 'Placement Accepted', isCompleted: true },
        { stage: 2, title: 'Biodata Verified', isCompleted: false },
        { stage: 3, title: 'Documents Uploaded', isCompleted: false },
        { stage: 4, title: 'Documents Verified', isCompleted: false },
        { stage: 5, title: 'Prospectus Acquired', isCompleted: false },
        { stage: 6, title: 'Items Inspected', isCompleted: false },
        { stage: 7, title: 'Appointment Scheduled', isCompleted: false },
        { stage: 8, title: 'Desk Clearance', isCompleted: false },
        { stage: 9, title: 'Enrolled', isCompleted: false },
      ],
    });

    // Create admin
    adminUser = await User.create({
      name: 'Admissions Officer',
      email: 'officer@achimota.edu.gh',
      phone: '0240009999',
      password: 'Password123!',
      role: 'admin',
      school: school._id,
      schoolId: 'inst-1',
    });
    adminToken = generateAccessToken(adminUser);
  });

  it('should successfully book an appointment and increment slot bookedCount atomically', async () => {
    const res = await request(app)
      .post('/api/v1/appointments/book')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        slotId: slot.slotId,
        serviceId: 'srv-101',
        appointmentDate: '2026-10-30',
        timeSlot: '09:00 AM',
        purpose: 'CSSPS Verification',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNumber).toContain('CQ-BK-20261030');

    // Verify slot bookedCount in database
    const updatedSlot = await AppointmentSlot.findById(slot._id);
    expect(updatedSlot.bookedCount).toBe(1);
  });

  it('should reject a second concurrent booking when slot capacity is exhausted (Concurrency Safety)', async () => {
    // First booking consumes capacity (1/1)
    await request(app)
      .post('/api/v1/appointments/book')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        slotId: slot.slotId,
        serviceId: 'srv-101',
        appointmentDate: '2026-10-30',
        timeSlot: '09:00 AM',
      });

    // Second user tries to book the same exhausted slot
    const secondUser = await User.create({
      name: 'Second Candidate',
      email: 'second@example.com',
      phone: '0248889999',
      password: 'Password123!',
      role: 'citizen',
    });
    const secondToken = generateAccessToken(secondUser);

    const secondRes = await request(app)
      .post('/api/v1/appointments/book')
      .set('Authorization', `Bearer ${secondToken}`)
      .send({
        slotId: slot.slotId,
        serviceId: 'srv-101',
        appointmentDate: '2026-10-30',
        timeSlot: '09:00 AM',
      });

    expect(secondRes.status).toBe(409);
    expect(secondRes.body.success).toBe(false);
    expect(secondRes.body.error).toContain('fully booked or no longer available');
  });

  it('should allow student to cancel their appointment and restore slot capacity', async () => {
    const bookingRes = await request(app)
      .post('/api/v1/appointments/book')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        slotId: slot.slotId,
        serviceId: 'srv-101',
        appointmentDate: '2026-10-30',
        timeSlot: '09:00 AM',
      });

    const appointmentId = bookingRes.body.data._id;

    // Slot is now 1/1
    let slotCheck = await AppointmentSlot.findById(slot._id);
    expect(slotCheck.bookedCount).toBe(1);

    // Cancel appointment
    const cancelRes = await request(app)
      .post(`/api/v1/appointments/${appointmentId}/cancel`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ cancellationReason: 'Change of schedule' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.status).toBe('cancelled');

    // Slot bookedCount restored to 0
    slotCheck = await AppointmentSlot.findById(slot._id);
    expect(slotCheck.bookedCount).toBe(0);
  });

  it('should allow officer to update desk status and checklist items', async () => {
    const bookingRes = await request(app)
      .post('/api/v1/appointments/book')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        slotId: slot.slotId,
        serviceId: 'srv-101',
        appointmentDate: '2026-10-30',
        timeSlot: '09:00 AM',
      });

    const appointmentId = bookingRes.body.data._id;

    // Check-in at desk
    const statusRes = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/desk-status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ deskStatus: 'checked_in' });

    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('checked_in');

    // Toggle checklist item
    const checkRes = await request(app)
      .patch(`/api/v1/appointments/${appointmentId}/checklist`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ itemKey: 'chk-cssps', verified: true });

    expect(checkRes.status).toBe(200);
    const item = checkRes.body.data.checklist.find((c) => c.id === 'chk-cssps');
    expect(item.verified).toBe(true);
  });
});
