import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { School } from '../models/index.js';

describe('Authentication & Authorization Suite', () => {
  setupTestDB();

  beforeEach(async () => {
    // Seed default test school
    await School.create({
      schoolId: 'inst-1',
      name: 'Achimota Senior High School',
      shortName: 'Achimota School',
      category: 'Senior High School',
      region: 'Greater Accra Region',
      city: 'Accra',
      address: 'Achimota Forest Area',
      contactEmail: 'admissions@achimota.edu.gh',
      contactPhone: '+233 30 240 0123',
    });
  });

  describe('GET /health', () => {
    it('should return healthy status with uptime and service metadata', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('citizenqueue-backend');
      expect(res.body.version).toBe('1.0.0');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a student candidate and return tokens with admission progress', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Kofi Annan',
          email: 'kofi.annan@example.com',
          password: 'SecurePassword123!',
          phoneNumber: '0241122334',
          indexNumber: '1019988776',
          schoolId: 'inst-1',
          programme: 'General Arts',
          residentialStatus: 'Boarding',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe('kofi.annan@example.com');
      expect(res.body.data.user.role).toBe('student');
      expect(res.body.data.student.beceIndexNumber).toBe('1019988776');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
    });

    it('should reject registration with duplicate email address', async () => {
      const payload = {
        fullName: 'Kofi Annan',
        email: 'duplicate@example.com',
        password: 'SecurePassword123!',
        phoneNumber: '0241122334',
        indexNumber: '1019988771',
        schoolId: 'inst-1',
      };

      await request(app).post('/api/v1/auth/register').send(payload);
      const res = await request(app).post('/api/v1/auth/register').send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('already exists');
    });

    it('should reject registration when validation fails for weak password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Kofi Annan',
          email: 'weak@example.com',
          password: 'short',
          phoneNumber: '0241122334',
          schoolId: 'inst-1',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject registration when password contains no letters', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Kofi Annan',
          email: 'digitsonly@example.com',
          password: '1234567890',
          phoneNumber: '0241122334',
          schoolId: 'inst-1',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(JSON.stringify(res.body)).toContain('at least one letter');
    });

    it('should allow registration when optional email is omitted and preserve guardian/school details', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Yaw Boateng',
          password: 'SecurePassword123!',
          phoneNumber: '0245566778',
          indexNumber: '1019988779',
          schoolId: 'inst-2',
          assignedSchool: 'Prempeh College',
          guardianName: 'Kwesi Boateng',
          guardianRelation: 'Father',
          homeTown: 'Kumasi, Ashanti Region',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.student.assignedSchool).toBe('Prempeh College');
      expect(res.body.data.student.guardianName).toBe('Kwesi Boateng');
    });

    it('should allow newly registered school_admin staff to access admin dashboard', async () => {
      const regRes = await request(app)
        .post('/api/v1/auth/register-admin')
        .send({
          fullName: 'Kwame Addo',
          email: 'k.addo@achimota.edu.gh',
          password: 'StaffPassword123!',
          phoneNumber: '+233 24 330 9988',
          schoolId: 'inst-1',
          role: 'school_admin',
          staffId: 'GES-482910',
          designation: 'Senior Housemaster',
          department: 'Boarding Affairs',
        });

      expect(regRes.status).toBe(201);
      expect(regRes.body.data.user.role).toBe('school_admin');
      expect(regRes.body.data.user.staffId).toBe('GES-482910');

      const dashRes = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${regRes.body.data.accessToken}`);

      expect(dashRes.status).toBe(200);
      expect(dashRes.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Ama Serwaa',
          email: 'ama.serwaa@example.com',
          password: 'Password123!',
          phoneNumber: '0205566778',
          indexNumber: '1014433221',
          schoolId: 'inst-1',
        });
    });

    it('should authenticate student by email and return JWT access token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'ama.serwaa@example.com',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('ama.serwaa@example.com');
    });

    it('should authenticate student by BECE index number', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: '1014433221',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.name).toBe('Ama Serwaa');
    });

    it('should reject invalid password with 401 Unauthorized', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'ama.serwaa@example.com',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Protected Routes & Token Refresh', () => {
    it('should reject access to GET /api/v1/auth/me without Bearer token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('should rotate tokens via POST /api/v1/auth/refresh', async () => {
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Refresh Test',
          email: 'refresh@example.com',
          password: 'Password123!',
          phoneNumber: '0249988776',
          schoolId: 'inst-1',
        });

      const refreshToken = reg.body.data.refreshToken;

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.data.accessToken).toBeDefined();
      expect(refreshRes.body.data.refreshToken).toBeDefined();
    });
  });

  describe('Password Recovery & OTP Reset Flow', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Reset User',
          email: 'reset.user@example.com',
          password: 'OldPassword123!',
          phoneNumber: '0245556677',
          indexNumber: '1017778889',
          schoolId: 'inst-1',
        });
    });

    it('should dispatch a 6-digit OTP code to registered email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          identifier: 'reset.user@example.com',
          channel: 'email',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.channel).toBe('email');
      expect(res.body.data.destination).toBeDefined();
      expect(res.body.data.expiresInMinutes).toBe(10);
    });

    it('should dispatch an OTP code by BECE index number to phone', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          identifier: '1017778889',
          channel: 'phone',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.channel).toBe('phone');
    });

    it('should reset password with valid OTP and enable sign in with new password', async () => {
      const forgotRes = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          identifier: 'reset.user@example.com',
          channel: 'email',
        });

      const devOtp = forgotRes.body.data.devOtp;
      expect(devOtp).toBeDefined();

      // Verify OTP
      const verifyRes = await request(app)
        .post('/api/v1/auth/verify-reset-otp')
        .send({
          identifier: 'reset.user@example.com',
          otp: devOtp,
        });
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.valid).toBe(true);

      // Reset password
      const resetRes = await request(app)
        .post('/api/v1/auth/reset-password')
        .send({
          identifier: 'reset.user@example.com',
          otp: devOtp,
          newPassword: 'BrandNewPassword2026!',
        });
      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);

      // Verify login with new password succeeds
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'reset.user@example.com',
          password: 'BrandNewPassword2026!',
        });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);

      // Verify old password fails
      const oldLoginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          identifier: 'reset.user@example.com',
          password: 'OldPassword123!',
        });
      expect(oldLoginRes.status).toBe(401);
    });
  });

  describe('Institution Onboarding, Authorization Keys & Staff Role Assignment', () => {
    it('should register a new institution, generate key, pre-assign Staff ID role, enforce key validation, and restrict non-managers', async () => {
      // 1. Register brand-new institution
      const instRes = await request(app)
        .post('/api/v1/auth/register-institution')
        .send({
          schoolName: 'Mfantsipim School',
          shortName: 'Kwabotwe',
          category: 'Senior High School',
          region: 'Central Region',
          city: 'Cape Coast',
          adminFullName: 'Dr. Kofi Mensah',
          adminStaffId: 'MFN-HEAD-01',
          adminEmail: 'head@mfantsipim.edu.gh',
          adminPhone: '+233 24 900 1122',
          password: 'HeadPassword123!',
        });

      expect(instRes.status).toBe(201);
      expect(instRes.body.success).toBe(true);
      expect(instRes.body.data.user.role).toBe('school_admin');
      expect(instRes.body.data.school.name).toBe('Mfantsipim School');
      expect(instRes.body.data.authorizationKey).toMatch(/^CQ-/);

      const adminToken = instRes.body.data.accessToken;
      const newSchoolId = instRes.body.data.school.schoolId;
      const institutionKey = instRes.body.data.authorizationKey;

      // 2. Public GET /schools must NOT expose authorizationKey or roster
      const publicSchoolsRes = await request(app).get('/api/v1/schools');
      expect(publicSchoolsRes.status).toBe(200);
      const createdPublicSchool = publicSchoolsRes.body.data.find((s) => s.schoolId === newSchoolId);
      expect(createdPublicSchool).toBeDefined();
      expect(createdPublicSchool.authorizationKey).toBeUndefined();
      expect(createdPublicSchool.authorizedStaffRoster).toBeUndefined();

      // 3. School Admin pre-assigns Staff ID MFN-FIN-09 -> finance_officer
      const rosterRes = await request(app)
        .post('/api/v1/admin/staff/roster')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          staffId: 'MFN-FIN-09',
          fullName: 'Abena Osei',
          assignedRole: 'finance_officer',
          designation: 'School Bursar',
          department: 'Bursary & Accounts',
        });

      expect(rosterRes.status).toBe(201);
      expect(rosterRes.body.data.staffId).toBe('MFN-FIN-09');
      expect(rosterRes.body.data.assignedRole).toBe('finance_officer');

      // 4. Reject staff signup with WRONG Institution Key
      const badKeyRes = await request(app)
        .post('/api/v1/auth/register-admin')
        .send({
          fullName: 'Abena Osei',
          email: 'abena.osei@mfantsipim.edu.gh',
          password: 'OfficerPassword123!',
          phoneNumber: '+233 24 888 7766',
          schoolId: newSchoolId,
          staffId: 'MFN-FIN-09',
          role: 'school_admin',
          authorizationKey: 'WRONG-KEY-999',
        });

      expect(badKeyRes.status).toBe(403);

      // 5. Valid Institution Key + pre-assigned Staff ID enforces admin-assigned finance_officer role
      const staffRes = await request(app)
        .post('/api/v1/auth/register-admin')
        .send({
          fullName: 'Abena Osei',
          email: 'abena.osei@mfantsipim.edu.gh',
          password: 'OfficerPassword123!',
          phoneNumber: '+233 24 888 7766',
          schoolId: newSchoolId,
          staffId: 'MFN-FIN-09',
          role: 'school_admin', // Attempted escalation must be overridden by roster!
          authorizationKey: institutionKey,
        });

      expect(staffRes.status).toBe(201);
      expect(staffRes.body.data.user.role).toBe('finance_officer');
      expect(staffRes.body.data.user.schoolId).toBe(newSchoolId);

      const officerToken = staffRes.body.data.accessToken;
      const officerUserId = staffRes.body.data.user._id;

      // 6. Finance Officer cannot view Institution Key or rotate it (403 Forbidden)
      const forbiddenStaffMgmt = await request(app)
        .get('/api/v1/admin/staff')
        .set('Authorization', `Bearer ${officerToken}`);
      expect(forbiddenStaffMgmt.status).toBe(403);

      // 7. School Admin updates officer role to registrar & rotates Institution Key
      const updateRoleRes = await request(app)
        .patch(`/api/v1/admin/staff/${officerUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'registrar' });
      expect(updateRoleRes.status).toBe(200);
      expect(updateRoleRes.body.data.role).toBe('registrar');

      const rotateRes = await request(app)
        .post('/api/v1/admin/institution/regenerate-key')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(rotateRes.status).toBe(200);
      expect(rotateRes.body.data.authorizationKey).toMatch(/^CQ-/);
      expect(rotateRes.body.data.authorizationKey).not.toBe(institutionKey);
    });
  });
});
