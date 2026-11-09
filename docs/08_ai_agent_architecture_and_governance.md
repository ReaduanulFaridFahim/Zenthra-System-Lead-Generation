# SECTION 8 — Multi-Agent AI Sales Automation Architecture
**Zenthra Systems — 12-Agent Autonomous Revenue Organization**
*Classification: Autonomous Systems Engineering & Governance*

---

## 8.1 System Philosophy & Guardrails
The Zenthra AI Sales Organization executes continuous market discovery, deep company intelligence, qualification scoring, and copy drafting. 

**Core Human-in-the-Loop (HITL) Safety Constraints:**
1. **No Autonomous Outbound Sending:** No AI agent may dispatch cold email or LinkedIn messages without explicit human approval in CRM or Slack.
2. **No Autonomous Contract Commitments:** No agent may propose binding pricing, discounts, or contractual terms.
3. **No Hallucinated Claims:** Agents are programmatically restricted to verified company facts and approved Zenthra capability matrices.

---

## 8.2 The 12 Specialized AI Sales Agents

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE 12 ZENTHRA AUTONOMOUS SALES AGENTS                   │
├──────┬───────────────────────────────────┬──────────────────────────────────┤
│ ID   │ Agent Name                        │ Core Operational Mission         │
├──────┼───────────────────────────────────┼──────────────────────────────────┤
│ AG-01│ Global Market Intelligence Agent  │ Monitors macro-trends & sectors  │
│ AG-02│ Lead Discovery Agent              │ Harvests entities via APIs & PR  │
│ AG-03│ Company Deep-Research Agent       │ Compiles technical & debt dossier│
│ AG-04│ Service Matching Agent            │ Selects single best inroad wedge │
│ AG-05│ Lead Qualification & Scoring Agent│ Computes 100-pt qualification    │
│ AG-06│ Personalized Outreach Agent       │ Drafts tailored email & LinkedIn │
│ AG-07│ Campaign Orchestration Agent      │ Controls dispatch & throttles    │
│ AG-08│ Reply Intelligence Agent          │ Classifies inbound replies & sentiment│
│ AG-09│ Meeting Coordination Agent        │ Coordinates calendar & briefing  │
│ AG-10│ Proposal & SOW Drafting Agent     │ Drafts milestone-based SOW docs  │
│ AG-11│ CRM Lifecycle Management Agent    │ Maintains deal stages & hygiene  │
│ AG-12│ Revenue Operations Analytics Agent│ Generates Power BI / daily telemetry│
└──────┴───────────────────────────────────┴──────────────────────────────────┘
```

---

## 8.3 Detailed Agent Specifications & Handoff Interfaces

### Agent 1: Global Market Intelligence Agent (AG-01)
- **Objective:** Continuously scan industry publications, hiring trends, and economic indicators to identify verticals experiencing acute technical bottlenecks.
- **Trigger:** Scheduled cron (Every Sunday, 22:00 UTC).
- **Inputs:** RSS feeds (Logistics Management, TechCrunch, CFO.com), SEC EDGAR filings, public hiring indices.
- **Output Schema:**
  ```json
  {
    "batch_id": "MKT-2026-W45",
    "recommended_sectors": [
      {
        "sector": "Logistics & Freight Forwarding",
        "region": "United States",
        "macro_driver": "Surging transaction volumes paired with 40% open back-office staffing gap",
        "recommended_service": "Microsoft Power BI Modernization",
        "priority_score": 9.4
      }
    ]
  }
  ```

### Agent 2: Lead Discovery Agent (AG-02)
- **Objective:** Ingest the sector mandate from AG-01, query licensed B2B databases (Apollo/SalesNav), filter companies by headcount (50–500) and geography (Tier 1), and identify the primary decision maker.
- **Trigger:** Webhook from AG-01 output.
- **Outputs:** List of validated raw accounts (`company_name`, `domain`, `headcount`, `decision_maker_name`, `decision_maker_title`).

### Agent 3: Company Deep-Research Agent (AG-03)
- **Objective:** Deep-dive into each discovered domain, extracting technology stack components, open job descriptions, recent executive appointments, and corporate initiatives.
- **Trigger:** New record in staging table.
- **Tools:** Headless DOM analyzer, job description parser, LLM summarizer.
- **Outputs:** `CompanyDossier` categorizing verified evidence vs. operational assumptions.

### Agent 4: Service Matching Agent (AG-04)
- **Objective:** Evaluate the `CompanyDossier` against Zenthra's 7 offerings and select the **Single Strongest Wedge Offer**.
- **Rule:** If the company relies on legacy ERP + manual spreadsheets, match **Service 5 (Power BI)**. If high customer support friction is observed, match **Service 2 (AI Automation)**. If proprietary compliance knowledge exists, match **Service 1 (Enterprise RAG)**.

### Agent 5: Lead Qualification & Scoring Agent (AG-05)
- **Objective:** Execute the mathematical 100-point scoring algorithm.
- **Outputs:** Final score (0–100), Tier (Tier A, Tier B, Tier C), and qualification justification.

### Agent 6: Personalized Outreach Drafting Agent (AG-06)
- **Objective:** Draft hyper-personalized cold outreach (3 emails + 2 LinkedIn messages).
- **Prompt Constraints:** Hook directly into the verified buying signal (e.g. unfilled job post). Propose a low-friction wedge sprint. Keep initial email under 120 words. No buzzwords.
- **Output:** Staged draft awaiting Human-in-the-Loop review.

### Agent 7: Campaign Orchestration Agent (AG-07)
- **Objective:** Enforce sending throttles (max 30 emails/mailbox/day), randomize dispatch timing, insert mandatory CAN-SPAM / UK GDPR headers, and track delivery receipts.
- **Pre-Condition:** Record MUST have `status = 'APPROVED_BY_HUMAN'`.

### Agent 8: Reply Intelligence & Sentiment Agent (AG-08)
- **Objective:** Analyze inbound replies via webhook.
- **Classification Categories:**
  - `POSITIVE_INTEREST`: Requesting call, demo, or pricing.
  - `OBJECTION_TIMING`: "Follow up in Q3."
  - `OBJECTION_PRICE`: "Too expensive / no budget."
  - `UNSUBSCRIBE`: Opt-out request $\rightarrow$ immediately flags email in global suppression list across all systems.
  - `OUT_OF_OFFICE`: Pauses sequence until return date.

### Agent 9: Meeting Coordination Agent (AG-09)
- **Objective:** When `POSITIVE_INTEREST` is confirmed, generate a bespoke scheduling link, send an executive calendar invite, and prepare a **1-Page Discovery Brief** for the Zenthra sales engineer.

### Agent 10: Proposal & SOW Drafting Agent (AG-10)
- **Objective:** Following discovery call completion, synthesize call transcript, confirmed technical constraints, and client deliverables into a formal, milestone-based Statement of Work (SOW).

### Agent 11: CRM Lifecycle Management Agent (AG-11)
- **Objective:** Maintain bidirectional data consistency across PostgreSQL, CRM (HubSpot/Pipedrive), and email tools; flag stale deals with >7 days of inactivity.

### Agent 12: Revenue Operations Analytics Agent (AG-12)
- **Objective:** Calculate daily funnel metrics (Win Rate, CAC, Sales Cycle Days, Pipeline Velocity) and push updated tabular data to the Zenthra Power BI Sales Dashboard.
