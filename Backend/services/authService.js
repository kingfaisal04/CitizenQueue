import { User, Student, School, Admission, AuditLog } from '../models/index.js';
import { EmailService } from './emailService.js';
import { ApiError } from '../utils/ApiError.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/tokenUtils.js';

const INITIAL_STAGES = [
  { stage: 1, title: 'CSSPS Placement Accepted', isCompleted: true, completedAt: new Date() },
  { stage: 2, title: 'Biodata & Guardian Verification', isCompleted: false, completedAt: null },
  { stage: 3, title: 'Mandatory Document Upload', isCompleted: false, completedAt: null },
  { stage: 4, title: 'Institutional Document Review', isCompleted: false, completedAt: null },
  { stage: 5, title: 'Digital Prospectus Item Acquisition', isCompleted: false, completedAt: null },
  { stage: 6, title: 'Items Visual Inspection & Clearance', isCompleted: false, completedAt: null },
  { stage: 7, title: 'Capacity & Arrival Appointment Scheduled', isCompleted: false, completedAt: null },
  { stage: 8, title: 'Physical Desk Clearance & Enrollment', isCompleted: false, completedAt: null },
  { stage: 9, title: 'Official SHS Enrolment Confirmed', isCompleted: false, completedAt: null },
];

export class AuthService {
  /**
   * Register a new student citizen
   */
  static async registerStudent(data, ipAddress = null, userAgent = null) {
    const {
      fullName,
      email,
      password,
      phoneNumber,
      indexNumber,
      schoolId = 'inst-1',
      academicYear = '2026/2027',
      residentialStatus = 'Boarding',
      programme = 'General Science',
    } = data;

    // Check duplicate email
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        throw ApiError.conflict('An account with this email address already exists');
      }
    }

    // Check duplicate phone
    if (phoneNumber) {
      const existingPhone = await User.findOne({ phone: phoneNumber });
      if (existingPhone) {
        throw ApiError.conflict('An account with this phone number already exists');
      }
    }

    const assignedIndexNumber = indexNumber || `101${Date.now().toString().slice(-7)}`;

    // Check duplicate index number in students
    const existingIndex = await Student.findOne({ beceIndexNumber: assignedIndexNumber });
    if (existingIndex) {
      throw ApiError.conflict(`A student record with index number ${assignedIndexNumber} is already registered`);
    }

    // Lookup School
    let schoolDoc = await School.findOne({ schoolId });
    if (!schoolDoc) {
      schoolDoc = await School.findOne(); // Fallback to first available institution if needed
    }

    // Create User
    const user = new User({
      name: fullName,
      email: email || `${assignedIndexNumber}@citizenqueue.gov.gh`,
      phone: phoneNumber,
      password, // Pre-save hook hashes it
      role: 'student',
      school: schoolDoc?._id || null,
      schoolId: schoolDoc?.schoolId || schoolId,
      accountStatus: 'active',
      emailVerified: false,
    });
    await user.save();

    // Create Student record
    const student = new Student({
      user: user._id,
      school: schoolDoc?._id || null,
      schoolId: schoolDoc?.schoolId || schoolId,
      assignedSchool: schoolDoc?.name || 'Achimota Senior High School',
      beceIndexNumber: assignedIndexNumber,
      fullName,
      phone: phoneNumber || '',
      email: email || '',
      programme,
      residentialStatus,
      guardianName: data.guardianName || 'Parent / Legal Guardian',
      guardianPhone: data.guardianPhone || phoneNumber,
      guardianEmail: data.guardianEmail || email || '',
      guardianRelation: data.guardianRelation || 'Guardian',
      homeTown: data.homeTown || '',
      placementBatch: 'CSSPS 2026 Regular Batch',
    });
    await student.save();

    // Create Admission record
    const admission = new Admission({
      student: student._id,
      school: schoolDoc?._id || null,
      schoolId: schoolDoc?.schoolId || schoolId,
      beceIndexNumber: assignedIndexNumber,
      currentStage: 2,
      readinessScore: 20,
      registrationStatus: 'profile_pending',
      stages: INITIAL_STAGES,
    });
    await admission.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persist hashed refresh token
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    user.refreshTokens.push({
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });
    user.lastLoginAt = new Date();
    await user.save();

    // Audit log
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      schoolId: user.schoolId,
      action: 'USER_REGISTERED',
      targetResource: 'User',
      targetId: user._id.toString(),
      details: { role: 'student', beceIndexNumber: assignedIndexNumber },
      ipAddress,
      userAgent,
    });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    return {
      user: userObj,
      student: student.toObject(),
      admission: admission.toObject(),
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Register an administrator or officer
   */
  static async registerAdmin(data, ipAddress = null, userAgent = null) {
    const { fullName, email, password, phoneNumber, schoolId, role = 'admin', staffId } = data;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw ApiError.conflict('An administrator account with this email address already exists');
    }

    let schoolDoc = await School.findOne({ schoolId });
    if (!schoolDoc && schoolId) {
      schoolDoc = await School.findOne();
    }

    const user = new User({
      name: fullName,
      email,
      phone: phoneNumber,
      password,
      role,
      school: schoolDoc?._id || null,
      schoolId: schoolDoc?.schoolId || schoolId,
      staffId: staffId || `STF-${Date.now().toString().slice(-5)}`,
      accountStatus: 'active',
      emailVerified: true,
    });
    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });
    user.lastLoginAt = new Date();
    await user.save();

    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      schoolId: user.schoolId,
      action: 'ADMIN_REGISTERED',
      targetResource: 'User',
      targetId: user._id.toString(),
      details: { role, schoolId: user.schoolId },
      ipAddress,
      userAgent,
    });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    return {
      user: userObj,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Authenticate user with password
   */
  static async login(identifier, password, ipAddress = null, userAgent = null) {
    // 1. Check if identifier is email or phone
    let user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select('+password');

    // 2. If not found, check if identifier is BECE index number
    let student = null;
    if (!user) {
      student = await Student.findOne({ beceIndexNumber: identifier });
      if (student) {
        user = await User.findById(student.user).select('+password');
      }
    }

    // 3. Reject invalid credentials
    if (!user || !(await user.comparePassword(password))) {
      throw ApiError.unauthorized('Invalid login credentials provided');
    }

    // 4. Verify account status
    if (user.accountStatus !== 'active') {
      throw ApiError.forbidden(`Account access suspended or pending verification (${user.accountStatus})`);
    }

    // If student wasn't queried yet and user is student/citizen, fetch student profile
    if (!student && ['citizen', 'student'].includes(user.role)) {
      student = await Student.findOne({ user: user._id });
    }

    // Fetch admission record if student
    let admission = null;
    if (student) {
      admission = await Admission.findOne({ student: student._id });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Save refresh token
    const tokenHash = hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Keep up to 5 concurrent sessions per user
    if (user.refreshTokens.length >= 5) {
      user.refreshTokens.shift();
    }

    user.refreshTokens.push({
      tokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });
    user.lastLoginAt = new Date();
    await user.save();

    // Audit log
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      schoolId: user.schoolId,
      action: 'USER_LOGIN',
      targetResource: 'User',
      targetId: user._id.toString(),
      details: { role: user.role },
      ipAddress,
      userAgent,
    });

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    return {
      user: userObj,
      student: student ? student.toObject() : null,
      admission: admission ? admission.toObject() : null,
      tokens: { accessToken, refreshToken },
    };
  }

  /**
   * Rotate refresh token and issue new access token
   */
  static async refreshTokens(refreshToken, ipAddress = null, userAgent = null) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const tokenHash = hashToken(refreshToken);
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.tokenHash': tokenHash,
      accountStatus: 'active',
    });

    if (!user) {
      throw ApiError.unauthorized('Revoked or invalid refresh session');
    }

    // Remove the consumed refresh token
    user.refreshTokens = user.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);

    // Issue new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    const newTokenHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash: newTokenHash,
      expiresAt,
      ipAddress,
      userAgent,
    });
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Revoke session on logout
   */
  static async logout(userId, refreshToken = null) {
    const user = await User.findById(userId);
    if (!user) return;

    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      user.refreshTokens = user.refreshTokens.filter((rt) => rt.tokenHash !== tokenHash);
    } else {
      user.refreshTokens = [];
    }
    await user.save();
  }

  /**
   * Fetch authenticated user identity and context
   */
  static async getMe(userId) {
    const user = await User.findById(userId).populate('school');
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }

    let student = null;
    let admission = null;

    if (['citizen', 'student'].includes(user.role)) {
      student = await Student.findOne({ user: user._id }).populate('school');
      if (student) {
        admission = await Admission.findOne({ student: student._id }).populate('appointment');
      }
    }

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;

    return {
      user: userObj,
      student: student ? student.toObject() : null,
      admission: admission ? admission.toObject() : null,
    };
  }

  /**
   * Helper: Resolve user by flexible identifier (email, phone, BECE index number)
   */
  static async findUserByIdentifier(rawIdentifier) {
    if (!rawIdentifier) return { user: null, student: null };
    const identifier = rawIdentifier.trim();
    const digitsOnly = identifier.replace(/\D/g, '');

    // 1. Direct search on User by email or phone
    let user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
      ],
    });

    // 2. Search on User by phone digits if phone has country code or whitespace
    if (!user && digitsOnly.length >= 7) {
      user = await User.findOne({
        phone: { $regex: digitsOnly.slice(-9) },
      });
    }

    // 3. Search via Student by student phone, student email, beceIndexNumber, or guardian phone/email
    let student = null;
    if (!user) {
      student = await Student.findOne({
        $or: [
          { beceIndexNumber: identifier },
          { phone: identifier },
          { email: identifier.toLowerCase() },
          { guardianPhone: identifier },
          { guardianEmail: identifier.toLowerCase() },
        ],
      });

      if (!student && digitsOnly.length >= 7) {
        student = await Student.findOne({
          $or: [
            { phone: { $regex: digitsOnly.slice(-9) } },
            { guardianPhone: { $regex: digitsOnly.slice(-9) } },
          ],
        });
      }

      if (student && student.user) {
        user = await User.findById(student.user);
      }
    } else {
      student = await Student.findOne({ user: user._id });
    }

    return { user, student };
  }

  /**
   * Request password reset OTP via email or phone
   */
  static async requestPasswordReset(identifier, preferredChannel = 'email', ipAddress = null, userAgent = null) {
    const { user, student } = await this.findUserByIdentifier(identifier);

    if (!user) {
      throw ApiError.notFound('No account associated with that BECE Index, email, or phone number was found.');
    }

    // Auto-detect channel if user input is distinctly an email address or mobile phone number
    const isEmailInput = identifier.includes('@');
    const isPhoneInput = !isEmailInput && identifier.replace(/\D/g, '').length >= 8;

    let channel = preferredChannel;
    if (isEmailInput) {
      channel = 'email';
    } else if (isPhoneInput) {
      channel = 'phone';
    } else if (!channel) {
      channel = 'email';
    }

    let destination = null;

    if (channel === 'phone') {
      destination = user.phone || student?.phone || student?.guardianPhone;
      if (!destination && (user.email || student?.email || student?.guardianEmail)) {
        // Fallback to email if phone not on file
        channel = 'email';
        destination = user.email || student?.email || student?.guardianEmail;
      }
    } else {
      destination = user.email || student?.email || student?.guardianEmail;
      if (!destination && (user.phone || student?.phone || student?.guardianPhone)) {
        // Fallback to phone if email not on file
        channel = 'phone';
        destination = user.phone || student?.phone || student?.guardianPhone;
      }
    }

    if (!destination) {
      throw ApiError.badRequest('No valid contact channel found on file for this account. Please contact school administration.');
    }

    // Generate 6-digit cryptographically random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP to user record
    const userDoc = await User.findById(user._id);
    userDoc.resetPasswordOtp = otp;
    userDoc.resetPasswordOtpExpires = expiresAt;
    userDoc.resetPasswordChannel = channel;
    await userDoc.save();

    // Dispatch via EmailService
    await EmailService.sendPasswordResetOtp(destination, otp, channel, user.name);

    // Audit log
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      schoolId: user.schoolId,
      action: 'PASSWORD_RESET_REQUESTED',
      targetResource: 'User',
      targetId: user._id.toString(),
      details: { channel, destination: destination.replace(/^(.{2})(.*)(.{2})$/, '$1***$3') },
      ipAddress,
      userAgent,
    });

    // Mask destination for user privacy
    let maskedDestination = destination;
    if (channel === 'email' || destination.includes('@')) {
      const [local, domain] = destination.split('@');
      maskedDestination = `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`;
    } else {
      const clean = destination.trim();
      maskedDestination = clean.length > 6 ? `${clean.slice(0, 4)} *** ${clean.slice(-4)}` : '***';
    }

    return {
      message: `A 6-digit verification code has been sent to your ${channel} (${maskedDestination}).`,
      destination: maskedDestination,
      channel,
      expiresInMinutes: 10,
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  /**
   * Verify password reset OTP code
   */
  static async verifyResetOtp(identifier, otp) {
    const { user } = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw ApiError.notFound('Account not found.');
    }

    const userWithOtp = await User.findById(user._id).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!userWithOtp || !userWithOtp.resetPasswordOtp || !userWithOtp.resetPasswordOtpExpires) {
      throw ApiError.badRequest('No active password reset request found. Please request a new verification code.');
    }

    if (new Date() > userWithOtp.resetPasswordOtpExpires) {
      throw ApiError.badRequest('Verification code has expired. Please request a fresh one.');
    }

    if (userWithOtp.resetPasswordOtp !== otp.trim()) {
      throw ApiError.badRequest('Invalid verification code. Please check the 6-digit code and try again.');
    }

    return {
      valid: true,
      message: 'Verification code verified successfully.',
    };
  }

  /**
   * Reset password upon successful OTP verification
   */
  static async resetPasswordWithOtp(identifier, otp, newPassword, ipAddress = null, userAgent = null) {
    const { user } = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw ApiError.notFound('Account not found.');
    }

    const userWithOtp = await User.findById(user._id).select('+resetPasswordOtp +resetPasswordOtpExpires');
    if (!userWithOtp || !userWithOtp.resetPasswordOtp || !userWithOtp.resetPasswordOtpExpires) {
      throw ApiError.badRequest('No active password reset request found. Please request a new verification code.');
    }

    if (new Date() > userWithOtp.resetPasswordOtpExpires) {
      throw ApiError.badRequest('Verification code has expired. Please request a fresh one.');
    }

    if (userWithOtp.resetPasswordOtp !== otp.trim()) {
      throw ApiError.badRequest('Invalid verification code.');
    }

    if (!newPassword || newPassword.length < 8) {
      throw ApiError.badRequest('New password must be at least 8 characters long.');
    }

    if (!/[a-zA-Z]/.test(newPassword)) {
      throw ApiError.badRequest('New password must contain at least one letter.');
    }

    // Set new password (pre-save hook will hash it with bcrypt)
    userWithOtp.password = newPassword;
    userWithOtp.resetPasswordOtp = null;
    userWithOtp.resetPasswordOtpExpires = null;
    userWithOtp.resetPasswordChannel = null;
    userWithOtp.refreshTokens = []; // Clear existing tokens for account security
    await userWithOtp.save();

    // Audit log
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      schoolId: user.schoolId,
      action: 'PASSWORD_RESET_COMPLETED',
      targetResource: 'User',
      targetId: user._id.toString(),
      details: { identifier },
      ipAddress,
      userAgent,
    });

    return {
      success: true,
      message: 'Your password has been reset successfully. You may now sign in with your new credentials.',
    };
  }
}
