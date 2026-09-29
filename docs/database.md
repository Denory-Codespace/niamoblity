# nia mobility — Database Schema Specification & Data Architecture
**Author & Lead Engineering:** Denory Codespace  
**Database Engine:** PostgreSQL 15+ (Supabase compatible)  
**ORM:** Prisma / Typed SQL with RLS  

---

## 1. Schema Design Overview

The database is structured to guarantee relational integrity, strict auditability, role-based multi-tenancy, and performance.

### Key Conventions
- **Primary Keys:** UUIDv4 generated at creation (`gen_random_uuid()` or application-level UUID).
- **Timestamps:** Every table has `created_at TIMESTAMPTZ DEFAULT NOW()` and `updated_at TIMESTAMPTZ DEFAULT NOW()`.
- **Soft Deletion:** Business-critical entities (`users`, `vehicles`, `vehicle_listings`, `agreements`) implement `deleted_at TIMESTAMPTZ NULL` to preserve historical integrity.
- **Currency Storage:** All financial amounts (target amounts, deposits, fees) are stored as integer or numeric fields representing Kenyan Shillings (`KES`).
- **Audit Trails:** Transitions in applications, agreements, user roles, and verification states are written to append-only audit tables.

---

## 2. Entity-Relationship Diagram (ERD) Overview

```
+---------------+        1:1       +-----------------+
|     users     |----------------->|    profiles     |
+---------------+                  +-----------------+
       | 1:1                              |
       +-----------------+                |
       |                 |                |
       v                 v                |
+--------------+  +---------------+       |
|   drivers    |  |   partners    |       |
+--------------+  +---------------+       |
       | 1:N             | 1:N            |
       |                 v                |
       |          +---------------+       |
       |          |   vehicles    |       |
       |          +---------------+       |
       |                 | 1:N            |
       |                 v                |
       |          +---------------+       |
       |          |vehicle_listing|       |
       |          +---------------+       |
       |                 | 1:N            |
       +--------+--------+                |
                |                         |
                v                         v
       +-----------------+        +---------------+
       |  applications   |        | notifications |
       +-----------------+        +---------------+
                | 1:1                     |
                v                         v
       +-----------------+        +---------------+
       |   agreements    |        | conversations |
       +-----------------+        +---------------+
                | 1:N                     | 1:N
                v                         v
       +-----------------+        +---------------+
       | agreement_events|        |   messages    |
       +-----------------+        +---------------+
```

---

## 3. Detailed Table Specifications

### 3.1. Authentication & RBAC Core
- **`users`**: Master authentication records.
  - `id` (UUID, PK)
  - `email` (VARCHAR, UNIQUE, NOT NULL)
  - `password_hash` (VARCHAR, NOT NULL)
  - `role` (ENUM: `DRIVER`, `PARTNER`, `ADMIN`, `SUPPORT`)
  - `phone` (VARCHAR, UNIQUE, NOT NULL)
  - `is_active` (BOOLEAN, DEFAULT true)
  - `is_verified` (BOOLEAN, DEFAULT false)
  - `created_at`, `updated_at`, `deleted_at`

- **`profiles`**: User biographical and common attributes.
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> `users.id`, UNIQUE)
  - `full_name` (VARCHAR, NOT NULL)
  - `avatar_url` (VARCHAR, NULL)
  - `location_county` (VARCHAR, DEFAULT 'Nairobi')
  - `location_subcounty` (VARCHAR, NULL)
  - `bio` (TEXT, NULL)
  - `created_at`, `updated_at`

### 3.2. Driver Domain
- **`drivers`**: Professional driver operational parameters.
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> `users.id`, UNIQUE)
  - `driving_experience_years` (INT, DEFAULT 0)
  - `preferred_operating_areas` (TEXT[], e.g., `["Westlands", "Kasarani", "CBD", "Kilimani"]`)
  - `preferred_platforms` (TEXT[], e.g., `["Uber", "Bolt", "Little", "Faras"]`)
  - `preferred_vehicle_types` (TEXT[], e.g., `["Sedan", "Hatchback", "SUV"]`)
  - `preferred_arrangement_types` (TEXT[], e.g., `["DAILY_TARGET", "WEEKLY_TARGET"]`)
  - `max_daily_target_kes` (DECIMAL, NULL)
  - `available_from` (TIMESTAMPTZ, DEFAULT NOW())
  - `is_available` (BOOLEAN, DEFAULT true)
  - `rating_avg` (DECIMAL, DEFAULT 5.0)
  - `rating_count` (INT, DEFAULT 0)
  - `completed_engagements_count` (INT, DEFAULT 0)
  - `identity_verified` (BOOLEAN, DEFAULT false)
  - `license_verified` (BOOLEAN, DEFAULT false)
  - `created_at`, `updated_at`

- **`driver_documents`**: Secure vault for driver credentials.
  - `id` (UUID, PK)
  - `driver_id` (UUID, FK -> `drivers.id`)
  - `document_type` (ENUM: `NATIONAL_ID`, `DRIVING_LICENSE`, `PSV_BADGE`, `POLICE_CLEARANCE`, `RECOMMENDATION_LETTER`)
  - `document_number` (VARCHAR, NULL)
  - `file_path` (VARCHAR, NOT NULL - internal secure bucket path)
  - `mime_type` (VARCHAR, NOT NULL)
  - `file_size_bytes` (INT, NOT NULL)
  - `status` (ENUM: `PENDING`, `VERIFIED`, `REJECTED`, `EXPIRED`)
  - `verification_notes` (TEXT, NULL)
  - `verified_by` (UUID, FK -> `users.id`, NULL)
  - `verified_at` (TIMESTAMPTZ, NULL)
  - `expiry_date` (TIMESTAMPTZ, NULL)
  - `created_at`, `updated_at`

### 3.3. Partner & Vehicle Domain
- **`partners`**: Fleet owner / individual partner attributes.
  - `id` (UUID, PK)
  - `user_id` (UUID, FK -> `users.id`, UNIQUE)
  - `partner_type` (ENUM: `INDIVIDUAL`, `COMPANY`, `FLEET_OPERATOR`)
  - `company_name` (VARCHAR, NULL)
  - `rating_avg` (DECIMAL, DEFAULT 5.0)
  - `rating_count` (INT, DEFAULT 0)
  - `total_vehicles_count` (INT, DEFAULT 0)
  - `active_agreements_count` (INT, DEFAULT 0)
  - `identity_verified` (BOOLEAN, DEFAULT false)
  - `business_verified` (BOOLEAN, DEFAULT false)
  - `created_at`, `updated_at`

- **`vehicles`**: Physical vehicle assets.
  - `id` (UUID, PK)
  - `partner_id` (UUID, FK -> `partners.id`)
  - `make` (VARCHAR, NOT NULL, e.g., 'Toyota')
  - `model` (VARCHAR, NOT NULL, e.g., 'Fielder')
  - `year` (INT, NOT NULL, e.g., 2017)
  - `registration_number` (VARCHAR, NOT NULL, UNIQUE, e.g., 'KDG 123X')
  - `vehicle_type` (ENUM: `SEDAN`, `HATCHBACK`, `SUV`, `VAN`, `MOTORCYCLE`, `BOX_TRUCK`)
  - `transmission` (ENUM: `AUTOMATIC`, `MANUAL`)
  - `fuel_type` (ENUM: `PETROL`, `DIESEL`, `HYBRID`, `ELECTRIC`)
  - `seating_capacity` (INT, DEFAULT 4)
  - `color` (VARCHAR, NOT NULL)
  - `mileage_km` (INT, NULL)
  - `primary_county` (VARCHAR, DEFAULT 'Nairobi')
  - `primary_subcounty` (VARCHAR, NULL)
  - `supported_platforms` (TEXT[], e.g., `["Uber", "Bolt", "Little"]`)
  - `photos` (TEXT[], Array of public image storage URLs)
  - `verification_status` (ENUM: `UNVERIFIED`, `UNDER_REVIEW`, `VERIFIED`, `REJECTED`)
  - `availability_status` (ENUM: `AVAILABLE`, `ASSIGNED`, `MAINTENANCE`, `DECOMMISSIONED`)
  - `created_at`, `updated_at`, `deleted_at`

- **`vehicle_documents`**: Vehicle statutory documents.
  - `id` (UUID, PK)
  - `vehicle_id` (UUID, FK -> `vehicles.id`)
  - `document_type` (ENUM: `LOGBOOK`, `COMMERCIAL_INSURANCE`, `INSPECTION_CERTIFICATE`, `SPEED_GOVERNOR_CERTIFICATE`, `NTSA_ROADWORTHINESS`)
  - `document_number` (VARCHAR, NULL)
  - `file_path` (VARCHAR, NOT NULL)
  - `status` (ENUM: `PENDING`, `VERIFIED`, `REJECTED`, `EXPIRED`)
  - `verified_at` (TIMESTAMPTZ, NULL)
  - `expiry_date` (TIMESTAMPTZ, NULL)
  - `created_at`, `updated_at`

### 3.4. Marketplace & Listing Domain
- **`vehicle_listings`**: Published driver opportunities.
  - `id` (UUID, PK)
  - `vehicle_id` (UUID, FK -> `vehicles.id`, UNIQUE when active)
  - `partner_id` (UUID, FK -> `partners.id`)
  - `title` (VARCHAR, NOT NULL)
  - `description` (TEXT, NOT NULL)
  - `county` (VARCHAR, DEFAULT 'Nairobi')
  - `subcounty` (VARCHAR, NULL)
  - `arrangement_type` (ENUM: `DAILY_TARGET`, `WEEKLY_TARGET`, `MONTHLY_TARGET`, `REVENUE_SHARE`, `OTHER`)
  - `target_amount_kes` (DECIMAL, NOT NULL)
  - `deposit_amount_kes` (DECIMAL, DEFAULT 0)
  - `payment_frequency` (ENUM: `DAILY`, `WEEKLY`, `BI_WEEKLY`, `MONTHLY`)
  - `fuel_responsibility` (ENUM: `DRIVER`, `PARTNER`, `SHARED_50_50`)
  - `maintenance_responsibility` (ENUM: `DRIVER`, `PARTNER`, `SHARED`)
  - `insurance_responsibility` (ENUM: `PARTNER`, `DRIVER`, `SHARED`)
  - `preferred_platforms` (TEXT[])
  - `driver_min_experience_years` (INT, DEFAULT 1)
  - `driver_requirements_summary` (TEXT, NULL)
  - `available_from` (TIMESTAMPTZ, DEFAULT NOW())
  - `status` (ENUM: `DRAFT`, `PUBLISHED`, `PAUSED`, `CLOSED`, `EXPIRED`)
  - `view_count` (INT, DEFAULT 0)
  - `applications_count` (INT, DEFAULT 0)
  - `published_at` (TIMESTAMPTZ, NULL)
  - `expires_at` (TIMESTAMPTZ, NULL)
  - `created_at`, `updated_at`, `deleted_at`

- **`saved_listings`**: Driver bookmarks.
  - `id` (UUID, PK)
  - `driver_id` (UUID, FK -> `drivers.id`)
  - `listing_id` (UUID, FK -> `vehicle_listings.id`)
  - `created_at` (TIMESTAMPTZ, DEFAULT NOW())
  - UNIQUE(`driver_id`, `listing_id`)

### 3.5. Application Workflow & Matching
- **`applications`**: Opportunity application records.
  - `id` (UUID, PK)
  - `listing_id` (UUID, FK -> `vehicle_listings.id`)
  - `driver_id` (UUID, FK -> `drivers.id`)
  - `partner_id` (UUID, FK -> `partners.id`)
  - `status` (ENUM: `SUBMITTED`, `VIEWED`, `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`, `EXPIRED`)
  - `cover_note` (TEXT, NULL)
  - `match_score_pct` (INT, NOT NULL DEFAULT 0)
  - `status_reason` (TEXT, NULL)
  - `last_status_changed_by` (UUID, FK -> `users.id`)
  - `last_status_changed_at` (TIMESTAMPTZ, DEFAULT NOW())
  - `created_at`, `updated_at`

- **`matches`**: Pre-calculated or on-demand deterministic match records.
  - `id` (UUID, PK)
  - `driver_id` (UUID, FK -> `drivers.id`)
  - `listing_id` (UUID, FK -> `vehicle_listings.id`)
  - `total_score_pct` (INT, NOT NULL)
  - `breakdown_json` (JSONB, NOT NULL) # breakdown of the 7 factors
  - `calculated_at` (TIMESTAMPTZ, DEFAULT NOW())
  - UNIQUE(`driver_id`, `listing_id`)

### 3.6. Structured Agreements & Lifecycle
- **`agreements`**: Structured digital operating agreements.
  - `id` (UUID, PK)
  - `application_id` (UUID, FK -> `applications.id`, UNIQUE)
  - `listing_id` (UUID, FK -> `vehicle_listings.id`)
  - `driver_id` (UUID, FK -> `drivers.id`)
  - `partner_id` (UUID, FK -> `partners.id`)
  - `vehicle_id` (UUID, FK -> `vehicles.id`)
  - `agreement_number` (VARCHAR, UNIQUE, NOT NULL, e.g., 'NIA-AGR-2026-0001')
  - `arrangement_type` (VARCHAR, NOT NULL)
  - `target_amount_kes` (DECIMAL, NOT NULL)
  - `deposit_amount_kes` (DECIMAL, NOT NULL)
  - `payment_frequency` (VARCHAR, NOT NULL)
  - `fuel_terms` (TEXT, NOT NULL)
  - `maintenance_terms` (TEXT, NOT NULL)
  - `insurance_terms` (TEXT, NOT NULL)
  - `operating_area` (VARCHAR, NOT NULL)
  - `start_date` (TIMESTAMPTZ, NOT NULL)
  - `end_date` (TIMESTAMPTZ, NULL)
  - `terms_and_conditions` (TEXT, NOT NULL)
  - `status` (ENUM: `DRAFT`, `PENDING_DRIVER`, `PENDING_PARTNER`, `ACTIVE`, `SUSPENDED`, `COMPLETED`, `TERMINATED`, `DISPUTED`)
  - `partner_signed_at` (TIMESTAMPTZ, NULL)
  - `driver_signed_at` (TIMESTAMPTZ, NULL)
  - `signed_document_url` (VARCHAR, NULL)
  - `termination_reason` (TEXT, NULL)
  - `created_at`, `updated_at`

- **`agreement_events`**: Immutable audit logs for agreement lifecycle.
  - `id` (UUID, PK)
  - `agreement_id` (UUID, FK -> `agreements.id`)
  - `actor_id` (UUID, FK -> `users.id`)
  - `from_status` (VARCHAR, NULL)
  - `to_status` (VARCHAR, NOT NULL)
  - `event_type` (VARCHAR, NOT NULL, e.g., `CREATED`, `DRIVER_ACCEPTED`, `TERMINATED`)
  - `metadata` (JSONB, NULL)
  - `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 3.7. Communication & Reviews
- **`conversations`**: Secure messaging thread between Driver and Partner.
  - `id` (UUID, PK)
  - `driver_id` (UUID, FK -> `drivers.id`)
  - `partner_id` (UUID, FK -> `partners.id`)
  - `listing_id` (UUID, FK -> `vehicle_listings.id`, NULL)
  - `application_id` (UUID, FK -> `applications.id`, NULL)
  - `is_active` (BOOLEAN, DEFAULT true)
  - `last_message_at` (TIMESTAMPTZ, DEFAULT NOW())
  - `created_at`, `updated_at`

- **`messages`**: Individual messages within a conversation.
  - `id` (UUID, PK)
  - `conversation_id` (UUID, FK -> `conversations.id`)
  - `sender_id` (UUID, FK -> `users.id`)
  - `content` (TEXT, NOT NULL)
  - `is_read` (BOOLEAN, DEFAULT false)
  - `read_at` (TIMESTAMPTZ, NULL)
  - `attachment_url` (VARCHAR, NULL)
  - `created_at` (TIMESTAMPTZ, DEFAULT NOW())

- **`reviews`**: Verified two-sided ratings.
  - `id` (UUID, PK)
  - `agreement_id` (UUID, FK -> `agreements.id`)
  - `reviewer_id` (UUID, FK -> `users.id`)
  - `reviewee_id` (UUID, FK -> `users.id`)
  - `reviewer_role` (ENUM: `DRIVER`, `PARTNER`)
  - `rating_score` (INT, 1-5, NOT NULL)
  - `communication_score` (INT, 1-5, NOT NULL)
  - `reliability_score` (INT, 1-5, NOT NULL)
  - `vehicle_care_or_condition_score` (INT, 1-5, NOT NULL)
  - `comment` (TEXT, NOT NULL)
  - `created_at` (TIMESTAMPTZ, DEFAULT NOW())
  - UNIQUE(`agreement_id`, `reviewer_id`)

### 3.8. Support, Moderation & System Configurations
- **`reports`**: User-submitted moderation reports.
  - `id` (UUID, PK)
  - `reporter_id` (UUID, FK -> `users.id`)
  - `reported_user_id` (UUID, FK -> `users.id`, NULL)
  - `reported_listing_id` (UUID, FK -> `vehicle_listings.id`, NULL)
  - `report_reason` (ENUM: `FAKE_LISTING`, `FAKE_IDENTITY`, `FRAUD`, `HARASSMENT`, `MISLEADING_INFO`, `PAYMENT_DISPUTE`, `VEHICLE_CONDITION`, `OTHER`)
  - `description` (TEXT, NOT NULL)
  - `evidence_urls` (TEXT[], NULL)
  - `status` (ENUM: `OPEN`, `IN_REVIEW`, `RESOLVED`, `DISMISSED`)
  - `admin_notes` (TEXT, NULL)
  - `resolved_by` (UUID, FK -> `users.id`, NULL)
  - `resolved_at` (TIMESTAMPTZ, NULL)
  - `created_at`, `updated_at`

- **`platform_settings`**: Dynamic operational parameters.
  - `key` (VARCHAR, PK)
  - `value` (JSONB, NOT NULL)
  - `description` (TEXT, NULL)
  - `updated_by` (UUID, FK -> `users.id`, NULL)
  - `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

- **`audit_logs`**: System-wide immutable security logs.
  - `id` (UUID, PK)
  - `actor_id` (UUID, FK -> `users.id`, NULL)
  - `action` (VARCHAR, NOT NULL)
  - `entity_type` (VARCHAR, NOT NULL)
  - `entity_id` (VARCHAR, NOT NULL)
  - `ip_address` (VARCHAR, NULL)
  - `user_agent` (VARCHAR, NULL)
  - `payload` (JSONB, NULL)
  - `created_at` (TIMESTAMPTZ, DEFAULT NOW())

---
*Authored with strict database normalization standards by Denory Codespace.*
