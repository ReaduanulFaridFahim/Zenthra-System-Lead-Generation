/**
 * Agent 10: Proposal & SOW Architect
 * Generates structured, production-grade Statements of Work (SOW) and proposals.
 */

function generateSOW(params) {
  const {
    clientName,
    serviceTitle,
    packageTier,
    priceUSD,
    durationWeeks,
    primaryPain,
    deliverables = []
  } = params;

  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
# STATEMENT OF WORK (SOW)
**Engagement Title:** ${serviceTitle}
**Client:** ${clientName}
**Provider:** Zenthra Systems
**Date:** ${dateStr}
**Package Tier:** ${packageTier}
**Fixed Investment:** $${priceUSD.toLocaleString()} USD
**Delivery Timeline:** ${durationWeeks} Weeks from Kickoff

---

### 1. Executive Summary & Objective
Zenthra Systems has been engaged by **${clientName}** to design, architect, and deploy a production-ready solution to resolve operational debt associated with:
> *"${primaryPain}"*

The objective of this engagement is to deliver tangible, measurable operational ROI within ${durationWeeks} weeks, providing immediate executive visibility and automating fragmented data workflows.

---

### 2. Scope of Deliverables
${deliverables.map((d, i) => `${i + 1}. **${d.title}**: ${d.description}`).join('\n')}

---

### 3. Architecture & Data Security Standards
- **Zero Public Training:** Proprietary client data is never transmitted to public LLM training sets.
- **Role-Based Access Control (RBAC):** Strict row-level security and credential isolation.
- **Client IP Ownership:** All custom code, data models, DAX measures, and documentation developed during this engagement become 100% the intellectual property of ${clientName}.

---

### 4. Commercial Terms & Payment Milestones
- **Total Fixed Fee:** $${priceUSD.toLocaleString()} USD
- **Milestone 1 (50%):** Upon execution of this SOW and kickoff ($${(priceUSD * 0.5).toLocaleString()} USD).
- **Milestone 2 (50%):** Upon final UAT signoff and deployment ($${(priceUSD * 0.5).toLocaleString()} USD).

---

### 5. Signatures & Acceptance

**For ${clientName}:**
Signature: __________________________  
Name: _______________________________  
Date: _______________________________  

**For Zenthra Systems:**
Signature: __________________________  
Name: **Enterprise Practice Director**  
Date: _______________________________  
`.trim();
}

module.exports = { generateSOW };
