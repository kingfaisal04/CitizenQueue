# CitizenQueue Database Schema Documentation
**Database Engine:** MongoDB Atlas (Mongoose ODM)  
**Multi-Tenancy Strategy:** Strict Institutional Isolation by `schoolId` (Compound Unique & Sparse Indexes)

---

## 1. Schema Entity Relationship Architecture

```
                       +-------------------+
                       |      School       |
                       +-------------------+
                                 ^
                                 |
        +------------------------+------------------------+
        |                        |                        |
        v                        v                        v
+---------------+        +---------------+        +---------------+
|     User      |        |    Service    |        |  Prospectus   |
+---------------+        +---------------+        +---------------+
        ^                        ^                        |
        |                        |                        v
        v                        v                 (Requirement item)
+---------------+        +---------------+
|    Student    |------->|AppointmentSlot|
+---------------+        +---------------+
   |        |                    ^
   |        |                    |
   |        v                    v
   | +-------------+     +---------------+
   | |  Admission  |     |  Appointment  |
   | +-------------+     +---------------+
   |        |                    ^
   |        v                    |
   | +-------------+             |
   | |  Document   |             |
   | +-------------+             |
   |                             |
   v                             |
+---------------------+          |
|AcademicRecordRequest|----------+
+---------------------+
   |
   v
+---------------------+
|   ClearanceRecord   |
+---------------------+
```

---

## 2. Entity Details

### 2.1 User (`users`)
- **Primary Key:** `_id` (ObjectId)
- **Fields:**
  - `name` (String, required)
  - `email` (String, indexed, sparse, lowercase)
  - `phone` (String, indexed, sparse)
  - `password` (String, select: false, bcrypt hashed)
  - `role` (Enum: `citizen`, `student`, `admin`, `academic_officer`, `housemaster`, `registrar`, `finance_officer`, `library_officer`, `collection_officer`)
  - `school` (ObjectId -> School)
  - `schoolId` (String, e.g. "inst-1", indexed)
  - `staffId` (String, e.g. "GES-482910")
  - `designation` (String)
  - `department` (String)
  - `accountStatus` (Enum: `active`, `suspended`, `pending_verification`)
  - `emailVerified` (Boolean)
  - `refreshTokens` (Array of subdocuments `{ tokenHash, expiresAt, ipAddress, userAgent }`)
- **Indexes:**
  - `{ email: 1, role: 1 }`
  - `{ schoolId: 1, staffId: 1 }`

### 2.2 School (`schools`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Identifier:** `schoolId` (String, unique, e.g. "inst-1")
- **Fields:**
  - `name` (String, required)
  - `shortName` (String)
  - `category` (Enum: `Senior High School`, `Tertiary Institution`, `Technical Institute`)
  - `region` (String)
  - `city` (String)
  - `address` (String)
  - `contactEmail` (String)
  - `contactPhone` (String)
  - `operatingHours` (String)
  - `badge` (String)
  - `verified` (Boolean)
  - `documentRequirements` (Array of requirement definitions)
  - `appointmentSettings` (Object: duration, max booking days, cancellation cutoff)

### 2.3 Student (`students`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Identifier:** `beceIndexNumber` (String, unique, indexed)
- **Fields:**
  - `user` (ObjectId -> User)
  - `school` (ObjectId -> School)
  - `schoolId` (String, indexed)
  - `assignedSchool` (String)
  - `fullName` (String)
  - `gender` (Enum: `Male`, `Female`, `Other`)
  - `dateOfBirth` (String)
  - `programme` (String)
  - `residentialStatus` (Enum: `Boarding`, `Day`)
  - `aggregateScore` (String)
  - `juniorHighSchool` (String)
  - `homeTown` (String)
  - `placementBatch` (String)
  - `guardianName`, `guardianPhone`, `guardianEmail`, `guardianRelation`
  - `placementSlipUploaded` (Boolean), `placementSlipFileName` (String)
  - `isComplete` (Boolean)

### 2.4 Admission (`admissions`)
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:** `student` (ObjectId -> Student, unique), `school` (ObjectId -> School)
- **Fields:**
  - `currentStage` (Number, 1-9)
  - `readinessScore` (Number, 0-100)
  - `registrationStatus` (Enum: `profile_pending`, `documents_pending`, `items_pending`, `pre_arrival_review`, `ready_for_reporting`, `appointment_booked`, `checked_in`, `completed`)
  - `stages` (Array of 9 standard admission stages)
  - `prospectusStatuses` (Array of item status subdocuments)
  - `appointment` (ObjectId -> Appointment)
  - `houseAllocation` (`{ houseName, roomNumber, allocatedAt }`)

### 2.5 Prospectus (`prospectus`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Compound Index:** `{ schoolId: 1, itemId: 1 }`
- **Fields:**
  - `itemId` (String, e.g. "pr-101")
  - `name`, `targetGender` (`all`, `boy`, `girl`), `category`, `specification`, `description`, `quantity`
  - `requiresPhotoReview` (Boolean)
  - `isFreeGesItem` (Boolean)
  - `providedBy`, `distributionPoint`

### 2.6 Document (`documents`)
- **Primary Key:** `_id` (ObjectId)
- **Foreign Keys:** `student` (ObjectId -> Student), `school` (ObjectId -> School)
- **Fields:**
  - `documentRequirementId` (String, e.g. "doc-1")
  - `name`, `category`, `required` (Boolean), `status` (`not_submitted`, `submitted`, `under_review`, `provisionally_accepted`, `changes_required`)
  - `fileName`, `fileSize`, `mimeType`, `storageKey`, `fileUrl`
  - `uploadedAt`, `reviewedAt`, `reviewedBy` (ObjectId -> User), `adminFeedback`
  - `history` (Array of review events)

### 2.7 Service (`services`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Identifier:** `serviceId` (String, unique, e.g. "srv-101")
- **Fields:**
  - `institutionName`, `name`, `category`, `description`, `location`, `durationMinutes`, `isActive`
  - `delayNotice`, `requirements`, `instructions`, `cancellationPolicy`

### 2.8 AppointmentSlot (`appointmentslots`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Compound Index:** `{ serviceId: 1, date: 1, time: 1 }`
- **Fields:**
  - `slotId` (String), `service` (ObjectId -> Service), `serviceId` (String)
  - `schoolId` (String), `date` (String YYYY-MM-DD), `time` (String)
  - `capacity` (Number, min 1), `bookedCount` (Number, min 0)
  - `isActive` (Boolean)
- **Virtuals:** `remaining` (`capacity - bookedCount`), `isFull` (`bookedCount >= capacity`)

### 2.9 Appointment (`appointments`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Reference:** `referenceNumber` (String, e.g. "CQ-2026-882101", unique)
- **Foreign Keys:** `student` (ObjectId -> Student), `slot` (ObjectId -> AppointmentSlot), `service` (ObjectId -> Service)
- **Fields:**
  - `appointmentDate`, `appointmentTime`, `status` (`booked`, `checked_in`, `in_progress`, `completed`, `cancelled`, `no_show`)
  - `visitor` (`{ parentName, contactPhone, contactEmail, studentName, studentIndex, notes }`)
  - `checklist` (Array of verified requirement items)
  - `history` (Array of lifecycle events)

### 2.10 AcademicRecordRequest (`academicrecordrequests`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Reference:** `requestReference` (String, e.g. "CQ-ARR-2026-XXXXXX", unique)
- **Fields:**
  - `documentType` (`transcript`, `testimonial`, `statement_of_results`, `recommendation_letter`, `attestation_letter`, `wassce_certificate_collection`)
  - `copiesCount`, `purpose`, `deliveryPreference`
  - `identityVerified`, `academicVerified`, `departmentClearanceStatus`, `approvalStatus`, `collectionStatus`
  - `appointment` (ObjectId -> Appointment), `history`

### 2.11 ClearanceRecord (`clearancerecords`)
- **Primary Key:** `_id` (ObjectId)
- **Unique Compound Index:** `{ academicRecordRequest: 1, department: 1 }`
- **Fields:**
  - `department` (`finance`, `library`, `stores`, `academic_office`, `administration`)
  - `status` (`cleared`, `outstanding_obligation`, `waived`, `disputed`)
  - `obligationDescription`, `amountDue`, `currency` (default "GHS")
  - `officerResponsible` (ObjectId -> User), `officerName`
  - `disputeReason`, `disputeStatus`, `confirmedAt`, `history`

### 2.12 Notification (`notifications`)
- **Primary Key:** `_id` (ObjectId)
- **Fields:** `user`, `schoolId`, `title`, `message`, `type` (`info`, `reminder`, `confirmation`, `urgent`), `isRead`, `link`

### 2.13 AuditLog (`auditlogs`)
- **Primary Key:** `_id` (ObjectId)
- **Fields:** `user`, `userName`, `userRole`, `schoolId`, `action`, `entityType`, `entityId`, `status`, `ipAddress`, `userAgent`, `metadata`
