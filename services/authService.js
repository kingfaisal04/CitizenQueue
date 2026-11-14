import { User, Student, School, Admission, AuditLog } from '../models/index.js';
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
      programme,
      residentialStatus,
      guardianName: 'Parent / Legal Guardian',
      guardianPhone: phoneNumber,
      guardianEmail: email || '',
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
}
