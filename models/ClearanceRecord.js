import mongoose from 'mongoose';

const ClearanceHistorySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    status: { type: String, required: true },
    officer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    officerName: { type: String, default: 'Officer' },
    note: { type: String, default: '' }
  },
  { _id: false }
);

const ClearanceRecordSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
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
    academicRecordRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AcademicRecordRequest',
      required: true,
      index: true
    },
    department: {
      type: String,
      required: true,
      enum: ['finance', 'library', 'stores', 'academic_office', 'administration'],
      index: true
    },
    status: {
      type: String,
      enum: ['cleared', 'outstanding_obligation', 'waived', 'disputed'],
      default: 'cleared',
      index: true
    },
    obligationDescription: {
      type: String,
      default: ''
    },
    amountDue: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      default: 'GHS'
    },
    officerResponsible: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    officerName: {
      type: String,
      default: ''
    },
    disputeReason: {
      type: String,
      default: null
    },
    disputeStatus: {
      type: String,
      enum: ['none', 'under_investigation', 'resolved_cleared', 'upheld'],
      default: 'none'
    },
    disputeRaisedAt: {
      type: Date,
      default: null
    },
    confirmedAt: {
      type: Date,
      default: Date.now
    },
    history: [ClearanceHistorySchema]
  },
  {
    timestamps: true
  }
);

ClearanceRecordSchema.index({ academicRecordRequest: 1, department: 1 }, { unique: true });
ClearanceRecordSchema.index({ schoolId: 1, status: 1 });

export const ClearanceRecord = mongoose.model('ClearanceRecord', ClearanceRecordSchema);
