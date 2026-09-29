# nia mobility — Business Rules, Matching Engine & State Machines
**Author & Lead Engineering:** Denory Codespace  
**Document Version:** 1.0.0-MVP  

---

## 1. Deterministic Matching Engine Architecture

The **MatchingService** computes a real-time compatibility score (0% to 100%) between a **Driver Profile** and a **Vehicle Listing** using a 7-factor weighted algorithm.

### 1.1. Configurable Factor Weights
These default weights are stored in `platform_settings` under the key `matching_weights` and can be adjusted by platform administrators without code deployment:

| Factor | Default Weight | Description & Calculation Logic |
| :--- | :--- | :--- |
| **Location Compatibility** | **20%** | County match (100% of factor) + Subcounty/Operating Area match (Bonus/Full). |
| **Platform Compatibility** | **20%** | Jaccard similarity index between Driver's preferred platforms and Vehicle's supported platforms (Uber, Bolt, Little, Faras, Yango). |
| **Vehicle Type Preference** | **15%** | 100% if vehicle type (e.g., Sedan) is in Driver's preferred types; 0% otherwise. |
| **Driver Experience** | **10%** | 100% if `driver.experience >= listing.min_experience`; Scaled proportionately if below. |
| **Availability Alignment** | **10%** | 100% if driver available date <= listing availability date. |
| **Financial Compatibility** | **15%** | Evaluates driver's `max_daily_target_kes` against `listing.target_amount_kes`. 100% if listing target <= driver budget. |
| **Other Preferences & KYC** | **10%** | Bonus factor for verified driver credentials, transmission preference, and commercial arrangement match. |
| **Total** | **100%** | Normalized percentage displayed as "e.g., 94% Match". |

*Note: The raw mathematical breakdown is kept proprietary on the server and only exposed as an aggregated compatibility score to marketplace users.*

---

## 2. Application Workflow Finite State Machine (FSM)

An application represents a Driver's formal expression of interest in a Vehicle Listing.

### 2.1. Valid State Transitions Matrix

```
[SUBMITTED]
    |
    +---> [VIEWED] (Triggered when Partner opens application details)
             |
             +---> [SHORTLISTED] (Partner indicates strong interest)
             |        |
             |        +---> [INTERVIEW] (In-app messaging unlocked)
             |                 |
             |                 +---> [ACCEPTED] (Creates draft agreement)
             |                 |
             |                 +---> [REJECTED]
             |
             +---> [REJECTED] (Partner declines application)
             |
             +---> [WITHDRAWN] (Driver cancels application before acceptance)
             |
             +---> [EXPIRED] (Listing closed or 14-day inactivity timeout)
```

### 2.2. State Transition Invariants
1. **No Skip-ahead to Acceptance:** An application cannot move from `SUBMITTED` directly to `ACCEPTED` without being `VIEWED`.
2. **Actor Authorization:** Only the listing's Partner can transition to `SHORTLISTED`, `INTERVIEW`, `ACCEPTED`, or `REJECTED`. Only the applicant Driver can transition to `WITHDRAWN`.
3. **Immutable Audit:** Every state change records `actor_id`, `from_status`, `to_status`, `reason`, and `timestamp`.

---

## 3. Structured Agreement Lifecycle

An Agreement formalizes the commercial relationship between Driver and Partner for a specific Vehicle.

### 3.1. States & Sign-off Flow

```
[DRAFT] 
   | (Partner customizes terms, deposit, and targets)
   v
[PENDING_DRIVER] 
   | (Driver reviews full terms & conditions)
   +---> [REJECTED / NEGOTIATING]
   |
   v (Driver accepts with digital signature timestamp)
[ACTIVE] 
   | (Vehicle handover confirmed, active operation)
   +---> [SUSPENDED] (Temporary dispute or maintenance)
   |        |
   |        +---> [ACTIVE] (Resolved)
   |
   +---> [COMPLETED] (Agreement duration concluded cleanly)
   |
   +---> [TERMINATED] (Early termination with logged reason)
   |
   +---> [DISPUTED] (Escalated to Platform Support / Admin)
```

### 3.2. Legal Disclaimer Rule
All agreement templates generated within the MVP include the mandatory statutory notice:
> *"nia mobility provides this structured operating framework as a technology marketplace facilitator. Parties are encouraged to seek independent legal counsel regarding regulatory and commercial compliance under Kenyan law."*

---
*Authored with strict domain modeling principles by Denory Codespace.*
