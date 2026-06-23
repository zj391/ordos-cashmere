-- Initial Supabase schema for Dongxiao Cashmere website
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Inquiries 询盘主表
CREATE TABLE IF NOT EXISTS inquiries (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('raw_material', 'yarn_fabric', 'garment_oem')),
  locale TEXT NOT NULL,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,
  ga_client_id TEXT,

  contact_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wechat_id TEXT,

  product_interest TEXT,
  quantity_kg NUMERIC,
  quantity_m NUMERIC,
  quantity_pcs NUMERIC,
  custom_specs JSONB,
  message TEXT,

  lead_grade TEXT CHECK (lead_grade IN ('A', 'B', 'C')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'sampling', 'negotiating', 'won', 'lost')),

  n8n_synced BOOLEAN DEFAULT FALSE,
  n8n_synced_at TIMESTAMPTZ,
  hermes_synced BOOLEAN DEFAULT FALSE,
  hermes_synced_at TIMESTAMPTZ,

  ip_address INET,
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries (status);
CREATE INDEX IF NOT EXISTS idx_inquiries_lead_grade ON inquiries (lead_grade);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries (email);

-- Visitor Events 访客行为
CREATE TABLE IF NOT EXISTS visitor_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  session_id TEXT,
  ga_client_id TEXT,
  ip_address INET,
  country TEXT,
  user_agent TEXT,

  event_type TEXT NOT NULL,
  page_path TEXT,
  event_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_events_session ON visitor_events (session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON visitor_events (event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON visitor_events (created_at DESC);

-- Known Customers 老客户
CREATE TABLE IF NOT EXISTS known_customers (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  country TEXT,
  industry TEXT,

  total_inquiries INT DEFAULT 0,
  last_inquiry_at TIMESTAMPTZ,
  total_value_usd NUMERIC DEFAULT 0,
  grade TEXT CHECK (grade IN ('VIP', 'A', 'B', 'C')),

  notes TEXT,
  hermes_customer_id TEXT,

  UNIQUE(company_name, country)
);

-- 询盘附件（如果未来支持）
CREATE TABLE IF NOT EXISTS inquiry_attachments (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  inquiry_id BIGINT REFERENCES inquiries(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INT
);

-- Lead 留资（download center）
CREATE TABLE IF NOT EXISTS download_leads (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  contact_name TEXT,
  company_name TEXT,
  contact_email TEXT,
  country TEXT,
  download_type TEXT,
  download_title TEXT,
  user_agent TEXT,
  ip_address INET,
  country_code TEXT
);

CREATE INDEX IF NOT EXISTS idx_download_leads_email ON download_leads (contact_email);

-- RLS 策略
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE known_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access" ON inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON visitor_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON known_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON inquiry_attachments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access" ON download_leads FOR ALL USING (true) WITH CHECK (true);
