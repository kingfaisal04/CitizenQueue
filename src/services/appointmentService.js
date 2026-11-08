/**
 * CitizenQueue - Appointment Service Layer
 * 
 * Manages appointment creation, capacity verification, lifecycle state transitions,
 * and visitor verification checklists.
 */

import { Storage } from './storageService';

export const APPOINTMENT_STATUSES = {
  BOOKED: 'booked',
  CHECKED_IN: 'checked_in',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const AppointmentService = {
  /**
   * Retrieve all appointments
   */
  getAll: () => {
    return Storage.getAppointments();
  },

  /**
   * Find an appointment by its ID or Reference Number
   */
  getById: (idOrRef) => {
    const list = Storage.getAppointments();
    return (
      list.find(
        (apt) => apt.id === idOrRef || apt.referenceNumber?.toLowerCase() === idOrRef?.toLowerCase()
      ) || null
    );
  },

  /**
   * Filter appointments by user/citizen (for demo, returns citizen's appointments)
   */
  getCitizenAppointments: () => {
    const list = Storage.getAppointments();
    // In our prototype, all stored appointments are citizen-visible demonstration bookings
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Create a new appointment with local slot capacity validation
   */
  createAppointment: ({
    service,
    date,
    slot,
    visitor
  }) => {
    // 1. Basic validation
    if (!service || !date || !slot || !visitor) {
      return { success: false, error: 'Missing required appointment details.' };
    }

    if (!visitor.parentName?.trim() || !visitor.contactPhone?.trim()) {
      return { success: false, error: 'Parent/Guardian name and contact phone are required.' };
    }

    // 2. Slot capacity verification
    const allAvailability = Storage.getAvailability();
    const serviceDates = allAvailability[service.id] || [];
    const dateEntry = serviceDates.find((d) => d.date === date);
    const targetSlot = dateEntry?.slots.find((s) => s.id === slot.id);

    if (targetSlot && targetSlot.bookedCount >= targetSlot.capacity) {
      return {
        success: false,
        error: `Selected slot at ${slot.time} has reached maximum demonstration capacity (${targetSlot.capacity}/${targetSlot.capacity}). Please choose another slot.`
      };
    }

    // 3. Duplicate local booking prevention
    const currentAppointments = Storage.getAppointments();
    const isDuplicate = currentAppointments.some((apt) => {
      const isSameService = apt.serviceId === service.id;
      const isSameDate = apt.appointmentDate === date;
      const isSameContact =
        apt.visitor?.contactPhone?.trim().toLowerCase() === visitor.contactPhone?.trim().toLowerCase();
      const isActive = apt.status === 'booked' || apt.status === 'checked_in';
      return isSameService && isSameDate && isSameContact && isActive;
    });

    if (isDuplicate) {
      return {
        success: false,
        error: 'An active appointment for this contact number already exists for this service on the selected date.'
      };
    }

    // 4. Generate Reference & ID
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = `CQ-2026-${randomDigits}`;
    const newId = `apt-cq-${randomDigits}`;

    // 5. Construct Checklist from service requirements
    const checklist = (service.requirements || []).map((reqText, index) => ({
      id: `c-${index + 1}`,
      label: reqText,
      verified: false
    }));

    // 6. Build Appointment object
    const newAppointment = {
      id: newId,
      referenceNumber,
      serviceId: service.id,
      serviceName: service.name,
      institutionId: service.institutionId,
      institutionName: service.institutionName,
      location: service.location || 'Administration Desk',
      appointmentDate: date,
      appointmentTime: slot.time,
      slotId: slot.id,
      status: APPOINTMENT_STATUSES.BOOKED,
      delayNotice: service.delayNotice || null,
      visitor: {
        parentName: visitor.parentName.trim(),
        contactPhone: visitor.contactPhone.trim(),
        contactEmail: visitor.contactEmail?.trim() || '',
        studentName: visitor.studentName?.trim() || '',
        studentIndex: visitor.studentIndex?.trim() || '',
        notes: visitor.notes?.trim() || ''
      },
      checklist,
      createdAt: new Date().toISOString(),
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'Appointment booked online via CitizenQueue prototype'
        }
      ]
    };

    // 7. Update slot capacity count
    if (targetSlot) {
      targetSlot.bookedCount = (targetSlot.bookedCount || 0) + 1;
      Storage.setAvailability(allAvailability);
    }

    // 8. Save appointment
    const updatedAppointments = [newAppointment, ...currentAppointments];
    Storage.setAppointments(updatedAppointments);

    // 9. Create notification for citizen
    const notifications = Storage.getNotifications();
    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `Booking Confirmed: ${referenceNumber}`,
      message: `Your appointment at ${service.institutionName} for ${date} at ${slot.time} is confirmed in DEMO MODE.`,
      date: new Date().toISOString(),
      isRead: false,
      type: 'confirmation'
    };
    Storage.setNotifications([newNotification, ...notifications]);

    return {
      success: true,
      appointment: newAppointment
    };
  },

  /**
   * Update appointment status (booked, checked_in, in_progress, completed, cancelled, no_show)
   */
  updateStatus: (appointmentId, newStatus, note = '') => {
    const list = Storage.getAppointments();
    const aptIndex = list.findIndex((a) => a.id === appointmentId);
    if (aptIndex === -1) {
      return { success: false, error: 'Appointment not found.' };
    }

    const apt = list[aptIndex];
    const oldStatus = apt.status;
    apt.status = newStatus;

    // Record in history log
    const historyEntry = {
      timestamp: new Date().toISOString(),
      action: note
        ? `Status updated to ${newStatus}: ${note}`
        : `Status changed from ${oldStatus} to ${newStatus}`
    };
    apt.history = [...(apt.history || []), historyEntry];

    // If cancelled, release slot capacity
    if (newStatus === APPOINTMENT_STATUSES.CANCELLED && oldStatus !== APPOINTMENT_STATUSES.CANCELLED) {
      const allAvailability = Storage.getAvailability();
      const serviceDates = allAvailability[apt.serviceId] || [];
      const dateEntry = serviceDates.find((d) => d.date === apt.appointmentDate);
      const slot = dateEntry?.slots.find((s) => s.id === apt.slotId);
      if (slot && slot.bookedCount > 0) {
        slot.bookedCount -= 1;
        Storage.setAvailability(allAvailability);
      }
    }

    list[aptIndex] = apt;
    Storage.setAppointments(list);

    return { success: true, appointment: apt };
  },

  /**
   * Cancel an appointment (Citizen action)
   */
  cancelAppointment: (appointmentId, reason = 'Cancelled by visitor') => {
    return AppointmentService.updateStatus(
      appointmentId,
      APPOINTMENT_STATUSES.CANCELLED,
      reason
    );
  },

  /**
   * Toggle document verification item on the checklist
   */
  toggleChecklistItem: (appointmentId, checklistItemId) => {
    const list = Storage.getAppointments();
    const apt = list.find((a) => a.id === appointmentId);
    if (!apt) return null;

    const item = (apt.checklist || []).find((c) => c.id === checklistItemId);
    if (item) {
      item.verified = !item.verified;
      Storage.setAppointments(list);
    }
    return apt;
  }
};
