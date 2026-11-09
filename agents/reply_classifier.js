/**
 * Agent 8: Inbound Reply Classifier
 * Categorizes prospect responses and formulates recommended sales actions.
 */

function classifyReply(rawText) {
  const text = (rawText || '').toLowerCase().trim();

  // 1. Opt-Out Detection
  if (text.includes('unsubscribe') || text.includes('remove') || text.includes('stop') || text.includes('do not contact') || text.includes('not interested')) {
    return {
      category: 'OPT_OUT',
      confidence: 0.98,
      recommended_action: 'SUPPRESS_IMMEDIATELY',
      suggested_reply: null,
      escalate_to_human: false
    };
  }

  // 2. High-Intent / Meeting Interest
  if (text.includes('sure') || text.includes('send over') || text.includes('free thursday') || text.includes('calendar') || text.includes('send details') || text.includes('sounds interesting') || text.includes('happy to chat') || text.includes('let us talk') || text.includes('available')) {
    return {
      category: 'INTERESTED',
      confidence: 0.92,
      recommended_action: 'SCHEDULE_DISCOVERY_CALL',
      suggested_reply: "Great to connect. You can pick any 15-minute slot that fits your schedule directly on our calendar here: https://calendly.com/zenthra-systems/discovery. Looking forward to our conversation.",
      escalate_to_human: true
    };
  }

  // 3. Referral / Wrong Person
  if (text.includes('reach out to') || text.includes('contact') || text.includes('not my department') || text.includes('speak with') || text.includes('forwarded')) {
    return {
      category: 'WRONG_PERSON',
      confidence: 0.88,
      recommended_action: 'ROUTE_TO_REFERRED_CONTACT',
      suggested_reply: "Thank you for pointing me in the right direction! I will reach out to them directly.",
      escalate_to_human: true
    };
  }

  // 4. Objections: Internal Team
  if (text.includes('in-house') || text.includes('internal team') || text.includes('already have') || text.includes('our own developers')) {
    return {
      category: 'OBJECTION_INTERNAL_TEAM',
      confidence: 0.85,
      recommended_action: 'SEND_STRIKE_TEAM_POSITIONING',
      suggested_reply: "Understood! Most clients we work with have strong internal engineering teams. We act as a dedicated strike team to deliver internal BI or automation systems without diverting your engineers from your core product roadmap.",
      escalate_to_human: true
    };
  }

  // 5. Objections: Timing / Budget
  if (text.includes('no budget') || text.includes('next quarter') || text.includes('later this year') || text.includes('too busy') || text.includes('q3') || text.includes('q4')) {
    return {
      category: 'OBJECTION_TIMING',
      confidence: 0.82,
      recommended_action: 'SCHEDULE_NURTURE_TOUCHPOINT',
      suggested_reply: "Completely understand. I will put a note to check back in when planning for next quarter begins. In the meantime, I am happy to share our 4-page planning framework if that is helpful for your team.",
      escalate_to_human: true
    };
  }

  // Fallback: Ambiguous
  return {
    category: 'AMBIGUOUS',
    confidence: 0.50,
    recommended_action: 'MANUAL_HUMAN_REVIEW',
    suggested_reply: null,
    escalate_to_human: true
  };
}

module.exports = { classifyReply };
