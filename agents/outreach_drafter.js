/**
 * Agent 6: Personalized Outreach Drafter
 * Generates bespoke, research-grounded outreach copy awaiting human SDR approval.
 * Integrates directly with Google Maps digital weakness audits.
 */

function draftOutreach(account, contact, matchedServiceInfo) {
  const firstName = contact.first_name || 'there';
  const company = account.company_name;
  const service = matchedServiceInfo.matched_service || account.primary_matched_service || 'Technology Services';
  const wedge = matchedServiceInfo.recommended_wedge || account.recommended_wedge || 'Operational Optimization Sprint';

  // If a Google Maps Weakness Audit was performed, use its bespoke weakness-hooked proposal pitch
  if (account.google_maps_audit && account.google_maps_audit.proposalPitch) {
    const pitch = account.google_maps_audit.proposalPitch;
    return {
      touch_1_email: {
        subject: pitch.subject,
        body: pitch.body
      },
      touch_2_email: {
        subject: `Following up regarding ${company}'s digital workflow in ${account.city || 'your area'}`,
        body: `Hi ${firstName},\n\nFollowing up on my previous note. Operators in ${account.industry} typically find that resolving the intake & communication bottlenecks on their Google Maps listing adds 15-20% more billable appointments within the first 30 days.\n\nWould you be open to a 10-minute preview of the live system this week?\n\nBest regards,\nZenthra Systems Enterprise Solutions\nsupport@zenthra.systems`
      },
      linkedin_note: pitch.linkedin
    };
  }

  let touch1 = {
    subject: `Question regarding ${company}'s operational visibility`,
    body: `Hi ${firstName},\n\nI noticed ${company}'s focus on scaling operations in ${account.country}.\n\nWhen mid-market teams expand, operational data across fragmented systems typically costs leaders 12-15 hours each week in manual reconciliation.\n\nAt Zenthra Systems, we engineer automated ${service} architectures. We recently helped a similar operator eliminate manual data assembly using our ${wedge}.\n\nWould it make sense to review a 3-minute video teardown of how this connects directly to your existing systems?\n\nBest regards,\nZenthra Systems Enterprise Sales\nhttps://zenthra.systems\n\n(Reply 'unsubscribe' to opt out.)`
  };

  if (service.includes('Power BI')) {
    touch1 = {
      subject: `Question regarding ${company}'s reporting latency`,
      body: `Hi ${firstName},\n\nI noticed ${company} manages complex multi-unit operations in ${account.city || account.country}.\n\nConsolidating disparate dispatch, financial, and operational metrics in manual Excel sheets typically costs management 12-15 hours each week in delayed reporting.\n\nAt Zenthra Systems, we engineer automated Microsoft Power BI architectures. We recently helped a peer company eliminate spreadsheet assembly using our ${wedge}.\n\nWould it make sense to review a 3-minute video teardown of how this connects directly to your ERP?\n\nBest regards,\nZenthra Systems Enterprise Sales\nhttps://zenthra.systems\n\n(Reply 'unsubscribe' to opt out.)`
    };
  } else if (service.includes('AI Agents') || service.includes('Automation')) {
    touch1 = {
      subject: `Automating customer intake & booking at ${company}`,
      body: `Hi ${firstName},\n\nIn reviewing ${company}'s presence in ${account.city || account.country}, I noticed your team manages substantial client inquiries.\n\nFor service operators scaling past ${account.headcount || 25} staff, manual phone intake and after-hours delays create missed bookings and administrative fatigue.\n\nAt Zenthra Systems, we deploy custom 24/7 AI intake agents that capture inquiries, qualify prospects, and book appointments automatically.\n\nWould you be open to reviewing an interactive demo of how this captures after-hours inquiries for ${account.industry} operators?\n\nBest regards,\nZenthra Systems Automation Practice\n\n(Reply 'unsubscribe' to opt out.)`
    };
  } else if (service.includes('Web')) {
    touch1 = {
      subject: `Modernizing ${company}'s web portal & mobile conversion`,
      body: `Hi ${firstName},\n\nI was analyzing high-growth ${account.industry} businesses in ${account.city || account.country}.\n\nHigh-intent prospective clients researching your services on mobile expect a fast, modern digital portal to view credentials and request quotes. Lacking a responsive mobile flow leads to significant inquiry drop-off.\n\nAt Zenthra Systems, we build high-converting, modern business web portals and customer self-service portals deployed in rapid 7-day sprints.\n\nWould you be open to seeing a 2-minute prototype we built for similar ${account.industry} leaders?\n\nBest regards,\nZenthra Systems Digital Engineering\nhttps://zenthra.systems\n\n(Reply 'unsubscribe' to opt out.)`
    };
  } else if (service.includes('Generative AI') || service.includes('RAG')) {
    touch1 = {
      subject: `Private enterprise RAG architecture for ${company}`,
      body: `Hi ${firstName},\n\nMost technology leaders we speak with want internal generative AI search across proprietary documentation and tickets, but are blocked by data privacy, role permissions, and hallucination risks.\n\nZenthra Systems designs private, SOC2-aligned Retrieval-Augmented Generation (RAG) architectures deployed directly in your private cloud (AWS/GCP/Azure). Your enterprise IP never touches public training loops.\n\nCan I send over the technical architecture brief for your engineering team?\n\nBest regards,\nZenthra Systems AI Practice\nhttps://zenthra.systems\n\n(Reply 'unsubscribe' to opt out.)`
    };
  }

  const touch2 = {
    subject: `Following up on ${company}'s operational visibility`,
    body: `Hi ${firstName},\n\nFollowing up on my previous note. Most leaders in ${account.industry} want live executive visibility without waiting for month-end close or hiring additional reporting analysts.\n\nIf you are open to it, I can share a sample interactive dashboard framework designed specifically for ${account.industry} operations.\n\nAre you free for 10 minutes this Thursday afternoon?\n\nBest,\nZenthra Systems`
  };

  const linkedin = `Hi ${firstName}, saw your focus on operational scale at ${company}. We help ${account.industry} leaders eliminate manual data debt with custom ${service} workflows. Would love to connect and share notes.`;

  return {
    touch_1_email: touch1,
    touch_2_email: touch2,
    linkedin_note: linkedin
  };
}

module.exports = { draftOutreach };
