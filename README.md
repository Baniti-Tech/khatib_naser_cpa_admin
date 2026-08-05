# khatib_naser_cpa_admin

Admin dashboard template for [Baniti-Tech/khatib_naser_cpa](https://github.com/Baniti-Tech/khatib_naser_cpa).

## What this template includes

- **Overview dashboard** — visits + engagement summary (mock data)
- **Analytics** — daily visits chart, WhatsApp / contact metrics (mock)
- **Content CMS** — editable sections mapped to the public site (Hero, Services, Team, etc.)
- **Media slots** — image field inventory for GCS upload wiring
- **GCP settings page** — env readiness checklist
- **SQL schema** — `sql/schema.sql` for Cloud SQL (PostgreSQL)
- **Stubs** — `lib/db.ts` (Cloud SQL) and `lib/storage.ts` (GCS)

Until GCP is configured, `USE_MOCK_DATA=true` keeps the UI fully usable with local mock data.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/dashboard`.  
Login page: `/login` (default password `admin` while using the template auth).

## Deploy with GitHub → Vercel (not Cursor deploy)

1. Push this repo to `Baniti-Tech/khatib_naser_cpa_admin`.
2. In [Vercel](https://vercel.com): **Add New Project** → **Import Git Repository**.
3. Select `Baniti-Tech/khatib_naser_cpa_admin` (GitHub integration).
4. Framework preset: **Next.js** (auto-detected).
5. Add environment variables from `.env.example` (start with `USE_MOCK_DATA=true`).
6. Deploy. Later set `USE_MOCK_DATA=false` when Cloud SQL + GCS are ready.

## After GCP is ready

1. Create a GCP project, Cloud SQL (PostgreSQL) instance, and Storage bucket.
2. Run `sql/schema.sql` on the database.
3. Create a service account with Cloud SQL Client + Storage Object Admin.
4. Fill `.env` / Vercel env vars (`DATABASE_URL`, `GCS_BUCKET`, `GCS_PROJECT_ID`, …).
5. Implement the TODOs in `lib/db.ts` and `lib/storage.ts` (e.g. `pg` + `@google-cloud/storage`).
6. Update the public site to fetch content from SQL / a public API instead of hardcoded constants.

## Content mapping

Editable sections in `lib/content-schema.ts` mirror the public site components:

| Admin section | Public site |
|---|---|
| brand | `lib/constants.ts` BRAND + logo |
| hero | `components/Hero.tsx` |
| trust | `TRUST_STATS` |
| services | `SERVICES` + Services section |
| whyUs | `components/WhyUs.tsx` |
| about | `components/About.tsx` |
| gallery | `components/OfficeGallery.tsx` |
| team | `TEAM` + Team section |
| contact | `components/Contact.tsx` |
