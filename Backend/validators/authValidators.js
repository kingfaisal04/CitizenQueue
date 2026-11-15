import { z } from 'zod';

// Reusable password schema: min 8 characters, at least 1 letter, no max limit
const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[a-zA-Z]/, 'Password must contain at least one letter');

export const studentRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address format').toLowerCase().trim(),
  password: passwordRule,
  phoneNumber: z.string().min(10, 'Valid phone number is required').max(20),
  indexNumber: z.string().optional(),
  schoolId: z.string().optional(),
  academicYear: z.string().optional(),
  residentialStatus: z.enum(['Day', 'Boarding']).optional(),
  programme: z.string().optional(),
});

export const adminRegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Invalid official email address format').toLowerCase().trim(),
  password: passwordRule,
  phoneNumber: z.string().min(10, 'Valid contact number is required').max(20),
  schoolId: z.string().min(1, 'Associated institution schoolId is required for administrator provisioning'),
  role: z.enum([
    'school_admin',
    'academic_officer',
    'finance_officer',
    'library_officer',
    'collection_officer',
    'super_admin',
  ]).default('school_admin'),
  inviteCode: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email, phone number, or index number is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordRule,
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email, phone number, or BECE index number is required').trim(),
  channel: z.enum(['email', 'phone']).default('email'),
});

export const verifyOtpSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required').trim(),
  otp: z.string().min(6, 'Valid 6-digit OTP code is required').max(6, 'OTP must be 6 digits').trim(),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required').trim(),
  otp: z.string().min(6, 'Valid 6-digit OTP code is required').max(6, 'OTP must be 6 digits').trim(),
  newPassword: passwordRule,
});
