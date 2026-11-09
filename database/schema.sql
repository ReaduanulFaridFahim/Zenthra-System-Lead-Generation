-- Zenthra Systems - Relational Database Schema
-- Version 3.0 Enterprise Architecture
-- Supports SQLite & PostgreSQL (ANSI SQL Compliant)

CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    account_id TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    industry TEXT NOT NULL,
    headcount INTEGER NOT NULL,
    country TEXT NOT NULL,
    estimated_revenue_usd REAL DEFAULT 0,
    detected_tech_stack TEXT DEFAULT '{}',
    observed_signals TEXT,
    signal_source_urls TEXT DEFAULT '[]',
    primary_matched_service TEXT NOT NULL,
    recommended_wedge TEXT NOT NULL,
    lead_score INTEGER NOT NULL DEFAULT 0,
    lead_tier TEXT NOT NULL DEFAULT 'Tier C',
    crm_status TEXT NOT NULL DEFAULT 'NEW_DISCOVERED',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_domain ON accounts(domain);
CREATE INDEX IF NOT EXISTS idx_accounts_tier ON accounts(lead_tier);
CREATE INDEX IF NOT EXISTS idx_accounts_service ON accounts(primary_matched_service);

CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id TEXT UNIQUE NOT NULL,
    account_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    job_title TEXT NOT NULL,
    corporate_email TEXT NOT NULL,
    email_verification_status TEXT DEFAULT 'VERIFIED_SMTP',
    linkedin_url TEXT,
    outreach_status TEXT DEFAULT 'READY_FOR_DRAFT',
    created_at TEXT NOT NULL,
    FOREIGN KEY(account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(corporate_email);

CREATE TABLE IF NOT EXISTS outreach_drafts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    draft_id TEXT UNIQUE NOT NULL,
    account_id TEXT NOT NULL,
    contact_id TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT 'EMAIL',
    touch_number INTEGER NOT NULL DEFAULT 1,
    subject_line TEXT,
    body_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'AWAITING_APPROVAL',
    created_at TEXT NOT NULL,
    reviewed_at TEXT,
    FOREIGN KEY(account_id) REFERENCES accounts(account_id) ON DELETE CASCADE,
    FOREIGN KEY(contact_id) REFERENCES contacts(contact_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON outreach_drafts(status);

CREATE TABLE IF NOT EXISTS pipeline_deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id TEXT UNIQUE NOT NULL,
    account_id TEXT NOT NULL,
    deal_name TEXT NOT NULL,
    service_line TEXT NOT NULL,
    package_tier TEXT NOT NULL,
    deal_stage TEXT NOT NULL DEFAULT 'Discovery Meeting Booked',
    deal_value_usd REAL NOT NULL DEFAULT 0,
    win_probability REAL NOT NULL DEFAULT 0.10,
    expected_close_date TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY(account_id) REFERENCES accounts(account_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_deals_stage ON pipeline_deals(deal_stage);

CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_id TEXT UNIQUE NOT NULL,
    account_id TEXT,
    agent_name TEXT NOT NULL,
    activity_type TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    timestamp TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activities_agent ON activities(agent_name);

-- Mail API & Auto-Mail Configuration
CREATE TABLE IF NOT EXISTS mail_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    provider TEXT NOT NULL DEFAULT 'SIMULATED', -- 'SMTP', 'RESEND', 'SENDGRID', 'SIMULATED'
    smtp_host TEXT DEFAULT 'smtp.gmail.com',
    smtp_port INTEGER DEFAULT 587,
    smtp_secure INTEGER DEFAULT 0,
    smtp_user TEXT DEFAULT '',
    smtp_pass TEXT DEFAULT '',
    from_name TEXT DEFAULT 'Zenthra Systems Solutions',
    from_email TEXT DEFAULT 'solutions@zenthrasystems.com',
    reply_to TEXT DEFAULT 'contact@zenthrasystems.com',
    api_key TEXT DEFAULT '',
    auto_send_enabled INTEGER DEFAULT 0,
    updated_at TEXT NOT NULL
);

-- Sent Emails Outbound Audit Log
CREATE TABLE IF NOT EXISTS sent_emails_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id TEXT UNIQUE NOT NULL,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    company_name TEXT,
    subject TEXT NOT NULL,
    service_wedge TEXT,
    deal_value_usd REAL DEFAULT 0,
    provider TEXT NOT NULL,
    message_id TEXT,
    status TEXT NOT NULL, -- 'DELIVERED', 'FAILED', 'SIMULATED'
    raw_response TEXT DEFAULT '{}',
    sent_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sent_emails_recipient ON sent_emails_log(recipient_email);
CREATE INDEX IF NOT EXISTS idx_sent_emails_status ON sent_emails_log(status);
