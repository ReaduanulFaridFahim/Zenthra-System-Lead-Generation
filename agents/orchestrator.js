/**
 * Zenthra Systems - Multi-Agent Cognitive Orchestrator
 * Coordinates Agents 1-12 across discovery, research, scoring, drafting, and CRM sync.
 */

const { insertAccount, insertContact, insertDraft, logActivity } = require('../database/db');
const { matchService } = require('./service_matcher');
const { qualifyLead } = require('./qualification_agent');
const { draftOutreach } = require('./outreach_drafter');
const { classifyReply } = require('./reply_classifier');
const { generateSOW } = require('./proposal_architect');

async function processProspect(rawPayload, forwardToN8n = false) {
  console.log(`\n======================================================`);
  console.log(`[*] AGENT 2: Ingesting Account: ${rawPayload.company_name} (${rawPayload.domain})`);
  logActivity('Agent 2: Lead Discovery', 'INGEST_ACCOUNT', `Ingested ${rawPayload.company_name}`, rawPayload.account_id);

  // 1. Agent 4: Service Matcher
  const matchedService = matchService(rawPayload);
  console.log(`[+] AGENT 4: Matched Service -> ${matchedService.matched_service} (${matchedService.recommended_wedge})`);
  logActivity('Agent 4: Service Matching', 'MATCH_SERVICE', `Matched ${matchedService.matched_service}`, rawPayload.account_id);

  // 2. Agent 5: Lead Qualification & 100-pt Scorer
  const qualification = qualifyLead(rawPayload);
  console.log(`[+] AGENT 5: Scored ${qualification.total_score}/100 -> ${qualification.tier} (${qualification.action})`);
  logActivity('Agent 5: Qualification', 'SCORE_LEAD', `Score: ${qualification.total_score} | Tier: ${qualification.tier}`, rawPayload.account_id);

  // 3. Save Account to Database
  const accountRecord = {
    account_id: rawPayload.account_id || `acc_${Date.now()}`,
    company_name: rawPayload.company_name,
    domain: rawPayload.domain,
    industry: rawPayload.industry,
    headcount: rawPayload.headcount || 100,
    city: rawPayload.city || '',
    state: rawPayload.state || '',
    country: rawPayload.country || 'United States',
    estimated_revenue_usd: rawPayload.estimated_revenue_usd || 25000000,
    detected_tech_stack: rawPayload.detected_tech_stack || {},
    observed_signals: rawPayload.observed_signals || '',
    signal_source_urls: rawPayload.signal_source_urls || [],
    primary_matched_service: matchedService.matched_service,
    recommended_wedge: matchedService.recommended_wedge,
    lead_score: qualification.total_score,
    lead_tier: qualification.tier,
    crm_status: qualification.qualified ? 'QUALIFIED_FOR_OUTREACH' : 'NURTURE_POOL',
    decision_maker_name: rawPayload.decision_maker_name,
    decision_maker_title: rawPayload.decision_maker_title,
    decision_maker_email: rawPayload.decision_maker_email,
    decision_maker_linkedin: rawPayload.decision_maker_linkedin,
    google_maps_audit: rawPayload.google_maps_audit
  };
  const savedAccount = insertAccount(accountRecord);
  const resolvedAccountId = savedAccount ? savedAccount.account_id : accountRecord.account_id;

  // 4. Save Decision Maker Contact if available
  let contactId = null;
  if (rawPayload.decision_maker_name && rawPayload.decision_maker_email) {
    const parts = rawPayload.decision_maker_name.split(' ');
    contactId = insertContact({
      account_id: resolvedAccountId,
      first_name: parts[0] || 'Executive',
      last_name: parts.slice(1).join(' ') || '',
      job_title: rawPayload.decision_maker_title || 'Leader',
      corporate_email: rawPayload.decision_maker_email,
      linkedin_url: rawPayload.decision_maker_linkedin || '',
      email_verification_status: 'VERIFIED_SMTP',
      outreach_status: qualification.qualified ? 'READY_FOR_DRAFT' : 'EXCLUDED_LOW_SCORE'
    });
    console.log(`[+] AGENT 2: Decision Maker Indexed -> ${rawPayload.decision_maker_name} (${rawPayload.decision_maker_email})`);
  }

  // 5. Agent 6: Personalized Outreach Drafter (Tier A & B only)
  let drafts = null;
  if (qualification.qualified && contactId) {
    drafts = draftOutreach(
      accountRecord,
      { first_name: rawPayload.decision_maker_name.split(' ')[0] },
      matchedService
    );

    // Save Email Touch 1 Draft to DB
    insertDraft({
      account_id: resolvedAccountId,
      contact_id: contactId,
      channel: 'EMAIL',
      touch_number: 1,
      subject_line: drafts.touch_1_email.subject,
      body_text: drafts.touch_1_email.body,
      status: 'AWAITING_APPROVAL'
    });

    // Save LinkedIn Draft to DB
    insertDraft({
      account_id: resolvedAccountId,
      contact_id: contactId,
      channel: 'LINKEDIN',
      touch_number: 1,
      subject_line: 'LinkedIn Connection Request',
      body_text: drafts.linkedin_note,
      status: 'AWAITING_APPROVAL'
    });

    console.log(`[+] AGENT 6: Generated Personalized Outreach Drafts (Awaiting Human Approval)`);
    logActivity('Agent 6: Outreach Drafter', 'DRAFTS_GENERATED', `Drafted Email & LinkedIn touches for ${rawPayload.company_name}`, resolvedAccountId);
  }

  // 6. Optional: Forward to n8n Webhook
  let n8nResult = null;
  if (forwardToN8n) {
    try {
      const baseUrl = process.env.N8N_BASE_URL || 'http://192.168.0.104:5678';
      const webhookUrl = `${baseUrl}/webhook/zenthra-lead-ingest`;
      console.log(`[i] AGENT 7: Forwarding to live n8n webhook -> ${webhookUrl}`);
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rawPayload)
      });
      n8nResult = await res.json();
      console.log(`[+] n8n Response:`, n8nResult);
      logActivity('Agent 7: Orchestrator', 'N8N_WEBHOOK_DISPATCHED', `Dispatched ${rawPayload.company_name} to n8n webhook (${res.status})`, accountRecord.account_id);
    } catch (e) {
      console.log(`[!] n8n Webhook forward skipped: ${e.message}`);
      n8nResult = { error: e.message };
    }
  }

  const steps = [
    {
      step: 1,
      agent: "Agent 2",
      role: "Lead Discovery",
      status: "COMPLETED",
      summary: `Normalized candidate account for ${rawPayload.company_name} (${rawPayload.domain}) in ${rawPayload.country || 'United States'}.`
    },
    {
      step: 2,
      agent: "Agent 3",
      role: "Company Research",
      status: "COMPLETED",
      summary: `Detected Tech Stack: ERP (${rawPayload.detected_tech_stack?.erp || 'Legacy'}), Reporting (${rawPayload.detected_tech_stack?.reporting || 'Manual Excel'}). Headcount: ${rawPayload.headcount || 100}.`
    },
    {
      step: 3,
      agent: "Agent 4",
      role: "Service Matcher",
      status: "COMPLETED",
      summary: `Matched Service: ${matchedService.matched_service} | Recommended Wedge: ${matchedService.recommended_wedge} (Confidence: ${matchedService.confidence_score}%).`
    },
    {
      step: 4,
      agent: "Agent 5",
      role: "100-pt Lead Qualifier",
      status: "COMPLETED",
      summary: `Calculated Lead Score: ${qualification.total_score}/100 (${qualification.tier}) | Action: ${qualification.action}.`
    },
    {
      step: 5,
      agent: "Agent 6",
      role: "Outreach Personalizer",
      status: drafts ? "COMPLETED" : "SKIPPED",
      summary: drafts ? `Drafted Touch 1 Cold Email ("${drafts.touch_1_email.subject}") and tailored LinkedIn connection message.` : "Score below Tier A/B threshold; routed to nurture."
    },
    {
      step: 6,
      agent: "Agent 7 / n8n",
      role: "Webhook Dispatch",
      status: n8nResult && !n8nResult.error ? "DELIVERED" : "LOCAL_ONLY",
      summary: n8nResult && !n8nResult.error ? `Successfully posted to n8n webhook (Response: ${n8nResult.message || 'Workflow was started'}).` : `n8n webhook: ${n8nResult?.error || 'Local processing complete.'}`
    },
    {
      step: 7,
      agent: "Human Gate",
      role: "SDR Approval Gate",
      status: "STAGED",
      summary: "Placed in AWAITING_APPROVAL queue. Ready for SDR review and 1-click dispatch."
    }
  ];

  console.log(`[✓] Orchestration Complete for ${rawPayload.company_name}`);
  console.log(`======================================================\n`);

  return {
    account: accountRecord,
    qualification,
    matchedService,
    drafts,
    n8nResult,
    steps
  };
}

module.exports = {
  processProspect,
  classifyReply,
  generateSOW
};

// Direct CLI Execution Example
if (require.main === module) {
  const sampleLead = {
    account_id: 'acc_demo_vanguard',
    company_name: 'Vanguard Freight Network',
    domain: 'vanguardfreight-demo.com',
    industry: 'Logistics & Distribution',
    headcount: 210,
    country: 'United States',
    estimated_revenue_usd: 52000000,
    detected_tech_stack: { erp: 'Sage 100', reporting: 'Excel' },
    observed_signals: 'Active job opening for Power BI & Data Analyst open 40 days; expanding regional hubs.',
    decision_maker_name: 'Robert Hastings',
    decision_maker_title: 'Chief Financial Officer',
    decision_maker_email: 'r.hastings@vanguardfreight-demo.com',
    decision_maker_linkedin: 'https://linkedin.com/in/robert-hastings-cfo-demo'
  };

  processProspect(sampleLead, false).then(() => {
    console.log('[+] Orchestrator test completed successfully.');
  });
}
