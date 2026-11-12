/**
 * Zenthra Systems - Enterprise Database Manager
 * Uses Node.js native DatabaseSync (node:sqlite) for zero-dependency persistence.
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'zenthra.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let dbInstance = null;
let schemaInitialized = false;

function getDb() {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_FILE);
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }
  if (!schemaInitialized) {
    schemaInitialized = true;
    const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
    dbInstance.exec(schemaSql);
  }
  return dbInstance;
}

function initDb() {
  const db = getDb();
  const schemaSql = fs.readFileSync(SCHEMA_FILE, 'utf8');
  db.exec(schemaSql);
  schemaInitialized = true;
  return db;
}

// === Account Operations ===
function insertAccount(account) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO accounts (
      account_id, company_name, domain, industry, headcount, country,
      estimated_revenue_usd, detected_tech_stack, observed_signals,
      signal_source_urls, primary_matched_service, recommended_wedge,
      lead_score, lead_tier, crm_status, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(domain) DO UPDATE SET
      company_name=excluded.company_name,
      headcount=excluded.headcount,
      lead_score=excluded.lead_score,
      lead_tier=excluded.lead_tier,
      updated_at=excluded.updated_at
  `);

  stmt.run(
    account.account_id || `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    account.company_name,
    account.domain,
    account.industry,
    account.headcount,
    account.country,
    account.estimated_revenue_usd || 0,
    typeof account.detected_tech_stack === 'object' ? JSON.stringify(account.detected_tech_stack) : (account.detected_tech_stack || '{}'),
    account.observed_signals || '',
    typeof account.signal_source_urls === 'object' ? JSON.stringify(account.signal_source_urls) : (account.signal_source_urls || '[]'),
    account.primary_matched_service,
    account.recommended_wedge,
    account.lead_score || 0,
    account.lead_tier || 'Tier C',
    account.crm_status || 'NEW_DISCOVERED',
    now,
    now
  );

  return getAccountByDomain(account.domain);
}

function getAccountByDomain(domain) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM accounts WHERE domain = ?');
  return stmt.get(domain);
}

function getAccountById(accountId) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM accounts WHERE account_id = ?');
  return stmt.get(accountId);
}

function listAccounts(filterTier = null) {
  const db = getDb();
  if (filterTier) {
    const stmt = db.prepare('SELECT * FROM accounts WHERE lead_tier = ? ORDER BY lead_score DESC');
    return stmt.all(filterTier);
  }
  const stmt = db.prepare('SELECT * FROM accounts ORDER BY lead_score DESC');
  return stmt.all();
}

// === Contact Operations ===
function insertContact(contact) {
  const db = getDb();
  const now = new Date().toISOString();

  // Ensure valid account_id for foreign key
  let accountId = contact.account_id;
  if (accountId) {
    const acc = db.prepare('SELECT account_id FROM accounts WHERE account_id = ?').get(accountId);
    if (!acc) accountId = null;
  }
  if (!accountId) {
    const emailDomain = (contact.corporate_email || '').split('@')[1];
    if (emailDomain) {
      const match = db.prepare('SELECT account_id FROM accounts WHERE domain = ?').get(emailDomain);
      if (match) accountId = match.account_id;
    }
  }
  if (!accountId) {
    const fallback = db.prepare('SELECT account_id FROM accounts LIMIT 1').get();
    if (fallback) {
      accountId = fallback.account_id;
    } else {
      accountId = `acc_${Date.now()}`;
      try {
        db.prepare(`
          INSERT INTO accounts (account_id, company_name, domain, industry, headcount, country, lead_score, lead_tier, crm_status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(accountId, 'Enterprise Partner', `enterprise_${Date.now()}.com`, 'Technology', 50, 'Global', 100, 'Tier A', 'QUALIFIED', now, now);
      } catch (_) {
        const anyAcc = db.prepare('SELECT account_id FROM accounts LIMIT 1').get();
        accountId = anyAcc ? anyAcc.account_id : accountId;
      }
    }
  }

  const stmt = db.prepare(`
    INSERT INTO contacts (
      contact_id, account_id, first_name, last_name, job_title,
      corporate_email, email_verification_status, linkedin_url,
      outreach_status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(contact_id) DO UPDATE SET
      first_name=excluded.first_name,
      last_name=excluded.last_name,
      job_title=excluded.job_title,
      corporate_email=excluded.corporate_email,
      email_verification_status=excluded.email_verification_status,
      linkedin_url=excluded.linkedin_url,
      outreach_status=excluded.outreach_status
  `);

  const contactId = contact.contact_id || `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  stmt.run(
    contactId,
    accountId,
    contact.first_name || '',
    contact.last_name || '',
    contact.job_title || '',
    contact.corporate_email || '',
    contact.email_verification_status || 'VERIFIED_SMTP',
    contact.linkedin_url || '',
    contact.outreach_status || 'READY_FOR_DRAFT',
    now
  );

  return contactId;
}

function listContactsForAccount(accountId) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM contacts WHERE account_id = ?');
  return stmt.all(accountId);
}

// === Outreach Draft Operations ===
function insertDraft(draft) {
  const db = getDb();
  const now = new Date().toISOString();
  const draftId = draft.draft_id || `drf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  // Ensure valid account_id
  let accountId = draft.account_id;
  if (accountId) {
    const acc = db.prepare('SELECT account_id FROM accounts WHERE account_id = ?').get(accountId);
    if (!acc) accountId = null;
  }
  if (!accountId) {
    const fallback = db.prepare('SELECT account_id FROM accounts LIMIT 1').get();
    accountId = fallback ? fallback.account_id : `acc_${Date.now()}`;
  }

  // Ensure valid contact_id
  let contactId = draft.contact_id;
  if (contactId) {
    const cnt = db.prepare('SELECT contact_id FROM contacts WHERE contact_id = ?').get(contactId);
    if (!cnt) contactId = null;
  }
  if (!contactId) {
    const fallback = db.prepare('SELECT contact_id FROM contacts WHERE account_id = ? LIMIT 1').get(accountId) ||
                     db.prepare('SELECT contact_id FROM contacts LIMIT 1').get();
    if (fallback) {
      contactId = fallback.contact_id;
    } else {
      contactId = `cnt_${Date.now()}`;
      try {
        db.prepare(`
          INSERT INTO contacts (contact_id, account_id, first_name, last_name, job_title, corporate_email, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(contactId, accountId, 'Enterprise', 'Executive', 'Managing Director', `contact@${Date.now()}.com`, now);
      } catch (_) {
        const anyCnt = db.prepare('SELECT contact_id FROM contacts LIMIT 1').get();
        contactId = anyCnt ? anyCnt.contact_id : contactId;
      }
    }
  }

  const stmt = db.prepare(`
    INSERT INTO outreach_drafts (
      draft_id, account_id, contact_id, channel, touch_number,
      subject_line, body_text, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(draft_id) DO UPDATE SET
      subject_line=excluded.subject_line,
      body_text=excluded.body_text,
      status=excluded.status
  `);

  stmt.run(
    draftId,
    accountId,
    contactId,
    draft.channel || 'EMAIL',
    draft.touch_number || 1,
    draft.subject_line || '',
    draft.body_text || '',
    draft.status || 'AWAITING_APPROVAL',
    now
  );

  return draftId;
}

function listPendingDrafts() {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT d.*, a.company_name, a.domain, a.primary_matched_service, a.lead_score,
           c.first_name, c.last_name, c.job_title, c.corporate_email
    FROM outreach_drafts d
    JOIN accounts a ON d.account_id = a.account_id
    JOIN contacts c ON d.contact_id = c.contact_id
    WHERE d.status = 'AWAITING_APPROVAL'
    ORDER BY a.lead_score DESC
  `);
  return stmt.all();
}

function updateDraftStatus(draftId, status) {
  const db = getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE outreach_drafts SET status = ?, reviewed_at = ? WHERE draft_id = ?');
  stmt.run(status, now, draftId);
}

function clearPendingDrafts(action = 'REJECTED') {
  const db = getDb();
  const now = new Date().toISOString();
  if (action === 'PURGE') {
    const stmt = db.prepare("DELETE FROM outreach_drafts WHERE status = 'AWAITING_APPROVAL'");
    const info = stmt.run();
    return info.changes;
  }
  const stmt = db.prepare("UPDATE outreach_drafts SET status = ?, reviewed_at = ? WHERE status = 'AWAITING_APPROVAL'");
  const info = stmt.run(action, now);
  return info.changes;
}

// === Pipeline Deals ===
function insertDeal(deal) {
  const db = getDb();
  const now = new Date().toISOString();
  const dealId = deal.deal_id || `deal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  // Ensure valid account_id for foreign key
  let accountId = deal.account_id;
  if (accountId) {
    const acc = db.prepare('SELECT account_id FROM accounts WHERE account_id = ?').get(accountId);
    if (!acc) {
      const companyName = deal.company_name || (deal.deal_name || 'Enterprise').split(' — ')[0].split(' - ')[0].trim();
      const domain = deal.domain || `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'enterprise'}.com`;
      const existing = db.prepare('SELECT account_id FROM accounts WHERE domain = ? OR company_name = ?').get(domain, companyName);
      if (existing) {
        accountId = existing.account_id;
      } else {
        const newAccId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        try {
          db.prepare(`
            INSERT INTO accounts (account_id, company_name, domain, industry, headcount, country, lead_score, lead_tier, crm_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(newAccId, companyName, domain, deal.industry || 'Enterprise Solutions', 50, deal.country || 'Global', 100, 'Tier A', 'QUALIFIED', now, now);
          accountId = newAccId;
        } catch (_) {
          const fallback = db.prepare('SELECT account_id FROM accounts LIMIT 1').get();
          accountId = fallback ? fallback.account_id : newAccId;
        }
      }
    }
  } else {
    const fallback = db.prepare('SELECT account_id FROM accounts LIMIT 1').get();
    accountId = fallback ? fallback.account_id : `acc_${Date.now()}`;
  }

  const stmt = db.prepare(`
    INSERT INTO pipeline_deals (
      deal_id, account_id, deal_name, service_line, package_tier,
      deal_stage, deal_value_usd, win_probability, expected_close_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(deal_id) DO UPDATE SET
      deal_stage=excluded.deal_stage,
      deal_value_usd=excluded.deal_value_usd,
      win_probability=excluded.win_probability,
      updated_at=excluded.updated_at
  `);

  stmt.run(
    dealId,
    accountId,
    deal.deal_name || 'Enterprise Sprint Engagement',
    deal.service_line || 'Enterprise Solutions',
    deal.package_tier || 'ENTRY_SPRINT',
    deal.deal_stage || 'Discovery Meeting Booked',
    deal.deal_value_usd || 0,
    typeof deal.win_probability === 'number' ? deal.win_probability : 0.10,
    deal.expected_close_date || deal.target_close_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    now,
    now
  );

  return dealId;
}

function listDeals() {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT d.*, a.company_name, a.country, a.industry
    FROM pipeline_deals d
    JOIN accounts a ON d.account_id = a.account_id
    ORDER BY d.deal_value_usd DESC
  `);
  return stmt.all();
}

// === Activity Logging ===
function logActivity(agentName, activityType, description, accountId = null, metadata = {}) {
  const db = getDb();
  const now = new Date().toISOString();
  const activityId = `act_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const stmt = db.prepare(`
    INSERT INTO activities (
      activity_id, account_id, agent_name, activity_type,
      description, metadata, timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    activityId,
    accountId,
    agentName,
    activityType,
    description,
    typeof metadata === 'object' ? JSON.stringify(metadata) : metadata,
    now
  );

  return activityId;
}

function listActivities(limit = 50) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM activities ORDER BY timestamp DESC LIMIT ?');
  return stmt.all(limit);
}

function updateDealStage(dealId, stage) {
  const db = getDb();
  const now = new Date().toISOString();
  let winProb = 0.20;
  if (stage === 'Proposal Submitted') winProb = 0.60;
  else if (stage === 'Technical Scope Confirmed') winProb = 0.50;
  else if (stage === 'Closed Won') winProb = 1.00;
  else if (stage === 'Closed Lost') winProb = 0.00;

  const stmt = db.prepare('UPDATE pipeline_deals SET deal_stage = ?, win_probability = ?, updated_at = ? WHERE deal_id = ?');
  stmt.run(stage, winProb, now, dealId);
}

function recordSentProposal(p) {
  const db = getDb();
  const now = new Date().toISOString();

  // 1. Resolve or ensure Account exists
  let accountId = p.account_id;
  const domain = p.domain || (p.company_name ? p.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '') + '.com' : 'unknown.com');
  let existingAccount = accountId ? getAccountById(accountId) : null;
  if (!existingAccount && domain) {
    existingAccount = getAccountByDomain(domain);
  }

  if (existingAccount) {
    accountId = existingAccount.account_id;
  } else {
    accountId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    insertAccount({
      account_id: accountId,
      company_name: p.company_name || 'Prospect Company',
      domain: domain,
      industry: p.industry || 'Commercial Services',
      headcount: 50,
      country: p.country || 'United States',
      primary_matched_service: p.service_wedge || 'Technology Services',
      recommended_wedge: p.service_wedge || 'Enterprise Technology Sprint',
      lead_score: 85,
      lead_tier: 'Tier A',
      crm_status: 'PROPOSAL_OUTBOUND'
    });
  }

  // 2. Resolve or ensure Contact exists
  let contactId = p.contact_id;
  let existingContacts = listContactsForAccount(accountId);
  if (existingContacts && existingContacts.length > 0) {
    contactId = existingContacts[0].contact_id;
  } else {
    contactId = `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const nameParts = (p.recipient_name || 'Managing Director').split(' ');
    insertContact({
      contact_id: contactId,
      account_id: accountId,
      first_name: nameParts[0] || 'Executive',
      last_name: nameParts.slice(1).join(' ') || 'Leader',
      job_title: 'Decision Maker',
      corporate_email: p.recipient_email || 'contact@' + domain,
      outreach_status: 'PROPOSAL_SENT'
    });
  }

  // 3. Mark or insert draft as SENT
  const touchNum = Math.max(1, Math.min(5, parseInt(p.touch_number, 10) || 1));
  const langTag = p.language ? String(p.language).toUpperCase().slice(0, 6) : '';
  let draftId = p.draft_id;
  if (draftId) {
    const stmt = db.prepare('UPDATE outreach_drafts SET status = ?, reviewed_at = ? WHERE draft_id = ?');
    stmt.run('SENT', now, draftId);
  } else {
    draftId = `drf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const stmt = db.prepare(`
      INSERT INTO outreach_drafts (
        draft_id, account_id, contact_id, channel, touch_number,
        subject_line, body_text, status, created_at, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      draftId,
      accountId,
      contactId,
      'EMAIL',
      touchNum,
      p.subject || 'Tailored Business Proposal',
      p.body || '',
      'SENT',
      now,
      now
    );
  }

  // 4. Insert or update pipeline deal to "Proposal Submitted"
  const dealValue = parseFloat(p.deal_value_usd) || 5000;
  const dealId = p.deal_id || `deal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const dealStmt = db.prepare(`
    INSERT INTO pipeline_deals (
      deal_id, account_id, deal_name, service_line, package_tier,
      deal_stage, deal_value_usd, win_probability, expected_close_date,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(deal_id) DO UPDATE SET
      deal_stage='Proposal Submitted',
      win_probability=0.60,
      deal_value_usd=excluded.deal_value_usd,
      updated_at=excluded.updated_at
  `);

  dealStmt.run(
    dealId,
    accountId,
    `${p.company_name} - ${p.service_wedge || 'Technology Solutions'}`,
    p.service_line || 'Enterprise Engineering',
    'Enterprise Sprint',
    'Proposal Submitted',
    dealValue,
    0.60,
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    now,
    now
  );

  // 5. Log activity
  logActivity('Human SDR / Outbound Engine', 'PROPOSAL_SENT', `Dispatched Touch #${touchNum}${langTag ? ' (' + langTag + ')' : ''} proposal to ${p.recipient_email} (${p.company_name}) for ${p.service_wedge || 'Services'}`, accountId);

  return {
    success: true,
    account_id: accountId,
    contact_id: contactId,
    draft_id: draftId,
    deal_id: dealId,
    sent_at: now
  };
}

// === Mail API & Auto-Dispatch Operations ===
function ensureMailTables() {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS mail_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      provider TEXT NOT NULL DEFAULT 'SIMULATED',
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
      webhook_relay_url TEXT DEFAULT '',
      booking_url TEXT DEFAULT 'https://cal.com/zenthra-systems-dyuqpi/30min',
      payment_deposit_url TEXT DEFAULT '',
      updated_at TEXT NOT NULL
    );
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
      status TEXT NOT NULL,
      raw_response TEXT DEFAULT '{}',
      sent_at TEXT NOT NULL
    );
  `);
  const cols = new Set(db.prepare('PRAGMA table_info(mail_settings)').all().map(c => c.name));
  if (!cols.has('webhook_relay_url')) db.exec("ALTER TABLE mail_settings ADD COLUMN webhook_relay_url TEXT DEFAULT ''");
  if (!cols.has('booking_url')) db.exec("ALTER TABLE mail_settings ADD COLUMN booking_url TEXT DEFAULT 'https://cal.com/zenthra-systems-dyuqpi/30min'");
  if (!cols.has('payment_deposit_url')) db.exec("ALTER TABLE mail_settings ADD COLUMN payment_deposit_url TEXT DEFAULT ''");
}

function getMailSettings() {
  const db = getDb();
  ensureMailTables();
  const stmt = db.prepare('SELECT * FROM mail_settings WHERE id = 1');
  let row = stmt.get();
  if (!row) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO mail_settings (
        id, provider, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass,
        from_name, from_email, reply_to, api_key, auto_send_enabled,
        webhook_relay_url, booking_url, payment_deposit_url, updated_at
      ) VALUES (1, 'SIMULATED', 'smtp.gmail.com', 587, 0, '', '', 'Zenthra Systems Solutions', 'solutions@zenthrasystems.com', 'contact@zenthrasystems.com', '', 0, '', 'https://cal.com/zenthra-systems-dyuqpi/30min', '', ?)
    `).run(now);
    row = stmt.get();
  }
  return row;
}

function saveMailSettings(s) {
  const db = getDb();
  ensureMailTables();
  const existing = getMailSettings();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO mail_settings (
      id, provider, smtp_host, smtp_port, smtp_secure, smtp_user, smtp_pass,
      from_name, from_email, reply_to, api_key, auto_send_enabled,
      webhook_relay_url, booking_url, payment_deposit_url, updated_at
    ) VALUES (
      1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      provider=excluded.provider,
      smtp_host=excluded.smtp_host,
      smtp_port=excluded.smtp_port,
      smtp_secure=excluded.smtp_secure,
      smtp_user=excluded.smtp_user,
      smtp_pass=excluded.smtp_pass,
      from_name=excluded.from_name,
      from_email=excluded.from_email,
      reply_to=excluded.reply_to,
      api_key=excluded.api_key,
      auto_send_enabled=excluded.auto_send_enabled,
      webhook_relay_url=excluded.webhook_relay_url,
      booking_url=excluded.booking_url,
      payment_deposit_url=excluded.payment_deposit_url,
      updated_at=excluded.updated_at
  `);

  stmt.run(
    s.provider || existing.provider || 'SIMULATED',
    s.smtp_host || existing.smtp_host || 'smtp.gmail.com',
    parseInt(s.smtp_port, 10) || existing.smtp_port || 587,
    s.smtp_secure !== undefined ? (s.smtp_secure ? 1 : 0) : (existing.smtp_secure || 0),
    s.smtp_user !== undefined ? (s.smtp_user || '') : (existing.smtp_user || ''),
    s.smtp_pass ? s.smtp_pass : (existing.smtp_pass || ''),
    s.from_name || existing.from_name || 'Zenthra Systems Solutions',
    s.from_email || existing.from_email || 'solutions@zenthrasystems.com',
    s.reply_to || existing.reply_to || 'contact@zenthrasystems.com',
    s.api_key ? s.api_key : (existing.api_key || ''),
    s.auto_send_enabled !== undefined ? (s.auto_send_enabled ? 1 : 0) : (existing.auto_send_enabled || 0),
    s.webhook_relay_url !== undefined ? (s.webhook_relay_url || '') : (existing.webhook_relay_url || ''),
    s.booking_url !== undefined ? (s.booking_url || 'https://cal.com/zenthra-systems-dyuqpi/30min') : (existing.booking_url || 'https://cal.com/zenthra-systems-dyuqpi/30min'),
    s.payment_deposit_url !== undefined ? (s.payment_deposit_url || '') : (existing.payment_deposit_url || ''),
    now
  );

  return getMailSettings();
}

function logSentEmail(entry) {
  const db = getDb();
  ensureMailTables();
  const stmt = db.prepare(`
    INSERT INTO sent_emails_log (
      log_id, recipient_email, recipient_name, company_name,
      subject, service_wedge, deal_value_usd, provider,
      message_id, status, raw_response, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const logId = entry.log_id || `eml_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const now = entry.sent_at || new Date().toISOString();

  stmt.run(
    logId,
    entry.recipient_email || '',
    entry.recipient_name || '',
    entry.company_name || '',
    entry.subject || 'Enterprise Proposal',
    entry.service_wedge || '',
    entry.deal_value_usd || 0,
    entry.provider || 'SMTP',
    entry.message_id || '',
    entry.status || 'DELIVERED',
    typeof entry.raw_response === 'object' ? JSON.stringify(entry.raw_response) : (entry.raw_response || '{}'),
    now
  );

  return { log_id: logId, sent_at: now };
}

function listSentEmails(limit = 50) {
  const db = getDb();
  ensureMailTables();
  const stmt = db.prepare('SELECT * FROM sent_emails_log ORDER BY sent_at DESC LIMIT ?');
  return stmt.all(limit);
}

// === Emailable Directory & 1-Click Mail Hub ===
function listEmailReadyContacts(options = {}) {
  const db = getDb();
  ensureMailTables();
  const { status = 'ALL', search = '', country = '', service = '', limit = 200 } = options;

  let query = `
    SELECT 
      c.id as contact_row_id,
      c.contact_id,
      c.account_id,
      c.first_name,
      c.last_name,
      c.job_title,
      c.corporate_email,
      c.email_verification_status,
      c.linkedin_url,
      c.outreach_status,
      a.company_name,
      a.domain,
      a.country,
      a.industry,
      a.lead_tier,
      a.lead_score,
      a.primary_matched_service,
      a.recommended_wedge,
      d.draft_id,
      d.subject_line as draft_subject,
      d.body_text as draft_body,
      d.status as draft_status,
      s.message_id as last_message_id,
      s.sent_at as last_sent_at,
      s.status as delivery_status
    FROM contacts c
    JOIN accounts a ON c.account_id = a.account_id
    LEFT JOIN outreach_drafts d ON c.contact_id = d.contact_id AND d.channel = 'EMAIL'
    LEFT JOIN (
      SELECT recipient_email, message_id, sent_at, status,
             ROW_NUMBER() OVER(PARTITION BY recipient_email ORDER BY sent_at DESC) as rn
      FROM sent_emails_log
    ) s ON lower(c.corporate_email) = lower(s.recipient_email) AND s.rn = 1
    WHERE c.corporate_email IS NOT NULL AND c.corporate_email != ''
  `;

  const params = [];

  if (status === 'CLEARED') {
    query += ` AND c.outreach_status = 'CLEARED'`;
  } else {
    query += ` AND (c.outreach_status IS NULL OR c.outreach_status != 'CLEARED')`;
  }

  if (search) {
    const sTerm = `%${search.toLowerCase().trim()}%`;
    query += ` AND (
      lower(c.first_name || ' ' || c.last_name) LIKE ? OR
      lower(c.job_title) LIKE ? OR
      lower(c.corporate_email) LIKE ? OR
      lower(a.company_name) LIKE ? OR
      lower(a.country) LIKE ?
    )`;
    params.push(sTerm, sTerm, sTerm, sTerm, sTerm);
  }

  if (country && country !== 'ALL') {
    query += ` AND lower(a.country) = lower(?)`;
    params.push(country.trim());
  }

  if (service && service !== 'ALL') {
    query += ` AND (lower(a.primary_matched_service) LIKE ? OR lower(a.recommended_wedge) LIKE ?)`;
    const sTerm = `%${service.toLowerCase().trim()}%`;
    params.push(sTerm, sTerm);
  }

  if (status === 'READY') {
    query += ` AND (s.sent_at IS NULL AND (c.outreach_status IS NULL OR c.outreach_status != 'EMAIL_SENT'))`;
  } else if (status === 'SENT') {
    query += ` AND (s.sent_at IS NOT NULL OR c.outreach_status = 'EMAIL_SENT')`;
  }

  query += ` ORDER BY s.sent_at ASC, a.lead_score DESC LIMIT ?`;
  params.push(parseInt(limit, 10) || 200);

  const stmt = db.prepare(query);
  const rows = stmt.all(...params);

  return rows.map(r => {
    const isSent = Boolean(r.last_sent_at || r.outreach_status === 'EMAIL_SENT');
    const calCharge = calculateEstimatedProposalValue(r.primary_matched_service, r.country);
    return {
      contact_id: r.contact_id,
      account_id: r.account_id,
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Managing Director',
      first_name: r.first_name || 'Executive',
      last_name: r.last_name || '',
      job_title: r.job_title || 'Chief Executive Officer',
      email: r.corporate_email,
      verification_status: r.email_verification_status || 'VERIFIED_SMTP',
      linkedin_url: r.linkedin_url || `https://linkedin.com/in/${(r.first_name || 'contact').toLowerCase()}-${(r.last_name || 'lead').toLowerCase()}`,
      company_name: r.company_name,
      domain: r.domain,
      country: r.country,
      industry: r.industry,
      lead_tier: r.lead_tier || 'Tier A',
      lead_score: r.lead_score || 85,
      service_line: r.primary_matched_service,
      recommended_wedge: r.recommended_wedge,
      estimated_deal_value_usd: calCharge,
      draft_id: r.draft_id,
      draft_subject: r.draft_subject,
      draft_body: r.draft_body,
      is_sent: isSent,
      readiness_status: r.outreach_status === 'CLEARED' ? 'CLEARED' : (isSent ? 'SENT' : 'READY_TO_EMAIL'),
      last_sent_at: r.last_sent_at,
      last_message_id: r.last_message_id,
      delivery_status: r.delivery_status || (isSent ? 'DELIVERED' : 'UNSENT')
    };
  });
}

function calculateEstimatedProposalValue(serviceLine, country) {
  let base = 9500;
  if (!serviceLine) base = 9500;
  else if (serviceLine.includes('RAG') || serviceLine.includes('GenAI') || serviceLine.includes('Security')) base = 16500;
  else if (serviceLine.includes('Power BI') || serviceLine.includes('Analytics')) base = 12500;
  else if (serviceLine.includes('Voice') || serviceLine.includes('WhatsApp')) base = 8500;
  else if (serviceLine.includes('SEO') || serviceLine.includes('3-Pack')) base = 6500;
  else if (serviceLine.includes('E-Commerce')) base = 11500;

  // Country multiplier
  const c = (country || '').toLowerCase();
  if (c.includes('united states') || c.includes('usa') || c.includes('united arab emirates') || c.includes('uae')) {
    return base;
  } else if (c.includes('united kingdom') || c.includes('germany') || c.includes('australia')) {
    return Math.round(base * 0.95);
  } else {
    return Math.round(base * 0.75);
  }
}

function markContactEmailSent(contactId, details) {
  const db = getDb();
  ensureMailTables();
  const now = details.sent_at || new Date().toISOString();

  // 1. Update contact outreach status
  const stmt1 = db.prepare('UPDATE contacts SET outreach_status = ? WHERE contact_id = ?');
  stmt1.run('EMAIL_SENT', contactId);

  // 2. Log in sent_emails_log
  const logId = `eml_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const stmt2 = db.prepare(`
    INSERT INTO sent_emails_log (
      log_id, recipient_email, recipient_name, company_name,
      subject, service_wedge, deal_value_usd, provider,
      message_id, status, raw_response, sent_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt2.run(
    logId,
    details.recipient_email,
    details.recipient_name || '',
    details.company_name || '',
    details.subject || 'Enterprise Proposal',
    details.service_wedge || '',
    details.deal_value_usd || 0,
    details.provider || 'SMTP',
    details.message_id || '',
    details.status || 'DELIVERED',
    typeof details.raw_response === 'object' ? JSON.stringify(details.raw_response) : (details.raw_response || '{}'),
    now
  );

  // Resolve valid accountId for foreign keys
  let validAccountId = details.account_id || null;
  if (validAccountId) {
    const acc = db.prepare('SELECT account_id FROM accounts WHERE account_id = ?').get(validAccountId);
    if (!acc) validAccountId = null;
  }

  if (!validAccountId && details.company_name) {
    const domain = (details.recipient_email || '').split('@')[1] || 'enterprise.com';
    const existing = db.prepare('SELECT account_id FROM accounts WHERE domain = ? OR company_name = ?').get(domain, details.company_name);
    if (existing) {
      validAccountId = existing.account_id;
    } else {
      const newAccId = `acc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      try {
        db.prepare(`
          INSERT INTO accounts (account_id, company_name, domain, industry, headcount, country, lead_score, lead_tier, crm_status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(newAccId, details.company_name, domain, 'Enterprise Solutions', 50, 'Global', 100, 'Tier A', 'QUALIFIED', now, now);
        validAccountId = newAccId;
      } catch (e) {
        validAccountId = null;
      }
    }
  }

  // 3. Stage deal
  let dealId = null;
  if (validAccountId) {
    dealId = `deal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const stmt3 = db.prepare(`
      INSERT INTO pipeline_deals (
        deal_id, account_id, deal_name, service_line, package_tier,
        deal_stage, deal_value_usd, win_probability, expected_close_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt3.run(
      dealId,
      validAccountId,
      `${details.company_name || 'Enterprise'} — ${details.service_wedge || 'Service Engagement'}`,
      details.service_line || 'Enterprise Solutions',
      'ENTRY_SPRINT',
      'Value Proposal Sent',
      details.deal_value_usd || 9500,
      0.65,
      new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      now,
      now
    );
  }

  // 4. Log activity
  logActivity('1-Click Mail Hub', 'ONE_CLICK_EMAIL_DISPATCHED', `Dispatched 1-click proposal to ${details.recipient_email} (${details.company_name})`, validAccountId);

  return { log_id: logId, deal_id: dealId, sent_at: now };
}

function getContactById(contactId) {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, a.company_name, a.domain, a.country, a.recommended_wedge 
    FROM contacts c
    LEFT JOIN accounts a ON c.account_id = a.account_id
    WHERE c.contact_id = ?
  `).get(contactId) || null;
}

// === Emailable Contacts Clearing & Reset Options ===
function clearContactFromEmailable(contactId) {
  const db = getDb();
  ensureMailTables();
  const stmt = db.prepare("UPDATE contacts SET outreach_status = 'CLEARED' WHERE contact_id = ?");
  return stmt.run(contactId).changes;
}

function clearContactsBulk(contactIds) {
  const db = getDb();
  ensureMailTables();
  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) return 0;
  const stmt = db.prepare("UPDATE contacts SET outreach_status = 'CLEARED' WHERE contact_id = ?");
  let count = 0;
  db.exec('BEGIN TRANSACTION');
  try {
    for (const id of contactIds) {
      if (id) {
        const res = stmt.run(id);
        if (res.changes > 0) count++;
      }
    }
    db.exec('COMMIT');
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (_) {}
    throw err;
  }
  return count;
}

function clearSingleSentStatus(contactId) {
  const db = getDb();
  ensureMailTables();
  const c = db.prepare('SELECT corporate_email FROM contacts WHERE contact_id = ?').get(contactId);
  db.prepare("UPDATE contacts SET outreach_status = 'READY_TO_EMAIL' WHERE contact_id = ?").run(contactId);
  if (c && c.corporate_email) {
    db.prepare('DELETE FROM sent_emails_log WHERE lower(recipient_email) = lower(?)').run(c.corporate_email);
  }
  return 1;
}

function resetEmailableContacts(action = 'RESET_SENT') {
  const db = getDb();
  ensureMailTables();
  if (action === 'RESET_SENT') {
    const res = db.prepare("UPDATE contacts SET outreach_status = 'READY_TO_EMAIL' WHERE outreach_status = 'EMAIL_SENT'").run();
    db.prepare("DELETE FROM sent_emails_log").run();
    return res.changes;
  } else if (action === 'RESTORE_CLEARED') {
    const res = db.prepare("UPDATE contacts SET outreach_status = 'READY_TO_EMAIL' WHERE outreach_status = 'CLEARED'").run();
    return res.changes;
  } else if (action === 'CLEAR_ALL') {
    const res = db.prepare("UPDATE contacts SET outreach_status = 'CLEARED' WHERE corporate_email IS NOT NULL").run();
    return res.changes;
  }
  return 0;
}

module.exports = {
  initDb,
  getDb,
  insertAccount,
  getAccountByDomain,
  getAccountById,
  getContactById,
  listAccounts,
  insertContact,
  listContactsForAccount,
  insertDraft,
  listPendingDrafts,
  updateDraftStatus,
  clearPendingDrafts,
  recordSentProposal,
  insertDeal,
  listDeals,
  updateDealStage,
  logActivity,
  listActivities,
  getMailSettings,
  saveMailSettings,
  logSentEmail,
  listSentEmails,
  listEmailReadyContacts,
  markContactEmailSent,
  clearContactFromEmailable,
  clearContactsBulk,
  clearSingleSentStatus,
  resetEmailableContacts
};
