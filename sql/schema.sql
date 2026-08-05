-- Cloud SQL (PostgreSQL) schema template for khatib_naser_cpa CMS + analytics
-- Apply after the Cloud SQL instance is created.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Key/value style site content (text fields mapped to the public website)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  field_key TEXT NOT NULL,
  field_type TEXT NOT NULL DEFAULT 'text', -- text | textarea | list_json | image
  value_text TEXT,
  value_json JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT,
  UNIQUE (section, field_key)
);

-- Media assets stored in GCS; SQL holds metadata + public URL
CREATE TABLE IF NOT EXISTS media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_key TEXT NOT NULL UNIQUE, -- e.g. hero.background, team.osama, gallery.reception
  gcs_object_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT,
  content_type TEXT,
  byte_size BIGINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by TEXT
);

-- Page visits (incremented by the public site tracker later)
CREATE TABLE IF NOT EXISTS page_visits (
  id BIGSERIAL PRIMARY KEY,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  user_agent TEXT,
  session_id TEXT,
  country TEXT,
  device_type TEXT
);

CREATE INDEX IF NOT EXISTS idx_page_visits_visited_at ON page_visits (visited_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_path ON page_visits (path);

-- Higher-level engagement events (CTA clicks, WhatsApp, form submits, etc.)
CREATE TABLE IF NOT EXISTS engagement_events (
  id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name TEXT NOT NULL, -- page_view | whatsapp_click | contact_submit | cta_click
  path TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_engagement_occurred_at ON engagement_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_engagement_event_name ON engagement_events (event_name);

-- Optional daily rollups for faster dashboard reads
CREATE TABLE IF NOT EXISTS daily_stats (
  day DATE PRIMARY KEY,
  visits BIGINT NOT NULL DEFAULT 0,
  unique_sessions BIGINT NOT NULL DEFAULT 0,
  whatsapp_clicks BIGINT NOT NULL DEFAULT 0,
  contact_submits BIGINT NOT NULL DEFAULT 0,
  cta_clicks BIGINT NOT NULL DEFAULT 0
);
