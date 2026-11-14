import mongoose from 'mongoose';

const AppointmentSlotSchema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
      index: true
    },
    serviceId: {
      type: String,
      required: true,
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
    slotId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    date: {
      type: String, // ISO YYYY-MM-DD
      required: true,
      trim: true,
      index: true
    },
    time: {
      type: String, // e.g. "08:30 AM"
      required: true,
      trim: true
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Slot capacity must be at least 1']
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: [0, 'Booked count cannot be negative']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Concurrency & Uniqueness: Exactly one slot per service, date, and time
AppointmentSlotSchema.index({ serviceId: 1, date: 1, time: 1 }, { unique: true });
AppointmentSlotSchema.index({ schoolId: 1, date: 1 });

AppointmentSlotSchema.virtual('remaining').get(function () {
  return Math.max(0, this.capacity - this.bookedCount);
});

AppointmentSlotSchema.virtual('isFull').get(function () {
  return this.bookedCount >= this.capacity;
});

export const AppointmentSlot = mongoose.model('AppointmentSlot', AppointmentSlotSchema);
