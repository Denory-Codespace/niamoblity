# nia mobility — Kenya Regulatory & Data Protection Compliance Specification
**Author & Lead Engineering:** Denory Codespace  
**Jurisdiction:** Republic of Kenya  
**Statutory Frameworks:** Data Protection Act, 2019 (KDPA) & National Transport and Safety Authority (NTSA) Regulations  

---

## 1. Kenya Data Protection Act, 2019 (KDPA) Architecture

As a digital marketplace processing Personally Identifiable Information (PII) and official documentation (National IDs, Driving Licenses, Vehicle Logbooks, Police Clearance certificates), **nia mobility** implements privacy by design:

### 1.1. Data Minimization & Consent Management
- **Explicit Consent Checkpoints:** During registration and verification upload, explicit consent is captured and stored with timestamp, IP address, and policy version.
- **Role-Gated Document Access:** Raw document images (e.g. National ID cards, Logbooks) are stored in secure private object buckets with strictly no public read permissions.
- **Signed Ephemeral URLs:** Document access for administrative verification is granted exclusively via short-lived (15-minute) cryptographic signed URLs.
- **Phone Number Shielding:** Driver and Partner personal contact numbers are hidden during initial marketplace discovery. Direct contact details are shared only when an application advances to `INTERVIEW` or `ACCEPTED` states with mutual consent.

### 1.2. Right to Rectification & Erasure (Data Deletion)
- Soft deletion mechanism preserves audit history for anti-fraud requirements while anonymizing PII in public listings and inactive accounts upon verified request.
- Data export endpoint allows users to download a machine-readable JSON copy of their profile, documents, applications, and agreement history.

---

## 2. Mobility Marketplace Regulatory Positioning

### 2.1. Platform Classification
- **nia mobility** is strictly classified as a **Technology Marketplace Facilitator** connecting independent asset owners (Partners) with certified independent operators (Drivers).
- The platform **does not own vehicles** and **does not employ drivers**.
- In the MVP stage, **nia mobility does not operate passenger dispatch or ride-hailing services**, distinguishing it from Transport Network Companies (TNCs) governed under the NTSA (Operation of Digital Hailing Operators) Regulations.

### 2.2. Vehicle & Driver Verification Standards
To ensure community safety and legal roadworthiness:
- Driver accounts must verify valid Kenyan Driving License with appropriate endorsement (Class B/C or PSV endorsement where required).
- Vehicle listings must verify valid NTSA Inspection Certificate, Commercial Comprehensive Insurance, and proof of ownership/authorization.

---
*Authored with highest legal and compliance integrity by Denory Codespace.*
