import { z } from 'zod';

export const bookAppointmentSchema = z.object({
  slotId: z.string().min(1, 'Target appointment slotId is required'),
  serviceId: z.string().min(1, 'Service identifier is required'),
  appointmentDate: z.string().min(1, 'Appointment date is required'),
  timeSlot: z.string().min(1, 'Time slot string is required (e.g. 08:30 - 09:00)'),
  purpose: z.string().optional().default('General Verification and Biometric Clearance'),
  notes: z.string().optional(),
});

export const updateDeskStatusSchema = z.object({
  deskStatus: z.enum(['pending', 'checked_in', 'with_officer', 'completed', 'no_show']),
  officerNotes: z.string().optional(),
});

export const toggleChecklistSchema = z.object({
  itemKey: z.string().min(1, 'Checklist item key is required'),
  verified: z.boolean(),
});

export const createSlotSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  time: z.string().min(1, 'Time is required (e.g. 09:00 AM)'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1').default(25),
});

export const bulkCreateSlotsSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  times: z.array(z.string()).min(1),
  capacity: z.number().int().min(1).default(25),
});
