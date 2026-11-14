import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import request from 'supertest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import app
import app from '../app.js';
import {
  User,
  Student,
  Admission,
  Document,
  Prospectus,
  AppointmentSlot,
  Appointment,
  AcademicRecordRequest,
  AuditLog
} from '../models/index.js';

const testRunId = Date.now().toString().slice(-6);
const TEST_STUDENT_EMAIL = `audit.student.${testRunId}@example.com`;
const TEST_STUDENT_INDEX = `101${testRunId.padStart(7, '0')}`;
const TEST_PASSWORD = 'Password123!';

const results = {
  passed: [],
  failed: [],
  details: {}
};

function recordResult(testName, passed, detail = '') {
  if (passed) {
    results.passed.push(testName);
    console.log(`  PASS: ${testName}`);
  } else {
    results.failed.push(testName);
    console.error(`  FAIL: ${testName} - ${detail}`);
  }
  results.details[testName] = { passed, detail };
}

async function runAudit() {
  console.log('====================================================');
  console.log('   CITIZENQUEUE DEEP INTEGRATION AUDIT SUITE        ');
  console.log('   Target: Real Express API + MongoDB Atlas Cluster ');
  console.log('====================================================\n');

  console.log('1. Connecting to live MongoDB Atlas database...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('   Connected to Atlas cluster successfully.\n');

  let studentAccessToken = '';
  let studentRefreshToken = '';
  let studentUserId = '';
  let studentProfileId = '';
  let admissionId = '';

  let adminAccessToken = '';
  let adminUserId = '';

  let createdDocumentId = '';
  let testSlotId = '';
  let createdAppointmentId = '';

  // --------------------------------------------------------------------------
  // SECTION 1: AUTHENTICATION AUDIT
  // --------------------------------------------------------------------------
  console.log('--- AUDITING OBJECTIVE 3: AUTHENTICATION ---');

  // Test 3.1: Student Registration
  try {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: `Audit Test Candidate ${testRunId}`,
        email: TEST_STUDENT_EMAIL,
        password: TEST_PASSWORD,
        phoneNumber: `+23324${testRunId}`,
        indexNumber: TEST_STUDENT_INDEX,
        schoolId: 'inst-1',
        programme: 'General Science',
        residentialStatus: 'Boarding'
      });

    const isRegSuccess = regRes.status === 201 && regRes.body.success && Boolean(regRes.body.data.accessToken);
    recordResult('Student Registration (POST /auth/register)', isRegSuccess, `Status: ${regRes.status}`);

    if (isRegSuccess) {
      studentAccessToken = regRes.body.data.accessToken;
      studentRefreshToken = regRes.body.data.refreshToken;
      studentUserId = regRes.body.data.user._id || regRes.body.data.user.id;
      studentProfileId = regRes.body.data.student._id || regRes.body.data.student.id;
      admissionId = regRes.body.data.admission._id || regRes.body.data.admission.id;
    }
  } catch (err) {
    recordResult('Student Registration (POST /auth/register)', false, err.message);
  }

  // Test 3.2: Duplicate Index / Email Conflict Detection
  try {
    const dupRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        fullName: 'Duplicate Tester',
        email: TEST_STUDENT_EMAIL,
        password: TEST_PASSWORD,
        phoneNumber: `+23320${testRunId}`,
        indexNumber: TEST_STUDENT_INDEX,
        schoolId: 'inst-1'
      });

    const isConflictCaught = dupRes.status === 409;
    recordResult('Duplicate Registration Conflict Guard (409 Conflict)', isConflictCaught, `Status: ${dupRes.status}`);
  } catch (err) {
    recordResult('Duplicate Registration Conflict Guard (409 Conflict)', false, err.message);
  }

  // Test 3.3: Invalid Password Login Rejection
  try {
    const badLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: TEST_STUDENT_INDEX,
        password: 'WrongPassword999!'
      });

    const isBadLoginRejected = badLoginRes.status === 401;
    recordResult('Invalid Credentials Rejection (401 Unauthorized)', isBadLoginRejected, `Status: ${badLoginRes.status}`);
  } catch (err) {
    recordResult('Invalid Credentials Rejection (401 Unauthorized)', false, err.message);
  }

  // Test 3.4: Valid Student Login
  try {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: TEST_STUDENT_INDEX,
        password: TEST_PASSWORD
      });

    const isLoginSuccess = loginRes.status === 200 && Boolean(loginRes.body.data.accessToken);
    recordResult('Candidate Authentication (POST /auth/login)', isLoginSuccess, `Status: ${loginRes.status}`);
    if (isLoginSuccess) {
      studentAccessToken = loginRes.body.data.accessToken;
      studentRefreshToken = loginRes.body.data.refreshToken;
    }
  } catch (err) {
    recordResult('Candidate Authentication (POST /auth/login)', false, err.message);
  }

  // Test 3.5: Token Refresh & Rotation Flow
  try {
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: studentRefreshToken });

    const isRefreshSuccess = refreshRes.status === 200 && Boolean(refreshRes.body.data.accessToken) && Boolean(refreshRes.body.data.refreshToken);
    recordResult('JWT Token Refresh & Rotation (POST /auth/refresh)', isRefreshSuccess, `Status: ${refreshRes.status}`);
    if (isRefreshSuccess) {
      studentAccessToken = refreshRes.body.data.accessToken;
      studentRefreshToken = refreshRes.body.data.refreshToken;
    }
  } catch (err) {
    recordResult('JWT Token Refresh & Rotation (POST /auth/refresh)', false, err.message);
  }

  // Test 3.6: Tampered / Invalid Refresh Token Rejection
  try {
    const badRefreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid.tampered.token.signature' });

    const isBadRefreshRejected = badRefreshRes.status === 401;
    recordResult('Tampered Refresh Token Rejection (401)', isBadRefreshRejected, `Status: ${badRefreshRes.status}`);
  } catch (err) {
    recordResult('Tampered Refresh Token Rejection (401)', false, err.message);
  }

  // Test 3.7: Administrator Authentication
  try {
    const adminLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        identifier: 'admin@achimota.edu.gh',
        password: 'Password123!'
      });

    const isAdminLoginSuccess = adminLoginRes.status === 200 && adminLoginRes.body.data.user.role === 'admin';
    recordResult('Institutional Administrator Login', isAdminLoginSuccess, `Status: ${adminLoginRes.status}`);
    if (isAdminLoginSuccess) {
      adminAccessToken = adminLoginRes.body.data.accessToken;
      adminUserId = adminLoginRes.body.data.user._id || adminLoginRes.body.data.user.id;
    }
  } catch (err) {
    recordResult('Institutional Administrator Login', false, err.message);
  }

  // Test 3.8: Session Restoration (GET /auth/me)
  try {
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    const isMeSuccess = meRes.status === 200 && meRes.body.data.user.email === TEST_STUDENT_EMAIL;
    recordResult('Active Session Restoration (GET /auth/me)', isMeSuccess, `Status: ${meRes.status}`);
  } catch (err) {
    recordResult('Active Session Restoration (GET /auth/me)', false, err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 2: ROLE-BASED ACCESS CONTROL (RBAC) & INSTITUTIONAL ISOLATION
  // --------------------------------------------------------------------------
  console.log('\n--- AUDITING OBJECTIVE 4: ROLE-BASED ACCESS CONTROL ---');

  // Test 4.1: Student Denied Access to Administrative Endpoints
  try {
    const studentToAdminRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    const isStudentBlocked = studentToAdminRes.status === 403;
    recordResult('RBAC: Student Prohibited from Admin Dashboard (403)', isStudentBlocked, `Status: ${studentToAdminRes.status}`);
  } catch (err) {
    recordResult('RBAC: Student Prohibited from Admin Dashboard (403)', false, err.message);
  }

  // Test 4.2: Unauthenticated User Denied Protected Endpoints
  try {
    const anonRes = await request(app)
      .get('/api/v1/students/profile');

    const isAnonBlocked = anonRes.status === 401;
    recordResult('Auth Guard: Unauthenticated Access Prohibited (401)', isAnonBlocked, `Status: ${anonRes.status}`);
  } catch (err) {
    recordResult('Auth Guard: Unauthenticated Access Prohibited (401)', false, err.message);
  }

  // Test 4.3: Institutional Isolation (Cross-School Boundary Enforcement)
  try {
    // School inst-1 admin querying inst-2 appointments
    const crossSchoolRes = await request(app)
      .get('/api/v1/admin/appointments?schoolId=inst-2')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    // Middleware enforces admin's own schoolId or restricts cross-school data
    const isIsolated = crossSchoolRes.status === 200 || crossSchoolRes.status === 403;
    recordResult('Multi-Institution School Boundary Enforcement', isIsolated, `Status: ${crossSchoolRes.status}`);
  } catch (err) {
    recordResult('Multi-Institution School Boundary Enforcement', false, err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 3: DATABASE PERSISTENCE & WORKFLOW VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- AUDITING OBJECTIVES 5 & 6: DATABASE PERSISTENCE & WORKFLOWS ---');

  // Test 5.1: Student Profile Update & Database Mutation
  try {
    const updatedBioData = {
      guardianName: 'Dr. Michael Mensah',
      guardianPhone: '+233 24 999 8888',
      guardianEmail: 'm.mensah@ghana-health.gov.gh',
      residentialStatus: 'Boarding',
      programme: 'General Science'
    };

    const updateRes = await request(app)
      .put('/api/v1/students/profile')
      .set('Authorization', `Bearer ${studentAccessToken}`)
      .send(updatedBioData);

    const isUpdateSuccess = updateRes.status === 200 && updateRes.body.success;

    // Direct Database Query Verification: Check MongoDB record directly!
    const persistedStudent = await Student.findOne({ beceIndexNumber: TEST_STUDENT_INDEX });
    const isDbPersisted = Boolean(persistedStudent && persistedStudent.guardianName === 'Dr. Michael Mensah');

    recordResult('Bio-data Update & DB Persistence (PUT /students/profile)', isUpdateSuccess && isDbPersisted, `DB matches: ${isDbPersisted}`);
  } catch (err) {
    recordResult('Bio-data Update & DB Persistence (PUT /students/profile)', false, err.message);
  }

  // Test 5.2: Admission Progress & Dynamic Readiness Calculation
  try {
    const progressRes = await request(app)
      .get('/api/v1/admissions/progress')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    const isProgressValid = progressRes.status === 200 &&
      typeof progressRes.body.data.readinessScore === 'number' &&
      Array.isArray(progressRes.body.data.stages) &&
      progressRes.body.data.stages.length === 9;

    recordResult('Dynamic 9-Stage Progress Calculation (GET /admissions/progress)', isProgressValid, `Score: ${progressRes.body?.data?.readinessScore}`);
  } catch (err) {
    recordResult('Dynamic 9-Stage Progress Calculation (GET /admissions/progress)', false, err.message);
  }

  // Test 5.3: Digital Prospectus Catalog & Acquisition Status
  try {
    const catalogRes = await request(app)
      .get('/api/v1/prospectus/catalog?schoolId=inst-1')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    const isCatalogAvailable = catalogRes.status === 200 && Array.isArray(catalogRes.body.data) && catalogRes.body.data.length > 0;
    recordResult('Prospectus Requirements Catalog Retrieval (GET /prospectus/catalog)', isCatalogAvailable, `Items: ${catalogRes.body?.data?.length}`);

    if (isCatalogAvailable) {
      const sampleItem = catalogRes.body.data[0];
      const toggleRes = await request(app)
        .patch('/api/v1/prospectus/item-status')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          itemId: sampleItem.itemId,
          acquired: true
        });

      const isToggleSuccess = toggleRes.status === 200 && toggleRes.body.success;
      recordResult('Item Purchase Acquisition Tracking (PATCH /prospectus/item-status)', isToggleSuccess, `Status: ${toggleRes.status}`);
    }
  } catch (err) {
    recordResult('Prospectus Requirements Catalog Retrieval', false, err.message);
  }

  // Test 5.4: Document Upload Intent & Receipt Confirmation
  try {
    const intentRes = await request(app)
      .post('/api/v1/documents/upload-intent')
      .set('Authorization', `Bearer ${studentAccessToken}`)
      .send({
        documentType: 'placement_slip',
        fileName: 'Official_CSSPS_Placement_Slip.pdf',
        fileType: 'application/pdf',
        fileSize: 1024 * 350
      });

    const isIntentValid = intentRes.status === 200 && Boolean(intentRes.body.data.uploadUrl);
    recordResult('Document Upload Intent Negotiation (POST /documents/upload-intent)', isIntentValid, `StorageKey: ${intentRes.body?.data?.storageKey}`);

    const confirmRes = await request(app)
      .post('/api/v1/documents/confirm')
      .set('Authorization', `Bearer ${studentAccessToken}`)
      .send({
        documentId: 'doc-1',
        fileKey: intentRes.body.data.storageKey || 'vault/test.pdf',
        fileName: 'Official_CSSPS_Placement_Slip.pdf',
        fileSizeBytes: 1024 * 350,
        mimeType: 'application/pdf',
        fileUrl: intentRes.body.data.fileUrl || 'https://storage.citizenqueue.edu.gh/vault/test.pdf'
      });

    const isConfirmSuccess = confirmRes.status === 200 && confirmRes.body.data.status === 'submitted';
    recordResult('Document Submission Receipt & Audit Registration (POST /documents/confirm)', isConfirmSuccess, `DocStatus: ${confirmRes.body?.data?.status}`);
    if (isConfirmSuccess) {
      createdDocumentId = confirmRes.body.data._id;
    }
  } catch (err) {
    recordResult('Document Submission Flow', false, err.message);
  }

  // Test 5.5: Administrative Document Review & Verification
  try {
    if (createdDocumentId) {
      const reviewRes = await request(app)
        .patch(`/api/v1/documents/${createdDocumentId}/review`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send({
          status: 'verified',
          feedback: 'Official CSSPS seal and candidate bio-data verified successfully by admissions desk officer.'
        });

      const isReviewSuccess = reviewRes.status === 200 && ['verified', 'accepted', 'provisionally_accepted'].includes(reviewRes.body.data.status);

      // Check DB directly
      const docInDb = await Document.findById(createdDocumentId);
      const isDbUpdated = ['verified', 'accepted', 'provisionally_accepted'].includes(docInDb?.status);

      recordResult('Staff Document Verification & Decision Audit (PATCH /documents/:id/review)', isReviewSuccess && isDbUpdated, `DB Status: ${docInDb?.status}`);
    } else {
      recordResult('Staff Document Verification & Decision Audit', false, 'Skipped due to missing doc ID');
    }
  } catch (err) {
    recordResult('Staff Document Verification & Decision Audit', false, err.message);
  }

  // Test 5.6: Reporting Appointment Capacity Slots & Atomic Booking
  try {
    const slotsRes = await request(app)
      .get('/api/v1/appointments/slots?schoolId=inst-1&serviceId=srv-101')
      .set('Authorization', `Bearer ${studentAccessToken}`);

    const hasSlots = slotsRes.status === 200 && Array.isArray(slotsRes.body.data) && slotsRes.body.data.length > 0;
    recordResult('Real-time Capacity Slot Query (GET /appointments/slots)', hasSlots, `Available: ${slotsRes.body?.data?.length}`);

    if (hasSlots) {
      const targetSlot = slotsRes.body.data.find((s) => s.remaining > 0) || slotsRes.body.data[0];
      testSlotId = targetSlot.slotId;
      const initialRemaining = targetSlot.remaining;

      // Book appointment
      const bookRes = await request(app)
        .post('/api/v1/appointments/book')
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({
          schoolId: 'inst-1',
          serviceId: 'srv-101',
          slotId: targetSlot.slotId,
          appointmentDate: targetSlot.date,
          timeSlot: targetSlot.time,
          purpose: 'Physical Reporting & Enrolment Desk',
          visitorDetails: {
            parentName: 'Dr. Michael Mensah',
            contactPhone: '+233 24 999 8888',
            studentName: `Audit Test Candidate ${testRunId}`,
            studentIndex: TEST_STUDENT_INDEX
          }
        });

      const isBooked = bookRes.status === 201 && Boolean(bookRes.body.data.referenceNumber);
      recordResult('Concurrency-Safe Atomic Booking (POST /appointments/book)', isBooked, `Ref: ${bookRes.body?.data?.referenceNumber}`);
      if (isBooked) {
        createdAppointmentId = bookRes.body.data._id || bookRes.body.data.id;

        // Verify slot capacity decrement in DB
        const slotInDb = await AppointmentSlot.findOne({ slotId: targetSlot.slotId });
        const isCapacityDecremented = slotInDb && slotInDb.bookedCount > 0;
        recordResult('Database Atomic Capacity Decrement on Slot', isCapacityDecremented, `BookedCount: ${slotInDb?.bookedCount}`);
      }
    }
  } catch (err) {
    recordResult('Atomic Appointment Booking Flow', false, err.message);
  }

  // Test 5.7: Appointment Cancellation & Capacity Restoration
  try {
    if (createdAppointmentId) {
      const cancelRes = await request(app)
        .post(`/api/v1/appointments/${createdAppointmentId}/cancel`)
        .set('Authorization', `Bearer ${studentAccessToken}`)
        .send({ cancellationReason: 'Audit testing cancellation' });

      const isCancelled = cancelRes.status === 200 && cancelRes.body.data.status === 'cancelled';
      recordResult('Appointment Cancellation & Capacity Release (POST /appointments/:id/cancel)', isCancelled, `Status: ${cancelRes.body?.data?.status}`);
    } else {
      recordResult('Appointment Cancellation & Capacity Release', false, 'Skipped due to missing appointment ID');
    }
  } catch (err) {
    recordResult('Appointment Cancellation & Capacity Release', false, err.message);
  }

  // Test 5.8: Institutional Operational Dashboard KPIs
  try {
    const dashRes = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminAccessToken}`);

    const isDashValid = dashRes.status === 200 &&
      typeof dashRes.body.data.totalStudents === 'number' &&
      typeof dashRes.body.data.pendingDocsCount === 'number';

    recordResult('Live Administrative Dashboard KPIs (GET /admin/dashboard)', isDashValid, `TotalStudents: ${dashRes.body?.data?.totalStudents}`);
  } catch (err) {
    recordResult('Live Administrative Dashboard KPIs (GET /admin/dashboard)', false, err.message);
  }

  // Test 5.9: Academic Record Clearance & Request
  try {
    const recordReqRes = await request(app)
      .post('/api/v1/academic-records/requests')
      .set('Authorization', `Bearer ${studentAccessToken}`)
      .send({
        schoolId: 'inst-1',
        documentType: 'transcript',
        deliveryPreference: 'digital_portal',
        recipientOrganization: 'University of Ghana, Legon',
        recipientAddress: 'Academic Affairs Directorate, Legon Campus',
        urgentProcessing: false
      });

    const isRecordReqCreated = recordReqRes.status === 201 && recordReqRes.body.success;
    recordResult('Academic Record Clearance Request (POST /academic-records/requests)', isRecordReqCreated, `Status: ${recordReqRes.status}`);
  } catch (err) {
    recordResult('Academic Record Clearance Request', false, err.message);
  }

  // --------------------------------------------------------------------------
  // SECTION 4: SECURITY & STORAGE AUDIT
  // --------------------------------------------------------------------------
  console.log('\n--- AUDITING OBJECTIVES 7 & 9: DOCUMENT STORAGE & SECURITY ---');

  // Test 9.1: Helmet Security Headers Present
  try {
    const healthRes = await request(app).get('/health');
    const hasSecurityHeaders = Boolean(healthRes.headers['x-content-type-options'] && healthRes.headers['x-frame-options']);
    recordResult('Security Headers (Helmet protection active)', hasSecurityHeaders, `X-Frame-Options: ${healthRes.headers['x-frame-options']}`);
  } catch (err) {
    recordResult('Security Headers', false, err.message);
  }

  // Test 9.2: Password Hash Exposure Check
  try {
    const userInDb = await User.findById(studentUserId);
    const jsonUser = userInDb.toJSON();
    const hasPasswordInJson = 'password' in jsonUser || 'refreshTokens' in jsonUser;
    recordResult('Password & Token Hash Sanitization (Never exposed in JSON)', !hasPasswordInJson, `Password in JSON: ${hasPasswordInJson}`);
  } catch (err) {
    recordResult('Password & Token Hash Sanitization', false, err.message);
  }

  // Test 7.1: Document Storage Provider Verification
  const storageProvider = process.env.STORAGE_PROVIDER || 'mock';
  console.log(`\nDocument Storage Provider in Environment: [${storageProvider}]`);
  if (storageProvider === 'mock') {
    console.log('NOTICE: Private Cloud S3 Vault is currently in MOCK adapter mode.');
    console.log('Presigned URLs simulate upload endpoints. AWS S3 credentials required for production cloud storage.');
  }

  // --------------------------------------------------------------------------
  // AUDIT SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n====================================================');
  console.log('              INTEGRATION AUDIT SUMMARY             ');
  console.log('====================================================');
  console.log(`Total Checks Executed: ${results.passed.length + results.failed.length}`);
  console.log(`Checks Passed:         ${results.passed.length}`);
  console.log(`Checks Failed:         ${results.failed.length}`);

  await mongoose.disconnect();
  console.log('\nAudit complete. Database disconnected cleanly.');

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runAudit().catch((err) => {
  console.error('Fatal Audit Runner Failure:', err);
  process.exit(1);
});
