# nia mobility — Security & Hardening Architecture
**Author & Lead Engineering:** Denory Codespace  
**Target:** OWASP Top 10 Compliance, Data Protection & Trust  

---

## 1. Security Architecture Principles

1. **Role-Based Access Control (RBAC):**
   - Four distinct permission boundaries: `DRIVER`, `PARTNER`, `ADMIN`, `SUPPORT`.
   - Every API handler and server action enforces permission verification prior to entity query or mutation.
   - Resource-level ownership checks ensure that Partners only inspect their own listings/agreements and Drivers only access their own applications.

2. **Zero-Trust Document Vault:**
   - Identity documents (National IDs, DLs, Logbooks) are stored in private S3/Supabase storage buckets.
   - Direct public access is disabled at bucket policy level.
   - Access is mediated via time-limited (15-minute) cryptographic presigned URLs generated server-side for authenticated and authorized users only.

3. **Input Validation & Sanitization:**
   - All client inputs are validated via strict Zod schemas against injection, XSS, and malformed payloads before entering the domain layer.
   - SQL queries are executed via Prisma ORM parameterized statements, preventing SQL injection vulnerabilities.

4. **Rate Limiting & Anti-Abuse:**
   - API endpoints enforce IP- and user-based token bucket rate limiting (e.g. max 5 login attempts per minute, max 20 search queries per minute).
   - Phone number and registration scraping protections prevent unauthorized mass harvest of partner/driver details.

5. **Tamper-Evident Audit Trails:**
   - Critical domain operations (agreement signing, KYC approvals, account suspensions, financial records) generate immutable entries in `audit_logs` and `agreement_events`.

---
*Authored with highest cybersecurity rigor by Denory Codespace.*
