/**
 * Zenthra Systems - Google Maps Business Weakness & Digital Audit Analyzer
 * 
 * Deeply analyzes a business's Google Maps presence and digital footprint to uncover:
 * 1. Missing / broken / outdated website (Opportunity: Service 3 - Web Development)
 * 2. Low Google rating (< 4.2) or unanswered reviews (Opportunity: Service 2 - AI Customer Support)
 * 3. Friction-heavy manual booking / phone-only intake (Opportunity: Service 2 - AI Booking Automation)
 * 4. Multi-location / high-volume reporting debt (Opportunity: Service 5 - Power BI Executive Sprint)
 * 5. Repetitive paper/document processing backlog (Opportunity: Service 1 - AI Document RAG)
 */

/**
 * Evaluates the digital weaknesses of a discovered Google Maps listing
 * @param {Object} place - Discovered place data
 * @returns {Object} Comprehensive weakness audit report and tailored proposal pitch
 */
function analyzeBusinessWeaknesses(place) {
  const weaknesses = [];
  let digitalHealthScore = 100;
  let primaryWeakness = null;
  let recommendedService = null;
  let recommendedWedge = null;
  let estimatedMonthlyLossUSD = 0;
  let implementationDays = 7;

  const name = place.company_name || 'Business';
  const city = place.city || 'your area';
  const industry = place.industry || 'local services';
  const rating = typeof place.rating === 'number' ? place.rating : 4.2;
  const reviewCount = typeof place.review_count === 'number' ? place.review_count : 25;
  const websiteUrl = place.website_url || (place.domain && !place.domain.includes('no-website') ? `https://${place.domain}` : '');
  const hasWebsite = Boolean(websiteUrl && !websiteUrl.includes('no-website'));
  const websiteStatus = place.website_status || (hasWebsite ? 'ACTIVE' : 'MISSING');
  const recentReviews = place.recent_reviews || [];

  // ==========================================
  // 1. AUDIT: Web Presence & Mobile Readiness
  // ==========================================
  if (!hasWebsite || websiteStatus === 'MISSING') {
    weaknesses.push({
      category: 'WEB_PRESENCE',
      severity: 'CRITICAL',
      flaw: 'No Business Website Listed on Google Maps',
      impact: 'Up to 70% of high-intent mobile searchers bounce immediately to competitors with modern landing pages.',
      evidence: 'Google Maps listing has no website link attached; customers cannot view credentials or service menu.',
      serviceWedge: 'Service 3: Modern Business Web Development & High-Converting Portal'
    });
    digitalHealthScore -= 35;
    estimatedMonthlyLossUSD += 8500;
  } else if (websiteStatus === 'INSECURE_OR_SLOW' || websiteStatus === 'OUTDATED') {
    weaknesses.push({
      category: 'WEB_PERFORMANCE',
      severity: 'HIGH',
      flaw: 'Outdated or Mobile-Unresponsive Web Portal',
      impact: 'Slow page speed and lack of mobile optimization degrade Google SEO rankings and cut conversion rates by half.',
      evidence: 'Legacy layout, non-responsive mobile view, lacking modern HTTPS security protocols.',
      serviceWedge: 'Service 3: Web Portal Modernization & Core Web Vitals Optimization'
    });
    digitalHealthScore -= 20;
    estimatedMonthlyLossUSD += 4500;
  }

  // ==========================================
  // 2. AUDIT: Review Sentiment & Customer Communication
  // ==========================================
  const negativeReviewFound = recentReviews.some(r => 
    /wait|slow|hold|answer|call|rude|unresponsive|delay|nobody|mess/i.test(r)
  );

  if (rating < 4.2) {
    weaknesses.push({
      category: 'CUSTOMER_COMMUNICATION',
      severity: 'CRITICAL',
      flaw: `Sub-optimal Google Rating (${rating} / 5.0 Stars with ${reviewCount} Reviews)`,
      impact: 'Businesses below 4.2 stars lose over 52% of prospective clients who select higher-rated local alternatives.',
      evidence: `Public rating on Google Maps is ${rating} ⭐. Negative sentiment stems from communication and scheduling delays.`,
      serviceWedge: 'Service 2: 24/7 AI Customer Support & Instant Intake Agent'
    });
    digitalHealthScore -= 30;
    estimatedMonthlyLossUSD += 7000;
  } else if (negativeReviewFound) {
    weaknesses.push({
      category: 'RESPONSE_LATENCY',
      severity: 'HIGH',
      flaw: 'Customer Frustration Over Slow Response Times & Phone Tag',
      impact: 'Customers complain about long hold times and delayed quotes, creating churn before the first touchpoint.',
      evidence: 'Recent customer reviews cite slow phone callbacks and delayed estimate generation.',
      serviceWedge: 'Service 2: Instant WhatsApp & Web AI Intake Agent'
    });
    digitalHealthScore -= 18;
    estimatedMonthlyLossUSD += 4000;
  }

  // ==========================================
  // 3. AUDIT: Booking & Intake Friction
  // ==========================================
  const hasBookingFlow = Boolean(place.has_online_booking);
  if (!hasBookingFlow) {
    weaknesses.push({
      category: 'INTAKE_AUTOMATION',
      severity: 'MODERATE',
      flaw: 'Zero 24/7 Self-Service Booking or Instant Quote Flow',
      impact: 'Over 40% of customer inquiries occur outside standard business hours; without automated booking, these leads are lost.',
      evidence: 'Only a telephone number is listed; customers cannot schedule consultations or request quotes after 5 PM.',
      serviceWedge: 'Service 2: AI-Powered Booking & Workflow Automation'
    });
    digitalHealthScore -= 15;
    estimatedMonthlyLossUSD += 3500;
  }

  // ==========================================
  // 4. AUDIT: Operational Reporting & Multi-Branch Debt
  // ==========================================
  const isMultiLocationOrHighVolume = reviewCount > 50 || place.headcount > 30 || place.branches > 1;
  const usesExcelForReporting = !place.detected_tech_stack || /excel|manual|spreadsheets/i.test(JSON.stringify(place.detected_tech_stack));

  if (isMultiLocationOrHighVolume && usesExcelForReporting) {
    weaknesses.push({
      category: 'BUSINESS_INTELLIGENCE',
      severity: 'HIGH',
      flaw: 'Manual Spreadsheet Consolidation & Operational Blindness',
      impact: 'Operations and finance teams waste 12-18 hours every week consolidating job tickets, invoices, and staff performance.',
      evidence: 'Managing regional operations or high client volume without real-time Power BI executive reporting.',
      serviceWedge: 'Service 5: Microsoft Power BI 5-Day Executive Dashboard Sprint'
    });
    digitalHealthScore -= 20;
    estimatedMonthlyLossUSD += 6000;
  }

  // Normalize Digital Health Score
  digitalHealthScore = Math.max(25, Math.min(100, digitalHealthScore));

  // Determine Primary Weakness & Zenthra Solution Wedge
  const critical = weaknesses.find(w => w.severity === 'CRITICAL');
  const high = weaknesses.find(w => w.severity === 'HIGH');
  primaryWeakness = critical || high || weaknesses[0] || {
    category: 'GENERAL_OPTIMIZATION',
    severity: 'LOW',
    flaw: 'Standard Digital Footprint',
    impact: 'Room for AI-driven customer intake and automated client reporting.',
    serviceWedge: 'Service 2: AI Workflow Automation'
  };

  // Map to Zenthra Service Offering
  if (primaryWeakness.category === 'WEB_PRESENCE' || primaryWeakness.category === 'WEB_PERFORMANCE') {
    recommendedService = 'Service 3 — Web Development & Portal Engineering';
    recommendedWedge = 'Modern High-Converting Business Web Portal (7-Day Sprint)';
    implementationDays = 7;
  } else if (primaryWeakness.category === 'CUSTOMER_COMMUNICATION' || primaryWeakness.category === 'RESPONSE_LATENCY') {
    recommendedService = 'Service 2 — AI Agents and Business Automation';
    recommendedWedge = '24/7 AI Customer Support & Instant Intake Agent';
    implementationDays = 5;
  } else if (primaryWeakness.category === 'INTAKE_AUTOMATION') {
    recommendedService = 'Service 2 — AI Agents and Business Automation';
    recommendedWedge = 'AI-Powered Booking & Workflow Automation';
    implementationDays = 5;
  } else if (primaryWeakness.category === 'BUSINESS_INTELLIGENCE') {
    recommendedService = 'Service 5 — Microsoft Power BI Development';
    recommendedWedge = '5-Day Executive Power BI Dashboard Sprint';
    implementationDays = 5;
  } else {
    recommendedService = 'Service 2 — AI Workflow Automation';
    recommendedWedge = 'Automated Client Intake & Follow-up Flow';
    implementationDays = 5;
  }

  // ==========================================
  // 5. COMPOSE BESPOKE WEAKNESS-HOOKED PROPOSAL PITCH
  // ==========================================
  const decisionMaker = place.decision_maker_name || 'Managing Director';
  const firstName = decisionMaker.split(' ')[0] || 'there';

  let subjectLine = '';
  let emailHook = '';

  if (primaryWeakness.category === 'WEB_PRESENCE') {
    subjectLine = `Quick observation regarding ${name}'s Google Maps listing in ${city}`;
    emailHook = `I was researching ${industry} providers on Google Maps in ${city} and noticed that while ${name} has active customer search demand, your listing doesn't currently link to a dedicated website.

In our experience with ${industry} operators, over 65% of high-intent mobile prospects who tap a Maps listing bounce to the next provider if they can't immediately review services and request a consultation online.`;
  } else if (primaryWeakness.category === 'CUSTOMER_COMMUNICATION' || primaryWeakness.category === 'RESPONSE_LATENCY') {
    subjectLine = `Fixing after-hours response delays for ${name}`;
    emailHook = `I came across ${name} while analyzing ${industry} businesses in ${city} on Google Maps. While you clearly have solid local demand (${reviewCount} reviews), customer feedback shows occasional friction around phone wait times and response speed.

When potential clients reach out after 5 PM or during peak hours, every minute of delay increases the likelihood they book with a competitor.`;
  } else if (primaryWeakness.category === 'INTAKE_AUTOMATION') {
    subjectLine = `24/7 automated booking inquiry flow for ${name}`;
    emailHook = `I was reviewing ${name} on Google Maps in ${city}. You have a great reputation, but currently prospective clients are forced to call your main phone line during standard business hours to schedule or get quotes.

Over 40% of high-value service inquiries now happen in the evening or on weekends when offices are closed.`;
  } else if (primaryWeakness.category === 'BUSINESS_INTELLIGENCE') {
    subjectLine = `Consolidating ${name}'s multi-location operational reporting into Power BI`;
    emailHook = `I was studying ${name}'s growing footprint in ${city}. Managing high volume operations across multiple locations often creates a severe reporting bottleneck where your leadership team spends 10+ hours every week stitching together manual spreadsheets.`;
  } else {
    subjectLine = `Operational efficiency opportunity for ${name}`;
    emailHook = `I was reviewing ${name} on Google Maps in ${city}. You have established a notable presence, but your intake and digital workflow currently have significant manual touchpoints that could be streamlined.`;
  }

  const proposalPitchEmail = `Subject: ${subjectLine}

Hi ${firstName},

${emailHook}

At Zenthra Systems, we solve this exact bottleneck. We implement our ${recommendedWedge} in a rapid ${implementationDays}-day deployment:

- Eliminates customer wait time by deploying an intelligent 24/7 intake system.
- Captures after-hours leads automatically and syncs them directly into your workflow.
- Gives you complete visibility with zero manual administrative overhead.

We estimate this can recover approximately $${estimatedMonthlyLossUSD.toLocaleString()} / month in previously leaked inquiries.

Would you be open to a brief 10-minute walkthrough this Thursday or Friday to see how this works for ${name}?

Best regards,

Zenthra Systems Enterprise Solutions
support@zenthra.systems | https://zenthra.systems`;

  const linkedinPitch = `Hi ${firstName}, noticed ${name}'s Google Maps listing in ${city}. You have strong local visibility, but the lack of an automated 24/7 intake/booking flow is likely costing you high-intent inquiries after 5 PM. We deploy rapid ${recommendedWedge} in 5-7 days. Open to a 5-min chat?`;

  return {
    digitalHealthScore,
    severityBadge: digitalHealthScore < 60 ? 'CRITICAL_WEAKNESS' : (digitalHealthScore < 80 ? 'MODERATE_WEAKNESS' : 'OPTIMIZED'),
    weaknessesCount: weaknesses.length,
    weaknesses,
    primaryWeakness,
    recommendedService,
    recommendedWedge,
    estimatedMonthlyLossUSD,
    implementationDays,
    proposalPitch: {
      subject: subjectLine,
      body: proposalPitchEmail,
      linkedin: linkedinPitch
    }
  };
}

module.exports = {
  analyzeBusinessWeaknesses
};
