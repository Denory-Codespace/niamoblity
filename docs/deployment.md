# nia mobility — Deployment & Infrastructure Guide
**Author & Lead Engineering:** Denory Codespace  
**Target Environments:** Staging & Production  

---

## 1. Hosting Architecture

| Component | Target Platform | Free Tier / Cost Optimization |
| :--- | :--- | :--- |
| **Frontend & API Handlers** | Vercel or Render Web Service | Vercel Hobby / Render Free |
| **Database** | Supabase Managed PostgreSQL | Supabase Free Plan (500MB DB) |
| **Document Vault** | Supabase Storage (Private Buckets) | 1GB Free Storage |
| **Caching & Rate Limits** | Upstash Redis | Upstash Free Tier (10,000 req/day) |
| **Containerized Deployment** | Docker + Docker Compose | Self-hosted on VPS (Hetzner/DigitalOcean) |

---

## 2. Environment Variables Checklist for Production

Configure the following secrets in your production host (e.g. Vercel dashboard or Render environment settings):

```bash
NODE_ENV=production
APP_URL=https://niamobility.co.ke
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_SECRET]
AUTH_SECRET=[64_CHAR_RANDOM_HEX]
MPESA_ENVIRONMENT=production
MPESA_CONSUMER_KEY=[SAFARICOM_KEY]
MPESA_CONSUMER_SECRET=[SAFARICOM_SECRET]
MPESA_PASSKEY=[SAFARICOM_PASSKEY]
MPESA_SHORTCODE=174379
```

---
*Authored with precision by Denory Codespace.*
