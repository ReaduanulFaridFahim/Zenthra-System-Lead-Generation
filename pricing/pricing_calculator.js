/**
 * Zenthra Systems - Commercial Pricing Calculator & Quotation Engine
 * Calculates project investment, delivery margins, and generates customer proposals.
 */

const fs = require('fs');
const path = require('path');

const RATES = {
  SENIOR_ARCHITECT_USD_HR: 175,
  SENIOR_ENGINEER_USD_HR: 135,
  DATA_BI_ENGINEER_USD_HR: 125,
  QA_OPS_ENGINEER_USD_HR: 95
};

const PACKAGES = {
  POWER_BI_SPRINT: {
    name: '5-Day Executive Power BI KPI Sprint',
    service: 'Microsoft Power BI Development',
    tier: 'ENTRY_SPRINT',
    basePriceUSD: 12500,
    estimatedHours: {
      architect: 16,
      biEngineer: 48,
      qa: 16
    },
    deliverables: [
      { title: 'Executive Overview Dashboard', description: 'Real-time KPI view for C-suite (Gross margin, EBITDA, route performance).' },
      { title: 'Operational Drilldown Dashboard', description: 'Departmental transactional reporting with interactive filtering.' },
      { title: 'Automated Power Query ETL Pipeline', description: 'Direct connector to primary ERP/CRM with scheduled automated refresh.' },
      { title: 'Semantic Data Model & DAX Documentation', description: 'Star schema architecture with documented calculation rules.' }
    ],
    recommendedRetainer: {
      name: 'Power BI Performance & Maintenance Retainer',
      monthlyUSD: 3500,
      hoursPerMonth: 20
    }
  },

  AI_AUTOMATION_AUDIT: {
    name: 'Workflow Bottleneck Audit & Prototype',
    service: 'AI Agents & Business Automation',
    tier: 'ENTRY_SPRINT',
    basePriceUSD: 9500,
    estimatedHours: {
      architect: 14,
      engineer: 36,
      qa: 14
    },
    deliverables: [
      { title: 'Operational Process Mapping', description: 'End-to-end audit identifying exact hours lost to manual re-keying.' },
      { title: 'Working n8n / Python Automation Prototype', description: 'Functional document extraction and ERP routing pipeline in sandbox.' },
      { title: 'ROI Payback Financial Model', description: 'Quantified business case proving cost-per-transaction reduction.' }
    ],
    recommendedRetainer: {
      name: 'Automation Agent SLA & Monitoring Retainer',
      monthlyUSD: 4500,
      hoursPerMonth: 25
    }
  },

  AI_RAG_PROTOTYPE: {
    name: 'Private Enterprise RAG Architecture Proof-of-Concept',
    service: 'AI Development & Generative AI',
    tier: 'ENTRY_SPRINT',
    basePriceUSD: 18500,
    estimatedHours: {
      architect: 24,
      engineer: 60,
      qa: 20
    },
    deliverables: [
      { title: 'Private VPC Vector Store Deployment', description: 'Sandboxed Qdrant / pgvector database inside client cloud tenant.' },
      { title: 'Hybrid Search & Document Parsing Pipeline', description: 'Ingestion of up to 1,000 corporate PDFs, SOPs, and wikis.' },
      { title: 'Accuracy & Citation Benchmark Report', description: 'Evaluation matrix demonstrating zero data leakage and verifiable citations.' }
    ],
    recommendedRetainer: {
      name: 'Enterprise AI Infrastructure Retainer',
      monthlyUSD: 6500,
      hoursPerMonth: 30
    }
  },

  AI_VOICE_AGENT: {
    name: '3-Day 24/7 AI Voice Receptionist Sprint',
    service: 'Service 8: 24/7 AI Voice Receptionist & Phone Calling Agent',
    tier: 'ENTRY_SPRINT',
    basePriceUSD: 8500,
    estimatedHours: {
      architect: 12,
      engineer: 32,
      qa: 12
    },
    deliverables: [
      { title: 'Autonomous Inbound Phone Agent', description: 'Human-parity voice AI answering customer phone calls with sub-500ms latency.' },
      { title: 'Direct Calendar & CRM Dispatch', description: 'Live schedule booking, caller qualification, and CRM entry during call.' },
      { title: 'Instant Post-Call SMS & Transcription', description: 'Automatic SMS confirmation to caller and email audio briefing to staff.' }
    ],
    recommendedRetainer: {
      name: 'Voice Agent SIP & Telephony Retainer',
      monthlyUSD: 1800,
      hoursPerMonth: 15
    }
  },

  WHATSAPP_SMS_BOT: {
    name: '5-Day WhatsApp & SMS AI Conversational Sales Sprint',
    service: 'Service 9: WhatsApp & SMS AI Conversational Sales Engine',
    tier: 'ENTRY_SPRINT',
    basePriceUSD: 9500,
    estimatedHours: {
      architect: 14,
      engineer: 36,
      qa: 14
    },
    deliverables: [
      { title: 'Meta Cloud API WhatsApp Business Agent', description: 'Official verified green-badge conversational sales agent responding in <15s.' },
      { title: 'Catalog Ingestion & Instant Quote Engine', description: 'Dynamic pricing lookup, quotation generator, and PDF estimate delivery in chat.' },
      { title: 'Payment Link & Live CRM Synchronization', description: 'Stripe/payment gateway integration and bi-directional HubSpot/Salesforce sync.' }
    ],
    recommendedRetainer: {
      name: 'WhatsApp Commerce & Flow Maintenance Retainer',
      monthlyUSD: 2200,
      hoursPerMonth: 18
    }
  },

  LOCAL_MAPS_SEO: {
    name: '14-Day Google Maps 3-Pack & Review Velocity Domination',
    service: 'Service 10: Google Maps Local 3-Pack & Review Velocity Domination',
    tier: 'GROWTH_SPRINT',
    basePriceUSD: 6500,
    estimatedHours: {
      architect: 8,
      engineer: 28,
      qa: 10
    },
    deliverables: [
      { title: 'Google Business Profile Audit & Geo-Relevance', description: 'Primary/secondary category recalibration and geotagged local service area mapping.' },
      { title: 'Automated 5-Star SMS Review Acquisition Loop', description: 'Post-service customer SMS trigger generating consistent verified 5-star reviews.' },
      { title: 'Local Citation Network & Schema.org LocalSEO', description: 'Structured local business schema sync across 40+ global citation directories.' }
    ],
    recommendedRetainer: {
      name: 'Local Search Dominance & Review Guard Retainer',
      monthlyUSD: 1500,
      hoursPerMonth: 12
    }
  },

  CLOUD_SECURITY_SOC2: {
    name: '7-Day Enterprise Cloud Security & Compliance Hardening',
    service: 'Service 11: Enterprise Cloud Security, Data Privacy & SOC2 Guardrails',
    tier: 'ENTERPRISE_AUDIT',
    basePriceUSD: 16500,
    estimatedHours: {
      architect: 24,
      engineer: 48,
      qa: 18
    },
    deliverables: [
      { title: 'Private Cloud Isolation & VPC Audit', description: 'Hardened VPC architecture with zero public bucket or database exposures.' },
      { title: 'Zero-Retention LLM Privacy Firewall', description: 'PII scrubbing proxy ensuring proprietary company data never trains third-party models.' },
      { title: 'SOC2 / HIPAA Technical Readiness Matrix', description: 'Full remediation roadmap, IAM least-privilege enforcement, and audit logs.' }
    ],
    recommendedRetainer: {
      name: 'Cloud Security & Compliance Monitoring SLA',
      monthlyUSD: 4500,
      hoursPerMonth: 25
    }
  },

  ECOMMERCE_CRO: {
    name: '7-Day Headless E-Commerce & Checkout CRO Sprint',
    service: 'Service 12: E-Commerce Headless Replatforming & AI Checkout CRO',
    tier: 'GROWTH_SPRINT',
    basePriceUSD: 11500,
    estimatedHours: {
      architect: 16,
      engineer: 42,
      qa: 16
    },
    deliverables: [
      { title: 'Frictionless 1-Click Checkout Overhaul', description: 'Eliminates multi-step form drop-offs with Apple Pay, Google Pay, and localized gateways.' },
      { title: 'AI Personalized Cart Upsell Engine', description: 'Real-time contextual recommendation widget lifting Average Order Value by 18-28%.' },
      { title: 'Sub-1s Mobile Core Web Vitals Optimization', description: 'Edge-cached product catalog delivering instant page transitions.' }
    ],
    recommendedRetainer: {
      name: 'E-Commerce Growth & Conversion Retainer',
      monthlyUSD: 2800,
      hoursPerMonth: 20
    }
  }
};

function calculateQuote(packageKey, customAdjustments = {}) {
  const pkg = PACKAGES[packageKey];
  if (!pkg) {
    throw new Error(`Package ${packageKey} not found in catalog.`);
  }

  const hours = { ...pkg.estimatedHours, ...(customAdjustments.hours || {}) };
  const internalCost =
    (hours.architect || 0) * 65 +
    ((hours.engineer || 0) + (hours.biEngineer || 0)) * 50 +
    (hours.qa || 0) * 35;

  const priceUSD = customAdjustments.customPrice || pkg.basePriceUSD;
  const grossMarginUSD = priceUSD - internalCost;
  const grossMarginPercentage = priceUSD > 0 ? (grossMarginUSD / priceUSD) * 100 : 0;

  return {
    package: pkg.name,
    service: pkg.service,
    tier: pkg.tier,
    priceUSD,
    internalCostUSD: Math.round(internalCost),
    grossMarginUSD: Math.round(grossMarginUSD),
    grossMarginPercentage: Math.round(grossMarginPercentage * 10) / 10,
    deliverables: pkg.deliverables,
    recommendedRetainer: pkg.recommendedRetainer
  };
}

/**
 * MODEL 1: Value-Anchored Fixed Sprint Engine
 * 
 * Instead of charging hourly or commoditized dev rates, Model 1 calculates:
 * 1. Audited Monthly Revenue Loss / Waste from specific business weaknesses.
 * 2. Value-Anchored Fixed Sprint Investment calibrated to a 25-35 day payback period.
 * 3. 1-Year Projected Net ROI (typically 800% - 1,200%).
 * 4. Generates an executive Statement of Work (SOW) and Value-Anchored Proposal.
 */
function calculateValueAnchoredSprint(input = {}) {
  const companyName = input.companyName || input.company_name || 'Enterprise Prospect';
  const city = input.city || 'Metro Area';
  const industry = input.industry || 'B2B Services';
  const weaknessCategory = input.weaknessCategory || input.weakness_category || 'INTAKE_AUTOMATION';
  const decisionMaker = input.decisionMaker || input.decision_maker_name || 'Managing Director';
  const email = input.email || input.recipient_email || 'connect.zenthra@gmail.com';

  // Determine monthly revenue loss based on audited weakness
  let monthlyLossUSD = input.monthlyLossUSD || input.estimatedMonthlyLossUSD;
  if (!monthlyLossUSD) {
    switch (weaknessCategory) {
      case 'WEB_PRESENCE':
        monthlyLossUSD = 8500; // Lost mobile searchers bouncing to competitors
        break;
      case 'CUSTOMER_COMMUNICATION':
      case 'RESPONSE_LATENCY':
        monthlyLossUSD = 7000; // Lost inquiries from phone tag & delayed callbacks
        break;
      case 'INTAKE_AUTOMATION':
        monthlyLossUSD = 6500; // After-hours inquiry leakage
        break;
      case 'BUSINESS_INTELLIGENCE':
        monthlyLossUSD = 9000; // Finance & ops hours wasted on manual Excel reconciliation
        break;
      case 'RAG_KNOWLEDGE':
        monthlyLossUSD = 12000; // Manual document search & compliance risk
        break;
      case 'AI_VOICE_AGENT':
      case 'VOICE_PHONE':
        monthlyLossUSD = 8000; // Lost phone calls & unbooked phone consultations
        break;
      case 'WHATSAPP_SMS_BOT':
      case 'WHATSAPP_CONVERSATIONAL':
        monthlyLossUSD = 7500; // Delayed WhatsApp response & missed international buyers
        break;
      case 'LOCAL_MAPS_SEO':
      case 'LOCAL_SEO':
        monthlyLossUSD = 6000; // Trapped below competitor local 3-pack & review drag
        break;
      case 'CLOUD_SECURITY_SOC2':
      case 'SECURITY_PRIVACY':
        monthlyLossUSD = 15000; // Compliance breach risk & proprietary data leaks
        break;
      case 'ECOMMERCE_CRO':
      case 'CHECKOUT_CRO':
        monthlyLossUSD = 11000; // Cart abandonment & checkout drop-offs
        break;
      default:
        monthlyLossUSD = 6000;
    }
  }

  // Value-Anchored Fixed Sprint Investment:
  // Target: 25 - 35 days payback.
  // Formula: Fixed Price = roundTo(monthlyLossUSD * 1.12, 500)
  // Floor at $4,500, Ceiling for sprint at $25,000
  let sprintPriceUSD = input.customPriceUSD || Math.max(4500, Math.min(25000, Math.round((monthlyLossUSD * 1.12) / 500) * 500));
  
  const safeMonthlyLoss = Math.max(1000, monthlyLossUSD || 6000);
  const annualLossUSD = safeMonthlyLoss * 12;
  const paybackDays = Math.max(14, Math.round((sprintPriceUSD / safeMonthlyLoss) * 30));
  const annualRecoveredUSD = annualLossUSD - sprintPriceUSD;
  const firstYearROIPct = sprintPriceUSD > 0 ? Math.round((annualRecoveredUSD / sprintPriceUSD) * 100) : 0;

  // Delivery timelines and deliverables
  let sprintTitle = '';
  let sprintDurationDays = 5;
  let serviceCategory = '';
  let deliverables = [];
  let retainerMonthlyUSD = 2500;

  if (weaknessCategory === 'WEB_PRESENCE' || weaknessCategory === 'WEB_PERFORMANCE') {
    sprintTitle = '7-Day High-Converting Business Web Portal Sprint';
    sprintDurationDays = 7;
    serviceCategory = 'Modern Web Development & Conversion Architecture';
    deliverables = [
      { title: 'Responsive Cloud-Native Portal', description: 'Next.js/Node high-performance portal with SSL and mobile optimization.' },
      { title: 'Instant Lead Capture & Quote Flow', description: 'Direct webhook integration capturing name, requirements, and auto-notifying leadership.' },
      { title: 'Local SEO & Google Business Profile Sync', description: 'Schema.org rich snippets and Google Maps verified landing connection.' }
    ];
    retainerMonthlyUSD = 1200;
  } else if (weaknessCategory === 'BUSINESS_INTELLIGENCE') {
    sprintTitle = '5-Day Executive Power BI KPI Sprint';
    sprintDurationDays = 5;
    serviceCategory = 'Microsoft Power BI & Enterprise Analytics';
    deliverables = [
      { title: 'Executive Overview Dashboard', description: 'Live C-suite KPI cockpit replacing fragmented manual spreadsheets.' },
      { title: 'Automated Power Query ETL Pipeline', description: 'Scheduled automatic refresh connecting ERP, CRM, and accounting data.' },
      { title: 'Star Schema Architecture & DAX Measures', description: 'Standardized data model with certified calculation business logic.' }
    ];
    retainerMonthlyUSD = 3500;
  } else if (weaknessCategory === 'RAG_KNOWLEDGE') {
    sprintTitle = '10-Day Private Enterprise RAG Architecture Proof-of-Concept';
    sprintDurationDays = 10;
    serviceCategory = 'Enterprise GenAI & Knowledge Retrieval';
    deliverables = [
      { title: 'Private VPC Vector Store Deployment', description: 'Sandboxed Qdrant/pgvector instance inside isolated tenant.' },
      { title: 'Document Ingestion & Chunking Pipeline', description: 'Automated indexing of corporate contracts, SOPs, and manuals with citations.' },
      { title: 'Zero-Retention Guardrails & Evaluation Matrix', description: 'Enterprise privacy configuration ensuring no data leaks to public LLMs.' }
    ];
    retainerMonthlyUSD = 5500;
  } else if (weaknessCategory === 'AI_VOICE_AGENT' || weaknessCategory === 'VOICE_PHONE') {
    sprintTitle = '3-Day 24/7 AI Voice Receptionist Sprint';
    sprintDurationDays = 3;
    serviceCategory = '24/7 AI Voice Receptionist & Phone Calling Agent';
    deliverables = [
      { title: 'Autonomous Inbound Phone Agent', description: 'Human-parity voice AI answering customer phone calls with sub-500ms latency.' },
      { title: 'Direct Calendar & CRM Dispatch', description: 'Live schedule booking, caller qualification, and CRM entry during call.' },
      { title: 'Instant Post-Call SMS & Transcription', description: 'Automatic SMS confirmation to caller and email audio briefing to staff.' }
    ];
    retainerMonthlyUSD = 1800;
  } else if (weaknessCategory === 'WHATSAPP_SMS_BOT' || weaknessCategory === 'WHATSAPP_CONVERSATIONAL') {
    sprintTitle = '5-Day WhatsApp & SMS AI Conversational Sales Sprint';
    sprintDurationDays = 5;
    serviceCategory = 'WhatsApp & SMS AI Conversational Sales Engine';
    deliverables = [
      { title: 'Meta Cloud API WhatsApp Business Agent', description: 'Official verified green-badge conversational sales agent responding in <15s.' },
      { title: 'Catalog Ingestion & Instant Quote Engine', description: 'Dynamic pricing lookup, quotation generator, and PDF estimate delivery in chat.' },
      { title: 'Payment Link & Live CRM Synchronization', description: 'Stripe/payment gateway integration and bi-directional HubSpot/Salesforce sync.' }
    ];
    retainerMonthlyUSD = 2200;
  } else if (weaknessCategory === 'LOCAL_MAPS_SEO' || weaknessCategory === 'LOCAL_SEO') {
    sprintTitle = '14-Day Google Maps 3-Pack & Review Velocity Domination';
    sprintDurationDays = 14;
    serviceCategory = 'Google Maps Local 3-Pack & Review Velocity Domination';
    deliverables = [
      { title: 'Google Business Profile Audit & Geo-Relevance', description: 'Primary/secondary category recalibration and geotagged local service area mapping.' },
      { title: 'Automated 5-Star SMS Review Acquisition Loop', description: 'Post-service customer SMS trigger generating consistent verified 5-star reviews.' },
      { title: 'Local Citation Network & Schema.org LocalSEO', description: 'Structured local business schema sync across 40+ global citation directories.' }
    ];
    retainerMonthlyUSD = 1500;
  } else if (weaknessCategory === 'CLOUD_SECURITY_SOC2' || weaknessCategory === 'SECURITY_PRIVACY') {
    sprintTitle = '7-Day Enterprise Cloud Security & Compliance Hardening';
    sprintDurationDays = 7;
    serviceCategory = 'Enterprise Cloud Security, Data Privacy & SOC2 Guardrails';
    deliverables = [
      { title: 'Private Cloud Isolation & VPC Audit', description: 'Hardened VPC architecture with zero public bucket or database exposures.' },
      { title: 'Zero-Retention LLM Privacy Firewall', description: 'PII scrubbing proxy ensuring proprietary company data never trains third-party models.' },
      { title: 'SOC2 / HIPAA Technical Readiness Matrix', description: 'Full remediation roadmap, IAM least-privilege enforcement, and audit logs.' }
    ];
    retainerMonthlyUSD = 4500;
  } else if (weaknessCategory === 'ECOMMERCE_CRO' || weaknessCategory === 'CHECKOUT_CRO') {
    sprintTitle = '7-Day Headless E-Commerce & Checkout CRO Sprint';
    sprintDurationDays = 7;
    serviceCategory = 'E-Commerce Headless Replatforming & AI Checkout CRO';
    deliverables = [
      { title: 'Frictionless 1-Click Checkout Overhaul', description: 'Eliminates multi-step form drop-offs with Apple Pay, Google Pay, and localized gateways.' },
      { title: 'AI Personalized Cart Upsell Engine', description: 'Real-time contextual recommendation widget lifting Average Order Value by 18-28%.' },
      { title: 'Sub-1s Mobile Core Web Vitals Optimization', description: 'Edge-cached product catalog delivering instant page transitions.' }
    ];
    retainerMonthlyUSD = 2800;
  } else {
    // Default: AI Agents & Automation
    sprintTitle = '5-Day 24/7 AI Customer Intake & Workflow Automation Sprint';
    sprintDurationDays = 5;
    serviceCategory = 'AI Agents & Business Process Automation';
    deliverables = [
      { title: '24/7 Omnichannel Intake Agent', description: 'Instant response bot handling web, email, and WhatsApp lead inquiries.' },
      { title: 'Automated CRM / Calendar Booking Pipeline', description: 'Zero-touch appointment scheduling and qualification routing via n8n.' },
      { title: 'Executive Operations Cockpit', description: 'Real-time alert engine notifying directors of high-value deal opportunities.' }
    ];
    retainerMonthlyUSD = 2800;
  }

  // Estimated internal delivery cost & margins (assuming agile team)
  const deliveryHours = sprintDurationDays === 5 ? 40 : (sprintDurationDays === 7 ? 56 : 72);
  const internalCostUSD = Math.round(deliveryHours * 48); // blended internal engineering cost
  const grossMarginUSD = sprintPriceUSD - internalCostUSD;
  const grossMarginPct = sprintPriceUSD > 0 ? Math.round((grossMarginUSD / sprintPriceUSD) * 100) : 0;

  // Generate Model 1 SOW
  const sowText = `
# STATEMENT OF WORK (SOW) — VALUE-ANCHORED FIXED SPRINT
**Engagement Model:** Model 1 — Value-Anchored Fixed Sprint  
**Target Enterprise:** ${companyName} (${city})  
**Executive Sponsor:** ${decisionMaker}  
**Solutions Architect:** Zenthra Systems Enterprise Solutions  
**Date:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  

---

### 1. The Commercial Value Case
- **Audited Financial Leakage:** $${monthlyLossUSD.toLocaleString()} USD / month ($${annualLossUSD.toLocaleString()} USD / year).
- **Core Operational Bottleneck:** ${weaknessCategory.replace(/_/g, ' ')} detected during digital audit.
- **Fixed Sprint Investment:** $${sprintPriceUSD.toLocaleString()} USD (One-time, fixed fee).
- **Projected Payback Period:** **${paybackDays} Days** (Full investment recovered in ~1 month).
- **Projected 1-Year Net Value:** $${annualRecoveredUSD.toLocaleString()} USD (**${firstYearROIPct}% First-Year ROI**).

---

### 2. Sprint Deliverables (${sprintDurationDays} Business Days)
${deliverables.map((d, i) => `${i + 1}. **${d.title}**: ${d.description}`).join('\n')}

---

### 3. Commercial Terms & Guarantee
- **Fixed Price Guarantee:** $${sprintPriceUSD.toLocaleString()} USD. No hourly bill shock or scope creep.
- **Milestones:** 50% upon sprint kickoff, 50% upon production deployment sign-off.
- **IP Ownership:** 100% intellectual property, data models, and code transfer to ${companyName}.
- **Optional Post-Sprint Retainer:** $${retainerMonthlyUSD.toLocaleString()} USD / month for ongoing monitoring and expansion.
`.trim();

  // High-converting Value-Anchored Proposal Email
  const firstName = decisionMaker.split(' ')[0] || 'there';
  const proposalSubject = `Executive Briefing: Recovering an estimated $${monthlyLossUSD.toLocaleString()}/mo in operational leakage at ${companyName}`;
  const proposalBody = `Hi ${firstName},

We recently completed an audit of ${companyName}'s digital operations in ${city}. 

Based on our analysis, your current ${weaknessCategory.toLowerCase().replace(/_/g, ' ')} is resulting in an estimated $${monthlyLossUSD.toLocaleString()}/month ($${annualLossUSD.toLocaleString()}/year) in uncaptured revenue and manual labor waste.

Rather than quoting an open-ended hourly agency retainer, Zenthra Systems deploys a fixed "Model 1: Value-Anchored Sprint":

• Solution: ${sprintTitle}
• Timeline: Rapid ${sprintDurationDays}-day production deployment
• Fixed Investment: $${sprintPriceUSD.toLocaleString()} USD (One-time fixed fee)
• Payback Period: ${paybackDays} Days (Investment fully self-funded within Month 1)
• 1-Year Net ROI: Projected $${annualRecoveredUSD.toLocaleString()} USD in net value recovered (${firstYearROIPct}% ROI)

Key deliverables included in the 5-day deployment:
${deliverables.map(d => `  - ${d.title}: ${d.description}`).join('\n')}

Would you be open to a 10-minute briefing this Thursday or Friday to review the live interactive prototype for ${companyName}?

Best regards,

Enterprise Practice Director
Zenthra Systems Solutions
connect.zenthra@gmail.com | https://zenthra.systems
`.trim();

  return {
    success: true,
    model: 'MODEL_1_VALUE_ANCHORED_SPRINT',
    companyName,
    city,
    industry,
    decisionMaker,
    email,
    weaknessCategory,
    financials: {
      monthlyLossUSD,
      annualLossUSD,
      sprintPriceUSD,
      internalCostUSD,
      grossMarginUSD,
      grossMarginPct,
      paybackDays,
      annualRecoveredUSD,
      firstYearROIPct
    },
    sprint: {
      title: sprintTitle,
      serviceCategory,
      durationDays: sprintDurationDays,
      deliverables,
      recommendedRetainerUSD: retainerMonthlyUSD
    },
    sowText,
    proposal: {
      subject: proposalSubject,
      body: proposalBody
    }
  };
}

module.exports = { calculateQuote, calculateValueAnchoredSprint, PACKAGES, RATES };

if (require.main === module) {
  console.log('=== ZENTHRA SYSTEMS PRICING CALCULATOR ===\n');
  const quote = calculateQuote('POWER_BI_SPRINT');
  console.log(`Package: ${quote.package}`);
  console.log(`Price: $${quote.priceUSD.toLocaleString()} USD`);
  console.log(`Internal Cost: $${quote.internalCostUSD.toLocaleString()} USD`);
  console.log(`Gross Margin: $${quote.grossMarginUSD.toLocaleString()} USD (${quote.grossMarginPercentage}%)`);
  console.log(`Recommended Retainer: $${quote.recommendedRetainer.monthlyUSD.toLocaleString()}/mo`);
}
