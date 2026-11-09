/**
 * Zenthra Systems - Database Seeder
 * Populates realistic, high-intent accounts across priority verticals.
 */

const {
  initDb,
  insertAccount,
  insertContact,
  insertDraft,
  insertDeal,
  logActivity
} = require('./db');

function seed() {
  console.log('[*] Initializing Zenthra Systems Database...');
  initDb();

  console.log('[*] Seeding Target Enterprise & Mid-Market Accounts...');

  const accounts = [
    {
      account_id: 'acc_us_apex_logistics',
      company_name: 'Apex Global Logistics Inc.',
      domain: 'apexlogistics-global.com',
      industry: 'Logistics & Supply Chain',
      headcount: 240,
      country: 'United States',
      estimated_revenue_usd: 48000000,
      detected_tech_stack: { erp: 'AS400 / NetSuite', reporting: 'Excel Workbooks', crm: 'Salesforce' },
      observed_signals: 'Active job opening for Senior Power BI Analyst open for 52 days; expanded to 3 regional distribution hubs; CFO hired 60 days ago.',
      signal_source_urls: ['https://linkedin.com/jobs/view/apex-bi-analyst', 'https://apexlogistics-global.com/news/hub-expansion'],
      primary_matched_service: 'Microsoft Power BI Development',
      recommended_wedge: '5-Day Executive KPI Sprint',
      lead_score: 95,
      lead_tier: 'Tier A',
      crm_status: 'OUTREACH_PENDING'
    },
    {
      account_id: 'acc_uk_meridian_fin',
      company_name: 'Meridian Capital Partners LLP',
      domain: 'meridiancap-uk.com',
      industry: 'Fintech & Wealth Management',
      headcount: 120,
      country: 'United Kingdom',
      estimated_revenue_usd: 35000000,
      detected_tech_stack: { portfolio: 'Iress', cloud: 'AWS', analytics: 'Fragmented CSVs' },
      observed_signals: 'Recent FCA compliance disclosure on automated portfolio valuation latency; COO quoted on reducing operational reporting debt.',
      signal_source_urls: ['https://meridiancap-uk.com/press/governance-2026'],
      primary_matched_service: 'Microsoft Power BI Development',
      recommended_wedge: 'Executive Portfolio Reporting Modernization',
      lead_score: 88,
      lead_tier: 'Tier A',
      crm_status: 'OUTREACH_PENDING'
    },
    {
      account_id: 'acc_uae_al_futtaim_ops',
      company_name: 'Al-Mansoor Trading & Distribution',
      domain: 'almansoor-trade.ae',
      industry: 'Logistics & Distribution',
      headcount: 380,
      country: 'United Arab Emirates',
      estimated_revenue_usd: 72000000,
      detected_tech_stack: { erp: 'SAP ECC 6.0', warehouse: 'Manhattan WMS' },
      observed_signals: 'Announced 100% digital transformation initiative for GCC warehouse fulfillment; manual customs clearance bottlenecks cited.',
      signal_source_urls: ['https://gulfbusiness.com/almansoor-digital-shift'],
      primary_matched_service: 'AI Agents & Business Automation',
      recommended_wedge: 'Workflow Bottleneck Audit',
      lead_score: 90,
      lead_tier: 'Tier A',
      crm_status: 'DISCOVERY_SCHEDULED'
    },
    {
      account_id: 'acc_us_strata_saas',
      company_name: 'Strata Cloud Solutions',
      domain: 'stratacloud-io.com',
      industry: 'SaaS & Enterprise Software',
      headcount: 85,
      country: 'United States',
      estimated_revenue_usd: 18000000,
      detected_tech_stack: { backend: 'Python / Go', cloud: 'AWS', database: 'PostgreSQL' },
      observed_signals: 'Customer support tickets surging 45% YoY; VP of Product seeking private enterprise RAG engine to index 15,000 internal API docs.',
      signal_source_urls: ['https://stratacloud-io.com/careers/ai-engineer'],
      primary_matched_service: 'AI Development & Generative AI',
      recommended_wedge: 'Private Enterprise RAG Proof-of-Concept',
      lead_score: 92,
      lead_tier: 'Tier A',
      crm_status: 'PROPOSAL_SUBMITTED'
    },
    {
      account_id: 'acc_de_nordic_health',
      company_name: 'Synapse Healthcare Systems GmbH',
      domain: 'synapse-health.de',
      industry: 'Healthcare Technology',
      headcount: 160,
      country: 'Germany',
      estimated_revenue_usd: 28000000,
      detected_tech_stack: { web: 'Legacy Java EE', database: 'Oracle' },
      observed_signals: 'Modernizing hospital client portal for EU MDR compliance; hiring full-stack web architects.',
      signal_source_urls: ['https://synapse-health.de/jobs/lead-architect'],
      primary_matched_service: 'Modern Web Development',
      recommended_wedge: 'Technical Architecture & Modernization Sprint',
      lead_score: 78,
      lead_tier: 'Tier B',
      crm_status: 'QUALIFIED'
    }
  ];

  for (const acc of accounts) {
    insertAccount(acc);
    logActivity('Agent 2: Lead Discovery', 'ACCOUNT_INGESTED', `Ingested ${acc.company_name} from signal mining`, acc.account_id);
    logActivity('Agent 5: Qualification', 'LEAD_SCORED', `Scored ${acc.lead_score}/100 (${acc.lead_tier})`, acc.account_id, { score: acc.lead_score, tier: acc.lead_tier });
  }

  console.log('[*] Seeding Verified Decision-Makers...');
  const contacts = [
    {
      contact_id: 'cnt_marcus_vance',
      account_id: 'acc_us_apex_logistics',
      first_name: 'Marcus',
      last_name: 'Vance',
      job_title: 'Chief Financial Officer',
      corporate_email: 'marcus.vance@apexlogistics-global.com',
      linkedin_url: 'https://linkedin.com/in/marcus-vance-cfo-demo',
      email_verification_status: 'VERIFIED_SMTP'
    },
    {
      contact_id: 'cnt_elena_rostova',
      account_id: 'acc_uk_meridian_fin',
      first_name: 'Elena',
      last_name: 'Rostova',
      job_title: 'Chief Operating Officer',
      corporate_email: 'e.rostova@meridiancap-uk.com',
      linkedin_url: 'https://linkedin.com/in/elena-rostova-coo-demo',
      email_verification_status: 'VERIFIED_SMTP'
    },
    {
      contact_id: 'cnt_tariq_hashim',
      account_id: 'acc_uae_al_futtaim_ops',
      first_name: 'Tariq',
      last_name: 'Al-Hashim',
      job_title: 'Director of Supply Chain & Operations',
      corporate_email: 'tariq.hashim@almansoor-trade.ae',
      linkedin_url: 'https://linkedin.com/in/tariq-hashim-ops-demo',
      email_verification_status: 'VERIFIED_SMTP'
    },
    {
      contact_id: 'cnt_derek_chen',
      account_id: 'acc_us_strata_saas',
      first_name: 'Derek',
      last_name: 'Chen',
      job_title: 'Chief Technology Officer',
      corporate_email: 'derek@stratacloud-io.com',
      linkedin_url: 'https://linkedin.com/in/derek-chen-cto-demo',
      email_verification_status: 'VERIFIED_SMTP'
    }
  ];

  for (const c of contacts) {
    insertContact(c);
    logActivity('Agent 2: Contact Discovery', 'CONTACT_DISCOVERED', `Identified decision-maker: ${c.first_name} ${c.last_name} (${c.job_title})`, c.account_id);
  }

  console.log('[*] Seeding Staged Outreach Drafts (Awaiting SDR Review)...');
  const drafts = [
    {
      draft_id: 'drf_apex_touch1',
      account_id: 'acc_us_apex_logistics',
      contact_id: 'cnt_marcus_vance',
      channel: 'EMAIL',
      touch_number: 1,
      subject_line: "Question regarding Apex Global Logistics's reporting latency",
      body_text: "Hi Marcus,\n\nI noticed Apex Global Logistics has been seeking a BI & Analytics specialist for over a month to support operational reporting.\n\nWhen freight networks scale across regional hubs, consolidating disparate dispatch and accounting metrics in Excel typically costs finance teams 12-15 hours each week.\n\nAt Zenthra Systems, we engineer automated Microsoft Power BI architectures. We recently helped a multi-hub logistics firm eliminate 14 weekly hours of spreadsheet assembly using our 5-Day Executive KPI Sprint.\n\nWould it make sense to review a 3-minute video teardown of how this dashboard connects directly to your dispatch ERP?\n\nBest regards,\nZenthra Systems Enterprise Sales\nhttps://zenthra-systems.example.com",
      status: 'AWAITING_APPROVAL'
    },
    {
      draft_id: 'drf_meridian_touch1',
      account_id: 'acc_uk_meridian_fin',
      contact_id: 'cnt_elena_rostova',
      channel: 'EMAIL',
      touch_number: 1,
      subject_line: "Eliminating portfolio reporting latency at Meridian Capital",
      body_text: "Hi Elena,\n\nIn reviewing Meridian Capital's recent disclosures regarding operational reporting, I noticed your team manages multi-asset valuations across disparate custodian feeds.\n\nFor wealth management firms operating in the UK, manual Excel data consolidation introduces both valuation latency and audit friction.\n\nAt Zenthra Systems, we specialize in high-security Microsoft Power BI architectures for financial services. We recently built an automated portfolio reporting suite that refreshes partner dashboards daily at 06:00 AM.\n\nAre you open to seeing our 4-page technical implementation blueprint?\n\nBest regards,\nZenthra Systems Financial Analytics Practice",
      status: 'AWAITING_APPROVAL'
    }
  ];

  for (const d of drafts) {
    insertDraft(d);
    logActivity('Agent 6: Outreach Personalizer', 'DRAFT_GENERATED', `Generated Touch ${d.touch_number} ${d.channel} for ${d.subject_line}`, d.account_id);
  }

  console.log('[*] Seeding Active Pipeline Deals...');
  const deals = [
    {
      deal_id: 'deal_strata_rag',
      account_id: 'acc_us_strata_saas',
      deal_name: 'Strata Cloud - Enterprise Knowledge Copilot (RAG)',
      service_line: 'AI Development & Generative AI',
      package_tier: 'STANDARD',
      deal_stage: 'Proposal Submitted',
      deal_value_usd: 55000,
      win_probability: 0.60,
      expected_close_date: '2026-11-30'
    },
    {
      deal_id: 'deal_almansoor_automation',
      account_id: 'acc_uae_al_futtaim_ops',
      deal_name: 'Al-Mansoor - GCC Logistics Intake Automation',
      service_line: 'AI Agents & Business Automation',
      package_tier: 'STANDARD',
      deal_stage: 'Discovery Meeting Booked',
      deal_value_usd: 38000,
      win_probability: 0.35,
      expected_close_date: '2026-12-15'
    },
    {
      deal_id: 'deal_apex_kpi_sprint',
      account_id: 'acc_us_apex_logistics',
      deal_name: 'Apex Global Logistics - 5-Day Executive KPI Sprint',
      service_line: 'Microsoft Power BI Development',
      package_tier: 'SPRINT',
      deal_stage: 'Technical Scope Confirmed',
      deal_value_usd: 12500,
      win_probability: 0.50,
      expected_close_date: '2026-11-20'
    }
  ];

  for (const dl of deals) {
    insertDeal(dl);
    logActivity('Agent 11: CRM Synchronizer', 'DEAL_UPDATED', `Stage: ${dl.deal_stage} | Value: $${dl.deal_value_usd}`, dl.account_id);
  }

  console.log('[+] Seeding complete! Database is ready at data/zenthra.db');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
