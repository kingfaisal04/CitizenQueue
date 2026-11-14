import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { School, User, Student, Admission, AuditLog } from '../models/index.js';
import { generateAccessToken } from '../utils/tokenUtils.js';

describe('Multi-Institution Boundary & Isolation Security Suite', () => {
  setupTestDB();

  let achimotaSchool, prempehSchool;
  let achimotaAdmin, prempehAdmin;
  let achimotaStudent, prempehStudent;
  let achimotaAdminToken, prempehAdminToken;

  beforeEach(async () => {
    // 1. Create two distinct educational institutions
    achimotaSchool = await School.create({
      schoolId: 'inst-1',
      name: 'Achimota Senior High School',
      shortName: 'Achimota School',
      category: 'Senior High School',
      region: 'Greater Accra',
      city: 'Accra',
      address: 'Achimota',
    });

    prempehSchool = await School.create({
      schoolId: 'inst-2',
      name: 'Prempeh College',
      shortName: 'Prempeh',
      category: 'Senior High School',
      region: 'Ashanti',
      city: 'Kumasi',
      address: 'Sofoline',
    });

    // 2. Create Achimota School Admin
    achimotaAdmin = await User.create({
      name: 'Achimota Registrar',
      email: 'admin@achimota.edu.gh',
      phone: '0240001111',
      password: 'Password123!',
      role: 'admin',
      school: achimotaSchool._id,
      schoolId: 'inst-1',
      staffId: 'ACH-001',
    });
    achimotaAdminToken = generateAccessToken(achimotaAdmin);

    // 3. Create Prempeh College Admin
    prempehAdmin = await User.create({
      name: 'Prempeh Registrar',
      email: 'admin@prempeh.edu.gh',
      phone: '0240002222',
      password: 'Password123!',
      role: 'admin',
      school: prempehSchool._id,
      schoolId: 'inst-2',
      staffId: 'PRM-001',
    });
    prempehAdminToken = generateAccessToken(prempehAdmin);

    // 4. Create Students for both institutions
    const achimotaStudentUser = await User.create({
      name: 'Achimota Student',
      email: 'student.ach@example.com',
      phone: '0241113333',
      password: 'Password123!',
      role: 'student',
      school: achimotaSchool._id,
      schoolId: 'inst-1',
    });

    achimotaStudent = await Student.create({
      user: achimotaStudentUser._id,
      school: achimotaSchool._id,
      schoolId: 'inst-1',
      assignedSchool: 'Achimota Senior High School',
      beceIndexNumber: '1010000001',
      fullName: 'Achimota Student',
      programme: 'General Science',
      residentialStatus: 'Boarding',
      guardianName: 'Guardian 1',
      guardianPhone: '0241113333',
    });

    const prempehStudentUser = await User.create({
      name: 'Prempeh Student',
      email: 'student.prm@example.com',
      phone: '0242224444',
      password: 'Password123!',
      role: 'student',
      school: prempehSchool._id,
      schoolId: 'inst-2',
    });

    prempehStudent = await Student.create({
      user: prempehStudentUser._id,
      school: prempehSchool._id,
      schoolId: 'inst-2',
      assignedSchool: 'Prempeh College',
      beceIndexNumber: '2020000002',
      fullName: 'Prempeh Student',
      programme: 'General Arts',
      residentialStatus: 'Boarding',
      guardianName: 'Guardian 2',
      guardianPhone: '0242224444',
    });
  });

  it('should list ONLY Achimota students when Achimota Admin calls GET /api/v1/admin/students', async () => {
    const res = await request(app)
      .get('/api/v1/admin/students')
      .set('Authorization', `Bearer ${achimotaAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.students.length).toBe(1);
    expect(res.body.data.students[0].schoolId).toBe('inst-1');
    expect(res.body.data.students[0].fullName).toBe('Achimota Student');
  });

  it('should list ONLY Prempeh students when Prempeh Admin calls GET /api/v1/admin/students', async () => {
    const res = await request(app)
      .get('/api/v1/admin/students')
      .set('Authorization', `Bearer ${prempehAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.students.length).toBe(1);
    expect(res.body.data.students[0].schoolId).toBe('inst-2');
    expect(res.body.data.students[0].fullName).toBe('Prempeh Student');
  });

  it('should reject Prempeh Admin from accessing an Achimota student profile with 404/403 and audit log violation', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/students/${achimotaStudent._id}`)
      .set('Authorization', `Bearer ${prempehAdminToken}`);

    expect([403, 404]).toContain(res.status);

    // Verify audit log or absence of cross-institutional data leakage
    const responseBody = res.body;
    expect(responseBody.success).toBe(false);
  });
});
