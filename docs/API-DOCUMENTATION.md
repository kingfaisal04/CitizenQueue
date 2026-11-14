# CitizenQueue Backend API Documentation

**Version:** 1.0.0  
**Base URL:** `/api/v1`  
**Protocol:** HTTPS  
**Format:** JSON  

---

## 1. Unified Response Envelope

All API endpoints return responses in a standardized JSON contract matching the frontend client specifications:

```json
{
  "status": 200,
  "success": true,
  "data": { ... },
  "error": null,
  "timestamp": "2026-10-30T10:00:00.000Z"
}
```

When an error occurs:

```json
{
  "status": 400,
  "success": false,
  "data": {
    "details": [
      { "field": "email", "message": "Invalid email address format" }
    ]
  },
  "error": "Validation failed",
  "timestamp": "2026-10-30T10:00:00.000Z"
}
```

---

## 2. Authentication & Authorization

All protected routes require an HTTP Authorization header containing a valid Bearer JWT:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Alternatively, the refresh token can be delivered via secure HTTP-only cookies (`refreshToken`).

### Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register student candidate & initialize admission | None |
| `POST` | `/api/v1/auth/register-admin` | Provision institutional administrator | None (or Super Admin) |
| `POST` | `/api/v1/auth/login` | Authenticate by email, phone, or BECE index | None |
| `POST` | `/api/v1/auth/refresh` | Rotate session & retrieve fresh access token | None (cookie or body) |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token session | Bearer JWT |
| `GET` | `/api/v1/auth/me` | Fetch active user profile, student record, & admission | Bearer JWT |

---

## 3. Schools & Educational Institutions

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/schools` | List institutions with filtering (region, category, search) | None |
| `GET` | `/api/v1/schools/:schoolId` | Get detailed institution information and contact details | None |
| `GET` | `/api/v1/schools/:schoolId/services` | List active services available at this institution | None |
| `GET` | `/api/v1/schools/:schoolId/prospectus` | View published digital prospectus for this institution | None |

---

## 4. Student Profiles & Admission Progression

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/students/profile` | Get current student bio-data and contact details | Student / Admin |
| `PUT` | `/api/v1/students/profile` | Update student biodata, guardian contacts, and boarding preferences | Student / Admin |
| `GET` | `/api/v1/admissions/progress` | Get real-time admission readiness score (0–100%) and stage | Student / Admin |
| `GET` | `/api/v1/admissions/stages` | Get 9-stage admission progression checklist | Student / Admin |
| `GET` | `/api/v1/admissions/tasks` | Get pending actionable tasks for student dashboard | Student / Admin |
| `PUT` | `/api/v1/admissions/:admissionId/stage` | Override or verify stage completion | Admin Only |

---

## 5. Digital Prospectus

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/prospectus/catalog` | View complete school prospectus requirements | None |
| `GET` | `/api/v1/prospectus/me` | Get student checklist with acquisition & photo review statuses | Student |
| `PATCH` | `/api/v1/prospectus/item-status` | Toggle item acquisition status (`purchased: true/false`) | Student |
| `POST` | `/api/v1/prospectus/item-photo` | Submit item photograph for visual pre-verification | Student |
| `PATCH` | `/api/v1/prospectus/:admissionId/item-review` | Approve or reject student item photograph | Admin Only |
| `POST` | `/api/v1/prospectus/item` | Create a new institutional prospectus requirement | Admin Only |

---

## 6. Document Submission & Verification

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/documents` | List uploaded documents with review statuses | Student / Admin |
| `POST` | `/api/v1/documents/upload-intent` | Generate presigned private S3 upload URL | Student / Admin |
| `POST` | `/api/v1/documents/confirm` | Confirm upload completion and set status to `submitted` | Student / Admin |
| `GET` | `/api/v1/documents/:documentId/download` | Generate short-lived presigned download/preview URL | Owner / Admin |
| `PATCH` | `/api/v1/documents/:documentId/review` | Administrative document review (`accepted` / `changes_required`) | Admin Only |
| `POST` | `/api/v1/documents/batch-review` | Batch verify multiple documents in a single operation | Admin Only |

---

## 7. Capacity Scheduling & Appointments

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/appointments/slots` | Fetch real-time available arrival slots with capacity | None |
| `POST` | `/api/v1/appointments/book` | Concurrency-safe atomic appointment slot reservation | Student / Citizen |
| `GET` | `/api/v1/appointments/my` | View student / visitor scheduled appointments | Student / Citizen |
| `GET` | `/api/v1/appointments/:appointmentId` | Retrieve appointment ticket details | Student / Admin |
| `POST` | `/api/v1/appointments/:appointmentId/cancel` | Cancel appointment and atomically restore slot capacity | Owner / Admin |
| `PATCH` | `/api/v1/appointments/:appointmentId/desk-status` | Update desk arrival status (`checked_in`, `completed`) | Admin / Officer |
| `PATCH` | `/api/v1/appointments/:appointmentId/checklist` | Toggle physical arrival checklist verification items | Admin / Officer |

---

## 8. Academic Records & Departmental Clearance

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/academic-records/request` | Submit academic transcript / testimonial request | Student / Alumnus |
| `GET` | `/api/v1/academic-records/my` | View submitted academic record requests | Student / Alumnus |
| `GET` | `/api/v1/academic-records/:requestId` | Get request details with tracking status | Requester / Admin |
| `GET` | `/api/v1/academic-records/:requestId/clearance` | Get 5 departmental clearances (Finance, Library, etc.) | Requester / Admin |
| `POST` | `/api/v1/academic-records/clearance/:clearanceId/dispute` | Student formally disputes an institutional debt | Student / Alumnus |
| `PATCH` | `/api/v1/academic-records/clearance/:clearanceId` | Authorized officer clears, flags, or waives obligation | Officer Only |
| `PATCH` | `/api/v1/academic-records/:requestId/status` | Update preparation, approval, or collection status | Admin Only |

---

## 9. Administrator Portal & Analytics

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard` | Real-time institutional metrics & arrival statistics | Admin Only |
| `GET` | `/api/v1/admin/students` | Paginated candidate list with filter & search | Admin Only |
| `GET` | `/api/v1/admin/students/:studentId` | Full candidate dossier (documents, items, appointments) | Admin Only |
| `GET` | `/api/v1/admin/appointments` | Institutional arrival schedule & queue load | Admin Only |
| `GET` | `/api/v1/admin/audit-logs` | Immutable audit trail of administrative actions | Admin Only |
| `POST` | `/api/v1/admin/slots` | Bulk generate capacity slots for institution services | Admin Only |
