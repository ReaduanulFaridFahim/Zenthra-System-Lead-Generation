# SECTION 14 — Budget, Resource Models & Financial Projections
**Zenthra Systems — 12-Month Pro-Forma Economics**
*Classification: Financial Modeling & Resource Allocation*

---

## 14.1 Monthly Tooling & Operational Budget

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MONTHLY REVENUE OPERATIONS BUDGET                        │
├───────────────────────────────┬────────────────────┬────────────────────────┤
│ Tool / Expense Category       │ Startup Tier (Mo.) │ Growth Tier (Mo.)      │
├───────────────────────────────┼────────────────────┼────────────────────────┤
│ n8n Automation Engine         │ $20 (VPS Host)     │ $40 (High-Mem VPS)     │
│ PostgreSQL Managed Database   │ $0 (Supabase Free) │ $25 (Managed Instance) │
│ Apollo.io B2B Prospect Data   │ $99 (Professional) │ $149 (Custom API Plan) │
│ Smartlead Cold Email Delivery │ $39 (Basic)        │ $79 (Pro / Multi-IP)   │
│ Secondary Inbound Domains (x3)│ $10 (Amortized)    │ $15 (Amortized)        │
│ Google Workspace / Office 365 │ $24 (4 mailboxes)  │ $48 (8 mailboxes)      │
│ LLM API Tokens (OpenAI/Claude)│ $50 (gpt-4o-mini)  │ $120 (GPT-4o + Claude) │
│ Microsoft Power BI Pro License│ $10 (1 User)       │ $20 (2 Users)          │
├───────────────────────────────┼────────────────────┼────────────────────────┤
│ TOTAL MONTHLY TOOLING COST    │ $252 / month       │ $496 / month           │
└───────────────────────────────┴────────────────────┴────────────────────────┘
```

---

## 14.2 The Mathematical Conversion Funnel Formula

$$\text{Closed Won Deals} = \text{Researched} \times \text{Eligibility \%} \times \text{Delivery \%} \times \text{Positive Reply \%} \times \text{Meeting Booked \%} \times \text{SQO \%} \times \text{Win Rate \%}$$

### Funnel Parameter Assumptions (Based on B2B Tech Services Benchmarks)
- **Account Eligibility Rate:** 65% of raw discovered companies meet headcount and vertical filters.
- **Delivery & Inbox Placement Rate:** 96% (achieved through SPF/DKIM/DMARC and 14-day warming).
- **Positive Reply Rate:** 2.5% (Tier B) to 4.5% (Tier A) of delivered prospects.
- **Meeting Booking Rate:** 55% of positive replies book a confirmed discovery call.
- **Meeting Attendance Rate:** 85% of booked calls attend.
- **Sales Qualified Opportunity (SQO) Rate:** 65% of attended calls have verified pain, budget, and timeline.
- **Proposal Win Rate:** 30% (Conservative) to 40% (Base Case) for productized inroad wedges.

---

## 14.3 Three-Scenario 12-Month Revenue Pro-Forma

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    12-MONTH PRO-FORMA FINANCIAL SCENARIOS                   │
├───────────────────────────────────┬──────────────┬────────────┬─────────────┤
│ Metric                            │ Conservative │ Base Case  │ Ambitious   │
├───────────────────────────────────┼──────────────┼────────────┼─────────────┤
│ Monthly Accounts Researched       │ 350          │ 600        │ 1,000       │
│ Monthly Tier A/B Prospects Reached│ 218          │ 374        │ 624         │
│ Monthly Confirmed Discovery Calls │ 3            │ 7          │ 15          │
│ Monthly Sales Qualified Deals     │ 2            │ 5          │ 10          │
│ Monthly Closed-Won New Clients    │ 0.8 (9/yr)   │ 1.8 (21/yr)│ 3.8 (45/yr) │
├───────────────────────────────────┼──────────────┼────────────┼─────────────┤
│ Blended Initial Project Value     │ $14,000      │ $20,000    │ $26,000     │
│ Total Year 1 Project Revenue      │ $126,000     │ $420,000   │ $1,170,000  │
│ Monthly Retainer Run-Rate (M12)   │ $12,500/mo   │ $38,000/mo │ $85,000/mo  │
│ Cumulative Year 1 Retainer Revenue│ $55,000      │ $165,000   │ $380,000    │
├───────────────────────────────────┼──────────────┼────────────┼─────────────┤
│ TOTAL YEAR 1 REVENUE REALIZATION  │ $181,000     │ $585,000   │ $1,550,000  │
├───────────────────────────────────┼──────────────┼────────────┼─────────────┤
│ Total Year 1 Operating Tools Cost │ $3,600       │ $5,950     │ $8,400      │
│ Gross Profit Margin (Blended)     │ 71%          │ 74%        │ 76%         │
│ Customer Acquisition Cost (CAC)   │ $400         │ $283       │ $186        │
└───────────────────────────────────┴──────────────┴────────────┴─────────────┘
```

> [!NOTE]
> *Disclaimer on Projections:* All financial figures above represent modeled scenarios based on industry conversion benchmarks and stated packaging pricing. Actual revenue depends directly on Zenthra Systems' engineering delivery capacity and sales close rates during live discovery calls.
