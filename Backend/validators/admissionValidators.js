import { z } from 'zod';

export const updateAdmissionStatusSchema = z.object({
  status: z.enum([
    'admitted',
    'documents_pending',
    'documents_verified',
    'prospectus_cleared',
    'appointment_scheduled',
    'verified',
    'enrolled',
    'deferred',
    'cancelled',
  ]),
  notes: z.string().optional(),
});

export const updateStudentProfileSchema = z.object({
  fullName: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  programme: z.string().optional(),
  residentialStatus: z.enum(['Day', 'Boarding']).optional(),
  academicYear: z.string().optional(),
  aggregateScore: z.union([z.string(), z.number()]).optional(),
  juniorHighSchool: z.string().optional(),
  homeTown: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().optional(),
  guardianRelation: z.string().optional(),
  notes: z.string().optional(),
  placementSlipUploaded: z.boolean().optional(),
  placementSlipFileName: z.string().nullable().optional(),
  guardianInfo: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  medicalInfo: z.object({
    bloodGroup: z.string().optional(),
    allergies: z.array(z.string()).optional(),
    chronicConditions: z.array(z.string()).optional(),
    specialNeeds: z.string().optional(),
  }).optional(),
});
