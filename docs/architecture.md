# nia mobility — System Architecture Specification
**Author & Lead Engineering:** Denory Codespace  
**Target Market:** Nairobi & Kenyan Mobility Ecosystem  
**Version:** 1.0.0-MVP  

---

## 1. Executive Summary & Vision

**nia mobility** is a Kenyan-first two-sided digital marketplace connecting:
1. **Vehicle Partners / Owners** who have commercial or personal vehicles available for professional digital mobility deployment.
2. **Professional Drivers** who want to operate vehicles on ride-hailing/digital delivery platforms (e.g. Uber, Bolt, Little, Faras, Yango) but do not own a suitable vehicle.

The system is strictly a **Driver ↔ Vehicle Partner Marketplace** in its MVP phase. It solves discovery, trust, KYC verification, communication, algorithmic matching, structured agreements, and dispute resolution. It does **not** include end-passenger booking in this phase.

---

## 2. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|  - Next.js 14+ App Router (TypeScript, Tailwind CSS, Tokenized Design System)     |
|  - Progressive Web App (PWA) / Mobile-First Responsive Interface                  |
|  - Role-Based Portals: Public Landing, Driver Hub, Partner Portal, Admin Suite    |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          | HTTPS / REST API / Server Actions
                                          v
+-----------------------------------------------------------------------------------+
|                              APPLICATION & DOMAIN LAYER                           |
|  - Route Handlers & API Controllers (`/api/v1/*`)                                 |
|  - Middleware: Session Auth, RBAC Guards, Rate Limiting, Audit Interceptors       |
|  - Domain Services:                                                               |
|      * AuthService (RBAC, Session Management, Permission Gates)                   |
|      * DriverService & PartnerService (Profiles, Preferences, Onboarding)         |
|      * VehicleService & ListingService (Lifecycle, Availability, Pricing)         |
|      * ApplicationService (Finite State Machine: SUBMITTED -> ACCEPTED)           |
|      * MatchingService (Deterministic 7-Factor Compatibility Scorer)              |
|      * AgreementService (Immutable Audit Logs, Multi-party Sign-off)              |
|      * VerificationService (Document Vault, Secure Signed URLs, Tier Badging)     |
|      * MessagingService (Role-gated Conversations, Moderation, Event Dispatcher)  |
|      * NotificationService (Multi-channel: In-app, SMS, Email, WebPush)           |
|      * PaymentService (Provider Abstraction: M-Pesa Daraja, Bank, Escrow Record) |
|      * AdminSettingsService (Dynamic Business Rules, Configurable Weights)        |
+-----------------------------------------+-----------------------------------------+
                                          |
             +----------------------------+----------------------------+
             |                                                         |
             v                                                         v
+----------------------------+                            +-------------------------+
|     DATA PERSISTENCE       |                            |   EXTERNAL INTEGRATIONS |
| - PostgreSQL 15+ / Supabase|                            | - Safaricom M-Pesa API  |
| - Row-Level Security (RLS) |                            | - SMS (Africa's Talking)|
| - Normalized 24+ Tables    |                            | - Email (Resend/SMTP)   |
| - Audit Event Log Storage  |                            | - Mapbox / OpenStreetMap|
| - Local/Mock Mode Fallback |                            | - Sentry & PostHog      |
+----------------------------+                            +-------------------------+
```

---

## 3. Core Architectural Principles

1. **Zero-Cost Local Development with Zero Friction:**
   - The application is architected to run immediately in zero-cost development mode without mandatory paid external dependencies.
   - Provider abstractions (SMS, Email, Payments, Maps) provide built-in mock implementations for local testing, seamlessly switching to live providers via environment variables.

2. **Strict Domain-Driven Modularity:**
   - Every domain (Vehicles, Applications, Agreements, Verification, etc.) is isolated into dedicated service modules with typed Data Transfer Objects (DTOs), validation schemas (Zod), and domain events.

3. **Deterministic Matching Engine:**
   - Uses a weighted, modular 7-factor algorithmic score (Location 20%, Platform 20%, Vehicle 15%, Experience 10%, Availability 10%, Financial 15%, Preferences 10%).
   - The scoring engine operates independently of external AI services, returning reproducible, explainable percentage match scores while shielding raw weight formulas from end users.

4. **Security, Privacy & Kenyan Compliance by Design:**
   - Strict adherence to the **Kenya Data Protection Act, 2019 (KDPA)**.
   - Vehicle and driver identity documents are stored in private storage buckets and accessed exclusively via temporary time-limited signed URLs.
   - Contact numbers and private details are withheld until an application is mutually accepted or shortlisted based on consent configurations.

---

## 4. Layered Directory & Module Structure

```
d:\Systems\niamobility\
├── docs/                     # Full engineering, security, and architectural documentation
├── prisma/                   # Database schema, migrations, and seed scripts
├── public/                   # Static assets, branding graphics, manifest, favicons
├── src/
│   ├── app/                  # Next.js App Router (Pages, Layouts, API Route Handlers)
│   │   ├── (public)/         # Landing page, How It Works, Find a Vehicle, Terms, Privacy
│   │   ├── (auth)/           # Login, Register (Driver/Partner), Password Reset
│   │   ├── driver/           # Driver Portal (Marketplace, Applications, Matches, Agreements)
│   │   ├── partner/          # Partner Portal (Fleet, Listings, Applicants, Agreements)
│   │   ├── admin/            # Admin Management Portal (Verifications, Audit, Settings)
│   │   └── api/v1/           # REST API endpoints
│   ├── components/           # Reusable UI component library (Design System)
│   │   ├── ui/               # Buttons, Cards, Inputs, Modals, Badges, Tables, Skeletons
│   │   ├── marketplace/      # Vehicle Cards, Filter Drawers, Search Bars, Match Indicators
│   │   ├── forms/            # Multi-step Onboarding, Listing Builder, Agreement Forms
│   │   └── layout/           # Navbar, Mobile Bottom Navigation, Sidebar, Footer
│   ├── lib/                  # Core infrastructure utilities
│   │   ├── db/               # Database client, repository abstractions, in-memory store
│   │   ├── auth/             # JWT, Session validation, RBAC middleware
│   │   ├── matching/         # Deterministic matching algorithm
│   │   ├── payments/         # M-Pesa Daraja provider and payment abstraction
│   │   ├── notifications/    # In-app, SMS, and Email notification dispatchers
│   │   ├── storage/          # Secure document vault & signed URL generator
│   │   └── utils/            # Currency formatting (KES), date formatting (EAT), helpers
│   ├── types/                # TypeScript interfaces, DTOs, Enums, Database Entities
│   └── styles/               # Design tokens, CSS variables, typography
└── tests/                    # Unit, integration, and Playwright E2E test suites
```

---

## 5. Technology Stack Summary

| Layer | Selected Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 14+ (App Router) + TypeScript | Full-stack serverless capabilities, SEO-friendly SSR, rapid execution. |
| **Styling** | Custom Design System + Tailwind CSS | Custom tokenized Kenyan aesthetic (`#DCEEFF`, `#FFF1B8`, `#DDF5E3`, `#102A43`). |
| **Database** | PostgreSQL 15+ / Supabase | Relational integrity, ACID compliance, spatial indexing, JSONB flexibility. |
| **ORM / Query** | Prisma ORM + Typed SQL | Strongly typed database queries with automatic migration workflows. |
| **Authentication** | Built-in RBAC JWT / Supabase Auth | Multi-role permissions (`DRIVER`, `PARTNER`, `ADMIN`, `SUPPORT`). |
| **Payment Gateway** | Safaricom M-PESA Daraja (STK Push & C2B) | Universal standard for digital transactions in Kenya. |
| **Testing** | Vitest + React Testing Library + Playwright | Comprehensive unit, API, and cross-role end-to-end integration tests. |

---
*Built with precision and engineering excellence by Denory Codespace.*
