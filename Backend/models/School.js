import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Generates a readable, high-entropy Institution Authorization Key
 * e.g. CQ-ACH-7K9M2X
 */
export function generateInstitutionKey(shortCode = 'SHS') {
  const cleanPrefix = (shortCode || 'SHS')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 4) || 'SHS';
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  return `CQ-${cleanPrefix}-${randomPart}`;
}

const StaffRosterEntrySchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    fullName: {
      type: String,
      trim: true,
      default: ''
    },
    assignedRole: {
      type: String,
      enum: [
        'admin',
        'school_admin',
        'academic_officer',
        'housemaster',
        'registrar',
        'finance_officer',
        'library_officer',
        'collection_officer'
      ],
      default: 'academic_officer'
    },
    designation: {
      type: String,
      trim: true,
      default: ''
    },
    department: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'claimed', 'revoked'],
      default: 'pending'
    },
    claimedByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: true }
);

const DocumentRequirementSchema = new mongoose.Schema(
  {
    docId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    required: { type: Boolean, default: true },
    description: { type: String, default: '' },
    acceptedMimeTypes: [{ type: String }],
    maxSizeMB: { type: Number, default: 5 }
  },
  { _id: false }
);

const SchoolSchema = new mongoose.Schema(
  {
    schoolId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    shortName: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['Senior High School', 'Tertiary Institution', 'Technical Institute'],
      default: 'Senior High School',
      index: true
    },
    region: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    contactPhone: {
      type: String,
      trim: true
    },
    operatingHours: {
      type: String,
      default: 'Monday – Friday: 8:00 AM – 4:00 PM'
    },
    badge: {
      type: String,
      default: 'Public Secondary'
    },
    verified: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
    },
    documentRequirements: [DocumentRequirementSchema],
    // Institutional onboarding security key (never returned in public GET /schools)
    authorizationKey: {
      type: String,
      trim: true,
      select: false,
      default: null
    },
    authorizationKeyUpdatedAt: {
      type: Date,
      default: null
    },
    // Pre-authorized Staff ID -> Role roster managed by School Administrators
    authorizedStaffRoster: {
      type: [StaffRosterEntrySchema],
      select: false,
      default: []
    },
    appointmentSettings: {
      slotDurationMinutes: { type: Number, default: 20 },
      maxBookingDaysInAdvance: { type: Number, default: 30 },
      cancellationCutoffHours: { type: Number, default: 2 },
      allowReschedule: { type: Boolean, default: true }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

SchoolSchema.index({ region: 1, category: 1 });

export const School = mongoose.model('School', SchoolSchema);
