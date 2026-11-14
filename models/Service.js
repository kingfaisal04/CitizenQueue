import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
    institutionName: {
      type: String,
      required: true,
      trim: true
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
        'Admissions & Enrollment',
        'Records & Certification',
        'Identity & Registration',
        'Health & Clearance',
        'General Administration'
      ],
      default: 'Admissions & Enrollment',
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      default: 'Administration Block'
    },
    durationMinutes: {
      type: Number,
      default: 20
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    hasAvailability: {
      type: Boolean,
      default: true
    },
    delayNotice: {
      type: String,
      default: null
    },
    requirements: [{ type: String }],
    instructions: {
      type: String,
      default: 'Please arrive 10 minutes before your scheduled slot.'
    },
    cancellationPolicy: {
      type: String,
      default: 'Appointments may be rescheduled or cancelled up to 2 hours before the scheduled slot.'
    }
  },
  {
    timestamps: true
  }
);

ServiceSchema.index({ schoolId: 1, isActive: 1 });

export const Service = mongoose.model('Service', ServiceSchema);
