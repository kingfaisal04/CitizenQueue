import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { School, User, Student, Admission, Document } from '../models/index.js';
import { generateAccessToken } from '../utils/tokenUtils.js';

describe('Document Upload & Verification Suite', () => {
  setupTestDB();

  let school, studentUser, student, studentToken, adminUser, adminToken, document;

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
      name: 'Esi Nyarko',
      email: 'esi@example.com',
      phone: '0245556677',
      password: 'Password123!',
      role: 'student',
      school: school._id,
      schoolId: 'inst-1',
    });
    studentToken = generateAccessToken(studentUser);

    student = await Student.create({
      user: studentUser._id,
      school: school._id,
      schoolId: 'inst-1',
      assignedSchool: 'Achimota Senior High School',
      beceIndexNumber: '1013322110',
      fullName: 'Esi Nyarko',
      programme: 'Home Economics',
      guardianName: 'Guardian Nyarko',
      guardianPhone: '0245556677',
      isComplete: true,
    });

    await Admission.create({
      student: student._id,
      school: school._id,
      schoolId: 'inst-1',
      beceIndexNumber: '1013322110',
      currentStage: 3,
      readinessScore: 30,
      registrationStatus: 'documents_pending',
      stages: [
        { stage: 1, title: 'Placement Accepted', isCompleted: true },
        { stage: 2, title: 'Biodata Verified', isCompleted: true },
        { stage: 3, title: 'Documents Uploaded', isCompleted: false },
        { stage: 4, title: 'Documents Verified', isCompleted: false },
      ],
    });

    adminUser = await User.create({
      name: 'Officer Boateng',
      email: 'boateng@achimota.edu.gh',
      phone: '0240003344',
      password: 'Password123!',
      role: 'admin',
      school: school._id,
      schoolId: 'inst-1',
    });
    adminToken = generateAccessToken(adminUser);

    document = await Document.create({
      student: student._id,
      school: school._id,
      schoolId: 'inst-1',
      documentRequirementId: 'doc-1',
      name: 'CSSPS Placement Slip',
      category: 'Placement & Enrollment',
      required: true,
      status: 'not_submitted',
    });
  });

  it('should generate a presigned upload URL for a valid document file intent', async () => {
    const res = await request(app)
      .post('/api/v1/documents/upload-intent')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        documentType: 'placement_slip',
        fileName: 'my_placement_slip.pdf',
        fileType: 'application/pdf',
        fileSize: 1024 * 500, // 500 KB
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uploadUrl).toBeDefined();
    expect(res.body.data.storageKey).toBeDefined();
  });

  it('should reject upload intent when file exceeds allowed size', async () => {
    const res = await request(app)
      .post('/api/v1/documents/upload-intent')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        documentType: 'placement_slip',
        fileName: 'huge_file.pdf',
        fileType: 'application/pdf',
        fileSize: 1024 * 1024 * 10, // 10 MB (Limit is 5MB)
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('exceeds maximum allowed limit');
  });

  it('should confirm document upload and update status to submitted', async () => {
    const res = await request(app)
      .post('/api/v1/documents/confirm')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        documentId: document._id.toString(),
        fileKey: `students/${student._id}/placement_slip/my_placement_slip.pdf`,
        fileName: 'my_placement_slip.pdf',
        fileSizeBytes: 1024 * 500,
        mimeType: 'application/pdf',
        fileUrl: 'https://storage.mock.citizenqueue.edu.gh/vault/my_placement_slip.pdf',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('submitted');
    expect(res.body.data.fileName).toBe('my_placement_slip.pdf');
  });

  it('should allow officer to review and verify document and advance student admission readiness', async () => {
    // Confirm upload first
    await request(app)
      .post('/api/v1/documents/confirm')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        documentId: document._id.toString(),
        fileKey: 'key_123',
        fileName: 'placement.pdf',
      });

    // Review document by officer
    const res = await request(app)
      .patch(`/api/v1/documents/${document._id}/review`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'verified',
        feedback: 'Barcode scanned successfully and CSSPS verified.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('accepted');
    expect(res.body.data.adminFeedback).toContain('Barcode scanned');

    // Verify student admission readiness score increased
    const updatedAdmission = await Admission.findOne({ student: student._id });
    expect(updatedAdmission.readinessScore).toBeGreaterThanOrEqual(45);
  });
});
