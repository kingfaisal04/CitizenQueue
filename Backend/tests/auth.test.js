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
});
