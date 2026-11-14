# CitizenQueue Security Implementation Architecture

**Standard:** OWASP Top 10 Compliant Educational Data Protection  
**Target Environment:** Node.js / Express / MongoDB Atlas  

---

## 1. Multi-Institution Tenancy & Data Isolation

### Institutional Boundary Enforcement
CitizenQueue serves multiple educational institutions (e.g. Achimota School, Prempeh College, University of Ghana, KNUST) on a shared database. Data isolation is maintained through strict architectural controls:

1. **Mandatory Institutional Scoping**:
   - Every educational record (`Student`, `Admission`, `Prospectus`, `Document`, `Appointment`, `ClearanceRecord`) contains an indexed `schoolId` and `school` reference.
   - All administrative queries and updates in `adminController`, `studentController`, and `appointmentController` explicitly enforce `schoolId: req.user.schoolId`.

2. **Automated School Boundary Middleware (`schoolAccessMiddleware.js`)**:
   - Validates that the authenticated administrator's `schoolId` matches the institutional resource being queried.
   - Any cross-institutional access attempt immediately aborts with an HTTP `403 Forbidden` response.
   - Generates an immutable entry in `AuditLog` tagging the offending user, action, requested resource, IP address, and timestamp.

---

## 2. Authentication, Password Security & Token Rotation

### Password Security
- Passwords are never stored in plaintext.
- Handled via `bcryptjs` with salt round `10` via a Mongoose pre-save lifecycle hook on the `User` schema.
- Password hashes are stored under `select: false` so that routine user queries never retrieve the hash into memory.
- Password comparisons use `user.comparePassword(candidate)` which leverages bcrypt's timing-attack-resistant comparison.

### JWT Access & Refresh Token Rotation
- **Access Tokens**: Short-lived (15 minutes). Signed with `JWT_ACCESS_SECRET` containing user ID, role, and institutional scope (`schoolId`).
- **Refresh Tokens**: Long-lived (7 days). Signed with `JWT_REFRESH_SECRET`.
- **Token Rotation & Invalidation**:
  - SHA-256 hash of every active refresh token is stored in the user's `refreshTokens` array in MongoDB.
  - Upon each `/api/v1/auth/refresh` invocation, the old refresh token is permanently deleted and a new pair is issued.
  - Stolen or replayed refresh tokens are instantly rejected because their hash is no longer in the user's active session list.
  - Logout cleanly removes the session hash or clears all active sessions.

---

## 3. Concurrency-Safe Capacity Booking

### Race Condition Mitigation
In high-demand onboarding seasons, thousands of parents book reporting slots simultaneously. Traditional check-then-book approaches suffer from TOCTOU (Time-of-Check to Time-of-Use) race conditions, resulting in overbooking beyond facility capacity.

CitizenQueue guarantees capacity integrity using **MongoDB atomic find-and-modify operations**:

```javascript
const reservedSlot = await AppointmentSlot.findOneAndUpdate(
  {
    _id: slotDocId,
    isActive: true,
    $expr: { $lt: ['$bookedCount', '$capacity'] }
  },
  {
    $inc: { bookedCount: 1 }
  },
  { new: true }
);

if (!reservedSlot) {
  throw ApiError.conflict('The selected appointment slot has reached maximum capacity');
}
```

- Executed as an atomic database operation: MongoDB guarantees that no two concurrent requests can both read `bookedCount < capacity` when only one seat remains.
- Compound unique indexes prevent duplicate active bookings for the same student on the same date:
  ```javascript
  AppointmentSchema.index(
    { serviceId: 1, appointmentDate: 1, 'visitor.studentIndex': 1, status: 1 }
  );
  ```

---

## 4. Secure Object Storage Architecture (S3 Presigned URLs)

### Direct-to-Vault Secure Uploads
Student documents (e.g., CSSPS placement slips, BECE result slips, medical reports) contain sensitive personal data and must never be exposed to public URLs:

1. **No Files Through App Memory**:
   - The application server never buffers raw file uploads in RAM, mitigating denial-of-service via memory exhaustion.
2. **Presigned Upload URLs (`/upload-intent`)**:
   - Client requests an upload intent with `fileName`, `fileType`, and `fileSize`.
   - The backend validates the MIME type against an allowlist (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`) and enforces a 5MB size limit.
   - An AWS S3 (or Cloudflare R2 / MinIO) `PutObjectCommand` presigned URL is generated with a strict 15-minute expiration window.
3. **Private Buckets & Presigned Downloads**:
   - The storage bucket has all public access blocked.
   - Document downloads (`/documents/:documentId/download`) require authentication and verify that the requesting user is either the owner student or an authorized school officer.
   - Only then is a time-limited presigned `GetObjectCommand` URL (15 minutes) issued.

---

## 5. Rate Limiting & Denial-of-Service Defense

Using `express-rate-limit`:
1. **General API Limiter**: 300 requests per 15 minutes per IP address.
2. **Strict Auth Limiter**: 15 requests per 15 minutes on login, registration, and password change endpoints to mitigate credential stuffing and brute-force attacks.
3. **Upload Limiter**: 40 upload intents per 15 minutes.
4. **Helmet Headers**: Protects against clickjacking (`X-Frame-Options`), MIME sniffing (`X-Content-Type-Options`), and cross-site scripting.
5. **CORS Whitelisting**: Strict origin matching restricted to local development and the production frontend deployed on Vercel.

---

## 6. Comprehensive Audit Logging

All privileged and sensitive operations are logged to the `AuditLog` collection:
- User logins and logout events.
- Administrative account provisioning.
- Document review decisions (`accepted`, `changes_required`) with officer notes.
- Departmental clearance actions (debts cleared, flagged, or disputed).
- Capacity changes and slot creation.
- Security boundary violations (cross-school access attempts).

Each log record immutably captures:
- `user` (ObjectId)
- `userName`
- `userRole`
- `schoolId`
- `action` (e.g. `DOCUMENT_REVIEWED`, `CROSS_SCHOOL_ACCESS_VIOLATION`)
- `targetResource` & `targetId`
- `details` (JSON payload)
- `ipAddress`
- `userAgent`
- `createdAt`
