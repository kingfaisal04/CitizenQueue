import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    schoolId: {
      type: String,
      trim: true,
      index: true,
      default: null
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['info', 'reminder', 'confirmation', 'urgent'],
      default: 'info',
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    link: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', NotificationSchema);
