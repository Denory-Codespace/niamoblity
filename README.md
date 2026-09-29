# nia mobility 🇰🇪
> **"Find a Car. Find a Driver. Drive & Earn."**  
> *A Trusted Marketplace Connecting Kenyan Drivers and Vehicle Partners.*

**Architected & Built by:** **Denory Codespace**  
**Target Launch Market:** Nairobi, Kenya (with extensible county-level architecture)  
**Primary Currency:** Kenyan Shilling (`KES`) | **Timezone:** `Africa/Nairobi` (EAT)

---

## 🌟 What is nia mobility?

**nia mobility** is a Kenyan-first digital mobility marketplace that bridges the gap between:
1. **Vehicle Partners / Owners** who own vehicles (Toyota Fielder, Axio, Vitz, Note, Demio, EVs, etc.) and want reliable, verified drivers.
2. **Professional Drivers** who want to operate on digital mobility platforms (Uber, Bolt, Little, Faras, Yango) but do not own a vehicle.

Unlike passenger ride-hailing apps, **nia mobility is the critical B2B/B2C infrastructure** powering the supply side of mobility in Africa. It solves identity verification, algorithmic vehicle-driver matching, structured operating agreements, and dispute resolution.

---

## 🎨 Brand & Design System

The visual identity is custom-crafted to communicate **trust, African innovation, modern fintech, and youthfulness**:
- **Soft Blue:** `#DCEEFF` (Trust, openness, stability)
- **Soft Yellow:** `#FFF1B8` (Kenyan sunshine, warmth, opportunity)
- **Soft Green:** `#DDF5E3` (Growth, prosperity, environmental consciousness)
- **Primary Dark:** `#102A43` (Deep African night sky, high contrast, professionalism)
- **Neutral Light:** `#F8FAFC` & `#FFFFFF` (Clean, uncluttered, whitespace-rich)

---

## 🏗️ Architecture & Engineering Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS, Lucide Icons, Responsive Mobile-First PWA design.
- **Backend & APIs:** Next.js REST API Route Handlers (`/api/v1/*`), Layered Domain Services, Zod Validation, RBAC Guards.
- **Database & Data Layer:** PostgreSQL / Supabase, Prisma ORM, SQL DDL migrations, append-only audit trails, and zero-cost in-memory mock repository fallback for instantaneous local development.
- **Matching Engine:** Deterministic 7-Factor Compatibility Scorer (`MatchingService`) calculating location, platform, vehicle, experience, availability, financial, and preference alignment.
- **Security & Compliance:** Kenya Data Protection Act, 2019 (KDPA) compliant document vault, time-limited presigned URLs, RBAC permissions (`DRIVER`, `PARTNER`, `ADMIN`, `SUPPORT`).
- **Payments & Communication Abstractions:** Safaricom M-PESA Daraja architecture, SMS and Email notification dispatchers with mock development mode.

---

## 🚀 Quick Start Guide (Zero-Cost Local Setup)

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v22+ recommended)
- **npm** or **yarn** or **pnpm**

### 2. Clone & Install
```bash
git clone <repository_url> niamobility
cd niamobility
npm install
```

### 3. Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env.local
```
*(The default configuration comes ready for zero-cost local development with built-in mock fallbacks for database, SMS, and M-Pesa).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Engineering Documentation Suite

Detailed technical guides are maintained in the [`docs/`](./docs/) directory:
- [**System Architecture & Domain Design**](./docs/architecture.md)
- [**Database Schema & Normalization**](./docs/database.md)
- [**REST API Reference & DTOs**](./docs/api.md)
- [**Business Rules & Matching Engine**](./docs/business-rules.md)
- [**Security & Hardening Strategy**](./docs/security.md)
- [**Kenyan Compliance & Data Privacy (KDPA 2019)**](./docs/compliance.md)
- [**Product & Implementation Roadmap**](./docs/roadmap.md)

---

## 🏢 Developed by Denory Codespace
This platform is proudly engineered by **Denory Codespace**, dedicated to building resilient, scalable, and high-impact software solutions across Africa.
