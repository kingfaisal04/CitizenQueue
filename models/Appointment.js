import mongoose from 'mongoose';

const ChecklistItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  { _id: false }
);

const AppointmentHistorySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    performerName: { type: String, default: 'System' }
  },
  { _id: false }
);

const AppointmentSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
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
    serviceName: {
      type: String,
      required: true,
      trim: true
    },
    institutionName: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      default: 'Administration Block'
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppointmentSlot',
      required: true,
      index: true
    },
    slotId: {
      type: String,
      required: true,
      trim: true
    },
    appointmentDate: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true
    },
    appointmentTime: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['booked', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
      default: 'booked',
      index: true
    },
    delayNotice: {
      type: String,
      default: null
    },
    visitor: {
      parentName: { type: String, required: true, trim: true },
      contactPhone: { type: String, required: true, trim: true },
      contactEmail: { type: String, trim: true, default: '' },
      studentName: { type: String, trim: true, default: '' },
      studentIndex: { type: String, trim: true, default: '' },
      notes: { type: String, default: '' }
    },
    checklist: [ChecklistItemSchema],
    history: [AppointmentHistorySchema],
    cancellationReason: {
      type: String,
      default: null
    },
    cancelledAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent active duplicate bookings for the same phone/index on the same service & date
AppointmentSchema.index(
  { serviceId: 1, appointmentDate: 1, 'visitor.contactPhone': 1, status: 1 }
);
AppointmentSchema.index(
  { serviceId: 1, appointmentDate: 1, 'visitor.studentIndex': 1, status: 1 }
);
AppointmentSchema.index({ schoolId: 1, status: 1, appointmentDate: 1 });

export const Appointment = mongoose.model('Appointment', AppointmentSchema);
