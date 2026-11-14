import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    userName: {
      type: String,
      default: 'Anonymous / System',
    },
    userRole: {
      type: String,
      default: 'guest',
    },
    schoolId: {
      type: String,
      trim: true,
      index: true,
      default: null,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      default: 'Resource',
      index: true,
    },
    entityId: {
      type: String,
      default: null,
    },
    targetResource: {
      type: String,
      default: null,
    },
    targetId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'BLOCKED'],
      default: 'SUCCESS',
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.pre('validate', function (next) {
  if (!this.entityType && this.targetResource) {
    this.entityType = this.targetResource;
  }
  if (!this.entityId && this.targetId) {
    this.entityId = this.targetId;
  }
  next();
});

AuditLogSchema.index({ schoolId: 1, action: 1, createdAt: -1 });

export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
