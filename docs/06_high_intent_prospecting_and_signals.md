# SECTION 6 — High-Intent Lead Discovery & Signal Intelligence
**Zenthra Systems — Prospect Identification Framework**
*Classification: Revenue Operations & Data Architecture*

---

## 6.1 Authorized & Compliant Prospecting Sources
To maintain strict compliance and high data integrity, Zenthra Systems gathers intelligence exclusively from legally permissible, publicly available, or officially licensed sources:
1. **Official B2B Directory APIs:** Apollo.io API, LinkedIn Sales Navigator (via authorized user sessions), Crunchbase API.
2. **Public Job Requisitions:** Indeed, LinkedIn Jobs, Google Jobs, company career pages.
3. **Public Corporate Filings & Announcements:** PR Newswire, Business Wire, SEC filings (EDGAR), UK Companies House.
4. **Technology Stack Detection:** BuiltWith, Wappalyzer public headers, DNS records, public GitHub repositories.
5. **Corporate Web Properties:** Official company landing pages, terms of service, privacy policies, corporate leadership bios.

*Strict Policy:* Never deploy aggressive scrapers that violate platform Terms of Service, bypass authentication, or harvest private consumer personal data.

---

## 6.2 Service-Specific Buying Signals Taxonomy

Every account evaluated must demonstrate at least one primary verified buying signal before entering outreach drafting:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BUYING SIGNAL MATRIX                               │
├───────────────────┬───────────────────────────────────┬─────────────────────┤
│ Service Line      │ Primary Observable Buying Signal  │ Verification Source │
├───────────────────┼───────────────────────────────────┼─────────────────────┤
│ 1. Power BI       │ - "Power BI Developer" or         │ - Indeed / LinkedIn │
│                   │   "Financial Analyst" job open    │   Job postings      │
│                   │   >35 days                        │ - Annual / Interim  │
│                   │ - Announcement of ERP migration   │   reports / PR      │
│                   │ - Multiple regional branch growth │                     │
├───────────────────┼───────────────────────────────────┼─────────────────────┤
│ 2. AI Automation  │ - High volume of hiring for data  │ - Career portals    │
│                   │   entry, CSRs, or ops clerks      │ - Review sites      │
│                   │ - Customer complaints regarding   │   (G2/Capterra/Trust│
│                   │   slow response times             │   pilot)            │
│                   │ - Tech stack shows 8+ disconnected│ - BuiltWith /       │
│                   │   SaaS tools                      │   Job requirements  │
├───────────────────┼───────────────────────────────────┼─────────────────────┤
│ 3. Enterprise RAG │ - C-suite announcement of AI or   │ - Press releases    │
│    / GenAI        │   Knowledge Modernization init    │ - Technical blogs   │
│                   │ - Heavy compliance burden (Legal, │ - SEC 10-K / filings│
│                   │   Healthcare, Wealth Management)  │                     │
├───────────────────┼───────────────────────────────────┼─────────────────────┤
│ 4. Web Modern     │ - Website tech stack >5 years old │ - Wappalyzer        │
│                   │   (e.g., Drupal 7, legacy WP)     │ - Google PageSpeed  │
│                   │ - Mobile speed score <40/100      │ - LinkedIn news     │
│                   │ - Corporate rebrand announced     │                     │
└───────────────────┴───────────────────────────────────┴─────────────────────┘
```

---

## 6.3 Signal Credibility Hierarchy
Every research finding stored in the Zenthra intelligence engine must carry an explicit credibility badge:

1. **[VERIFIED EVIDENCE]:** Direct, auditable fact supported by a primary source URL (e.g., *"Job listing URL: https://indeed.com/... for Power BI Specialist posted 48 days ago"*).
2. **[REASONABLE HYPOTHESIS]:** Logical operational inference derived from verified facts (e.g., *"Company opened 3 distribution facilities in Q2 2026 without hiring inventory managers; likely experiencing manual spreadsheet reconciliation bottlenecks"*).
3. **[UNCONFIRMED SPECULATION]:** Any assumption lacking primary documentation. *Rules mandate that unconfirmed speculation cannot be used in cold outreach messaging.*

---

## 6.4 Prospect Account Data Schema (PostgreSQL / JSON)

```sql
CREATE TABLE zenthra_prospect_accounts (
    account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    official_website VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    headcount_range VARCHAR(50) NOT NULL,
    estimated_revenue_range VARCHAR(50),
    primary_tech_stack JSONB,
    verified_signals JSONB NOT NULL,
    matched_zenthra_service VARCHAR(100) NOT NULL,
    inroad_wedge_offer VARCHAR(255) NOT NULL,
    decision_maker_name VARCHAR(150),
    decision_maker_title VARCHAR(150),
    decision_maker_email VARCHAR(255),
    decision_maker_linkedin VARCHAR(255),
    email_verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    signal_source_urls TEXT[] NOT NULL,
    research_summary TEXT NOT NULL,
    lead_score INT NOT NULL,
    qualification_tier VARCHAR(10) NOT NULL,
    crm_sync_status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
