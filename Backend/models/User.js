import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const RefreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null }
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
      index: true
    },
    phone: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Never returned in normal queries
    },
    role: {
      type: String,
      enum: [
        'citizen',
        'student',
        'admin',
        'school_admin',
        'academic_officer',
        'housemaster',
        'registrar',
        'finance_officer',
        'library_officer',
        'collection_officer'
      ],
      default: 'citizen',
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
      trim: true,
      default: null,
      index: true
    },
    staffId: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    designation: {
      type: String,
      trim: true,
      default: null
    },
    department: {
      type: String,
      trim: true,
      default: null
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending_verification'],
      default: 'active',
      index: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordOtp: {
      type: String,
      default: null,
      select: false
    },
    resetPasswordOtpExpires: {
      type: Date,
      default: null,
      select: false
    },
    resetPasswordChannel: {
      type: String,
      enum: ['email', 'phone', null],
      default: null
    },
    refreshTokens: [RefreshTokenSchema],
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordOtp;
        delete ret.resetPasswordOtpExpires;
        delete ret.refreshTokens;
        return ret;
      }
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.resetPasswordOtp;
        delete ret.resetPasswordOtpExpires;
        delete ret.refreshTokens;
        return ret;
      }
    }
  }
);

// Indexes
UserSchema.index({ email: 1, role: 1 }, { unique: false });
UserSchema.index({ schoolId: 1, staffId: 1 }, { sparse: true });

// Pre-save hook: Hash password if modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password instance method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', UserSchema);
