# SECTION 9 — Technical Automation Blueprint & n8n Engine
**Zenthra Systems — End-to-End System Infrastructure**
*Classification: Technical Architecture & Systems Engineering*

---

## 9.1 Three-Tier Architecture Options

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       TECH STACK COMPARISON & EVOLUTION                     │
├───────────────────┬──────────────────────┬──────────────────────────────────┤
│ Dimension         │ Tier 1: Startup Stack│ Tier 2: Growth Stack (Recommended│
├───────────────────┼──────────────────────┼──────────────────────────────────┤
│ Automation Engine │ n8n (Self-Hosted)    │ n8n (Production Docker Cluster)  │
│ Database          │ SQLite / Supabase    │ Managed PostgreSQL + Redis       │
│ CRM Platform      │ Pipedrive / HubSpot  │ HubSpot Professional             │
│ Prospect Data     │ Apollo.io Basic      │ Apollo.io + SalesNav API         │
│ Cold Outreach     │ Instantly / Smartlead│ Smartlead Multi-Domain           │
│ AI Inference      │ OpenAI gpt-4o-mini   │ GPT-4o + Claude 3.5 Sonnet       │
│ Reporting Engine  │ Google Sheets / Looker│ Microsoft Power BI Pro           │
│ Monthly Tool Cost │ ~$120 - $220 / month │ ~$350 - $550 / month             │
└───────────────────┴──────────────────────┴──────────────────────────────────┘
```

---

## 9.2 The 10 Production n8n Workflows

Zenthra implements 10 modular, asynchronous n8n workflows:

### Workflow A: Prospect Ingestion & Deduplication
- **Trigger:** Webhook or cron receiving candidate company records.
- **Actions:** Normalizes domains, checks PostgreSQL `zenthra_prospect_accounts` to eliminate duplicates, verifies corporate registration.
- **Failover:** If domain query fails, flags record as `DOMAIN_LOOKUP_RETRY` with exponential backoff (3 attempts).

### Workflow B: AI Account Research & Signal Extraction
- **Trigger:** New unique record in `zenthra_prospect_accounts`.
- **Actions:** Scrapes homepage DOM and career pages via HTTP Request; passes unstructured text to LLM; extracts tech stack and open requisitions.
- **Output:** Structured `CompanyDossier` JSON.

### Workflow C: Service Classification & Inroad Wedge Selection
- **Trigger:** Output of Workflow B.
- **Actions:** Evaluates operational friction against Zenthra's 7 offerings. Assigns `matched_zenthra_service` and `inroad_wedge_offer`.

### Workflow D: 100-Point Lead Qualification Scoring
- **Trigger:** Completed service classification.
- **Actions:** Runs mathematical scoring rubric. Assigns `lead_score` (0–100) and `qualification_tier` (A/B/C).
- **Branching:** Tier C leads are marked `DEPRIORITIZED` and archived; Tier A/B proceed to Workflow E.

### Workflow E: Dynamic Cold Outreach Drafting
- **Trigger:** Tier A or B account score.
- **Actions:** Prompts Claude 3.5 Sonnet / GPT-4o with verified signal context; drafts 3 cold emails + 2 LinkedIn messages tailored to the decision-maker's role.
- **Output:** Staged record with `status = 'PENDING_HUMAN_APPROVAL'`.

### Workflow F: Human Approval & Outreach Delivery
- **Trigger:** Sales director clicks "Approve" button in Slack or CRM.
- **Actions:** Verifies recipient mailbox health and daily throttle count (<30 emails/day); dispatches through Smartlead API; records dispatch timestamp in PostgreSQL.

### Workflow G: Inbound Reply Detection & Sentiment Classification
- **Trigger:** Inbound email/LinkedIn webhook.
- **Actions:** LLM classifies message into 1 of 5 categories (`POSITIVE_INTEREST`, `OBJECTION_PRICE`, `OBJECTION_TIMING`, `UNSUBSCRIBE`, `OUT_OF_OFFICE`).
- **Safety Rule:** If `UNSUBSCRIBE`, immediately writes email to global exclusion list and cancels all future pending touches.

### Workflow H: Meeting Coordination & Brief Preparation
- **Trigger:** `POSITIVE_INTEREST` event.
- **Actions:** Creates deal in CRM at stage *Discovery Call Booked*; generates a 1-page executive briefing markdown file summarizing the company's pain points and recommended wedge for the sales engineer.

### Workflow I: Proposal & SOW Drafting Engine
- **Trigger:** CRM stage moved to *Technical Requirements Confirmed*.
- **Actions:** Compiles discovery notes into a structured SOW document covering deliverables, timeline milestones, pricing assumptions, and acceptance criteria.

### Workflow J: Revenue Telemetry & Power BI Refresh
- **Trigger:** Scheduled daily at 06:00 UTC.
- **Actions:** Queries CRM API and PostgreSQL; aggregates activity counts, win rates, and pipeline values; triggers Power BI dataset refresh via Microsoft Power BI REST API.
