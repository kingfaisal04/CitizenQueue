# CitizenQueue Backend API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/database-MongoDB%20Atlas-forestgreen.svg)](https://www.mongodb.com/atlas)
[![Architecture](https://img.shields.io/badge/architecture-Multi--Institution%20Tenancy-blue.svg)]()
[![Automated Tests](https://img.shields.io/badge/tests-23%2F23%20passed-success.svg)]()
[![Security](https://img.shields.io/badge/security-OWASP%20Compliant-orange.svg)]()

Production-grade, multi-institution backend and RESTful API infrastructure for **CitizenQueue** — a Ghanaian educational admission and capacity queue orchestration platform powering post-CSSPS placement onboarding, digital prospectus verification, arrival scheduling, and academic records clearance.

---

## Table of Contents

- [Core Capabilities](#core-capabilities)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Directory Structure](#directory-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Database Seeding](#database-seeding)
  - [Running the Server](#running-the-server)
- [Automated Testing Suite](#automated-testing-suite)
- [Demo Accounts](#demo-accounts)
- [API Endpoints Overview](#api-endpoints-overview)
- [Deployment](#deployment)
- [Technical Documentation](#technical-documentation)

---

## Core Capabilities

1. **Multi-Institution Tenancy & Isolation:**
   - Strict data boundaries between institutions (e.g. Achimota School, Prempeh College, University of Ghana, KNUST).
   - Automated boundary checks in middleware; cross-institutional access attempts trigger `403 Forbidden` and log immutable security audit violations.

2. **Concurrency-Safe Capacity Booking:**
   - Eliminates overbooking during high-volume reporting periods using **MongoDB atomic find-and-modify** operations (`findOneAndUpdate` with `$inc` and conditional capacity guards).
   - Prevents duplicate active bookings for the same candidate on the same date.
   - Restores capacity atomically upon cancellation.

3. **Dynamic 9-Stage Admission Progression:**
   - Real-time admission readiness score calculation (0–100%) and stage resolution based on biodata completeness, document verification, prospectus acquisition, and desk arrival status.
   - Computes pending tasks for the student dashboard.

4. **Secure Document Vault (S3 Presigned URLs):**
   - Files are never buffered through application memory.
   - Short-lived (15-minute) AWS S3 / Cloudflare R2 presigned `PutObjectCommand` URLs for direct uploads.
   - Authenticated, role-checked presigned `GetObjectCommand` URLs for downloads.

5. **Digital Prospectus Verification:**
   - Tracks item acquisition and visual proof photograph submissions.
   - Administrative review workflows (`approved`, `changes_required`).

6. **Departmental Clearance & Dispute Arbitration:**
   - Multi-department clearance tracking (Finance, Library, Stores, Academic Office, Administration) for transcript and certificate requests.
   - Student dispute submission with evidentiary notes against incorrect obligations.

7. **Security & Auditing:**
   - Passwords hashed with `bcryptjs` (salt round 10) via Mongoose pre-save hooks (`select: false`).
   - Short-lived JWT access tokens (15m) + cryptographic SHA-256 rotated refresh tokens (7d).
   - Tiered rate limiters (strict limits for auth and uploads).
   - Centralized operational error formatting and immutable audit logging.

---

## Architecture & Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Runtime** | Node.js (ES6+ ECMAScript Modules) |
| **Web Framework** | Express.js 4.x |
| **Database** | MongoDB Atlas with Mongoose ODM 8.x |
| **Validation** | Zod (strict request body, query, and parameter validation) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, Cookie-Parser |
| **Security** | Helmet (HTTP headers), CORS, `express-rate-limit` |
| **Storage** | AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) |
| **Testing** | Jest, Supertest, `mongodb-memory-server` |

---

## Directory Structure

```
Backend/
├── config/
│   ├── cors.js                     # CORS allowlist (Vercel preview regex & local)
│   ├── db.js                       # MongoDB Atlas connection pooling
│   └── storage.js                  # S3 presigned URL engine with mock fallback
├── controllers/                    # Express route controllers
│   ├── academicRecordController.js
│   ├── adminController.js
│   ├── admissionController.js
│   ├── appointmentController.js
│   ├── authController.js
│   ├── documentController.js
│   ├── notificationController.js
│   ├── prospectusController.js
│   ├── schoolController.js
│   ├── studentController.js
│   └── userController.js
├── models/                         # 13 Mongoose schemas & indexes
│   ├── AcademicRecordRequest.js
│   ├── Admission.js
│   ├── Appointment.js
│   ├── AppointmentSlot.js
│   ├── AuditLog.js
│   ├── ClearanceRecord.js
│   ├── Document.js
│   ├── Notification.js
│   ├── Prospectus.js
│   ├── School.js
│   ├── Service.js
│   ├── Student.js
│   ├── User.js
│   └── index.js
├── routes/                         # Modular route definitions mounted under /api/v1
│   ├── academicRecordRoutes.js
│   ├── adminRoutes.js
│   ├── admissionRoutes.js
│   ├── appointmentRoutes.js
│   ├── authRoutes.js
│   ├── documentRoutes.js
│   ├── notificationRoutes.js
│   ├── prospectusRoutes.js
│   ├── schoolRoutes.js
│   ├── studentRoutes.js
│   ├── userRoutes.js
│   └── index.js
├── middleware/
│   ├── authMiddleware.js           # Bearer token verification
│   ├── errorMiddleware.js          # Centralized error handler & 404 handler
│   ├── rateLimitMiddleware.js      # General, auth, and upload rate limiters
│   ├── roleMiddleware.js           # RBAC permissions enforcement
│   ├── schoolAccessMiddleware.js   # Institutional boundary enforcement
│   └── validationMiddleware.js     # Zod request validator
├── services/                       # Business logic layer
│   ├── admissionService.js
│   ├── appointmentService.js
│   ├── authService.js
│   ├── clearanceService.js
│   ├── emailService.js
│   └── storageService.js
├── validators/                     # Zod validation schemas
├── utils/                          # ApiError, ApiResponse, asyncHandler, tokenUtils
├── tests/                          # Automated Jest test suites
│   ├── academicRecords.test.js
│   ├── appointments.test.js
│   ├── auth.test.js
│   ├── documents.test.js
│   ├── isolation.test.js
│   └── setup.js
├── docs/                           # Architectural specifications & deployment guides
├── scripts/
│   └── seedDatabase.js             # Initial database seeder
├── app.js                          # Express application setup
├── server.js                       # Server entry point with graceful shutdown
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: MongoDB Atlas cluster or local MongoDB instance

### Installation

From the project root or the `Backend` directory:

```bash
# Navigate to Backend folder
cd Backend

# Install dependencies
npm install
```

### Environment Setup

Copy `.env.example` to create your local `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://citizenqueue.vercel.app

# MongoDB Atlas URI
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/citizenqueue?retryWrites=true&w=majority

# JWT Secrets (generate with `openssl rand -hex 64`)
JWT_ACCESS_SECRET=your_jwt_access_secret_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_minimum_32_characters_long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# S3 Object Storage (set to 'mock' for local development)
STORAGE_PROVIDER=mock
STORAGE_BUCKET=citizenqueue-vault
STORAGE_REGION=af-south-1
STORAGE_URL_EXPIRATION_SECONDS=900
```

### Database Seeding

Populate initial institutions (Achimota, Prempeh, UG, KNUST, Tamasco), services, prospectus items, capacity slots, and demo accounts:

```bash
npm run seed
```

### Running the Server

```bash
# Start development server with file watching
npm run dev

# Start production server
npm start
```

Health check endpoint: `http://localhost:5000/health`  
API Base URL: `http://localhost:5000/api/v1`

---

## Automated Testing Suite

The backend includes a comprehensive automated test suite running against an in-memory database engine:

```bash
npm test
```

### Test Coverage Summary:

- **Authentication & Security (`auth.test.js`)**: Registration, login by email/BECE index, token rotation, password hashing, invalid credentials (9 tests).
- **Multi-Institution Isolation (`isolation.test.js`)**: Institutional data scoping, boundary violation rejections with audit logging (3 tests).
- **Concurrency & Scheduling (`appointments.test.js`)**: Atomic capacity decrement, race condition rejection under capacity saturation, slot release on cancellation, desk check-in, arrival checklists (4 tests).
- **Document Management (`documents.test.js`)**: Presigned upload URL generation, upload confirmation, size limit enforcement, officer review (4 tests).
- **Academic Records & Clearances (`academicRecords.test.js`)**: Transcript requests, 5-department clearance initialization, student dispute submission, officer debt resolution (3 tests).

**Result: 5/5 Suites Passed | 23/23 Tests Passed | 0 Failures**

---

## Demo Accounts

After running `npm run seed`, the following pre-configured accounts are available:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Student** | `kwame.mensah@example.com` | `Password123!` | Achimota School (BECE: `101245089`) |
| **School Administrator** | `admin@achimota.edu.gh` | `Password123!` | Achimota Senior High School |
| **Finance Officer** | `finance@achimota.edu.gh` | `Password123!` | Achimota Senior High School |
| **Academic Officer** | `academic@achimota.edu.gh` | `Password123!` | Achimota Senior High School |
| **School Administrator** | `admin@prempeh.edu.gh` | `Password123!` | Prempeh College |

---

## API Endpoints Overview

| Area | Method | Endpoint | Access |
| :--- | :--- | :--- | :--- |
| **Health** | `GET` | `/health` | Public |
| **Auth** | `POST` | `/api/v1/auth/register` | Public |
| | `POST` | `/api/v1/auth/login` | Public |
| | `POST` | `/api/v1/auth/refresh` | Public |
| | `POST` | `/api/v1/auth/logout` | Authenticated |
| | `GET` | `/api/v1/auth/me` | Authenticated |
| **Schools** | `GET` | `/api/v1/schools` | Public |
| | `GET` | `/api/v1/schools/:schoolId` | Public |
| | `GET` | `/api/v1/schools/:schoolId/services` | Public |
| | `GET` | `/api/v1/schools/:schoolId/prospectus` | Public |
| **Students** | `GET` | `/api/v1/students/profile` | Student / Admin |
| | `PUT` | `/api/v1/students/profile` | Student / Admin |
| | `GET` | `/api/v1/admissions/progress` | Student / Admin |
| **Documents** | `GET` | `/api/v1/documents` | Student / Admin |
| | `POST` | `/api/v1/documents/upload-intent` | Student / Admin |
| | `POST` | `/api/v1/documents/confirm` | Student / Admin |
| | `GET` | `/api/v1/documents/:documentId/download` | Owner / Admin |
| | `PATCH` | `/api/v1/documents/:documentId/review` | Admin Only |
| **Appointments** | `GET` | `/api/v1/appointments/slots` | Public |
| | `POST` | `/api/v1/appointments/book` | Authenticated |
| | `GET` | `/api/v1/appointments/my` | Authenticated |
| | `POST` | `/api/v1/appointments/:appointmentId/cancel` | Owner / Admin |
| | `PATCH` | `/api/v1/appointments/:appointmentId/desk-status` | Officer Only |
| | `PATCH` | `/api/v1/appointments/:appointmentId/checklist` | Officer Only |
| **Academic Records** | `POST` | `/api/v1/academic-records/request` | Authenticated |
| | `GET` | `/api/v1/academic-records/my` | Authenticated |
| | `POST` | `/api/v1/academic-records/clearance/:clearanceId/dispute`| Student |
| | `PATCH` | `/api/v1/academic-records/clearance/:clearanceId` | Officer Only |
| **Admin** | `GET` | `/api/v1/admin/dashboard` | Admin Only |
| | `GET` | `/api/v1/admin/students` | Admin Only |
| | `GET` | `/api/v1/admin/appointments` | Admin Only |
| | `POST` | `/api/v1/admin/slots` | Admin Only |

---

## Deployment

The backend is configured for deployment on **Render** (Web Service) with MongoDB Atlas:

1. Connect the GitHub repository to Render.
2. Set **Root Directory** to `Backend`.
3. Set **Build Command** to `npm install`.
4. Set **Start Command** to `node server.js`.
5. Add production environment variables (`MONGO_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`).
6. Set **Health Check Path** to `/health`.

For detailed step-by-step instructions, see [RENDER-DEPLOYMENT.md](docs/RENDER-DEPLOYMENT.md).

---

## Technical Documentation

Detailed architectural and integration guides are available in the `docs/` directory:

- [API-DOCUMENTATION.md](docs/API-DOCUMENTATION.md) — Complete REST endpoint contracts, payloads, and response envelopes.
- [DATABASE-SCHEMA.md](docs/DATABASE-SCHEMA.md) — Entity-relationship diagrams, schema fields, and indexing policies.
- [SECURITY-IMPLEMENTATION.md](docs/SECURITY-IMPLEMENTATION.md) — Tenancy boundaries, password security, atomic concurrency, and OWASP compliance.
- [RENDER-DEPLOYMENT.md](docs/RENDER-DEPLOYMENT.md) — Complete Render and MongoDB Atlas production deployment guide.
- [FRONTEND-BACKEND-MAPPING.md](docs/FRONTEND-BACKEND-MAPPING.md) — Detailed mapping of frontend React views to backend APIs.

---

## License

Proprietary — Developed for CitizenQueue Educational Infrastructure.
