import { z } from 'zod';

export const requestRecordSchema = z.object({
  documentType: z.enum([
    'transcript',
    'recommendation_letter',
    'wassce_certificate_collection',
    'testimonial',
    'statement_of_results',
    'english_proficiency',
    'attestation_letter',
  ]),
  deliveryPreference: z.enum([
    'physical_pickup',
    'in_person_collection',
    'courier',
    'certified_postal',
    'digital_portal',
    'secure_digital_delivery',
    'institution_direct_dispatch',
  ]).default('physical_pickup'),
  numberOfCopies: z.number().int().min(1).max(10).optional(),
  copiesCount: z.number().int().min(1).max(10).optional(),
  recipientOrganization: z.string().optional(),
  recipientAddress: z.string().optional(),
  purpose: z.string().optional().default('Personal Records & Verification'),
  urgentProcessing: z.boolean().default(false),
  schoolId: z.string().optional(),
  requesterDetails: z.object({
    fullName: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    indexNumber: z.string().optional(),
    completionYear: z.number().optional(),
  }).optional(),
});

export const clearanceActionSchema = z.object({
  department: z.enum(['finance', 'library', 'stores', 'academic_office', 'administration']).optional(),
  status: z.enum(['cleared', 'outstanding_obligation', 'waived', 'disputed']),
  obligationDescription: z.string().optional(),
  amountDue: z.number().optional().default(0),
  explanation: z.string().optional(),
  outstandingObligation: z.object({
    description: z.string().optional(),
    amountDue: z.number().optional().default(0),
    currency: z.string().default('GHS'),
    actionRequired: z.string().optional(),
  }).optional(),
});

export const raiseDisputeSchema = z.object({
  reason: z.string().min(5, 'Dispute rationale must provide at least 5 characters of explanation'),
  studentEvidenceNote: z.string().optional(),
});

export const updateRequestWorkflowSchema = z.object({
  identityVerificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  academicVerificationStatus: z.enum(['pending', 'verified', 'rejected']).optional(),
  clearanceStatus: z.enum(['pending', 'in_progress', 'cleared', 'blocked']).optional(),
  preparationStatus: z.enum(['pending', 'in_preparation', 'ready_for_dispatch', 'completed']).optional(),
  approvalStatus: z.enum(['pending', 'approved', 'rejected']).optional(),
  collectionStatus: z.enum(['uncollected', 'ready_for_pickup', 'collected', 'dispatched']).optional(),
  notes: z.string().optional(),
});
