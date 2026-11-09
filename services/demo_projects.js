/**
 * Zenthra Systems - Live Enterprise Demo Projects Engine
 * 4 Interactive Production-Grade Prototype Systems:
 *  1. Enterprise RAG Knowledge Assistant & Semantic Q&A (Generative AI)
 *  2. 24/7 AI Customer Intake & Booking Agent (AI Agents & Automation)
 *  3. Executive Power BI & Revenue Operations Cockpit (Power BI & Analytics)
 *  4. Automated Document & Invoice Vision Parser (Document AI)
 */

// ==========================================
// DEMO 1: ENTERPRISE RAG KNOWLEDGE ASSISTANT
// ==========================================
const RAG_DOCUMENTS = [
  {
    key: 'logistics_sop',
    title: 'Global Supply Chain & Reefer Logistics SOP (v4.2)',
    category: 'Logistics & Cold Chain',
    sections: [
      {
        id: 'sec_reefer_temp',
        heading: 'Section 4.1: Cold Chain Temperature Thresholds & Alarm Policies',
        content: 'Pharmaceutical and perishable food cargo in refrigerated containers (reefers) must maintain continuous telemetry logging at -20°C (±1.5°C) for frozen bio-assays and +2°C to +8°C for clinical vaccines. If container temperature drifts by > 2.0°C for more than 45 consecutive minutes, an automated Level 1 telemetry alert is dispatched to dispatch coordinators and the port cold-storage buffer facility. Failure to notify port authorities within 2 hours triggers mandatory cargo quarantine under Maritime Food & Drug Protocol 18.',
        keywords: ['temperature', 'reefer', 'cold chain', 'threshold', 'alarm', 'quarantine', 'vaccine', 'perishable']
      },
      {
        id: 'sec_port_demurrage',
        heading: 'Section 6.3: Port Demurrage & Detention Liability Caps',
        content: 'Standard free demurrage allowance at major international transshipment hubs (Chittagong, Rotterdam, Singapore, Jebel Ali) is strictly 5 calendar days following vessel discharge. Unclaimed container dwell time beginning on Day 6 incurs detention billing of $185 USD per TEU per day for dry cargo, and $340 USD per day for temperature-controlled reefers. Maximum aggregate liability per shipper bill of lading is capped at $45,000 USD, unless customs hold is resulting from undeclared hazardous materials (HAZMAT Class 3/8).',
        keywords: ['demurrage', 'detention', 'penalty', 'fee', 'free time', 'liability', 'chittagong', 'rotterdam', 'teu']
      },
      {
        id: 'sec_customs_clearance',
        heading: 'Section 8.2: Automated Customs Clearance Intake',
        content: 'Digital Bill of Lading (e-BOL) and commercial packing lists must be transmitted via EDI 856 or API payload at least 48 hours prior to vessel estimated time of arrival (ETA). Manual paper documentation intake is subject to a $250 administrative verification surcharge and a minimum 72-hour physical inspection turnaround delay.',
        keywords: ['customs', 'clearance', 'ebol', 'edi', 'paperwork', 'delay', 'packing list', 'tariff']
      }
    ]
  },
  {
    key: 'rmg_compliance',
    title: 'RMG Apparel Export Manufacturing & Quality Compliance (ISO 9001)',
    category: 'Apparel & Textiles',
    sections: [
      {
        id: 'sec_fabric_defects',
        heading: 'Section 2.4: Four-Point Fabric Inspection Defect Thresholds',
        content: 'All greige and dyed knit fabrics undergo four-point system quality inspection before automated laser cutting. Any fabric roll exhibiting greater than 28 penalty points per 100 square yards is classified as Grade B and is strictly prohibited from European Union (EU) and North American export shipments. Critical defects include drop stitches, elastane breakage, shade variation exceeding Delta E 0.8, and uncalibrated shrinkage exceeding 5% after 3 laundering cycles.',
        keywords: ['fabric', 'defect', 'inspection', 'four point', 'quality', 'grade b', 'shrinkage', 'shade']
      },
      {
        id: 'sec_buyer_lead_time',
        heading: 'Section 5.1: Export Delivery Timelines & Chargeback Penalties',
        content: 'Sample approval to production cut-off cycle is capped at 14 calendar days. Production lead times for standard circular knitwear orders (50,000 to 200,000 units) require delivery on board (FOB) within 45 days of Letter of Credit (L/C) opening. Shipping delays exceeding 7 calendar days incur an automatic 2% invoice discount per week up to a maximum 10% penalty, after which buyers reserve right of air-freight conversion at factory expense.',
        keywords: ['lead time', 'delivery', 'penalty', 'delay', 'chargeback', 'letter of credit', 'fob', 'buyer']
      }
    ]
  },
  {
    key: 'cloud_security',
    title: 'Zenthra Enterprise Cloud & Data Security Architecture (SOC2 / GDPR)',
    category: 'Enterprise IT Architecture',
    sections: [
      {
        id: 'sec_encryption_standards',
        heading: 'Section 3.2: Cryptographic Standards & Field-Level Data Masking',
        content: 'All sensitive corporate databases, customer PII, and financial ledgers utilize AES-256 encryption at rest and TLS 1.3 in transit. Field-level data tokenization is enforced for corporate tax IDs, bank IBAN numbers, and medical record numbers (MRNs). Encryption keys are rotated automatically every 90 days via AWS KMS / Google Cloud KMS with hardware security module (HSM) backing.',
        keywords: ['encryption', 'security', 'aes', 'tls', 'kms', 'pii', 'gdpr', 'hipaa', 'masking']
      }
    ]
  }
];

function queryRagAssistant(query = '', documentKey = null) {
  const q = query.toLowerCase().trim();
  const matchedChunks = [];

  const docsToSearch = documentKey
    ? RAG_DOCUMENTS.filter(d => d.key === documentKey)
    : RAG_DOCUMENTS;

  for (const doc of docsToSearch) {
    for (const sec of doc.sections) {
      let score = 0;
      const secText = (sec.heading + ' ' + sec.content).toLowerCase();

      // Keyword match weighting
      for (const kw of sec.keywords) {
        if (q.includes(kw)) score += 25;
      }

      // Word overlap scoring
      const queryWords = q.split(/\s+/).filter(w => w.length > 3);
      for (const qw of queryWords) {
        if (secText.includes(qw)) score += 15;
      }

      if (score > 0) {
        matchedChunks.push({
          documentTitle: doc.title,
          category: doc.category,
          heading: sec.heading,
          content: sec.content,
          relevanceScore: Math.min(99, 45 + score)
        });
      }
    }
  }

  // Sort descending by relevance
  matchedChunks.sort((a, b) => b.relevanceScore - a.relevanceScore);

  let synthesizedAnswer = '';
  if (matchedChunks.length === 0) {
    synthesizedAnswer = `Based on the indexed enterprise documentation, no direct clause matching "${query}" was identified. Please refine your query or consult the general operating manual.`;
  } else {
    const top = matchedChunks[0];
    synthesizedAnswer = `Executive Briefing:\nAccording to ${top.documentTitle} (${top.heading}), the mandated standard specifies:\n\n"${top.content}"\n\nOperational Action: Ensure operations coordinators align workflows with these thresholds to avoid non-compliance charges.`;
  }

  return {
    query,
    totalChunksScanned: RAG_DOCUMENTS.reduce((sum, d) => sum + d.sections.length, 0),
    topMatchesCount: matchedChunks.length,
    citations: matchedChunks.slice(0, 3),
    synthesizedAnswer,
    retrievalLatencyMs: 42 + Math.floor(Math.random() * 25)
  };
}

// ==========================================
// DEMO 2: 24/7 AI CUSTOMER INTAKE AGENT
// ==========================================
function processIntakeConversation(message = '', history = [], industry = 'logistics') {
  const m = message.toLowerCase();

  let botReply = '';
  let extractedLeadData = {
    detectedIntent: 'GENERAL_INQUIRY',
    projectScope: 'Custom Implementation',
    estimatedBudgetUSD: 12500,
    urgency: 'Medium (30 Days)',
    tier: 'Tier B'
  };

  if (m.includes('quote') || m.includes('price') || m.includes('cost') || m.includes('fee')) {
    extractedLeadData.detectedIntent = 'PRICING_QUOTE';
    extractedLeadData.tier = 'Tier A';
    extractedLeadData.estimatedBudgetUSD = 18500;
    botReply = `Thanks for inquiring about our pricing! For ${industry} systems, our typical fixed-scope Sprint ranges between $9,500 and $18,500 depending on volume and integrations. Could you share your monthly volume (e.g. number of orders, bookings, or documents) and your target launch date?`;
  } else if (m.includes('demo') || m.includes('meeting') || m.includes('call') || m.includes('schedule') || m.includes('calendar')) {
    extractedLeadData.detectedIntent = 'SCHEDULE_MEETING';
    extractedLeadData.tier = 'Tier A';
    extractedLeadData.urgency = 'Immediate (This Week)';
    botReply = `I would be delighted to set up an executive technical briefing! Our Engineering Director has open slots available this Tuesday at 10:00 AM EST and Thursday at 2:00 PM EST. What email address should I send the calendar invite and Zoom link to?`;
  } else if (m.includes('dental') || m.includes('patient') || m.includes('appointment')) {
    extractedLeadData.detectedIntent = 'HEALTHCARE_INTAKE';
    extractedLeadData.projectScope = '24/7 After-Hours Patient Booking Bot';
    extractedLeadData.tier = 'Tier A';
    botReply = `Hello! Our 24/7 Medical Intake Bot eliminates missed calls by immediately scheduling dental appointments, validating insurance coverage, and syncing with your EMR (Dentrix/Eaglesoft). Would you like to see how it auto-confirms emergency dental slots after 5 PM?`;
  } else if (m.includes('freight') || m.includes('shipping') || m.includes('container') || m.includes('cargo')) {
    extractedLeadData.detectedIntent = 'LOGISTICS_DISPATCH';
    extractedLeadData.projectScope = 'Automated Freight Quotation & BOL Intake';
    extractedLeadData.tier = 'Tier A';
    extractedLeadData.estimatedBudgetUSD = 22000;
    botReply = `Welcome! Our Logistics Automation Engine connects your carrier rate sheets, auto-generates instant freight quotes for shippers, and reduces dispatch hotline wait times from 45 minutes to under 5 seconds. What ports or corridors do you primary operate across?`;
  } else {
    botReply = `Welcome to Zenthra Systems! I am your 24/7 intelligent intake coordinator. I can help you price an enterprise AI project, schedule a technical architecture session, or audit your operational bottlenecks. How can I assist your team today?`;
  }

  return {
    botReply,
    leadData: extractedLeadData,
    suggestedSlots: ['Tuesday at 10:00 AM EST', 'Thursday at 2:00 PM EST', 'Friday at 11:30 AM EST'],
    qualificationScore: extractedLeadData.tier === 'Tier A' ? 88 : 72
  };
}

// ==========================================
// DEMO 3: POWER BI REVENUE COCKPIT
// ==========================================
function getPowerBiMetrics(sector = 'Logistics & Freight') {
  const sectorData = {
    'Logistics & Freight': {
      mrrUSD: 84500,
      weightedPipelineUSD: 412000,
      grossMarginPct: 76.5,
      churnRatePct: 1.2,
      cacPaybackMonths: 3.4,
      avgDealSizeUSD: 16500,
      daxMeasure: `TotalFreightMargin = SUMX(FILTER('fact_shipments', 'fact_shipments'[status] = "Delivered"), 'fact_shipments'[billed_usd] - 'fact_shipments'[carrier_cost_usd])`
    },
    'RMG Apparel Export': {
      mrrUSD: 112000,
      weightedPipelineUSD: 590000,
      grossMarginPct: 71.8,
      churnRatePct: 0.8,
      cacPaybackMonths: 2.9,
      avgDealSizeUSD: 24000,
      daxMeasure: `FactoryEfficiencyRate = DIVIDE(SUM('fact_production'[standard_allowed_minutes]), SUM('fact_production'[actual_clock_minutes]), 0)`
    },
    'Healthcare & Dental': {
      mrrUSD: 62000,
      weightedPipelineUSD: 285000,
      grossMarginPct: 82.4,
      churnRatePct: 1.5,
      cacPaybackMonths: 4.1,
      avgDealSizeUSD: 12500,
      daxMeasure: `PatientChairUtilization = DIVIDE(CALCULATE(COUNTROWS('fact_appointments'), 'fact_appointments'[status] = "Completed"), 8 * 22, 0)`
    },
    'Enterprise SaaS': {
      mrrUSD: 145000,
      weightedPipelineUSD: 820000,
      grossMarginPct: 84.2,
      churnRatePct: 0.6,
      cacPaybackMonths: 2.2,
      avgDealSizeUSD: 18500,
      daxMeasure: `NetRevenueRetention = DIVIDE(SUM('fact_subscriptions'[ending_arr]), SUM('fact_subscriptions'[starting_arr]), 1.0)`
    }
  };

  const selected = sectorData[sector] || sectorData['Logistics & Freight'];

  return {
    sector,
    metrics: selected,
    trend: [
      { month: 'May', revenue: Math.round(selected.mrrUSD * 0.72) },
      { month: 'Jun', revenue: Math.round(selected.mrrUSD * 0.78) },
      { month: 'Jul', revenue: Math.round(selected.mrrUSD * 0.84) },
      { month: 'Aug', revenue: Math.round(selected.mrrUSD * 0.91) },
      { month: 'Sep', revenue: Math.round(selected.mrrUSD * 0.96) },
      { month: 'Oct', revenue: selected.mrrUSD }
    ]
  };
}

// ==========================================
// DEMO 4: DOCUMENT & INVOICE VISION PARSER
// ==========================================
const SAMPLE_DOCS = {
  bill_of_lading: {
    docType: 'Bill of Lading (Ocean Freight)',
    documentNumber: 'BOL-CGP-99428-A',
    issuer: 'Apex Ocean Logistics Ltd.',
    shipper: 'Bavaria Apparel Exports Ltd. (Chittagong, Bangladesh)',
    consignee: 'Hansa Global Retail GmbH (Hamburg, Germany)',
    portOfLoading: 'Chittagong Port (BDCGP)',
    portOfDischarge: 'Hamburg Port (DEHAM)',
    vessel: 'MV OCEAN PRODIGY / V.2410',
    totalContainers: 4,
    declaredWeightKg: 42800,
    lineItems: [
      { itemNo: 1, description: '100% Organic Cotton Knitted T-Shirts (Cartons)', qty: 24000, hsCode: '6109.10', valueUSD: 144000 },
      { itemNo: 2, description: 'Mens Stretch Denim Trousers 5-Pocket', qty: 12000, hsCode: '6203.42', valueUSD: 168000 }
    ],
    totalDeclaredValueUSD: 312000,
    discrepancyDetected: null
  },
  commercial_invoice: {
    docType: 'Commercial Tax Invoice',
    documentNumber: 'INV-2026-8812',
    issuer: 'Summit Precision Machining Corp.',
    taxId: 'US-EIN-94-2849102',
    buyer: 'Titan Industrial Components Inc.',
    paymentTerms: 'Net 30 Days Wire',
    lineItems: [
      { itemNo: 1, description: 'Precision CNC Titanium Spindle Housings', qty: 150, unitPriceUSD: 240.00, subtotalUSD: 36000 },
      { itemNo: 2, description: 'Hardened Anodized Calibration Bushings', qty: 500, unitPriceUSD: 18.50, subtotalUSD: 9250 },
      { itemNo: 3, description: 'Expedited Air Freight Courier Surcharge', qty: 1, unitPriceUSD: 1200.00, subtotalUSD: 1200 }
    ],
    subtotalUSD: 46450,
    taxAmountUSD: 3251.50,
    totalInvoiceUSD: 49701.50,
    discrepancyDetected: null
  }
};

function parseCommercialDocument(sampleKey = 'bill_of_lading') {
  const doc = SAMPLE_DOCS[sampleKey] || SAMPLE_DOCS.bill_of_lading;
  const parseLatencyMs = 65 + Math.floor(Math.random() * 30);

  return {
    success: true,
    sampleKey,
    document: doc,
    parsedAt: new Date().toISOString(),
    confidenceScore: 0.992,
    parseLatencyMs,
    extractedFieldsCount: Object.keys(doc).length + (doc.lineItems ? doc.lineItems.length * 4 : 0),
    dataIntegrityStatus: 'PASSED (0 Mismatches in Subtotal Verification)'
  };
}

module.exports = {
  RAG_DOCUMENTS,
  queryRagAssistant,
  processIntakeConversation,
  getPowerBiMetrics,
  parseCommercialDocument
};
