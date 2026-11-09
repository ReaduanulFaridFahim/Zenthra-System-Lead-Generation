/**
 * Zenthra Systems - Campaign Matrix & Messaging Engine
 * Defines complete outreach sequences across all 7 core service campaigns.
 */

const fs = require('fs');
const path = require('path');

const CAMPAIGNS = {
  power_bi: {
    campaign_id: 'camp_05_power_bi',
    service: 'Microsoft Power BI Development',
    target_personas: ['CFO', 'VP of Finance', 'Financial Controller', 'BI Manager'],
    priority_verticals: ['Logistics & Supply Chain', 'Financial Services', 'Manufacturing'],
    subject_lines: [
      "Question regarding {{company}}'s reporting latency",
      "Eliminating 15 hours of weekly spreadsheet assembly at {{company}}",
      "{{first_name}} — quick thought on your open BI requisition"
    ],
    touch_1_variations: [
      "Hi {{first_name}},\n\nI noticed {{company}} has had an open search for a BI & Analytics specialist to support operational reporting.\n\nWhen organizations scale across multiple entities, consolidating disparate accounting and operational metrics in Excel typically costs finance teams 12–15 hours every week.\n\nAt Zenthra Systems, we engineer automated Microsoft Power BI architectures. We recently helped a multi-hub distribution business eliminate 14 weekly hours of spreadsheet consolidation using our 5-Day Executive KPI Sprint.\n\nWould it make sense to review a 3-minute video teardown of how this connects directly to your ERP data?\n\nBest regards,\nZenthra Systems Enterprise Sales\nhttps://zenthra-systems.example.com",
      "Hi {{first_name}},\n\nMost CFOs we speak with in {{industry}} are frustrated by the multi-day lag required to calculate gross margin by customer and business unit.\n\nSpreadsheet-based consolidation introduces formula risk and consumes hours of senior finance time that should be spent on strategic planning.\n\nZenthra Systems builds board-ready Power BI workspaces that automate your weekly and monthly reporting cycles.\n\nAre you open to a brief conversation this week to see our operational finance dashboard framework?",
      "Hi {{first_name}},\n\nSaw {{company}}'s recent operational expansion. As transaction volumes grow, manual Excel reporting invariably creates visibility bottlenecks for executive leadership.\n\nWe specialize in rapid Power BI implementations that connect directly to your underlying ERP and CRM, providing real-time KPI dashboards in under 10 business days.\n\nWould you be opposed to seeing a 3-minute screen recording of how this works in practice?"
    ],
    linkedin_connection: [
      "Hi {{first_name}}, noticed your focus on financial operations at {{company}}. We help finance leaders replace manual Excel reporting debt with automated Power BI dashboards. Would love to connect and share our operational KPI frameworks.",
      "Hi {{first_name}}, saw {{company}}'s growth in {{industry}}. We design executive Power BI workspaces for scaling mid-market companies. Great to connect with fellow finance leaders."
    ],
    linkedin_post_connection: [
      "Thanks for connecting, {{first_name}}! Here is a link to our 4-page checklist on modernizing Excel reporting to Power BI: https://zenthra-systems.example.com/resources/excel-to-bi. Hope it is useful for your team.",
      "Glad to connect! If {{company}} is ever reviewing reporting automation or dashboard performance, I would be happy to share notes on what we are seeing across similar {{industry}} firms."
    ],
    value_follow_ups: [
      "Hi {{first_name}},\n\nWanted to share a quick insight: we find that 80% of finance reporting delays stem not from complex DAX formulas, but from un-optimized Power Query ETL pipelines connecting to legacy ERPs.\n\nHappy to share our data modeling checklist if you are evaluating your internal reporting architecture.",
      "Hi {{first_name}},\n\nFollowing up on my previous note. One of our recent logistics clients was able to reduce month-end close reporting from 5 business days to 4 hours by implementing an automated Power BI star schema.\n\nDo you have 10 minutes this Thursday to discuss whether a similar sprint fits {{company}}?",
      "Hi {{first_name}},\n\nQuick thought: if your team is currently hiring a BI analyst, our 5-Day Executive Sprint can bridge the gap immediately and deliver your core executive dashboards before you complete the hiring cycle."
    ],
    breakup_email: "Hi {{first_name}},\n\nI realize you are likely focused on other critical priorities at {{company}}. I will pause my outreach here so I do not crowd your inbox.\n\nIf reporting modernization or Power BI becomes a priority later this year, please feel free to reach out anytime.\n\nBest regards,\nZenthra Systems",
    discovery_invitation: "Hi {{first_name}},\n\nWould you be open to a 15-minute introductory discovery call this Thursday at 2:00 PM EST? You can also pick a time directly on our calendar here: https://calendly.com/zenthra-systems/discovery.",
    objection_responses: {
      internal_team: "We completely respect that you have an in-house team. Most of our clients do. We act as a specialized strike team to deliver executive dashboards in 10 days without pulling your developers away from core initiatives.",
      no_budget: "Understood. That is why our entry sprint is structured as a fixed $12.5k package that recoups its cost in recovered finance labor within 60 days.",
      already_have_software: "Commercial software is great for standard reports, but often lacks the custom business logic needed for multi-entity reporting. We build tailored models on your existing Microsoft tenant.",
      bad_timing: "Completely understand. I will set a reminder to check in with you at the start of next quarter.",
      security_concerns: "Our deployments occur directly inside your secure Microsoft 365 tenant using Row-Level Security (RLS). No client data ever leaves your cloud environment."
    }
  },

  ai_automation: {
    campaign_id: 'camp_02_ai_automation',
    service: 'AI Agents & Business Automation',
    target_personas: ['COO', 'Head of Operations', 'VP of Operations', 'Director of Shared Services'],
    priority_verticals: ['Logistics', 'Professional Services', 'Fintech', 'Manufacturing'],
    subject_lines: [
      "Automating repetitive transaction intake at {{company}}",
      "Eliminating the 48-hour fulfillment bottleneck for {{company}}",
      "{{first_name}} — operational automation question"
    ],
    touch_1_variations: [
      "Hi {{first_name}},\n\nIn reviewing {{company}}'s recent operational growth, I noticed your team manages substantial cross-system transaction volume.\n\nFor companies scaling past 100 employees, manual data intake and system re-keying creates fulfillment lag and human error.\n\nAt Zenthra Systems, we deploy custom AI workflow agents that automate document ingestion, validate transaction data, and update core databases automatically.\n\nWould you be open to reviewing a workflow diagram of how we automated invoice reconciliation for a similar operator?\n\nBest regards,\nZenthra Systems Automation Practice",
      "Hi {{first_name}},\n\nMost operations leaders we speak with in {{industry}} are managing back-office teams spent re-keying shipping documents, invoices, and intake tickets between disconnected platforms.\n\nZenthra Systems designs production-grade automation agents with built-in human approval gates, reducing processing cycle times by up to 75%.\n\nWould you be interested in a 10-minute briefing on our Workflow Bottleneck Audit?",
      "Hi {{first_name}},\n\nNoticed {{company}} is rapidly scaling operations. As transaction volume doubles, hiring additional administrative coordinators creates linear overhead.\n\nWe build custom multi-agent workflows that connect legacy ERPs with modern cloud tools, handling routine data routing without manual intervention.\n\nCould I share a 2-page case teardown showing how a peer firm automated their order entry?"
    ],
    linkedin_connection: [
      "Hi {{first_name}}, noticed your leadership in operations at {{company}}. We build intelligent AI workflow agents to eliminate manual back-office bottlenecks. Great to connect with ops leaders.",
      "Hi {{first_name}}, following {{company}}'s operational growth. We help scaling companies automate repetitive cross-system workflows. Would love to connect and exchange ideas."
    ],
    linkedin_post_connection: [
      "Thanks for connecting, {{first_name}}! Here is a brief guide on identifying high-ROI automation candidates in operations: https://zenthra-systems.example.com/resources/automation-guide.",
      "Glad to connect! If you ever want to audit potential bottlenecks in your intake or fulfillment workflows, let me know."
    ],
    value_follow_ups: [
      "Hi {{first_name}},\n\nWanted to share an observation: the highest ROI in operations automation almost always comes from unstructured document parsing—turning supplier PDFs into clean ERP database records automatically.",
      "Hi {{first_name}},\n\nFollowing up on my previous note. Our Workflow Bottleneck Audit identifies the exact cost-per-transaction of your manual steps and delivers a functional prototype within 2 weeks.\n\nDo you have 10 minutes to discuss this Thursday?",
      "Hi {{first_name}},\n\nChecking in to see if reducing operational fulfillment latency is on your radar for this quarter."
    ],
    breakup_email: "Hi {{first_name}},\n\nI realize operational priorities shift quickly. I will step back here so I do not clutter your inbox.\n\nFeel free to reach out whenever automation becomes a priority.\n\nBest,\nZenthra Systems",
    discovery_invitation: "Hi {{first_name}},\n\nAre you available for a 15-minute discovery call this Wednesday at 3:00 PM EST? You can also book directly: https://calendly.com/zenthra-systems/discovery.",
    objection_responses: {
      internal_team: "We build alongside your IT team, using standard open frameworks (Node.js, Python, n8n) so your internal team retains full ownership of the code.",
      no_budget: "Our Workflow Bottleneck Audit is $9,500 and typically identifies enough manual labor savings to pay for itself within the first 60 days.",
      fear_of_errors: "Every agent we engineer incorporates strict human-in-the-loop approval gates. No transaction commits to your production database without human signoff until 99.5% accuracy is proven.",
      bad_timing: "Understood. I will follow up in 90 days when your current initiatives settle.",
      tool_sprawl: "We don't add new SaaS platforms. We connect your existing databases and ERPs using secure, serverless API connectors."
    }
  },

  ai_rag: {
    campaign_id: 'camp_01_ai_dev',
    service: 'AI Development & Generative AI',
    target_personas: ['CTO', 'VP of Engineering', 'Chief AI Officer', 'Head of Architecture'],
    priority_verticals: ['SaaS & Software', 'Fintech', 'Healthcare Tech'],
    subject_lines: [
      "Private enterprise RAG architecture for {{company}}",
      "Eliminating AI hallucination risk across {{company}}'s documentation",
      "{{first_name}} — private LLM deployment question"
    ],
    touch_1_variations: [
      "Hi {{first_name}},\n\nMost technology leaders we speak with want internal generative AI search across proprietary documentation and tickets, but are blocked by data privacy, role permissions, and hallucination risks.\n\nZenthra Systems designs private, SOC2-aligned Retrieval-Augmented Generation (RAG) architectures deployed directly in your private cloud (AWS/GCP/Azure). Your enterprise IP never touches public training loops.\n\nWe have prepared a 4-page technical implementation blueprint covering vector chunking, hybrid search, and strict access filtering.\n\nCan I send over the PDF architecture brief for your engineering team?\n\nBest regards,\nZenthra Systems AI Practice",
      "Hi {{first_name}},\n\nSaw {{company}}'s recent engineering expansion. If your team is evaluating LLM integrations, the hardest challenge is usually ensuring accurate retrieval over unstructured enterprise knowledge bases without data leakage.\n\nWe build private RAG pipelines using Qdrant/pgvector and fine-tuned retrieval models that guarantee sub-second semantic search with exact source citations.\n\nWould your engineering team be interested in reviewing our benchmark architecture?",
      "Hi {{first_name}},\n\nAre your engineers or customer support teams losing hours searching through fragmented technical documentation and internal wikis?\n\nWe engineer custom enterprise AI assistants deployed in private VPCs with strict role-based access control.\n\nCould we connect for 10 minutes this week to discuss your technical requirements?"
    ],
    linkedin_connection: [
      "Hi {{first_name}}, saw your technical leadership at {{company}}. We engineer private, secure RAG architectures for enterprise engineering teams. Would love to connect and exchange notes on LLM production deployment.",
      "Hi {{first_name}}, following {{company}}'s product roadmap. We specialize in private enterprise generative AI and vector search. Great to connect with engineering leaders."
    ],
    linkedin_post_connection: [
      "Thanks for connecting, {{first_name}}! Here is our technical benchmark comparison on vector databases (pgvector vs Qdrant vs Pinecone) for enterprise RAG: https://zenthra-systems.example.com/resources/vector-benchmark.",
      "Glad to connect! If you ever want to brainstorm private LLM architectures or evaluation frameworks, always happy to chat."
    ],
    value_follow_ups: [
      "Hi {{first_name}},\n\nWanted to share a quick benchmark: implementing hybrid search (combining BM25 keyword matching with dense vector embeddings) reduces RAG retrieval hallucination by over 40% compared to pure vector search alone.",
      "Hi {{first_name}},\n\nFollowing up on my note. We offer a 2-week RAG Proof-of-Concept that ingests up to 1,000 internal documents in a sandboxed VPC to prove citation accuracy before you commit to production.\n\nAre you free for 10 minutes this Thursday?",
      "Hi {{first_name}},\n\nChecking in to see if private AI infrastructure is on your technical roadmap for this quarter."
    ],
    breakup_email: "Hi {{first_name}},\n\nUnderstood that timing might not be ideal right now. I will close out my outreach. Feel free to reach out whenever AI infrastructure becomes a priority.\n\nBest regards,\nZenthra Systems",
    discovery_invitation: "Hi {{first_name}},\n\nWould you be open to a 15-minute technical discovery session this Thursday at 1:00 PM EST? Calendar: https://calendly.com/zenthra-systems/discovery.",
    objection_responses: {
      data_privacy: "We deploy 100% inside your dedicated VPC or private cloud environment. Zero client data or embeddings ever leave your infrastructure.",
      hallucinations: "We implement multi-step guardrails and citation verification—if a query cannot be verified against retrieved ground-truth documents, the system explicitly returns an unverified status.",
      internal_team: "We provide your engineers with full source code, Terraform scripts, and CI/CD pipelines so your team owns and maintains the architecture.",
      no_budget: "Our feasibility prototype is $18,500 and establishes full benchmark metrics within 14 days.",
      model_lock_in: "Our architecture is model-agnostic, supporting OpenAI, Anthropic, or local open-weights models (Llama 3 / Mistral) interchangeably via an abstracted API."
    }
  }
};

function exportCampaigns() {
  const campaignsDir = path.resolve(__dirname);
  console.log('[*] Exporting Structured Campaign JSON Files...');

  for (const [key, campaign] of Object.entries(CAMPAIGNS)) {
    const filePath = path.join(campaignsDir, `${campaign.campaign_id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(campaign, null, 2), 'utf8');
    console.log(`[+] Exported ${campaign.campaign_id}.json`);
  }
  console.log('[✓] All campaigns exported successfully.');
}

if (require.main === module) {
  exportCampaigns();
}

module.exports = { CAMPAIGNS, exportCampaigns };
