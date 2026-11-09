/**
 * Zenthra Systems - Lead Scoring & Qualification Algorithm
 * Version: 3.1-Production (Supports Google Maps Digital Audits)
 */

class ZenthraLeadScorer {
  constructor() {
    this.priorityVerticals = [
      'logistics', 'freight', 'supply chain', 'distribution', 'manufacturing',
      'saas', 'software', 'fintech', 'legal', 'wealth management', 'healthcare tech',
      'healthcare', 'dental', 'clinic', 'medical', 'contractor', 'plumbing', 'hvac',
      'accounting', 'cpa', 'advisory', 'home services', 'commercial services'
    ];
    this.tier1Countries = ['united states', 'usa', 'us', 'united kingdom', 'uk', 'uae', 'united arab emirates', 'canada', 'australia', 'germany'];
    this.tier2Countries = ['netherlands', 'switzerland', 'singapore', 'france', 'japan'];
  }

  scoreAccount(account) {
    let breakdown = {
      vertical_fit: 0,
      company_scale: 0,
      demonstrated_problem: 0,
      buying_signals: 0,
      decision_maker: 0,
      geographic_fit: 0
    };

    // 1. Service & Vertical Alignment (0-20)
    const ind = (account.industry || '').toLowerCase();
    if (this.priorityVerticals.some(v => ind.includes(v))) {
      breakdown.vertical_fit = 20;
    } else if (account.has_digital_infrastructure || account.google_maps_audit) {
      breakdown.vertical_fit = 16;
    } else {
      breakdown.vertical_fit = 10;
    }

    // 2. Budget & Company Scale (0-20)
    const hc = parseInt(account.headcount, 10) || 0;
    if (hc >= 30 && hc <= 500) {
      breakdown.company_scale = 20;
    } else if ((hc >= 10 && hc < 30) || (hc > 500 && hc <= 1000)) {
      breakdown.company_scale = 16;
    } else if (hc > 0 && hc < 10) {
      breakdown.company_scale = 10;
    } else {
      breakdown.company_scale = 8;
    }

    // 3. Demonstrated Business Problem (0-20)
    if (account.google_maps_audit && account.google_maps_audit.weaknessesCount > 0) {
      // Direct empirical evidence from Google Maps digital audit
      breakdown.demonstrated_problem = account.google_maps_audit.severityBadge === 'CRITICAL_WEAKNESS' ? 20 : 16;
    } else if (account.verified_unfilled_job_req_days >= 35 || account.legacy_tech_stack_detected) {
      breakdown.demonstrated_problem = 20;
    } else if (account.rapid_facility_expansion_no_ops_hiring) {
      breakdown.demonstrated_problem = 12;
    } else if (account.general_operational_assumption) {
      breakdown.demonstrated_problem = 8;
    } else {
      breakdown.demonstrated_problem = 5;
    }

    // 4. Buying Signals & Timing Urgency (0-20)
    if (account.google_maps_audit && account.google_maps_audit.estimatedMonthlyLossUSD >= 5000) {
      breakdown.buying_signals = 20;
    } else if (account.c_suite_hired_last_90_days || account.ma_consolidation || account.rebrand_announced) {
      breakdown.buying_signals = 20;
    } else if (account.google_maps_audit || account.general_growth_announcement) {
      breakdown.buying_signals = 14;
    } else {
      breakdown.buying_signals = 8;
    }

    // 5. Decision Maker Accessibility (0-10)
    if (account.dm_verified_email && account.dm_linkedin_active) {
      breakdown.decision_maker = 10;
    } else if (account.dm_verified_email) {
      breakdown.decision_maker = 8;
    } else if (account.generic_email_only || account.decision_maker_email) {
      breakdown.decision_maker = 6;
    } else {
      breakdown.decision_maker = 2;
    }

    // 6. Geographic & Regulatory Fit (0-10)
    const country = (account.country || '').toLowerCase();
    if (this.tier1Countries.some(c => country.includes(c))) {
      breakdown.geographic_fit = 10;
    } else if (this.tier2Countries.some(c => country.includes(c))) {
      breakdown.geographic_fit = 8;
    } else {
      breakdown.geographic_fit = 5;
    }

    const totalScore = Object.values(breakdown).reduce((sum, pts) => sum + pts, 0);

    let tier = 'Tier C';
    let action = 'Passive Nurture (Quarterly Inbound Newsletter)';
    if (totalScore >= 80) {
      tier = 'Tier A';
      action = 'Immediate ABM (Personalized Weakness Teardown + Multi-Touch Sequence)';
    } else if (totalScore >= 60) {
      tier = 'Tier B';
      action = 'Semi-Automated Personalized Outbound Sequence';
    }

    return {
      company: account.company_name,
      total_score: totalScore,
      tier: tier,
      recommended_action: action,
      breakdown: breakdown
    };
  }
}

module.exports = ZenthraLeadScorer;
