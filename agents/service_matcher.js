/**
 * Agent 4: Service Matcher
 * Maps account pain signals, tech stack, and Google Maps weakness audits
 * to the optimal Zenthra service offering & wedge.
 */

const SERVICE_CATALOG = {
  POWER_BI: {
    service: 'Microsoft Power BI Development',
    wedge: '5-Day Executive KPI Sprint',
    targetBuyer: ['CFO', 'VP of Finance', 'Financial Controller', 'Director of Operations'],
    matchSignals: ['excel', 'reporting', 'power bi', 'dax', 'kpi', 'dashboard', 'fragmented', 'manual spreadsheets', 'spreadsheet consolidation', 'multi-branch reporting']
  },
  AI_AUTOMATION: {
    service: 'AI Agents & Business Automation',
    wedge: '24/7 AI Customer Support & Instant Intake Agent',
    targetBuyer: ['COO', 'Head of Operations', 'Director of Shared Services', 'Practice Director', 'Automation Lead'],
    matchSignals: ['manual intake', 're-keying', 'invoice processing', 'repetitive', 'backlog', 'fulfillment lag', 'erp sync', 'intake', 'booking', 'phone tag', 'unresponsive', 'rating', 'wait time', 'customer support', 'intake agent', 'slow response', 'voicemail']
  },
  AI_RAG: {
    service: 'AI Development & Generative AI',
    wedge: 'Private Enterprise RAG Proof-of-Concept',
    targetBuyer: ['CTO', 'VP of Engineering', 'Head of AI', 'Chief Architect'],
    matchSignals: ['knowledge base', 'rag', 'llm', 'support tickets', 'internal search', 'unstructured data', 'documentation', 'document processing']
  },
  WEB_MODERNIZATION: {
    service: 'Modern Web Development',
    wedge: 'High-Converting Business Web Portal (7-Day Sprint)',
    targetBuyer: ['CEO', 'CMO', 'VP of Digital', 'Practice Director', 'Owner'],
    matchSignals: ['no website', 'missing website', 'website', 'legacy web', 'portal', 'rebrand', 'slow site', 'saas mvp', 'mobile responsive', 'redesign', 'mobile-unresponsive', 'insecure']
  },
  BUSINESS_ANALYSIS: {
    service: 'Business Analysis & Digital Transformation',
    wedge: 'Operational Process Mapping Sprint',
    targetBuyer: ['COO', 'Transformation Director', 'Program Manager'],
    matchSignals: ['requirements', 'process mapping', 'vendor selection', 'transformation', 'system replacement']
  },
  AI_VOICE_AGENT: {
    service: '24/7 AI Voice Receptionist & Phone Calling Agent',
    wedge: '3-Day AI Voice Receptionist Sprint',
    targetBuyer: ['Managing Partner', 'Clinic Director', 'General Manager', 'Head of Practice', 'Owner'],
    matchSignals: ['phone', 'voicemail', 'call', 'receptionist', 'missed call', 'calling', 'telephone', 'hold time', 'answering service']
  },
  WHATSAPP_SMS_BOT: {
    service: 'WhatsApp & SMS AI Conversational Sales Engine',
    wedge: '5-Day WhatsApp & SMS Conversational Sales Sprint',
    targetBuyer: ['Head of Sales', 'Chief Commercial Officer', 'E-Commerce Director', 'Managing Director'],
    matchSignals: ['whatsapp', 'sms', 'text message', 'messaging', 'chat quote', 'instant message', 'omnichannel']
  },
  LOCAL_MAPS_SEO: {
    service: 'Google Maps Local 3-Pack & Review Velocity Domination',
    wedge: '14-Day Google Maps 3-Pack & Review Velocity Domination',
    targetBuyer: ['Owner', 'Founder', 'Marketing Director', 'Managing Partner'],
    matchSignals: ['local seo', 'google maps', '3-pack', 'reviews', 'rating', 'citations', 'local search', 'google business profile', 'gbp']
  },
  CLOUD_SECURITY_SOC2: {
    service: 'Enterprise Cloud Security, Data Privacy & SOC2 Guardrails',
    wedge: '7-Day Enterprise Cloud Security & Compliance Hardening',
    targetBuyer: ['CISO', 'Head of Security', 'VP of Engineering', 'General Counsel', 'CTO'],
    matchSignals: ['security', 'compliance', 'soc2', 'hipaa', 'gdpr', 'data privacy', 'leakage', 'zero retention', 'firewall']
  },
  ECOMMERCE_CRO: {
    service: 'E-Commerce Headless Replatforming & AI Checkout CRO',
    wedge: '7-Day Headless E-Commerce & Checkout CRO Sprint',
    targetBuyer: ['E-Commerce Director', 'VP of Digital Commerce', 'CMO', 'Founder'],
    matchSignals: ['ecommerce', 'e-commerce', 'shopify', 'woocommerce', 'cart abandonment', 'checkout', 'cro', 'conversion rate', 'average order value']
  }
};

function matchService(accountDossier) {
  // If a Google Maps Weakness Audit was already conducted, honor its recommended service directly
  if (accountDossier.google_maps_audit && accountDossier.google_maps_audit.recommendedService) {
    const recService = accountDossier.google_maps_audit.recommendedService;
    const recWedge = accountDossier.google_maps_audit.recommendedWedge;

    let targetBuyer = ['CEO', 'Managing Director', 'Owner'];
    if (recService.includes('Power BI')) {
      targetBuyer = SERVICE_CATALOG.POWER_BI.targetBuyer;
    } else if (recService.includes('AI Agents') || recService.includes('Automation')) {
      targetBuyer = SERVICE_CATALOG.AI_AUTOMATION.targetBuyer;
    } else if (recService.includes('Web')) {
      targetBuyer = SERVICE_CATALOG.WEB_MODERNIZATION.targetBuyer;
    }

    return {
      matched_service: recService,
      recommended_wedge: recWedge,
      target_buyer_titles: targetBuyer,
      confidence_score: 98
    };
  }

  const textCorpus = [
    accountDossier.observed_signals || '',
    accountDossier.industry || '',
    JSON.stringify(accountDossier.detected_tech_stack || {}),
    accountDossier.unfilled_job_title || ''
  ].join(' ').toLowerCase();

  let bestMatch = SERVICE_CATALOG.POWER_BI; // Default fallback
  let maxScore = -1;

  for (const [key, catalogItem] of Object.entries(SERVICE_CATALOG)) {
    let score = 0;
    for (const signal of catalogItem.matchSignals) {
      if (textCorpus.includes(signal)) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = catalogItem;
    }
  }

  return {
    matched_service: bestMatch.service,
    recommended_wedge: bestMatch.wedge,
    target_buyer_titles: bestMatch.targetBuyer,
    confidence_score: Math.min(100, Math.max(50, maxScore * 15))
  };
}

module.exports = { matchService, SERVICE_CATALOG };
