# SECTION 11 — Sales Conversion System & Discovery Call Playbooks
**Zenthra Systems — Enterprise Deal Execution Standards**
*Classification: Commercial Sales Engineering & Closing Operations*

---

## 11.1 The 14-Stage High-Value B2B Sales Pipeline

```
[01 Prospect Identified] ──► [02 Research Completed] ──► [03 Qualified & Scored]
                                                                  │
[06 Discovery Booked]   ◄── [05 Positive Reply]      ◄── [04 Sequence Active]
       │
[07 Discovery Completed]──► [08 Sales Qualified]     ──► [09 Tech Scoping / SOW]
                                                                  │
[12 Closed Won / Lost]  ◄── [11 Negotiation]         ◄── [10 Proposal Submitted]
       │
[13 Client Onboarding]  ──► [14 Expansion / Retainer]
```

### Stage Criteria & Governance Table

| Stage ID & Name | Entry Criteria | Exit Criteria | Stage Owner | Automation Opportunity |
| :--- | :--- | :--- | :--- | :--- |
| **01. Prospect Identified** | Domain and corporate entity discovered | Company registration, headcount, and country verified | Lead Discovery Agent | Automated registry and Apollo lookup |
| **02. Research Completed** | Entity verified | `CompanyDossier` compiled with buying signals | Deep Research Agent | Automated tech stack and job post extraction |
| **03. Qualified & Scored** | Dossier compiled | 100-pt score calculated; Tier A/B assigned | Scoring Agent | Automated mathematical qualification |
| **04. Sequence Active** | Outbound copy human-approved | 3 touches dispatched or reply received | Campaign Orchestration | Throttled dispatch and delivery tracking |
| **05. Positive Reply** | Inbound positive response received | Sentiment classified as `POSITIVE_INTEREST` | Reply Agent | Instant Slack notification & draft scheduling link |
| **06. Discovery Booked** | Prospect selects calendar slot | Calendar invite accepted; briefing doc generated | Meeting Agent | Automated 1-page prospect brief pushed to calendar |
| **07. Discovery Completed**| 25-minute call executed | Call transcript and notes ingested into CRM | Sales Director / Lead Eng | Automated call summarization and action item extraction |
| **08. Sales Qualified (SQO)**| Confirmed problem, budget, and timeline | Qualified via MEDDIC criteria | Sales Director | CRM stage update and deal creation |
| **09. Tech Scoping (SOW)** | Specific project scope agreed | Milestone SOW and deliverables authored | Lead Solutions Architect| Semi-automated SOW generation via Agent 10 |
| **10. Proposal Submitted** | SOW approved internally | Formal proposal presented on live video call | Sales Director | Automated document view tracking |
| **11. Negotiation** | Client requested commercial edits | Final payment terms and start date agreed | CRO / Sales Director | Contract revision tracking |
| **12. Closed Won** | Contract signed & 50% deposit paid | Invoice settled; Slack channel created | Operations / Finance | Automated project provisioning in Jira/Slack |
| **13. Client Onboarding** | Deposit confirmed | Kickoff call held; repo/data access granted | Technical Project Lead | Automated client onboarding questionnaire |
| **14. Expansion Opportunity**| Core deliverable accepted | Upsell/Retainer proposal presented | Account Manager / Lead Eng| Automated 30-day review prompt and BI audit trigger |

---

## 11.2 The Zenthra Discovery Call Script (SPIN / Challenger Model)
*Time Budget: 25 Minutes | Target Outcome: Secure agreement for a Technical Scoping Session / Wedge Sprint*

### Part 1: Rapport & Context Setting (3 Minutes)
> *"Thanks for taking the time today, {{firstName}}. I've reviewed {{company}}'s recent expansion in {{industry}}. The goal for our 20 minutes today is very focused: I want to understand your current data reporting/automation setup, share how we engineer these architectures for similar firms, and see if a 5-day modernization sprint makes sense for {{company}}. If there's a strong fit, we can discuss next steps; if not, you'll walk away with an objective architectural perspective. Fair enough?"*

### Part 2: Situation Questions (5 Minutes)
- **Power BI / Analytics:** *"Walk me through the lifecycle of your monthly financial reporting. How many disparate systems are your analysts pulling data from, and how many workbooks are involved?"*
- **Automation / AI:** *"When a new customer signs up or an operational request arrives, what are the exact manual steps your team takes across your CRM, billing, and internal databases?"*
- **Enterprise GenAI:** *"How is your engineering and compliance team currently searching through your internal technical documentation and client contracts?"*

### Part 3: Problem Questions (5 Minutes)
- *"Where does the process break down today? What is the most frustrating part of that workflow for your leadership team?"*
- *"How often do discrepancies arise between operational reports and financial accounting?"*
- *"How many hours does your team estimate they lose to manual data wrangling each week?"*

### Part 4: Implication Questions (Challenger Push — 7 Minutes)
- *"What happens to executive decision-making when margin data is three weeks old instead of real-time?"*
- *"If transaction volume grows by 40% next year and this workflow remains manual, how many additional full-time coordinators will you have to hire just to keep up?"*
- *"What is the financial exposure if an analyst makes a copy-paste error in an unversioned spreadsheet right before board review?"*

### Part 5: Need-Payoff & The Wedge Close (5 Minutes)
- *"If you could open your phone on Monday morning at 8:00 AM and see live, audited gross margin and operational pacing across all facilities, how would that change your leadership meetings?"*
- **The Closing Bridge:**  
  > *"Based on what you've shared, {{firstName}}, trying to overhaul your entire data stack at once would be high-risk and disruptive. Instead, what we typically do is our **5-Day Executive KPI Sprint**: we take your single most painful workbook, build an automated, interactive Power BI model, and deploy it in 5 days for a flat fee of \$3,500. If your leadership loves it, we can explore a broader roadmap; if not, you keep the working dashboard and clean data model with zero strings attached. Would you be open to reviewing a formal 1-page SOW for that next week?"*

---

## 11.3 Qualification Framework: MEDDIC for Mid-Market Tech

1. **Metrics:** Quantifiable business impact (e.g., saving 15 analyst hours/week = \$45,000 annual labor savings).
2. **Economic Buyer:** Direct access to the person with check-signing authority (CFO, COO, or Founder).
3. **Decision Criteria:** The technical and commercial standards the client will use to evaluate Zenthra (e.g., security, delivery speed, fixed-price guarantee).
4. **Decision Process:** The formal steps required to approve an SOW (e.g., discovery call $\rightarrow$ technical review $\rightarrow$ CFO signature).
5. **Identify Pain:** Acute, bleeding-neck problem that cannot wait another quarter to be solved.
6. **Champion:** An internal leader (e.g., Financial Controller, Operations Manager) who actively advocates for Zenthra's engagement.
