/**
 * Agent 5: Lead Qualification & 100-Point Scorer
 * Scores accounts using the deterministic 100-point rubric.
 * Intelligently extracts signal indicators from textual research if explicit flags are missing.
 */

const ZenthraLeadScorer = require('../analytics/lead_scorer');

function extractSignals(dossier) {
  const normalized = { ...dossier };
  const text = (dossier.observed_signals || '').toLowerCase();

  // Infer unfilled job requisitions
  if (normalized.verified_unfilled_job_req_days === undefined) {
    if (text.includes('job opening') || text.includes('hiring') || text.includes('requisition') || text.includes('seeking')) {
      const match = text.match(/(\d+)\s*days?/);
      normalized.verified_unfilled_job_req_days = match ? parseInt(match[1], 10) : 40;
    } else {
      normalized.verified_unfilled_job_req_days = 0;
    }
  }

  // Infer C-suite or leadership changes
  if (normalized.c_suite_hired_last_90_days === undefined) {
    normalized.c_suite_hired_last_90_days = text.includes('cfo') || text.includes('coo') || text.includes('cto') || text.includes('vp') || text.includes('hired') || text.includes('appointed');
  }

  // Infer decision-maker accessibility
  if (normalized.dm_verified_email === undefined) {
    normalized.dm_verified_email = !!(dossier.decision_maker_email && dossier.decision_maker_email.includes('@'));
  }
  if (normalized.dm_linkedin_active === undefined) {
    normalized.dm_linkedin_active = !!(dossier.decision_maker_linkedin || text.includes('linkedin'));
  }

  return normalized;
}

function qualifyLead(accountDossier) {
  const preparedDossier = extractSignals(accountDossier);
  const scorer = new ZenthraLeadScorer();
  const evaluation = scorer.scoreAccount(preparedDossier);

  return {
    account_id: accountDossier.account_id,
    company_name: accountDossier.company_name,
    total_score: evaluation.total_score,
    tier: evaluation.tier,
    breakdown: evaluation.breakdown,
    action: evaluation.recommended_action,
    qualified: evaluation.total_score >= 60
  };
}

module.exports = { qualifyLead };
