import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    assignedSchool: {
      type: String,
      required: true,
      trim: true
    },
    beceIndexNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      index: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      index: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    dateOfBirth: {
      type: String,
      default: '2010-01-01'
    },
    programme: {
      type: String,
      required: true,
      trim: true
    },
    residentialStatus: {
      type: String,
      enum: ['Boarding', 'Day'],
      default: 'Boarding'
    },
    aggregateScore: {
      type: String,
      trim: true,
      default: '10'
    },
    juniorHighSchool: {
      type: String,
      trim: true,
      default: ''
    },
    homeTown: {
      type: String,
      trim: true,
      default: ''
    },
    placementBatch: {
      type: String,
      default: 'CSSPS 2026 Batch A'
    },
    guardianName: {
      type: String,
      required: true,
      trim: true
    },
    guardianPhone: {
      type: String,
      required: true,
      trim: true
    },
    guardianEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    guardianRelation: {
      type: String,
      default: 'Guardian'
    },
    placementSlipUploaded: {
      type: Boolean,
      default: false
    },
    placementSlipFileName: {
      type: String,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    isComplete: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

StudentSchema.index({ schoolId: 1, beceIndexNumber: 1 });
StudentSchema.index({ schoolId: 1, fullName: 'text', beceIndexNumber: 'text' });

export const Student = mongoose.model('Student', StudentSchema);
