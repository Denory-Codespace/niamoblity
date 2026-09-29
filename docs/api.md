# nia mobility — REST API Reference & Specification
**Author & Lead Engineering:** Denory Codespace  
**Base URL:** `/api/v1`  
**Standard Response Format:** JSON  

---

## 1. Global API Standards

All API responses follow a consistent, predictable structure:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 85,
    "totalPages": 5
  }
}
```

Error responses:
```json
{
  "success": false,
  "statusCode": 400,
  "error": "BAD_REQUEST",
  "message": "Validation failed on target_amount_kes",
  "details": [
    { "field": "target_amount_kes", "issue": "Must be greater than 0" }
  ]
}
```

---

## 2. API Endpoints Map

### 2.1. Authentication (`/api/v1/auth`)
- `POST /auth/register` — Register a new Driver or Partner account.
- `POST /auth/login` — Authenticate and receive session token.
- `POST /auth/logout` — Invalidate current session.
- `GET /auth/me` — Retrieve current authenticated user profile & permissions.
- `POST /auth/refresh` — Refresh authentication token.

### 2.2. Profiles & Verification (`/api/v1/profiles`, `/api/v1/verification`)
- `GET /profiles/driver` — Get current driver operational preferences & stats.
- `PUT /profiles/driver` — Update driver preferences (platforms, areas, targets).
- `GET /profiles/partner` — Get current partner fleet summary.
- `PUT /profiles/partner` — Update partner profile details.
- `POST /verification/documents` — Upload KYC document (Driver ID, DL, Logbook, Insurance).
- `GET /verification/status` — Get verification status and missing requirements.

### 2.3. Vehicles & Fleet (`/api/v1/vehicles`)
- `GET /vehicles` — List partner's vehicles.
- `POST /vehicles` — Add a new vehicle to partner's fleet.
- `GET /vehicles/:id` — Get vehicle details and statutory document statuses.
- `PUT /vehicles/:id` — Update vehicle information or maintenance status.
- `DELETE /vehicles/:id` — Archive/soft-delete a vehicle.

### 2.4. Marketplace & Listings (`/api/v1/listings`)
- `GET /listings` — Search and filter published vehicle opportunities.
  - *Query Params:* `county`, `subcounty`, `vehicle_type`, `transmission`, `fuel_type`, `platform`, `arrangement_type`, `max_target`, `verified_only`, `sort_by`, `page`, `limit`.
- `GET /listings/:id` — Detailed public listing view (includes match score if logged in as driver).
- `POST /listings` — Partner creates a new listing for an available vehicle.
- `PUT /listings/:id` — Partner updates listing terms or pricing.
- `POST /listings/:id/save` — Driver bookmarks listing.
- `DELETE /listings/:id/save` — Driver removes bookmark.

### 2.5. Applications & Matching (`/api/v1/applications`, `/api/v1/matches`)
- `GET /applications` — List applications (filtered by Driver or Partner role).
- `POST /applications` — Driver applies for a listing with cover note.
- `GET /applications/:id` — Detailed application view with timeline history.
- `PATCH /applications/:id/status` — Transition application state (`SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, `REJECTED`, `WITHDRAWN`).
- `GET /matches/driver` — Algorithmic top matches scored for the logged-in driver.

### 2.6. Structured Agreements (`/api/v1/agreements`)
- `GET /agreements` — List agreements for the current user.
- `POST /agreements` — Partner initiates structured agreement from accepted application.
- `GET /agreements/:id` — View full agreement terms, milestones, and audit history.
- `POST /agreements/:id/sign` — Driver or Partner digitally signs agreement.
- `POST /agreements/:id/status` — Suspend, complete, or terminate agreement.

### 2.7. Messaging (`/api/v1/conversations`, `/api/v1/messages`)
- `GET /conversations` — List active messaging threads for user.
- `GET /conversations/:id/messages` — Get message history in thread.
- `POST /conversations/:id/messages` — Send a new message.
- `PATCH /messages/:id/read` — Mark message as read.

### 2.8. Reviews & Ratings (`/api/v1/reviews`)
- `POST /reviews` — Submit verified review following an active/completed agreement.
- `GET /reviews/user/:userId` — View public verified reviews for a driver or partner.

### 2.9. Support, Reports & Admin (`/api/v1/reports`, `/api/v1/admin`)
- `POST /reports` — Submit report against a listing or user.
- `GET /admin/dashboard/stats` — High-level platform KPIs (Users, Listings, Agreements, Disputes).
- `GET /admin/verifications/queue` — Admin pending KYC verification queue.
- `POST /admin/verifications/:id/decision` — Approve or reject KYC document.
- `GET /admin/settings` — Read configurable platform settings (matching weights, fees).
- `PUT /admin/settings` — Update platform settings.
- `GET /admin/audit-logs` — Immutable system audit log.

---
*Authored with strict REST architectural design by Denory Codespace.*
