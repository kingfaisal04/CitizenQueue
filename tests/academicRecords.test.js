import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { School, User, Student, AcademicRecordRequest, ClearanceRecord } from '../models/index.js';
import { generateAccessToken } from '../utils/tokenUtils.js';

describe('Academic Records & Departmental Clearance Suite', () => {
  setupTestDB();

  let school, studentUser, studentToken, financeOfficer, financeToken;

  beforeEach(async () => {
    school = await School.create({
      schoolId: 'inst-1',
      name: 'Achimota Senior High School',
      shortName: 'Achimota',
      category: 'Senior High School',
      region: 'Greater Accra',
      city: 'Accra',
      address: 'Achimota Forest Area',
    });

    studentUser = await User.create({
      name: 'Alumnus Kojo',
      email: 'kojo@example.com',
      phone: '0249988776',
      password: 'Password123!',
      role: 'student',
      school: school._id,
      schoolId: 'inst-1',
    });
    studentToken = generateAccessToken(studentUser);

    await Student.create({
      user: studentUser._id,
      school: school._id,
      schoolId: 'inst-1',
      assignedSchool: 'Achimota Senior High School',
      beceIndexNumber: '1018877665',
      fullName: 'Alumnus Kojo',
      programme: 'General Science',
      guardianName: 'Guardian',
      guardianPhone: '0249988776',
    });

    financeOfficer = await User.create({
      name: 'Bursar Danquah',
      email: 'finance@achimota.edu.gh',
      phone: '0240007788',
      password: 'Password123!',
      role: 'finance_officer',
      school: school._id,
      schoolId: 'inst-1',
    });
    financeToken = generateAccessToken(financeOfficer);
  });

  it('should successfully submit an academic transcript request and initialize all 5 departmental clearances', async () => {
    const res = await request(app)
      .post('/api/v1/academic-records/request')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        documentType: 'transcript',
        deliveryPreference: 'physical_pickup',
        numberOfCopies: 2,
        purpose: 'Application for Tertiary Education at University of Ghana',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.request.requestReference).toContain('AR-TRA-');
    expect(res.body.data.clearances.length).toBe(5);

    const departments = res.body.data.clearances.map((c) => c.department);
    expect(departments).toContain('finance');
    expect(departments).toContain('library');
    expect(departments).toContain('stores');
    expect(departments).toContain('academic_office');
    expect(departments).toContain('administration');
  });

  it('should allow student to raise a dispute over a flagged clearance record', async () => {
    const reqRes = await request(app)
      .post('/api/v1/academic-records/request')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        documentType: 'transcript',
        purpose: 'Foreign University Evaluation',
      });

    const financeClearance = reqRes.body.data.clearances.find((c) => c.department === 'finance');

    // Student raises dispute
    const disputeRes = await request(app)
      .post(`/api/v1/academic-records/clearance/${financeClearance._id}/dispute`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        reason: 'All PTA dues and laboratory arrears were fully settled in final year term 3.',
        studentEvidenceNote: 'Bursary receipt #4421 attached.',
      });

    expect(disputeRes.status).toBe(200);
    expect(disputeRes.body.success).toBe(true);
    expect(disputeRes.body.data.status).toBe('disputed');
    expect(disputeRes.body.data.disputeStatus).toBe('under_investigation');
  });

  it('should allow finance officer to clear an obligation with audit history', async () => {
    const reqRes = await request(app)
      .post('/api/v1/academic-records/request')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        documentType: 'transcript',
        purpose: 'Employment Verification',
      });

    const financeClearance = reqRes.body.data.clearances.find((c) => c.department === 'finance');

    const updateRes = await request(app)
      .patch(`/api/v1/academic-records/clearance/${financeClearance._id}`)
      .set('Authorization', `Bearer ${financeToken}`)
      .send({
        status: 'cleared',
        explanation: 'Accounts ledger verified, zero outstanding balance.',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('cleared');
    expect(updateRes.body.data.officerName).toBe('Bursar Danquah');
  });
});
