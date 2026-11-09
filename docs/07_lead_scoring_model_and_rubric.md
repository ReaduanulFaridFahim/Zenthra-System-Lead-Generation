# SECTION 7 — 100-Point Lead Qualification Model & Scoring Algorithm
**Zenthra Systems — Opportunity Prioritization Architecture**
*Classification: Revenue Operations Scoring Standards*

---

## 7.1 The 100-Point Scoring Model

Every prospective account identified by the Lead Discovery Agent must be mathematically evaluated across six weighted dimensions totaling 100 points:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          100-POINT LEAD SCORING BREAKDOWN                   │
├───────────────────────────────────┬────────────┬────────────────────────────┤
│ Scoring Category                  │ Max Points │ Key Evaluation Factor      │
├───────────────────┼────────────┼────────────────────────────┤
│ 1. Service & Vertical Alignment   │ 20 Points  │ Direct priority ICP match  │
│ 2. Budget & Company Scale         │ 20 Points  │ Headcount & revenue bands  │
│ 3. Demonstrated Business Problem  │ 20 Points  │ Verifiable bottleneck/debt │
│ 4. Buying Signal Urgency          │ 20 Points  │ Active hiring/expansion PR │
│ 5. Decision-Maker Accessibility   │ 10 Points  │ Direct verified contact ID │
│ 6. Geographic & Regulatory Fit    │ 10 Points  │ Tier 1 market & compliance │
├───────────────────────────────────┼────────────┼────────────────────────────┤
│ TOTAL POSSIBLE                    │ 100 Points │ Tier Thresholds A / B / C  │
└───────────────────────────────────┴────────────┴────────────────────────────┘
```

### Detailed Scoring Breakdown

#### 1. Service & Vertical Alignment (0–20 Points)
- **20 pts:** Exact match with priority wedge vertical (e.g. Freight/Logistics for Power BI; B2B SaaS for Automation; Legal/Finance for RAG).
- **12 pts:** Adjacent mid-market vertical with demonstrated software/data reliance.
- **5 pts:** Generic business sector without obvious technical infrastructure.
- **0 pts:** B2C consumer, micro-business, or non-target industry (government, agriculture).

#### 2. Budget & Company Scale (0–20 Points)
- **20 pts:** Headcount 50–500 employees AND estimated revenue \$15M–\$150M (Sweet Spot).
- **14 pts:** Headcount 25–49 employees OR 501–1,000 employees.
- **7 pts:** Headcount 10–24 employees (budget risk) OR >1,000 employees (enterprise procurement friction).
- **0 pts:** Solo operators (<5 employees) or companies in visible financial distress.

#### 3. Demonstrated Business Problem / Technical Debt (0–20 Points)
- **20 pts:** Publicly verified problem: open job req for relevant role unfilled for >35 days; outdated legacy stack confirmed via DNS/BuiltWith; negative reviews citing slow turnaround.
- **12 pts:** Strong operational proxy: company scaling facilities/locations rapidly without visible back-office hires.
- **5 pts:** General corporate assumptions without verified primary source evidence.
- **0 pts:** Company has modern, newly deployed competing solutions or in-house engineering team fully handling the domain.

#### 4. Buying Signals & Timing Urgency (0–20 Points)
- **20 pts:** High-urgency catalyst: C-suite hire (new CFO/COO) within last 90 days; M&A consolidation; corporate rebrand; major new contract win.
- **12 pts:** General company growth announcement; standard team expansion.
- **5 pts:** Stable business operations with no recent public announcements.
- **0 pts:** Active downsizing, executive departures, or hiring freezes.

#### 5. Decision-Maker Accessibility & Direct Reach (0–10 Points)
- **10 pts:** Direct decision-maker identified (CFO/COO/CTO) with verified zero-bounce corporate email AND active LinkedIn presence (>1 post/month).
- **6 pts:** Decision-maker identified with corporate email, but low public activity.
- **3 pts:** Generic corporate contact (`info@`, `contact@`) or unverified personal email.
- **0 pts:** No identifiable leadership or company masking corporate officers.

#### 6. Geographic & Regulatory Compatibility (0–10 Points)
- **10 pts:** United States, United Kingdom, or UAE (Tier 1 launch markets with clear legal outreach basis).
- **6 pts:** Canada, Australia, Netherlands, Switzerland (Tier 2 markets).
- **2 pts:** Other European or international jurisdictions requiring strict language localization.
- **0 pts:** Sanctioned countries, high-fraud regions, or jurisdictions with total outbound bans.

---

## 7.2 Actionable Tier Classifications

```
   Tier A (80 – 100 Points) ──► Immediate Account-Based Marketing (ABM)
                                - Bespoke 2-minute video teardown
                                - Multi-touch sequence (Email + LinkedIn)
                                - Priority human sales review

   Tier B (60 – 79 Points)  ──► Semi-Automated Outreach Sequencing
                                - Personalized 3-step value email
                                - Standard connection invitation
                                - Nurture campaign if unresponsive

   Tier C (< 60 Points)     ──► Deprioritized / Passive Nurture
                                - Zero direct manual sales outreach
                                - Added to quarterly inbound newsletter
```

> [!CAUTION]
> **Core Operating Principle:** A score of 95 indicates **exceptionally high qualification fit**, NOT guaranteed purchasing intent. Outreach must always lead with discovery and curiosity, never assuming the client has committed budget before the discovery call.
