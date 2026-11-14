import mongoose from 'mongoose';

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
