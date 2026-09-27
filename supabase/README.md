# Supabase Integration for BidSentinel

BidSentinel connects seamlessly to **Supabase** as its managed cloud PostgreSQL database.

## Architecture

```text
┌──────────────────────────────────────┐
│  Procurement Officer Frontend (Next) │
└──────────────────┬───────────────────┘
                   │ HTTP / REST
┌──────────────────▼───────────────────┐
│     FastAPI Application Server       │
└──────────────────┬───────────────────┘
                   │ PostgreSQL (via psycopg)
┌──────────────────▼───────────────────┐
│       Supabase Cloud Database        │
│   (AWS ap-south-1 Mumbai Region)     │
│   • Users & Roles                    │
│   • Tenders & Requirements           │
│   • Bidders & Documents Dossiers     │
│   • AI Verifications & Audit Trail   │
└──────────────────────────────────────┘
```

## Files in this Directory

- `schema.sql`: Pure PostgreSQL DDL table definitions and indexes for the entire BidSentinel database schema.

## Environment Configuration

To point BidSentinel to your Supabase instance, configure `.env` in the root directory:

```env
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
```

> **Note on IPv4 / Pooler:**
> Supabase direct connections (`db.[PROJECT_REF].supabase.co`) use IPv6. For Windows and standard IPv4 networks, use the **Session Pooler** host (`aws-0-[REGION].pooler.supabase.com`) on port `5432` or `6543`.

## Database Seeding

To initialize all tables and populate the 10 tenders and 50 bidders:

```bash
python scripts/seed_database.py
```
