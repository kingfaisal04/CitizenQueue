import request from 'supertest';
import app from '../app.js';
import { setupTestDB } from './setup.js';
import { School, Student, Document, AppointmentSlot, User, Service } from '../models/index.js';

describe('Schools & Public Analytics Suite', () => {
  setupTestDB();

  beforeEach(async () => {
    // Seed test school
    const school = await School.create({
      schoolId: 'inst-1',
      name: 'Achimota Senior High School',
      shortName: 'Achimota School',
      category: 'Senior High School',
      region: 'Greater Accra Region',
      city: 'Accra',
      address: 'Achimota Forest Area',
      contactEmail: 'admissions@achimota.edu.gh',
      contactPhone: '+233 30 240 0123',
      status: 'active',
    });

    // Seed test service
    const service = await Service.create({
      school: school._id,
      schoolId: 'inst-1',
      serviceId: 'srv-101',
      name: 'Admissions Reporting',
      institutionName: 'Achimota Senior High School',
      description: 'Official verification and reporting',
      category: 'Admissions',
      durationMinutes: 20,
      isActive: true,
    });

    // Seed test user
    const user = await User.create({
      name: 'Test Candidate',
      email: 'test.candidate@example.com',
      password: 'Password123!',
      phone: '+233 24 111 2222',
      role: 'student',
      school: school._id,
      schoolId: 'inst-1',
    });

    // Seed candidate
    const student = await Student.create({
      user: user._id,
      school: school._id,
      schoolId: 'inst-1',
      assignedSchool: 'Achimota Senior High School',
      beceIndexNumber: '1019988776',
      fullName: 'Test Candidate',
      guardianName: 'Parent',
      guardianPhone: '+233 24 111 2222',
      programme: 'General Science',
      residentialStatus: 'Boarding',
    });

    // Seed document
    await Document.create({
      student: student._id,
      documentRequirementId: 'doc-1',
      school: school._id,
      schoolId: 'inst-1',
      name: 'BECE Result Slip',
      category: 'Academic Records',
      status: 'accepted',
      fileName: 'bece_results.pdf',
      fileSize: '1.2 MB',
      fileSizeBytes: 1258291,
      mimeType: 'application/pdf',
      storageKey: 'students/test/bece_results.pdf',
      fileUrl: 'https://example.com/bece_results.pdf',
    });

    // Seed slot
    await AppointmentSlot.create({
      school: school._id,
      schoolId: 'inst-1',
      service: service._id,
      serviceId: service.serviceId,
      slotId: 'slot-101',
      date: '2026-11-20',
      time: '09:00 AM',
      capacity: 25,
      bookedCount: 5,
      isActive: true,
    });
  });

  describe('GET /api/v1/schools/analytics/public', () => {
    it('should return live dynamic system analytics computed from database collections', async () => {
      const res = await request(app).get('/api/v1/schools/analytics/public');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalSchools).toBe(1);
      expect(res.body.data.totalStudents).toBe(1);
      expect(res.body.data.totalDocuments).toBe(1);
      expect(res.body.data.verifiedDocuments).toBe(1);
      expect(res.body.data.totalCapacity).toBe(25);
      expect(res.body.data.queueReductionRate).toBeGreaterThanOrEqual(75);
      expect(res.body.data.systemOperational).toBe(true);
      expect(res.body.data.lastCalculatedAt).toBeDefined();
    });
  });

  describe('GET /api/v1/schools', () => {
    it('should return list of available schools', async () => {
      const res = await request(app).get('/api/v1/schools');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });
});
