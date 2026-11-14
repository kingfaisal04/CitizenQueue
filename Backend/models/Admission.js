import mongoose from 'mongoose';

const StageStatusSchema = new mongoose.Schema(
  {
    stage: { type: Number, required: true },
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { _id: false }
);

const ProspectusItemStatusSchema = new mongoose.Schema(
  {
    itemId: { type: String, required: true },
    purchased: { type: Boolean, default: false },
    photoStatus: {
      type: String,
      enum: ['not_submitted', 'awaiting_review', 'provisionally_accepted', 'changes_required'],
      default: 'not_submitted'
    },
    photoName: { type: String, default: null },
    photoUrl: { type: String, default: null },
    storageKey: { type: String, default: null },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    adminFeedback: { type: String, default: null }
  },
  { _id: false }
);

const AdmissionSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
      unique: true,
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
    beceIndexNumber: {
      type: String,
      required: true,
      index: true
    },
    currentStage: {
      type: Number,
      min: 1,
      max: 9,
      default: 1
    },
    readinessScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    registrationStatus: {
      type: String,
      enum: [
        'profile_pending',
        'documents_pending',
        'items_pending',
        'pre_arrival_review',
        'ready_for_reporting',
        'appointment_booked',
        'checked_in',
        'completed'
      ],
      default: 'profile_pending',
      index: true
    },
    stages: [StageStatusSchema],
    prospectusStatuses: [ProspectusItemStatusSchema],
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    },
    houseAllocation: {
      houseName: { type: String, default: null },
      roomNumber: { type: String, default: null },
      allocatedAt: { type: Date, default: null }
    },
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

AdmissionSchema.index({ schoolId: 1, registrationStatus: 1, readinessScore: -1 });

export const Admission = mongoose.model('Admission', AdmissionSchema);
