import mongoose from 'mongoose';

const DocumentReviewHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewerName: { type: String, default: 'Admissions Officer' },
    adminFeedback: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now }
  },
  { _id: false }
);

const DocumentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      index: true
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      default: null,
      index: true
    },
    schoolId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    documentRequirementId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Placement & Enrollment',
        'Academic Records',
        'Identity & Bio-data',
        'Identification',
        'Health & Welfare',
        'Guardian Records',
        'Special Clearances'
      ],
      index: true
    },
    required: {
      type: Boolean,
      default: true
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: [
        'not_submitted',
        'submitted',
        'under_review',
        'provisionally_accepted',
        'accepted',
        'changes_required'
      ],
      default: 'not_submitted',
      index: true
    },
    fileName: {
      type: String,
      default: null
    },
    fileSize: {
      type: String,
      default: null
    },
    fileSizeBytes: {
      type: Number,
      default: null
    },
    mimeType: {
      type: String,
      default: null
    },
    storageKey: {
      type: String,
      default: null
    },
    fileUrl: {
      type: String,
      default: null
    },
    uploadedAt: {
      type: Date,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    adminFeedback: {
      type: String,
      default: null
    },
    history: [DocumentReviewHistorySchema]
  },
  {
    timestamps: true
  }
);

DocumentSchema.index({ student: 1, documentRequirementId: 1 });
DocumentSchema.index({ schoolId: 1, status: 1 });

export const Document = mongoose.model('Document', DocumentSchema);
