# CitizenQueue Backend Integration Architecture Plan
**Target Stack:** Node.js, Express.js, MongoDB (Mongoose), Cloud File Storage (S3 / GridFS)  
**Version:** 1.0.0  
**Domain:** Ghanaian Senior High School (SHS) Admission & Service Orchestration

---

## 1. Executive Summary & Architectural Philosophy

CitizenQueue is designed to bridge the post-placement administrative gap between the Computerized School Selection and Placement System (CSSPS) and physical reporting at Ghanaian Senior High Schools.

### Core Principles
1. **Decoupled Client-Server Contract:** The React frontend interacts with the backend strictly through asynchronous JSON/REST APIs and multipart upload endpoints via the centralized `apiClient` service adapter.
2. **Stateless Authentication:** JSON Web Tokens (JWT) in standard `Authorization: Bearer <token>` headers manage role-based access for students, guardians, and institutional officers.
3. **Queue Fairness & Capacity Limits:** Strict capacity limits per time slot prevent campus congestion. There are **zero paid priority tiers or expedited lanes**.
4. **Mandatory Physical Verification Baseline:** Digital preliminary document reviews and item photo screening reduce arrival queues by up to 80%, but physical identity verification and original document presentation remain mandatory on campus.

---

## 2. Authentication & Authorization Specification

### 2.1 Security Model
- **Token Delivery:** JWT signed with HMAC SHA-256 or RSA-256.
- **Access Token Expiry:** 15–60 minutes.
- **Refresh Token Expiry:** 7–30 days (stored in HTTP-only, Secure cookie).
- **Role-Based Access Control (RBAC):**
  - `citizen` / `student`: Admitted candidate or guardian. Restrained to viewing and updating their own profile, documents, prospectus checklist, and appointments.
  - `admin`: School Admissions Desk Officer. Authorized to review submissions, inspect dossiers, manage prospectus items, and configure capacity.
  - `superadmin`: Ministry or District Director with aggregate multi-school visibility.

---

## 3. REST API Endpoint Catalog

### 3.1 Authentication Endpoints (`/api/v1/auth`)

#### `POST /api/v1/auth/register`
Creates student admission account post-CSSPS placement.
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "beceIndexNumber": "1012450890",
  "fullName": "Emmanuel Mensah",
  "gender": "Male",
  "dateOfBirth": "2009-04-12",
  "assignedSchool": "Achimota Senior High School",
  "schoolCode": "ACH-SHS-01",
  "programme": "General Science",
  "residentialStatus": "Boarding",
  "aggregateScore": 10,
  "guardianName": "Kwame Mensah",
  "guardianPhone": "+233244112233",
  "guardianEmail": "kwame.mensah@example.com",
  "password": "SecurePassword123!"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "usr_654321",
      "role": "citizen",
      "name": "Emmanuel Mensah",
      "indexNumber": "1012450890",
      "school": "Achimota Senior High School"
    }
  }
}
```

#### `POST /api/v1/auth/login`
Authenticates candidate, guardian, or school administrator.
- **Request Body:**
```json
{
  "identifier": "1012450890", // or "admissions-desk@achimota.edu.gh"
  "password": "UserSecretPass!",
  "role": "citizen" // or "admin"
}
```
- **Response `200 OK`:** Same payload structure as register.

#### `POST /api/v1/auth/logout`
Revokes active session token.
- **Response `200 OK`:** `{ "success": true, "message": "Session terminated" }`

---

### 3.2 Student Profile & Placement (`/api/v1/student`)

#### `GET /api/v1/student/profile`
Retrieves bio-data, CSSPS placement, and guardian information.
- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "std_1012450890",
    "fullName": "Emmanuel Mensah",
    "beceIndexNumber": "1012450890",
    "dateOfBirth": "2009-04-12",
    "gender": "Male",
    "assignedSchool": "Achimota Senior High School",
    "programme": "General Science",
    "residentialStatus": "Boarding",
    "aggregateScore": 10,
    "guardianName": "Kwame Mensah",
    "guardianPhone": "+233244112233",
    "guardianEmail": "kwame.mensah@example.com",
    "emergencyContact": "+233201122334",
    "hometown": "Aburi",
    "region": "Eastern Region",
    "isComplete": true
  }
}
```

#### `PUT /api/v1/student/profile`
Updates editable student profile fields (contacts, medical notes, emergency contact).
- **Request Body:** Partial or complete profile fields.
- **Response `200 OK`:** Updated student profile object.

#### `GET /api/v1/student/readiness`
Calculates real-time admission readiness score across all 9 stages.
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "compositeScore": 65,
    "currentStage": 6,
    "profileComplete": true,
    "totalDocs": 6,
    "docsAccepted": 4,
    "docsSubmitted": 1,
    "docsChanges": 0,
    "totalProspectusItems": 15,
    "purchasedCount": 11,
    "photosAcceptedCount": 5,
    "photosAwaitingCount": 2,
    "isReadyForReporting": false,
    "activeAppointment": null
  }
}
```

---

### 3.3 Digital Prospectus & Items (`/api/v1/prospectus`, `/api/v1/student/prospectus-status`)

#### `GET /api/v1/prospectus`
Fetches official prospectus requirements for candidate's school and programme.
- **Response `200 OK`:** Array of prospectus items with category, specifications, mandatory flags, and photo requirements.

#### `GET /api/v1/student/prospectus-status`
Fetches candidate's checklist status for all items.
- **Response `200 OK`:** Key-value map of item ID to status `{ purchased, photoStatus, photoUrl, adminFeedback, submittedAt }`.

#### `PATCH /api/v1/student/prospectus-status/:itemId/purchased`
Updates purchase checkbox for a prospectus item.
- **Request Body:** `{ "isPurchased": true }`

#### `POST /api/v1/student/prospectus-status/:itemId/photo`
Submits item photograph for preliminary verification.
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** `file` (image binary <= 5MB)
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "itemId": "itm-01",
    "photoStatus": "awaiting_review",
    "photoUrl": "https://cdn.citizenqueue.gov.gh/items/itm-01-uuid.webp",
    "submittedAt": "2026-11-08T16:20:00Z"
  }
}
```

---

### 3.4 Document Submission & Review (`/api/v1/student/documents`)

#### `GET /api/v1/student/documents`
Lists required documents and upload status.
- **Response `200 OK`:** Array of documents `{ id, name, category, status, fileUrl, adminFeedback }`.

#### `POST /api/v1/student/documents/:docId/upload`
Uploads document (PDF, PNG, JPG).
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** `file` (binary <= 5MB)
- **Response `200 OK`:** Updated document record with `status: "submitted"`.

#### `DELETE /api/v1/student/documents/:docId`
Deletes an uploaded document (permitted only when status is `not_submitted`, `submitted`, or `changes_required`).

---

### 3.5 Appointments & Reporting Capacity (`/api/v1/appointments`)

#### `GET /api/v1/appointments/availability`
Query parameters: `?serviceId=srv-101&month=2026-11`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2026-11-16",
      "slots": [
        { "id": "s-1", "time": "08:00 - 09:30", "capacity": 25, "bookedCount": 18, "isAvailable": true },
        { "id": "s-2", "time": "09:30 - 11:00", "capacity": 25, "bookedCount": 25, "isAvailable": false }
      ]
    }
  ]
}
```

#### `POST /api/v1/appointments`
Books a reporting appointment with atomic capacity lock.
- **Request Body:**
```json
{
  "serviceId": "srv-101",
  "date": "2026-11-16",
  "slotId": "s-1",
  "visitor": {
    "candidateName": "Emmanuel Mensah",
    "indexNumber": "1012450890",
    "parentName": "Kwame Mensah",
    "contactPhone": "+233244112233",
    "contactEmail": "kwame.mensah@example.com"
  }
}
```
- **Response `201 Created`:** Full appointment record with `referenceNumber` (e.g. `CQ-ACH-8942`).

---

### 3.6 Institutional Desk Administration (`/api/v1/admin`)
*Requires `role: "admin"`.*

#### `GET /api/v1/admin/metrics`
Operational KPIs for dashboard: total admitted, documents pending, item photos pending, enrolled, capacity utilization.

#### `GET /api/v1/admin/students`
Query parameters: `?page=1&limit=20&search=1012&programme=General+Science&stage=3`
- **Response `200 OK`:** Paginated cohort roster with readiness scores and stage indicators.

#### `GET /api/v1/admin/students/:id/dossier`
Returns aggregated student profile, all submitted documents with review logs, item photos with statuses, and appointment details.

#### `PATCH /api/v1/admin/documents/:docId/review`
- **Request Body:**
```json
{
  "studentId": "std_1012450890",
  "status": "accepted", // or "changes_required"
  "adminFeedback": "Document verified against CSSPS master placement."
}
```

#### `PATCH /api/v1/admin/items/:itemId/review`
- **Request Body:**
```json
{
  "studentId": "std_1012450890",
  "status": "changes_required",
  "adminFeedback": "Trunk dimensions exceed hostel standard (Max 36x24x18 inches)."
}
```

#### `POST /api/v1/admin/prospectus`
Adds a new requirement to the school digital prospectus.

#### `PATCH /api/v1/admin/capacity/slots/:slotId`
Adjusts capacity limit for a reporting slot.

---

## 4. MongoDB Database Schema Specification

### 4.1 Users & Authentication (`users`)
```javascript
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true, lowercase: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['citizen', 'admin', 'superadmin'], default: 'citizen' },
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile' },
  institutionId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});
```

### 4.2 Student Profile (`student_profiles`)
```javascript
const StudentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  beceIndexNumber: { type: String, unique: true, required: true },
  fullName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female'] },
  assignedSchool: { type: String, required: true },
  schoolCode: { type: String, required: true },
  programme: { type: String, required: true },
  residentialStatus: { type: String, enum: ['Boarding', 'Day'], required: true },
  aggregateScore: { type: Number, default: 10 },
  guardianName: { type: String, required: true },
  guardianPhone: { type: String, required: true },
  guardianEmail: { type: String },
  emergencyContact: { type: String },
  hometown: { type: String },
  region: { type: String },
  admissionStage: { type: Number, default: 2, min: 1, max: 9 },
  readinessScore: { type: Number, default: 35, min: 0, max: 100 },
  registrationStatus: {
    type: String,
    enum: ['profile_pending', 'documents_pending', 'appointment_booked', 'reporting_ready', 'enrolled'],
    default: 'profile_pending'
  }
}, { timestamps: true });
```

### 4.3 Student Documents (`student_documents`)
```javascript
const StudentDocumentSchema = new mongoose.Schema({
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  docKey: { type: String, required: true }, // e.g., 'doc-cssps-placement'
  title: { type: String, required: true },
  category: { type: String, enum: ['Academic', 'Medical', 'Identification', 'Administrative'] },
  fileUrl: { type: String },
  fileName: { type: String },
  fileSize: { type: String },
  mimeType: { type: String },
  status: {
    type: String,
    enum: ['not_submitted', 'submitted', 'under_review', 'accepted', 'changes_required'],
    default: 'not_submitted'
  },
  adminFeedback: { type: String, default: null },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
```

### 4.4 Prospectus Item & Submission (`prospectus_items` & `student_prospectus_status`)
```javascript
const ProspectusItemSchema = new mongoose.Schema({
  schoolCode: { type: String, required: true },
  programme: { type: String, default: 'All' },
  residentialStatus: { type: String, enum: ['All', 'Boarding', 'Day'], default: 'All' },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: String, required: true },
  specifications: { type: String },
  isMandatory: { type: Boolean, default: true },
  requiresPhoto: { type: Boolean, default: false }
});

const StudentProspectusStatusSchema = new mongoose.Schema({
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProspectusItem', required: true },
  purchased: { type: Boolean, default: false },
  photoUrl: { type: String, default: null },
  photoStatus: {
    type: String,
    enum: ['none', 'awaiting_review', 'accepted', 'changes_required'],
    default: 'none'
  },
  adminFeedback: { type: String, default: null },
  submittedAt: { type: Date },
  reviewedAt: { type: Date }
}, { timestamps: true });
```

### 4.5 Appointments & Capacity (`reporting_appointments`)
```javascript
const AppointmentSchema = new mongoose.Schema({
  studentProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentProfile', required: true },
  referenceNumber: { type: String, unique: true, required: true }, // e.g., 'CQ-ACH-8942'
  schoolCode: { type: String, required: true },
  serviceId: { type: String, default: 'srv-101' },
  appointmentDate: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  slotId: { type: String, required: true },
  status: {
    type: String,
    enum: ['booked', 'checked_in', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'booked'
  },
  visitorDetails: {
    candidateName: { type: String, required: true },
    parentName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactEmail: { type: String }
  },
  checkedInAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });
```

---

## 5. Frontend Switching from Demo Adapter to Live Backend

The frontend application uses a clean adapter pattern in `src/services/api/apiClient.js`.

To switch the entire application to the production backend:
1. Update `src/utils/constants.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'https://api.citizenqueue.gov.gh/api/v1',
  TIMEOUT_MS: 10000,
  SIMULATE_NETWORK_DELAY_MS: 0,
  USE_BACKEND: true // Enable live backend dispatching
};
```
2. Set environment variable in `.env`:
```env
VITE_API_BASE_URL=https://api.citizenqueue.gov.gh/api/v1
```
All service calls (`authService`, `studentService`, `documentService`, `prospectusService`, `appointmentService`, `adminService`) will automatically dispatch standard REST requests to the Node/Express backend with JWT headers.

---

## 6. Real-Time Two-Way Synchronization Architecture

For real-time desk updates when an administrator accepts a document or when a student uploads an item photo:
- **WebSocket Gateway:** Socket.io on `/ws`
- **Channels:**
  - `student:<studentProfileId>`: Emits review decisions and status updates directly to student viewport.
  - `school:<schoolCode>`: Emits incoming document uploads and appointment bookings to administrator desks.
- **Client Fallback:** If WebSockets are unavailable, `apiClient` falls back to smart interval polling (every 30 seconds) on dashboard and review queue pages.

