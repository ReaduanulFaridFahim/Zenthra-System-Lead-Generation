/**
 * Zenthra Systems - Full Enterprise Platform Server
 * Provides complete API for Executive Dashboard, SDR Console, Agent Command Center,
 * Pipeline Management, Pricing Engine, and SOW Generator.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const db = require('../database/db');
const { processProspect } = require('../agents/orchestrator');
const { calculateQuote, calculateValueAnchoredSprint, PACKAGES, RATES } = require('../pricing/pricing_calculator');
const { CAMPAIGNS } = require('../campaigns/campaign_matrix');
const { generateSOW } = require('../agents/proposal_architect');
const { classifyReply } = require('../agents/reply_classifier');
const {
  discoverAuditAndPropose,
  discoverUnlimitedPlaces,
  generateExcelCSV,
  listAllCountriesAndCities,
  listAllCategories
} = require('../agents/places_discovery_agent');
const mailService = require('../services/mail_service');
const demoProjects = require('../services/demo_projects');

// Load environment variables from .env
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const PORT = parseInt(process.env.CONSOLE_PORT || '3050', 10);
const HTML_FILE = path.join(__dirname, 'console.html');

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Static HTML Portal
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const html = fs.readFileSync(HTML_FILE, 'utf8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
    return;
  }

  // 2. GET /api/data (Full Platform State)
  if (req.method === 'GET' && req.url === '/api/data') {
    const accounts = db.listAccounts();
    const deals = db.listDeals();
    const drafts = db.listPendingDrafts();
    const activities = db.listActivities(40);

    // Calculate Executive KPIs
    const activeDeals = deals.filter(d => d.deal_stage !== 'Closed Lost');
    const totalPipelineUSD = activeDeals.reduce((sum, d) => sum + d.deal_value_usd, 0);
    const weightedPipelineUSD = activeDeals.reduce((sum, d) => sum + (d.deal_value_usd * d.win_probability), 0);
    const closedWonDeals = deals.filter(d => d.deal_stage === 'Closed Won');
    const closedWonUSD = closedWonDeals.reduce((sum, d) => sum + d.deal_value_usd, 0);
    const resolvedDeals = deals.filter(d => d.deal_stage === 'Closed Won' || d.deal_stage === 'Closed Lost');
    const winRatePct = resolvedDeals.length > 0 ? Math.round((closedWonDeals.length / resolvedDeals.length) * 100) : 67;

    const avgScore = accounts.length > 0 ? Math.round(accounts.reduce((sum, a) => sum + a.lead_score, 0) / accounts.length) : 0;
    const tierACount = accounts.filter(a => a.lead_tier === 'Tier A').length;
    const tierBCount = accounts.filter(a => a.lead_tier === 'Tier B').length;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      kpis: {
        totalPipelineUSD,
        weightedPipelineUSD,
        closedWonUSD,
        winRatePct,
        avgDealUSD: activeDeals.length > 0 ? Math.round(totalPipelineUSD / activeDeals.length) : 0,
        avgScore,
        tierACount,
        tierBCount,
        accountsCount: accounts.length,
        dealsCount: deals.length,
        pendingDraftsCount: drafts.length
      },
      accounts,
      deals,
      drafts,
      activities,
      campaigns: CAMPAIGNS,
      packages: PACKAGES,
      rates: RATES,
      mailSettings: db.getMailSettings(),
      system: {
        n8nBaseUrl: process.env.N8N_BASE_URL || 'http://192.168.0.104:5678',
        nodeVersion: process.version,
        uptimeSeconds: Math.round(process.uptime()),
        database: 'SQLite (node:sqlite Native)'
      }
    }));
    return;
  }

  // 3. POST /api/ingest (Run Multi-Agent Prospect Discovery)
  if (req.method === 'POST' && req.url === '/api/ingest') {
    try {
      const payload = await parseJsonBody(req);
      const result = await processProspect(payload, true);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, result }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3b. POST /api/ingest-batch (Run Batch Multi-Agent Ingestion)
  if (req.method === 'POST' && req.url === '/api/ingest-batch') {
    try {
      const { accounts } = await parseJsonBody(req);
      const results = [];
      for (const acc of (accounts || [])) {
        const resObj = await processProspect(acc, true);
        results.push(resObj);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: results.length, results }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3c. GET /api/meta-geo-categories (Dynamic Country, City & Category Metadata)
  if (req.method === 'GET' && req.url === '/api/meta-geo-categories') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      countries: listAllCountriesAndCities(),
      categories: listAllCategories()
    }));
    return;
  }

  // 3c2. POST /api/places-discover (Unlimited Google Maps Discovery & Weakness Audit Agent)
  if (req.method === 'POST' && req.url === '/api/places-discover') {
    try {
      const { query, country, city, categoryKey, count, forwardToN8n, autoSendMail } = await parseJsonBody(req);
      const shouldForward = forwardToN8n !== undefined ? forwardToN8n : true;
      const outcome = await discoverAuditAndPropose(
        query || 'apparel manufacturers in Dhaka',
        country || 'Bangladesh',
        parseInt(count, 10) || 10,
        city || 'All',
        categoryKey || '',
        shouldForward
      );

      // Auto-Send Mail Check
      let autoMailOutcome = { autoSentCount: 0, results: [] };
      if (autoSendMail === true || mailService.isAutoSendEnabled()) {
        autoMailOutcome = await mailService.autoDispatchDiscoveredPlaces(outcome.results, Boolean(autoSendMail));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        country: outcome.country,
        city: outcome.city,
        count: outcome.count,
        results: outcome.results,
        auto_mail_sent: autoMailOutcome.autoSentCount
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3c3. POST /api/export-excel (Generate Excel-Compatible UTF-8 CSV)
  if (req.method === 'POST' && req.url === '/api/export-excel') {
    try {
      const { results, country, city } = await parseJsonBody(req);
      const csvData = generateExcelCSV(results || []);
      const countrySlug = (country || 'global').toLowerCase().replace(/[^a-z0-9]/g, '_');
      const filename = `zenthra_leads_${countrySlug}_${Date.now()}.csv`;
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`
      });
      res.end(csvData);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3d. POST /api/send-proposal (Direct Proposal Dispatch via Mail API, SMTP & n8n)
  if (req.method === 'POST' && req.url === '/api/send-proposal') {
    try {
      const payload = await parseJsonBody(req);
      
      // 1. Dispatch Real Email via configured Mail API / SMTP
      let emailDelivery = null;
      try {
        emailDelivery = await mailService.sendEmail({
          to: payload.recipient_email,
          recipientName: payload.recipient_name,
          companyName: payload.company_name,
          subject: payload.subject,
          body: payload.body,
          serviceWedge: payload.service_wedge,
          dealValueUSD: payload.deal_value_usd || 5000,
          demoProjectKey: payload.demo_project_key || 'demo-rag'
        });
      } catch (emlErr) {
        emailDelivery = { success: false, error: emlErr.message, provider: 'ERROR' };
      }

      // 2. Dispatch to live n8n webhook
      let n8nResponse = null;
      try {
        const baseUrl = process.env.N8N_BASE_URL || 'http://192.168.0.104:5678';
        const webhookUrl = `${baseUrl}/webhook/zenthra-lead-ingest`;
        const resN8n = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'PROPOSAL_DISPATCHED',
            proposal: payload,
            email_delivery: emailDelivery
          })
        });
        n8nResponse = await resN8n.json();
      } catch (e) {
        n8nResponse = { status: 'LOCAL_DISPATCH', error: e.message };
      }

      // 3. Record in database (Drafts, Deals, Activities)
      const recordResult = db.recordSentProposal(payload);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        sent_at: recordResult.sent_at,
        draft_id: recordResult.draft_id,
        deal_id: recordResult.deal_id,
        recipient: payload.recipient_email,
        company: payload.company_name,
        email_delivery: emailDelivery,
        n8n_status: n8nResponse?.message || 'Workflow was started'
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3e. POST /api/batch-send-proposals (Batch Proposal Dispatch via Mail API & n8n)
  if (req.method === 'POST' && req.url === '/api/batch-send-proposals') {
    try {
      const { proposals } = await parseJsonBody(req);
      const results = [];
      const baseUrl = process.env.N8N_BASE_URL || 'http://192.168.0.104:5678';
      const webhookUrl = `${baseUrl}/webhook/zenthra-lead-ingest`;

      for (const p of (proposals || [])) {
        const rec = db.recordSentProposal(p);

        // Send real email via Mail API / SMTP
        let emailRes = null;
        try {
          emailRes = await mailService.sendEmail({
            to: p.recipient_email,
            recipientName: p.recipient_name,
            companyName: p.company_name,
            subject: p.subject,
            body: p.body,
            serviceWedge: p.service_wedge,
            dealValueUSD: p.deal_value_usd || 5000
          });
        } catch (e) {
          emailRes = { success: false, error: e.message };
        }

        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event: 'PROPOSAL_DISPATCHED', proposal: p, email_res: emailRes })
          });
        } catch (_) {}

        results.push({
          company: p.company_name,
          recipient: p.recipient_email,
          status: 'SENT',
          sent_at: rec.sent_at,
          email_delivery: emailRes
        });
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: results.length, results }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3f. GET /api/mail-settings (Inspect Mail API & Auto-Send Config)
  if (req.method === 'GET' && req.url === '/api/mail-settings') {
    const settings = db.getMailSettings();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      settings: {
        provider: settings.provider,
        smtp_host: settings.smtp_host,
        smtp_port: settings.smtp_port,
        smtp_secure: Boolean(settings.smtp_secure),
        smtp_user: settings.smtp_user,
        has_password: Boolean(settings.smtp_pass),
        from_name: settings.from_name,
        from_email: settings.from_email,
        reply_to: settings.reply_to,
        has_api_key: Boolean(settings.api_key),
        auto_send_enabled: Boolean(settings.auto_send_enabled),
        updated_at: settings.updated_at
      }
    }));
    return;
  }

  // 3g. POST /api/mail-settings (Save Mail API & SMTP Credentials)
  if (req.method === 'POST' && req.url === '/api/mail-settings') {
    try {
      const payload = await parseJsonBody(req);
      const updated = db.saveMailSettings(payload);
      db.logActivity('System Admin', 'MAIL_SETTINGS_UPDATED', `Mail API configuration updated to ${updated.provider} (Auto-Send: ${updated.auto_send_enabled ? 'ON' : 'OFF'})`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, settings: updated }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3h. POST /api/send-test-email (Test Mail API Connectivity)
  if (req.method === 'POST' && req.url === '/api/send-test-email') {
    try {
      const { email } = await parseJsonBody(req);
      if (!email) throw new Error('Target email address is required');
      const testResult = await mailService.sendTestEmail(email);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, result: testResult }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3i. GET /api/sent-emails (List Outbound Emails Audit Log)
  if (req.method === 'GET' && req.url === '/api/sent-emails') {
    const logs = db.listSentEmails(50);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: logs.length, logs }));
    return;
  }

  // === DEMO PROJECTS ROUTES ===
  // 3j1. GET /api/demo/rag/documents
  if (req.method === 'GET' && req.url === '/api/demo/rag/documents') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, documents: demoProjects.RAG_DOCUMENTS }));
    return;
  }

  // 3j2. POST /api/demo/rag/query
  if (req.method === 'POST' && req.url === '/api/demo/rag/query') {
    try {
      const { query, documentKey } = await parseJsonBody(req);
      const answer = demoProjects.queryRagAssistant(query || '', documentKey);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, result: answer }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3j3. POST /api/demo/intake/chat
  if (req.method === 'POST' && req.url === '/api/demo/intake/chat') {
    try {
      const { message, history, industry } = await parseJsonBody(req);
      const outcome = demoProjects.processIntakeConversation(message || '', history || [], industry || 'Logistics');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, outcome }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 3j4. GET /api/demo/powerbi/metrics
  if (req.method === 'GET' && req.url.startsWith('/api/demo/powerbi/metrics')) {
    const urlObj = new URL(req.url, 'http://localhost:3050');
    const sector = urlObj.searchParams.get('sector') || 'Logistics & Freight';
    const metrics = demoProjects.getPowerBiMetrics(sector);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, data: metrics }));
    return;
  }

  // 3j5. POST /api/demo/parser/extract
  if (req.method === 'POST' && req.url === '/api/demo/parser/extract') {
    try {
      const { sampleKey } = await parseJsonBody(req);
      const doc = demoProjects.parseCommercialDocument(sampleKey || 'bill_of_lading');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, document: doc }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 4. POST /api/review-draft (SDR Gate)
  if (req.method === 'POST' && req.url === '/api/review-draft') {
    try {
      const { draftId, status } = await parseJsonBody(req);
      db.updateDraftStatus(draftId, status);
      db.logActivity('Human SDR', 'DRAFT_REVIEWED', `Draft ${draftId} set to ${status}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, draftId, status }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 4b. POST /api/clear-drafts (Bulk Clear / Reject / Approve SDR Drafts)
  if (req.method === 'POST' && req.url === '/api/clear-drafts') {
    try {
      const { action = 'REJECTED' } = await parseJsonBody(req);
      const count = db.clearPendingDrafts(action);
      db.logActivity('Human SDR', 'SDR_QUEUE_CLEARED', `Bulk action ${action} performed on ${count} pending drafts in SDR Approval Gate`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count, action }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 5. POST /api/calculate-quote (Pricing Engine)
  if (req.method === 'POST' && req.url === '/api/calculate-quote') {
    try {
      const { packageKey, customPrice, hours } = await parseJsonBody(req);
      const quote = calculateQuote(packageKey, { customPrice, hours });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, quote }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 6. POST /api/generate-sow (SOW Generator)
  if (req.method === 'POST' && req.url === '/api/generate-sow') {
    try {
      const params = await parseJsonBody(req);
      const sowMarkdown = generateSOW(params);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, sow: sowMarkdown }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 7. POST /api/classify-reply (Inbound Intelligence)
  if (req.method === 'POST' && req.url === '/api/classify-reply') {
    try {
      const { text } = await parseJsonBody(req);
      const classification = classifyReply(text);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, classification }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 8. POST /api/update-deal (Pipeline Stage Transition)
  if (req.method === 'POST' && req.url === '/api/update-deal') {
    try {
      const { dealId, stage } = await parseJsonBody(req);
      db.updateDealStage(dealId, stage);
      db.logActivity('Sales Rep', 'DEAL_STAGE_CHANGED', `Deal ${dealId} transitioned to ${stage}`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, dealId, stage }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 9. GET /api/model1-samples (Model 1 Benchmark Scenarios)
  if (req.method === 'GET' && req.url === '/api/model1-samples') {
    const samples = [
      {
        companyName: 'Apex Freight & Logistics LLC',
        city: 'Dallas, TX (USA)',
        industry: 'Freight & Transportation',
        weaknessCategory: 'BUSINESS_INTELLIGENCE',
        decisionMaker: 'Marcus Vance (Chief Financial Officer)',
        email: 'connect.zenthra@gmail.com',
        monthlyLossUSD: 9000,
        narrative: 'Finance team spends 15 hours every Monday manually consolidating driver pay and diesel invoices across 4 regional yards.'
      },
      {
        companyName: 'Harley Street Medical Specialist Clinic',
        city: 'London (UK)',
        industry: 'Private Healthcare & Aesthetics',
        weaknessCategory: 'CUSTOMER_COMMUNICATION',
        decisionMaker: 'Dr. Evelyn Ward (Clinical Director & Owner)',
        email: 'connect.zenthra@gmail.com',
        monthlyLossUSD: 7500,
        narrative: 'Clinic reception misses 40% of consultation booking inquiries arriving after 5:30 PM, causing high-intent patients to book with Mayfair clinics.'
      },
      {
        companyName: 'Emirates Prestige Luxury Realty',
        city: 'Dubai (UAE)',
        industry: 'Luxury Real Estate',
        weaknessCategory: 'INTAKE_AUTOMATION',
        decisionMaker: 'Tariq Al-Mansoor (Managing Partner)',
        email: 'connect.zenthra@gmail.com',
        monthlyLossUSD: 12000,
        narrative: 'High-net-worth WhatsApp property inquiries sit unanswered for 6+ hours during overseas buyer peak hours, forfeiting high-value investor deals.'
      },
      {
        companyName: 'MedVance BioResearch Innovations',
        city: 'Boston, MA (USA)',
        industry: 'BioTech & Clinical Research',
        weaknessCategory: 'RAG_KNOWLEDGE',
        decisionMaker: 'Dr. Nathan Cruz (VP of Regulatory Affairs)',
        email: 'connect.zenthra@gmail.com',
        monthlyLossUSD: 14000,
        narrative: 'Research staff waste 2.5 hours daily manually searching 18,000 PDF clinical protocol documents with severe compliance risk.'
      }
    ];

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, samples }));
    return;
  }

  // 10. POST /api/model1-execute (Model 1: Value-Anchored Fixed Sprint Engine)
  if (req.method === 'POST' && req.url === '/api/model1-execute') {
    try {
      const payload = await parseJsonBody(req);
      const executionResult = calculateValueAnchoredSprint(payload);

      const dealId = `deal_m1_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const accountId = payload.accountId || `acc_m1_${Date.now()}`;
      
      try {
        db.insertDeal({
          deal_id: dealId,
          account_id: accountId,
          deal_name: `${executionResult.companyName} — ${executionResult.sprint.title}`,
          deal_value_usd: executionResult.financials.sprintPriceUSD,
          deal_stage: 'Value Proposal Sent',
          win_probability: 0.65,
          target_close_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          notes: `Model 1 Value-Anchored Sprint. Audited Monthly Loss: $${executionResult.financials.monthlyLossUSD}/mo. Payback: ${executionResult.financials.paybackDays} days.`
        });
        db.logActivity('Model 1 Engine', 'VALUE_SPRINT_EXECUTED', `Executed Model 1 Sprint for ${executionResult.companyName} ($${executionResult.financials.sprintPriceUSD} USD, ${executionResult.financials.paybackDays}d payback)`);
      } catch (dbErr) {
        console.warn('DB deal insert warning:', dbErr.message);
      }

      let emailResult = null;
      if (payload.dispatch !== false) {
        const recipient = payload.recipient_email || executionResult.email || 'connect.zenthra@gmail.com';
        emailResult = await mailService.sendEmail({
          to: recipient,
          subject: executionResult.proposal.subject,
          html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #0d9488); padding: 18px 24px; border-radius: 6px; margin-bottom: 24px;">
              <h2 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">ZENTHRA SYSTEMS — EXECUTIVE VALUE BRIEFING</h2>
              <p style="color: #99f6e4; margin: 4px 0 0 0; font-size: 12px;">Model 1: Value-Anchored Fixed Sprint Engagement</p>
            </div>
            ${executionResult.proposal.body.replace(/\n/g, '<br/>')}
            <div style="margin-top: 24px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 6px;">
              <h4 style="color: #166534; margin: 0 0 8px 0; font-size: 14px;">Commercial Payback Horizon</h4>
              <p style="margin: 0; font-size: 13px; color: #15803d;">
                <strong>Audited Leakage:</strong> $${executionResult.financials.monthlyLossUSD.toLocaleString()}/mo &bull; 
                <strong>Fixed Sprint:</strong> $${executionResult.financials.sprintPriceUSD.toLocaleString()} &bull; 
                <strong>Payback:</strong> ${executionResult.financials.paybackDays} Days &bull; 
                <strong>1-Year Net Value:</strong> $${executionResult.financials.annualRecoveredUSD.toLocaleString()} (${executionResult.financials.firstYearROIPct}% ROI)
              </p>
            </div>
          </div>`,
          text: executionResult.proposal.body
        });
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        deal_id: dealId,
        execution: executionResult,
        email_delivery: emailResult
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 11. GET /api/emailable-contacts (Email Readiness Directory)
  if (req.method === 'GET' && req.url.startsWith('/api/emailable-contacts')) {
    try {
      const urlObj = new URL(req.url, 'http://localhost:3050');
      const search = urlObj.searchParams.get('search') || '';
      const country = urlObj.searchParams.get('country') || '';
      const service = urlObj.searchParams.get('service') || '';
      const status = urlObj.searchParams.get('status') || 'ALL';
      const limit = parseInt(urlObj.searchParams.get('limit') || '300', 10);

      const contacts = db.listEmailReadyContacts({ search, country, service, status, limit });
      
      const allContacts = db.listEmailReadyContacts({ limit: 1000 });
      const readyContacts = allContacts.filter(c => c.readiness_status === 'READY_TO_EMAIL');
      const sentContacts = allContacts.filter(c => c.readiness_status === 'SENT');
      const totalPipelineUSD = allContacts.reduce((sum, c) => sum + (c.estimated_deal_value_usd || 0), 0);
      const readyPipelineUSD = readyContacts.reduce((sum, c) => sum + (c.estimated_deal_value_usd || 0), 0);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        kpis: {
          total_emailable: allContacts.length,
          ready_to_send: readyContacts.length,
          already_sent: sentContacts.length,
          total_pipeline_usd: totalPipelineUSD,
          ready_pipeline_usd: readyPipelineUSD
        },
        summary: {
          total_emailable: allContacts.length,
          ready_to_send: readyContacts.length,
          already_sent: sentContacts.length,
          total_pipeline_usd: totalPipelineUSD,
          ready_pipeline_usd: readyPipelineUSD
        },
        count: contacts.length,
        contacts: contacts.map(c => ({
          ...c,
          status: c.readiness_status || c.status,
          deal_value_usd: c.estimated_deal_value_usd || c.deal_value_usd || 8500
        }))
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 11b. POST /api/contacts/clear (Clear Individual or Bulk Contacts from Who Can I Email)
  if (req.method === 'POST' && req.url === '/api/contacts/clear') {
    try {
      const payload = await parseJsonBody(req);
      let count = 0;
      if (payload.contact_ids && Array.isArray(payload.contact_ids)) {
        count = db.clearContactsBulk(payload.contact_ids);
      } else if (payload.contact_id) {
        count = db.clearContactFromEmailable(payload.contact_id);
      }
      db.logActivity('Human SDR', 'CONTACTS_CLEARED', `Cleared ${count} contact(s) from emailable directory`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 11c. POST /api/contacts/reset (Reset Sent Flags, Single Sent Flag, or Restore Cleared Contacts)
  if (req.method === 'POST' && req.url === '/api/contacts/reset') {
    try {
      const payload = await parseJsonBody(req);
      let count = 0;
      if (payload.contact_id) {
        count = db.clearSingleSentStatus(payload.contact_id);
      } else {
        const action = payload.action || 'RESET_SENT';
        count = db.resetEmailableContacts(action);
      }
      db.logActivity('Human SDR', 'CONTACTS_RESET', `Reset action executed affecting ${count} contact(s)`);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 12. POST /api/send-one-click-mail (1-Click Instant Email Dispatch)
  if (req.method === 'POST' && req.url === '/api/send-one-click-mail') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload.recipient_email && payload.contact_id) {
        const c = db.getContactById(payload.contact_id);
        if (c) {
          payload.recipient_email = c.corporate_email || c.email;
          payload.recipient_name = payload.recipient_name || `${c.first_name || ''} ${c.last_name || ''}`.trim();
          payload.company_name = payload.company_name || c.company_name;
          payload.account_id = payload.account_id || c.account_id;
          payload.service_wedge = payload.service_wedge || c.recommended_wedge;
        }
      }
      const {
        contact_id,
        recipient_email,
        recipient_name,
        company_name,
        service_wedge,
        deal_value_usd = 9500
      } = payload;

      if (!recipient_email) {
        throw new Error('Recipient email is required for 1-click mail delivery.');
      }

      const firstName = (recipient_name || 'there').split(' ')[0];
      const subject = payload.subject || `Business Proposal & Value Sprint for ${company_name || 'your operations'}`;
      const body = payload.body || `Hi ${firstName},

We recently completed an audit of ${company_name || 'your organization'}'s digital and operational workflows.

At Zenthra Systems, we engineer custom technology architectures to eliminate manual operational drag and scale revenue visibility. We deploy our ${service_wedge || 'Enterprise Technology Sprint'} in a rapid 5-day delivery with guaranteed outcomes.

Investment: $${(deal_value_usd || 9500).toLocaleString()} USD (Fixed fee, 100% IP ownership, ~30-day payback period).

Would you be open to a brief 10-minute briefing this Thursday or Friday to review the live interactive prototype for ${company_name}?

Best regards,

Enterprise Practice Director
Zenthra Systems Solutions
connect.zenthra@gmail.com | https://zenthra.systems`;

      const mailResult = await mailService.sendEmail({
        to: recipient_email,
        subject,
        html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #1e3a8a, #059669); padding: 18px 24px; border-radius: 6px; margin-bottom: 24px;">
            <h2 style="color: white; margin: 0; font-size: 18px; font-weight: 700;">ZENTHRA SYSTEMS — 1-CLICK PROPOSAL BRIEFING</h2>
            <p style="color: #a7f3d0; margin: 4px 0 0 0; font-size: 12px;">Executive Technology Delivery</p>
          </div>
          ${body.replace(/\n/g, '<br/>')}
          <div style="margin-top: 24px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 6px;">
            <p style="margin: 0; font-size: 13px; color: #15803d;">
              <strong>Target Enterprise:</strong> ${company_name} &bull; 
              <strong>Sprint:</strong> ${service_wedge || 'Custom Solution'} &bull; 
              <strong>Fixed Fee:</strong> $${(deal_value_usd || 9500).toLocaleString()} USD
            </p>
          </div>
        </div>`,
        text: body
      });

      const dbResult = db.markContactEmailSent(contact_id || `cnt_${Date.now()}`, {
        account_id: payload.account_id,
        recipient_email,
        recipient_name,
        company_name,
        subject,
        service_wedge: service_wedge || 'Enterprise Technology Sprint',
        deal_value_usd,
        provider: mailResult.provider || 'SMTP',
        message_id: mailResult.message_id,
        status: mailResult.status,
        raw_response: mailResult.raw
      });

      let n8nStatus = 'SKIPPED';
      try {
        const n8nClient = require('../workflows/n8n_client');
        const n8nRes = await n8nClient.triggerLeadWorkflow({
          account_id: payload.account_id || dbResult.deal_id,
          company_name: company_name || 'Enterprise',
          recipient_name,
          recipient_email,
          service_wedge: service_wedge || 'Enterprise Sprint',
          deal_value_usd,
          source: 'ONE_CLICK_MAIL_DISPATCH',
          mail_message_id: mailResult.message_id
        });
        n8nStatus = n8nRes.status || 'Workflow triggered';
      } catch (nErr) {
        n8nStatus = 'Simulated / Logged';
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        contact_id,
        recipient_email,
        email_delivery: mailResult,
        deal_id: dbResult.deal_id,
        n8n_status: n8nStatus
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 13. POST /api/batch-send-one-click-mail (1-Click Batch Send All Ready)
  if (req.method === 'POST' && req.url === '/api/batch-send-one-click-mail') {
    try {
      const payload = await parseJsonBody(req);
      let contactsToDispatch = [];
      if (payload.contact_ids && payload.contact_ids.length > 0) {
        const allContacts = db.listEmailReadyContacts({ limit: 1000 });
        contactsToDispatch = allContacts.filter(c => payload.contact_ids.includes(c.contact_id));
      } else {
        contactsToDispatch = db.listEmailReadyContacts({ status: 'READY', limit: 25 });
      }

      const dispatched = [];
      for (const c of contactsToDispatch) {
        try {
          const res = await mailService.sendEmail({
            to: c.email,
            subject: c.draft_subject || `Business Proposal for ${c.company_name}`,
            html: `<div style="font-family: sans-serif; line-height: 1.6; color: #1f2937; padding: 20px;">
              <h3 style="color: #2563eb;">Zenthra Systems — Business Proposal</h3>
              ${(c.draft_body || `Hi ${c.first_name}, proposal for ${c.company_name}.`).replace(/\n/g, '<br/>')}
            </div>`,
            text: c.draft_body || `Hi ${c.first_name}, proposal for ${c.company_name}.`
          });

          db.markContactEmailSent(c.contact_id, {
            account_id: c.account_id,
            recipient_email: c.email,
            recipient_name: c.name,
            company_name: c.company_name,
            subject: c.draft_subject || `Business Proposal for ${c.company_name}`,
            service_wedge: c.recommended_wedge,
            deal_value_usd: c.estimated_deal_value_usd,
            provider: res.provider || 'SMTP',
            message_id: res.message_id,
            status: res.status,
            raw_response: res.raw
          });

          dispatched.push({ contact_id: c.contact_id, email: c.email, message_id: res.message_id, status: 'DELIVERED' });
        } catch (e) {
          dispatched.push({ contact_id: c.contact_id, email: c.email, error: e.message, status: 'FAILED' });
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        sent_count: dispatched.filter(d => d.status === 'DELIVERED').length,
        count_attempted: contactsToDispatch.length,
        count_successful: dispatched.filter(d => d.status === 'DELIVERED').length,
        dispatched
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // 14. GET /api/extended-services (12 Enterprise Services Catalog)
  if (req.method === 'GET' && req.url === '/api/extended-services') {
    const services = [
      {
        num: 1,
        name: 'AI Development & Generative AI',
        category: 'Build',
        badge: 'Enterprise GenAI',
        wedge: 'Private Enterprise RAG Architecture Proof-of-Concept',
        timeline: '10 Business Days',
        basePriceUSD: 18500,
        retainerUSD: 6500,
        targetBuyer: 'CTO, Head of AI, VP of Engineering',
        pain: 'Proprietary PDF compliance documents and knowledge unsearchable; unauthorized staff pasting confidential data into public ChatGPT.',
        deliverables: [
          'Private VPC Vector Store Deployment (pgvector/Qdrant)',
          'Hybrid Document Parsing & Semantic Q&A with Citation Integrity',
          'Zero Data Retention Compliance Guardrails'
        ],
        roiMultiple: '12.4x ROI'
      },
      {
        num: 2,
        name: 'AI Agents & Business Automation',
        category: 'Automate',
        badge: 'Workflow Automation',
        wedge: '24/7 AI Customer Support & Instant Intake Agent',
        timeline: '5 Business Days',
        basePriceUSD: 9500,
        retainerUSD: 2800,
        targetBuyer: 'COO, VP of Operations, RevOps Director',
        pain: 'Operations staff wasting 20+ hours weekly manually re-keying data between CRM, email, and ERP with customer inquiry backlogs.',
        deliverables: [
          '24/7 Omnichannel Intake Agent (Web, Email, CRM)',
          'Automated Calendar Scheduling & Qualification Pipeline via n8n',
          'Executive Deal Alert Cockpit'
        ],
        roiMultiple: '14.8x ROI'
      },
      {
        num: 3,
        name: 'Modern Web Development & Conversion Portals',
        category: 'Build',
        badge: 'Web Systems',
        wedge: 'High-Converting Business Web Portal (7-Day Sprint)',
        timeline: '7 Business Days',
        basePriceUSD: 8500,
        retainerUSD: 1200,
        targetBuyer: 'CEO, CMO, VP of Digital, Owner',
        pain: 'Outdated legacy website or zero website listed on Google Maps, causing 70% of high-intent mobile searchers to bounce to competitors.',
        deliverables: [
          'Responsive Cloud-Native Portal (Next.js/Node with SSL)',
          'Instant Lead Capture & Webhook Quote Routing',
          'Local Business Schema & Core Web Vitals Optimization'
        ],
        roiMultiple: '18.2x ROI'
      },
      {
        num: 4,
        name: 'Data Analytics & Automated ETL Pipelines',
        category: 'Scale',
        badge: 'Data Engineering',
        wedge: 'Automated Multi-Source Data Ingestion Engine',
        timeline: '7 Business Days',
        basePriceUSD: 14500,
        retainerUSD: 4000,
        targetBuyer: 'VP Finance, Head of Data, Operations Director',
        pain: 'Disparate databases, broken CSV extracts, and conflicting departmental numbers preventing accurate financial planning.',
        deliverables: [
          'Scheduled Automated Ingestion from ERP, SQL, and APIs',
          'Centralized Star Schema Data Warehouse Modeling',
          'Data Integrity & Drift Anomaly Detection Alerts'
        ],
        roiMultiple: '10.5x ROI'
      },
      {
        num: 5,
        name: 'Microsoft Power BI Executive Dashboards',
        category: 'Scale',
        badge: 'Executive BI',
        wedge: '5-Day Executive Power BI KPI Sprint',
        timeline: '5 Business Days',
        basePriceUSD: 12500,
        retainerUSD: 3500,
        targetBuyer: 'CFO, Financial Controller, BI Director',
        pain: 'Finance team wasting 15+ hours every Monday morning manually stitching together 12 Excel workbooks with zero real-time margin visibility.',
        deliverables: [
          'Executive C-Suite KPI Cockpit (Gross Margin, EBITDA, Cashflow)',
          'Automated Power Query Refresh Engine directly to ERP',
          'DAX Calculations & Star Schema Architecture Documentation'
        ],
        roiMultiple: '26.1x ROI'
      },
      {
        num: 6,
        name: 'Business Analysis & Digital Transformation',
        category: 'Plan',
        badge: 'Strategic Specs',
        wedge: 'Operational Process Mapping & Gap Analysis Sprint',
        timeline: '5 Business Days',
        basePriceUSD: 6500,
        retainerUSD: 3500,
        targetBuyer: 'COO, CIO, Program Director',
        pain: 'Complex legacy software replacement projects failing or going 300% over budget due to lack of rigorous functional specifications.',
        deliverables: [
          'End-to-End Business Process Flow Diagrams (BPMN)',
          'Functional & Technical Requirements Specification (FSD/BRD)',
          'Vendor Evaluation & ROI Payback Financial Model'
        ],
        roiMultiple: '8.4x ROI'
      },
      {
        num: 7,
        name: 'Digital Product Engineering (Custom SaaS / MVP)',
        category: 'Build',
        badge: 'Product SaaS',
        wedge: 'Client-Funded Production MVP Sprint',
        timeline: '14 Business Days',
        basePriceUSD: 24500,
        retainerUSD: 8500,
        targetBuyer: 'Founder, Product Director, Managing Director',
        pain: 'Protracted 9-month development agency timelines; inability to get a working enterprise prototype into paying clients\' hands.',
        deliverables: [
          'Production-Ready Cloud Backend Architecture (PostgreSQL/Node/Docker)',
          'Multi-Tenant Role-Based Access Control (RBAC) & Auth',
          'Interactive Frontend Application & Stripe Billing Integration'
        ],
        roiMultiple: '15.0x ROI'
      },
      {
        num: 8,
        name: '24/7 AI Voice Receptionist & Phone Calling Agent',
        category: 'Automate',
        badge: 'Voice AI (New)',
        wedge: '3-Day AI Voice Receptionist Sprint',
        timeline: '3 Business Days',
        basePriceUSD: 8500,
        retainerUSD: 1800,
        targetBuyer: 'Managing Partner, Clinic Director, Practice Owner, General Manager',
        pain: 'High-value customer phone inquiries sent to voicemail after 5 PM and on weekends, causing 40%+ of callers to immediately hire competitors.',
        deliverables: [
          'Autonomous Inbound Phone Agent (Human-parity voice, <500ms latency)',
          'Live Calendar Booking & CRM Lead Dispatch During Call',
          'Instant Post-Call Caller SMS Confirmation & Staff Audio Briefing'
        ],
        roiMultiple: '19.4x ROI'
      },
      {
        num: 9,
        name: 'WhatsApp & SMS AI Conversational Sales Engine',
        category: 'Automate',
        badge: 'Omnichannel (New)',
        wedge: '5-Day WhatsApp & SMS Conversational Sales Sprint',
        timeline: '5 Business Days',
        basePriceUSD: 9500,
        retainerUSD: 2200,
        targetBuyer: 'Head of Sales, Chief Commercial Officer, E-Commerce Director',
        pain: 'International buyers inquiring via WhatsApp experience 6+ hour delays due to timezone lags, losing high-ticket transactions.',
        deliverables: [
          'Official Meta Cloud API WhatsApp Business Verified Bot (<15s response)',
          'Instant Catalog Lookup & Dynamic PDF Estimate Generator',
          '1-Click Payment Link Generation & Bi-Directional CRM Sync'
        ],
        roiMultiple: '22.0x ROI'
      },
      {
        num: 10,
        name: 'Google Maps Local 3-Pack & Review Velocity Domination',
        category: 'Scale',
        badge: 'Local SEO (New)',
        wedge: '14-Day Google Maps 3-Pack & Review Domination',
        timeline: '14 Business Days',
        basePriceUSD: 6500,
        retainerUSD: 1500,
        targetBuyer: 'Owner, Managing Partner, Practice Founder',
        pain: 'Business trapped on page 2 of Google Maps with stagnant review counts while competitor 3-pack captures 70% of local customers.',
        deliverables: [
          'Google Business Profile Geo-Relevance & Category Overhaul',
          'Automated Post-Service SMS 5-Star Review Acquisition Loop',
          'Local Geotagged Citation Sync Across 40+ Authoritative Directories'
        ],
        roiMultiple: '16.5x ROI'
      },
      {
        num: 11,
        name: 'Enterprise Cloud Security, Data Privacy & SOC2 Guardrails',
        category: 'Security',
        badge: 'Cybersecurity (New)',
        wedge: '7-Day Enterprise Cloud Security & Compliance Hardening',
        timeline: '7 Business Days',
        basePriceUSD: 16500,
        retainerUSD: 4500,
        targetBuyer: 'CISO, Head of Security, General Counsel, CTO',
        pain: 'Severe compliance liability from staff secretly pasting patient/client confidential data into public LLMs without SOC2/HIPAA isolation.',
        deliverables: [
          'Hardened Private Cloud Isolation with Zero Public Exposures',
          'Zero-Retention LLM Privacy Proxy with Automated PII Scrubbing',
          'SOC2 / HIPAA Technical Remediation & Audit Telemetry Matrix'
        ],
        roiMultiple: '11.8x ROI'
      },
      {
        num: 12,
        name: 'E-Commerce Headless Replatforming & AI Checkout CRO',
        category: 'Scale',
        badge: 'CRO Engine (New)',
        wedge: '7-Day Headless E-Commerce & Checkout CRO Sprint',
        timeline: '7 Business Days',
        basePriceUSD: 11500,
        retainerUSD: 2800,
        targetBuyer: 'E-Commerce Director, VP of Digital Commerce, CMO, Founder',
        pain: 'Over 70% of mobile shopping carts abandoned due to multi-step legacy checkout friction and slow product page load times.',
        deliverables: [
          'Frictionless 1-Click Checkout Overhaul (Apple Pay, Google Pay, Localized)',
          'AI Contextual Cart Upsell Engine (+18-28% Average Order Value lift)',
          'Sub-1s Mobile Core Web Vitals Edge Acceleration'
        ],
        roiMultiple: '24.5x ROI'
      }
    ];

    const normalizedServices = services.map(s => ({
      ...s,
      service_number: s.num,
      sprint_price_usd: s.basePriceUSD,
      monthly_retainer_usd: s.retainerUSD,
      sprint_timeline_days: parseInt((s.timeline || '5').replace(/[^0-9]/g, ''), 10) || 5,
      headline: s.wedge,
      key_deliverables: s.deliverables,
      target_buyer_personas: (s.targetBuyer || '').split(',').map(x => x.trim()),
      estimated_roi_pct: Math.round(parseFloat((s.roiMultiple || '12').replace(/[^0-9.]/g, '')) * 100) || 1200,
      is_extended: s.num > 7
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, count: normalizedServices.length, services: normalizedServices }));
    return;
  }

  // 404 Fallback
  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

if (require.main === module) {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[+] Zenthra Systems Platform live at:`);
    console.log(`    - Local:   http://localhost:${PORT}`);
    console.log(`    - Network: http://192.168.0.104:${PORT}`);
  });
}

module.exports = server;
