import mongoose from 'mongoose';

const RecordRequestHistorySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    performerName: { type: String, default: 'System' },
    notes: { type: String, default: '' },
  },
  { _id: false }
);

const AcademicRecordRequestSchema = new mongoose.Schema(
  {
    requestReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      default: null,
      index: true,
    },
    schoolId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    requesterName: {
      type: String,
      required: true,
      trim: true,
    },
    requesterPhone: {
      type: String,
      required: true,
      trim: true,
    },
    requesterEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    indexNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    completionYear: {
      type: Number,
      required: true,
      default: 2025,
    },
    documentType: {
      type: String,
      required: true,
      enum: [
        'transcript',
        'testimonial',
        'statement_of_results',
        'recommendation_letter',
        'attestation_letter',
        'wassce_certificate_collection',
        'english_proficiency',
      ],
      index: true,
    },
    copiesCount: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    purpose: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryPreference: {
      type: String,
      enum: [
        'in_person_collection',
        'physical_pickup',
        'certified_postal',
        'courier',
        'secure_digital_delivery',
        'digital_portal',
        'institution_direct_dispatch',
      ],
      default: 'physical_pickup',
    },
    identityVerified: {
      type: Boolean,
      default: false,
    },
    academicVerified: {
      type: Boolean,
      default: false,
    },
    departmentClearanceStatus: {
      type: String,
      enum: ['pending', 'cleared', 'held_for_obligations', 'disputed'],
      default: 'pending',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    collectionStatus: {
      type: String,
      enum: ['pending_preparation', 'ready_for_collection', 'collected'],
      default: 'pending_preparation',
      index: true,
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    collectedAt: {
      type: Date,
      default: null,
    },
    collectedBy: {
      name: { type: String, default: null },
      idType: { type: String, default: null },
      idNumber: { type: String, default: null },
    },
    history: [RecordRequestHistorySchema],
  },
  {
    timestamps: true,
  }
);

AcademicRecordRequestSchema.index({ schoolId: 1, indexNumber: 1 });
AcademicRecordRequestSchema.index({ schoolId: 1, approvalStatus: 1, collectionStatus: 1 });

export const AcademicRecordRequest = mongoose.model('AcademicRecordRequest', AcademicRecordRequestSchema);
