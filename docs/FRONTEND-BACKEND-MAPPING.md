# CitizenQueue: Frontend-to-Backend Architecture & API Mapping
**Author:** Senior Backend & Security Architect  
**Project:** CitizenQueue — Ghanaian Educational Admission & Institutional Queue Orchestration Platform  
**Target Environment:** Node.js/Express on Render + MongoDB Atlas; Frontend on Vercel  

---

## 1. Executive Architecture Overview

CitizenQueue digitizes the post-placement administrative intake, document validation, digital prospectus verification, and reporting appointment scheduling for Ghanaian Senior High Schools (SHS) and tertiary institutions following the Computerized School Selection & Placement System (CSSPS) cycle.

### Frontend Topology & Communication Pattern
- **Framework:** React 19 + Vite 8 + Tailwind CSS v4.
- **Client Service Layer:** `src/services/api/apiClient.js` provides standard `GET`, `POST`, `PUT`, `PATCH`, `DELETE` methods that append `Authorization: Bearer <token>`.
- **Target API Base:** `/api/v1` (configurable via `VITE_API_BASE_URL`).
- **Response Contract Expected by Frontend:**
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "status": 200,
    "timestamp": "2026-11-14T12:00:00.000Z"
  }
  ```
  On failure:
  ```json
  {
    "success": false,
    "data": null,
    "error": "Error description message",
    "status": 400,
    "timestamp": "2026-11-14T12:00:00.000Z"
  }
  ```

---

## 2. Comprehensive Module-by-Module Mapping

### 2.1 Public & Authentication Module
**Frontend Files:**
- `src/pages/citizen/LandingPage.jsx`
- `src/pages/citizen/SignInPage.jsx`
- `src/pages/citizen/RegisterPage.jsx`
- `src/pages/admin/AdminRegisterPage.jsx`
- `src/context/AuthContext.jsx`
- `src/services/authService.js`

#### A. Candidate Sign Up (`/register`, `/signup`)
- **Required Backend Functionality:** Register student user account and associated student admission profile record. Verify that BECE index number is unique. Hash PIN/password with bcrypt. Generate short-lived access JWT and set HttpOnly refresh token cookie.
- **Required Database Entities:** `User`, `Student`, `Admission`, `AuditLog`.
- **API Endpoint:** `POST /api/v1/auth/register`
- **Request Payload:**
  ```json
  {
    "fullName": "Emmanuel Mensah",
    "beceIndexNumber": "101245089",
    "dateOfBirth": "2010-04-15",
    "gender": "Male",
    "assignedSchoolId": "inst-1",
    "programme": "General Science",
    "residentialStatus": "Boarding",
    "aggregateScore": "08",
    "juniorHighSchool": "St. Theresa's Basic School, Kaneshie",
    "guardianName": "Kwame Mensah",
    "guardianRelation": "Father",
    "guardianPhone": "+233 24 411 2233",
    "guardianEmail": "kwame.mensah@example.com",
    "homeTown": "Kasoa, Central Region",
    "pin": "2026",
    "confirmPin": "2026"
  }
  ```
- **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6735e1...",
        "role": "citizen",
        "name": "Emmanuel Mensah",
        "email": "kwame.mensah@example.com",
        "phone": "+233 24 411 2233",
        "schoolId": "inst-1",
        "schoolName": "Achimota Senior High School",
        "indexNumber": "101245089"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **User Permissions:** Public (unauthenticated).
- **Data Ownership Rules:** Creates new `User` with role `citizen`/`student` and a linked `Student` record owned by the user.

#### B. Administrative Staff Registration (`/admin/register`, `/staff/register`)
- **Required Backend Functionality:** Verify institutional authorization key (invitation secret), register staff user account, create staff record linked to institution.
- **Required Database Entities:** `User`, `School`, `AuditLog`.
- **API Endpoint:** `POST /api/v1/auth/admin/register`
- **Request Payload:**
  ```json
  {
    "title": "Mr.",
    "fullName": "Kwame Addo",
    "staffId": "GES-482910",
    "email": "k.addo@achimota.edu.gh",
    "phone": "+233 24 330 9988",
    "schoolId": "inst-1",
    "designation": "Admissions & Placement Officer",
    "department": "Admissions & Records Directorate",
    "authorizationKey": "GES-SHS-2026",
    "password": "staffpass2026",
    "confirmPassword": "staffpass2026"
  }
  ```
- **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6735e2...",
        "role": "admin",
        "name": "Mr. Kwame Addo",
        "email": "k.addo@achimota.edu.gh",
        "staffId": "GES-482910",
        "designation": "Admissions & Placement Officer",
        "department": "Admissions & Records Directorate",
        "institutionId": "inst-1",
        "institutionName": "Achimota Senior High School"
      },
      "token": "eyJhbGciOi..."
    }
  }
  ```
- **User Permissions:** Public with valid authorization key.
- **Data Ownership Rules:** Creates user with role `admin` or specific sub-roles (`academic_officer`, `housemaster`, `registrar`). Bound to `schoolId`.

#### C. Unified Sign In (`/login`, `/signin`)
- **Required Backend Functionality:** Authenticate student (via BECE index number/phone + PIN) or administrative staff (via email/staffId + password). Support rate limiting (brute force protection). Return access JWT + set HttpOnly refresh token cookie.
- **API Endpoint:** `POST /api/v1/auth/login`
- **Request Payload:**
  ```json
  {
    "identifier": "101245089",
    "password": "2026",
    "role": "citizen"
  }
  ```
  *(or role: "admin" with institutional email)*
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": { ... },
      "token": "eyJhbGci..."
    }
  }
  ```

#### D. Session Refresh & Termination (`/api/v1/auth/refresh`, `/api/v1/auth/logout`)
- **Required Backend Functionality:** Rotate refresh tokens, detect token reuse, invalidate stored refresh token family, revoke session cookies on logout.
- **API Endpoints:**
  - `POST /api/v1/auth/refresh`
  - `POST /api/v1/auth/logout`
  - `GET /api/v1/auth/me`

---

### 2.2 Student & Admission Profile Module
**Frontend Files:**
- `src/pages/citizen/AdmissionProfilePage.jsx`
- `src/services/admissionService.js`

#### A. Fetch Candidate Profile (`/profile`)
- **Required Backend Functionality:** Fetch the authenticated candidate's bio-data, CSSPS placement data, guardian contacts, and placement slip attachment details.
- **API Endpoint:** `GET /api/v1/students/me`
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "std-101245089",
      "fullName": "Emmanuel Mensah",
      "beceIndexNumber": "101245089",
      "dateOfBirth": "2010-04-15",
      "gender": "Male",
      "assignedSchool": "Achimota Senior High School",
      "assignedSchoolId": "inst-1",
      "programme": "General Science",
      "residentialStatus": "Boarding",
      "guardianName": "Kwame Mensah",
      "guardianPhone": "+233 24 411 2233",
      "guardianEmail": "kwame.mensah@example.com",
      "guardianRelation": "Father",
      "homeTown": "Kasoa, Central Region",
      "placementBatch": "CSSPS 2026 Batch A",
      "aggregateScore": "08",
      "juniorHighSchool": "St. Theresa's Basic School, Kaneshie",
      "placementSlipUploaded": true,
      "placementSlipFileName": "cssps_placement_slip_101245089.pdf",
      "isComplete": true
    }
  }
  ```
- **User Permissions:** Authenticated student (`role: citizen/student`).
- **Data Ownership Rules:** Strict self-ownership (`student.userId === req.user.id`).

#### B. Update Candidate Bio-Data (`PATCH /api/v1/students/me`)
- **Required Backend Functionality:** Update editable bio-data fields, recompute profile completeness, log audit event.
- **Request Payload:**
  ```json
  {
    "homeTown": "Kasoa, Central Region",
    "juniorHighSchool": "St. Theresa's Basic School",
    "guardianName": "Kwame Mensah",
    "guardianPhone": "+233 24 411 2233",
    "guardianEmail": "kwame.mensah@example.com",
    "guardianRelation": "Father",
    "placementSlipUploaded": true,
    "placementSlipFileName": "placement_slip.pdf"
  }
  ```

---

### 2.3 Digital Prospectus & Item Photo Verification Module
**Frontend Files:**
- `src/pages/citizen/DigitalProspectusPage.jsx`
- `src/pages/admin/AdminProspectusPage.jsx`
- `src/pages/admin/AdminItemReviewPage.jsx`
- `src/services/admissionService.js`

#### A. Retrieve School Prospectus Items & Free GES Items
- **Required Backend Functionality:** Retrieve all items required by the student's assigned school, partitioned by categories (Clothing, Bedding, Toiletries, Academic Materials, Storage, Maintenance). Include items provided 100% free under the National Free SHS policy.
- **API Endpoint:** `GET /api/v1/schools/:schoolId/prospectus`
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "pr-101",
          "schoolId": "inst-1",
          "name": "Khaki Trousers (Official Uniform)",
          "targetGender": "boy",
          "category": "Clothing and Uniforms",
          "specification": "Standard school khaki brown...",
          "quantity": "2 pairs",
          "requiresPhotoReview": false
        }
      ],
      "gesFreeItems": [ ... ]
    }
  }
  ```

#### B. Student Prospectus Status Ledger
- **Required Backend Functionality:** Get and update student's acquisition status per item, upload optional item verification photos, and view administrator review feedback.
- **API Endpoints:**
  - `GET /api/v1/admissions/me/prospectus-status`
  - `PATCH /api/v1/admissions/me/prospectus-items/:itemId` (Payload: `{ "purchased": true }`)
  - `POST /api/v1/admissions/me/prospectus-items/:itemId/photo` (Payload: `{ "photoUrl": "...", "photoName": "..." }`)
  - `DELETE /api/v1/admissions/me/prospectus-items/:itemId/photo`

#### C. Administrator Review of Item Photos
- **Required Backend Functionality:** Inspect candidate item photos, update photo verification status (`provisionally_accepted` or `changes_required`), record feedback note, dispatch student notification.
- **API Endpoint:** `POST /api/v1/admin/prospectus-items/:studentId/:itemId/review`
- **Request Payload:**
  ```json
  {
    "status": "provisionally_accepted",
    "adminFeedback": "Approved: Meets Achimota School specifications."
  }
  ```
- **User Permissions:** Authenticated institutional admin with school match (`admin.schoolId === student.schoolId`).

#### D. Administrator Prospectus Configuration
- **API Endpoints:**
  - `POST /api/v1/admin/prospectus/requirements` (Create new item requirement)
  - `PATCH /api/v1/admin/prospectus/requirements/:id` (Update specifications)
  - `DELETE /api/v1/admin/prospectus/requirements/:id` (Delete requirement)

---

### 2.4 Document Centre & Credential Clearance Module
**Frontend Files:**
- `src/pages/citizen/DocumentCentrePage.jsx`
- `src/pages/admin/AdminDocumentReviewPage.jsx`
- `src/services/admissionService.js`
- `src/services/documentService.js`

#### A. Retrieve Student Mandatory Documents
- **API Endpoint:** `GET /api/v1/students/me/documents`
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "doc-1",
        "name": "CSSPS Placement Slip",
        "category": "Placement & Enrollment",
        "required": true,
        "status": "provisionally_accepted",
        "fileName": "cssps_placement_slip.pdf",
        "fileSize": "1.2 MB",
        "uploadedAt": "2026-10-24T09:15:00Z",
        "reviewedAt": "2026-10-24T14:20:00Z",
        "adminFeedback": "Placement confirmed.",
        "fileUrl": "..."
      }
    ]
  }
  ```

#### B. Document Upload Process (Presigned Cloud Storage Flow)
1. `POST /api/v1/documents/upload-intent`  
   **Payload:** `{ "documentRequirementId": "doc-1", "fileName": "slip.pdf", "fileSize": 1240000, "mimeType": "application/pdf" }`  
   **Response:** `{ "uploadUrl": "https://storage.provider.../key?presigned=...", "storageKey": "inst-1/std-101/slip.pdf" }`
2. Frontend uploads directly to private object storage.
3. `POST /api/v1/documents/complete-upload`  
   **Payload:** `{ "documentRequirementId": "doc-1", "storageKey": "inst-1/std-101/slip.pdf", "fileName": "slip.pdf", "fileSize": 1240000, "mimeType": "application/pdf" }`  
   **Response:** Records document in MongoDB, updates status to `submitted`.

#### C. Administrative Document Review Terminal
- **API Endpoints:**
  - `GET /api/v1/admin/documents` (List all documents across cohort with filtering by status, category, student index, and search query)
  - `GET /api/v1/admin/students/:studentId/documents` (Inspect specific student dossier)
  - `POST /api/v1/admin/documents/:id/review` (Approve / Reject with feedback note)
  - `POST /api/v1/admin/documents/batch-review` (Batch review multiple documents)
  - `POST /api/v1/admin/document-requirements` (Create new institutional document requirement)
  - `PATCH /api/v1/admin/document-requirements/:id`
  - `DELETE /api/v1/admin/document-requirements/:id`

---

### 2.5 Admission Progress Tracker & Journey Metrics
**Frontend Files:**
- `src/pages/citizen/AdmissionProgressPage.jsx`
- `src/pages/citizen/CitizenDashboardPage.jsx`
- `src/services/admissionService.js`

- **Required Backend Functionality:** Computes real-time composite readiness score (0-100%) and current admission stage (1 through 9) from the authoritative state of:
  1. Bio-data profile completion (Mandatory fields check)
  2. Document submission & verification ratios (Accepted vs Pending vs Changes Required)
  3. Prospectus acquisition and required item photo approvals
  4. Reporting appointment reservation status
  5. Campus arrival check-in and final enrollment confirmation
- **API Endpoint:** `GET /api/v1/admissions/me/progress`
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "compositeScore": 82,
      "currentStage": 5,
      "profileComplete": true,
      "totalDocs": 6,
      "docsAccepted": 3,
      "docsSubmitted": 2,
      "docsChanges": 1,
      "totalProspectusItems": 15,
      "purchasedCount": 13,
      "photosAcceptedCount": 4,
      "activeAppointment": { ... },
      "stages": [
        { "stage": 1, "title": "Placement Received", "isCompleted": true, "isCurrent": false },
        { "stage": 5, "title": "Preliminary Review Completed", "isCompleted": false, "isCurrent": true }
      ],
      "outstandingTasks": [ ... ]
    }
  }
  ```

---

### 2.6 Appointments & Capacity Concurrency Module
**Frontend Files:**
- `src/pages/citizen/BookingPage.jsx`
- `src/pages/citizen/BookingConfirmationPage.jsx`
- `src/pages/citizen/AppointmentDetailsPage.jsx`
- `src/pages/admin/AdminAppointmentsPage.jsx`
- `src/pages/admin/AdminAvailabilityPage.jsx`
- `src/services/appointmentService.js`
- `src/services/serviceService.js`

#### A. Service Availability & Slots
- **API Endpoint:** `GET /api/v1/appointments/availability?serviceId=srv-101&month=2026-10`
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "date": "2026-10-27",
        "slots": [
          { "id": "slot-101-1", "time": "08:30 AM", "capacity": 8, "bookedCount": 5, "remaining": 3 }
        ]
      }
    ]
  }
  ```

#### B. Concurrency-Safe Appointment Booking
- **Required Backend Functionality:**
  - Enforce concurrency safety using atomic MongoDB conditional updates (`$inc: { bookedCount: 1 }` with query `{ bookedCount: { $lt: capacity } }`) or MongoDB transactions.
  - Enforce duplicate booking rejection for the same student on the same date.
  - Generate human-readable reference number: `CQ-2026-XXXXXX`.
- **API Endpoint:** `POST /api/v1/appointments`
- **Request Payload:**
  ```json
  {
    "serviceId": "srv-101",
    "slotId": "slot-101-1",
    "date": "2026-10-27",
    "visitor": {
      "parentName": "Kwame Mensah",
      "contactPhone": "+233 24 411 2233",
      "contactEmail": "kwame.mensah@example.com",
      "studentName": "Emmanuel Mensah",
      "studentIndex": "101245089",
      "notes": "Travelling from Kasoa"
    }
  }
  ```
- **Expected Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "id": "apt-cq-882101",
      "referenceNumber": "CQ-2026-882101",
      "status": "booked",
      "appointmentDate": "2026-10-27",
      "appointmentTime": "08:30 AM",
      "checklist": [ ... ]
    }
  }
  ```

#### C. Appointment Lifecycle & Desk Management
- **API Endpoints:**
  - `GET /api/v1/appointments/:id` (Fetch appointment details)
  - `PATCH /api/v1/appointments/:id/cancel` (Cancel booking & restore slot capacity)
  - `GET /api/v1/admin/appointments` (Desk ledger with date, status & search filters)
  - `PATCH /api/v1/admin/appointments/:id/status` (Update status: `checked_in`, `in_progress`, `completed`, `no_show`)
  - `PATCH /api/v1/admin/appointments/:id/checklist/:checkId` (Toggle document checklist verification)

#### D. Institutional Availability & Slot Capacity Configuration
- **API Endpoints:**
  - `GET /api/v1/admin/availability/:serviceId`
  - `POST /api/v1/admin/availability/slots` (Create new date slot)
  - `PATCH /api/v1/admin/availability/slots/:slotId` (Update slot capacity)
  - `DELETE /api/v1/admin/availability/slots/:slotId`

---

### 2.7 Academic Records & Departmental Clearance Module (`srv-102`)
**Frontend Files:**
- `src/data/mockData.js` (`srv-102`, `srv-105`)
- `src/pages/citizen/BookingPage.jsx`

#### A. Academic Record Request Workflow
- **Documents Supported:**
  - Official Academic Transcripts
  - Certified Completion Testimonials
  - Certified Statements of Results
  - Formal Recommendation Letters
  - Institutional Attestation / Verification Letters
  - School-Held WASSCE Certificate Collection
- **Workflow Stages:**
  1. Request Submission (`POST /api/v1/academic-records/requests`)
  2. Identity & BECE/WASSCE Index Verification
  3. Departmental Clearance Checks:
     - **Finance:** Processing fees / outstanding student fee balances
     - **Library:** Unreturned library books or resources
     - **Stores:** Dormitory trunk / sports equipment returns
     - **Academic Office:** Results compilation & verification
     - **Administration:** Formal institutional approval
  4. Dispute Resolution (Students can raise formal disputes over unverified debt flags)
  5. Document Preparation & Seal
  6. Quality Review & Headmaster / Registrar Authorization
  7. Physical Collection Scheduling (`srv-102` appointment booking)
  8. Physical Verification & Collection Confirmation
- **API Endpoints:**
  - `POST /api/v1/academic-records/requests`
  - `GET /api/v1/academic-records/requests/me`
  - `GET /api/v1/admin/academic-records/requests`
  - `PATCH /api/v1/admin/academic-records/requests/:id/clearance`
  - `POST /api/v1/academic-records/requests/:id/dispute`
  - `PATCH /api/v1/admin/academic-records/requests/:id/approve`
  - `POST /api/v1/admin/academic-records/requests/:id/confirm-collection`

---

### 2.8 Institutional Administration & Multi-School Isolation
**Frontend Files:**
- `src/layouts/AdminLayout.jsx`
- `src/pages/admin/AdminDashboardPage.jsx`
- `src/pages/admin/AdminStudentsPage.jsx`
- `src/pages/admin/AdminServicesPage.jsx`

#### A. Multi-Institution Isolation Principle
- Every administrative query MUST automatically scope database lookups by the staff member's authenticated `schoolId`.
- No admin from School A (e.g. Achimota) can view or modify records, appointments, students, or documents belonging to School B (e.g. Prempeh College).
- The `schoolId` parameter passed by the client is never trusted blindly; the server-side auth token context is authoritative.

#### B. Administrative Dashboard Metrics
- **API Endpoint:** `GET /api/v1/admin/dashboard`
- **Expected Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalStudents": 8,
      "completedProfiles": 7,
      "readyForReporting": 4,
      "docsAwaitingReview": 3,
      "docsChangesRequired": 1,
      "scheduledAppointments": 2,
      "completedRegistrations": 1,
      "totalCapacity": 120,
      "totalBooked": 42,
      "remainingCapacity": 78,
      "bottlenecks": [ ... ]
    }
  }
  ```

---

## 3. Frontend-Backend Inconsistencies & Integration Gap Analysis

| Frontend Behavior / Artifact | Underlying Issue / Gap | Backend Solution & Architecture Contract |
| :--- | :--- | :--- |
| **LocalStorage Tokens (`cq_auth_token`)** | Long-lived tokens in `localStorage` are vulnerable to XSS. | Implement short-lived Access Tokens (15 min) returned in JSON payload for `Authorization: Bearer <token>`, paired with HttpOnly, Secure, SameSite Refresh Cookies stored in database. |
| **String IDs vs MongoDB ObjectIds** | Frontend uses demo IDs like `inst-1`, `srv-101`, `std-101245089`, `pr-101`, `doc-1`. | Backend models support both native MongoDB `_id` and indexed unique business identifiers (`schoolId: "inst-1"`, `serviceId: "srv-101"`, `indexNumber: "101245089"`), enabling dual lookup seamlessly. |
| **Direct Base64 Image Uploads** | Frontend simulates photo upload with `FileReader.readAsDataURL()`, packing multi-megabyte base64 strings into localStorage. | Presigned Cloud Object Storage URL flow: Client requests upload intent -> Backend signs secure upload URL -> Client uploads binary directly -> Backend stores sanitized metadata. |
| **Unprotected Concurrency in Bookings** | Frontend reads local slot array, increments `bookedCount` in memory, and writes back. Under simultaneous requests, capacity overbooking occurs. | Atomic conditional updates: `{ _id: slotId, bookedCount: { $lt: capacity } }` with `$inc: { bookedCount: 1 }`, combined with MongoDB unique compound index `[studentId, appointmentDate]`. |
| **Client-Side Role Switching** | Frontend context switches between student and admin with a simulated persona toggle button. | Strict Server-Side Role-Based Access Control (RBAC) middleware verifying signed JWT claims. Route guards on frontend are reinforced by server boundaries. |
| **Cross-School Parameter Spoofing** | Frontend allows admin to filter or select `institutionName` in form fields. | Staff token embeds verified `institutionId`. Backend middleware enforces `req.user.institutionId` on all write and read queries. |

---

## 4. Verification Checklists & Completion Criteria
- [x] All 9 Admission Stages mapped with definitive state transitions.
- [x] Multi-institution isolation contract defined.
- [x] Concurrency safety rules specified for appointment slots.
- [x] Cloud storage presigned URL architecture formalized.
- [x] Academic Records and Departmental Clearance workflow documented.
- [x] Standard REST response envelope `{ success, data, error, status, timestamp }` codified.
