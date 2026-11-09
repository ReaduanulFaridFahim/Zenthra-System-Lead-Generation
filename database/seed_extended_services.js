/**
 * Seeds extended services prospects (Services 8 to 12) into SQLite database.
 */
const db = require('./db');

function seedExtendedServices() {
  const accountsData = [
    {
      account_id: 'acc_srv8_prestige_dental',
      company_name: 'Prestige Dental & Aesthetic Surgery Clinic',
      domain: 'prestigedental-bh.com',
      industry: 'Healthcare & Specialized Practice',
      headcount: 45,
      country: 'United States',
      estimated_revenue_usd: 12000000,
      detected_tech_stack: { phone_system: 'Legacy PBX Voicemail', crm: 'Dentrix' },
      observed_signals: 'High patient complaints regarding missed calls after 5 PM and busy lines during lunch peak hours.',
      primary_matched_service: '24/7 AI Voice Receptionist & Phone Calling Agent',
      recommended_wedge: '3-Day AI Voice Receptionist Sprint',
      lead_score: 95,
      lead_tier: 'Tier A',
      contacts: [
        {
          contact_id: 'cnt_srv8_dr_sterling',
          first_name: 'Julian',
          last_name: 'Sterling',
          job_title: 'Medical Director & Founder',
          corporate_email: 'dr.sterling@prestigedental-bh.com',
          email_verification_status: 'VERIFIED_SMTP',
          linkedin_url: 'https://linkedin.com/in/dr-julian-sterling-md',
          subject: 'Eliminating after-hours voicemail drop-offs for Prestige Dental',
          body: `Hi Dr. Sterling,

I noticed Prestige Dental has high patient appointment demand in Beverly Hills, but after 5 PM incoming calls are routed to standard voicemail. Over 42% of aesthetic surgery consultations are booked in the evening when patients are off work.

At Zenthra Systems, we deploy human-parity 24/7 AI Voice Receptionists that answer calls in under 500ms, qualify treatment inquiries, and book directly onto your schedule with zero hold times.

Would you be open to a 5-minute interactive test call to hear the voice bot live?

Best regards,
Enterprise Solutions Practice
Zenthra Systems Solutions
connect.zenthra@gmail.com`
        }
      ]
    },
    {
      account_id: 'acc_srv9_emirates_exotics',
      company_name: 'Emirates Exotic Car Rentals LLC',
      domain: 'emiratesexotics-dxb.ae',
      industry: 'Luxury Automotive & Tourism',
      headcount: 35,
      country: 'United Arab Emirates',
      estimated_revenue_usd: 18000000,
      detected_tech_stack: { chat: 'Manual WhatsApp Business App', crm: 'None' },
      observed_signals: 'Overseas tourists inquiring on WhatsApp experience 5+ hour delays due to timezone differences, losing bookings to competitors.',
      primary_matched_service: 'WhatsApp & SMS AI Conversational Sales Engine',
      recommended_wedge: '5-Day WhatsApp & SMS Conversational Sales Sprint',
      lead_score: 98,
      lead_tier: 'Tier A',
      contacts: [
        {
          contact_id: 'cnt_srv9_rashid_falasi',
          first_name: 'Rashid',
          last_name: 'Al-Falasi',
          job_title: 'Head of Commercial Sales',
          corporate_email: 'rashid.falasi@emiratesexotics-dxb.ae',
          email_verification_status: 'VERIFIED_SMTP',
          linkedin_url: 'https://linkedin.com/in/rashid-al-falasi-dxb',
          subject: 'Sub-15s WhatsApp quote automation for luxury fleet inquiries',
          body: `Hi Rashid,

Managing a high-value exotic fleet in Dubai means VIP international tourists reach out via WhatsApp at all hours of the night from Europe and the Americas.

When inquiries sit unanswered for hours, prospective renters immediately message alternative rental providers in Business Bay.

We engineer automated WhatsApp & SMS AI Conversational Sales Bots that ingest your fleet availability, generate instant PDF quotations in chat, and send secure deposit links in under 15 seconds.

Would you have 10 minutes this week to test a simulated reservation on WhatsApp?

Best regards,
Enterprise Solutions Practice
Zenthra Systems Solutions
connect.zenthra@gmail.com`
        }
      ]
    },
    {
      account_id: 'acc_srv10_vanguard_legal',
      company_name: 'Vanguard Litigation & Corporate Counsel LLP',
      domain: 'vanguardlegal-ny.com',
      industry: 'Legal Services & Commercial Counsel',
      headcount: 85,
      country: 'United States',
      estimated_revenue_usd: 28000000,
      detected_tech_stack: { cms: 'WordPress 5.4', seo: 'Unoptimized' },
      observed_signals: 'Firm ranks on page 2 of Google Maps in Midtown Manhattan with only 18 reviews, while competing law firms capture the 3-Pack.',
      primary_matched_service: 'Google Maps Local 3-Pack & Review Velocity Domination',
      recommended_wedge: '14-Day Google Maps 3-Pack & Review Domination',
      lead_score: 92,
      lead_tier: 'Tier A',
      contacts: [
        {
          contact_id: 'cnt_srv10_arthur_sterling',
          first_name: 'Arthur',
          last_name: 'Sterling',
          job_title: 'Managing Partner',
          corporate_email: 'arthur.sterling@vanguardlegal-ny.com',
          email_verification_status: 'VERIFIED_SMTP',
          linkedin_url: 'https://linkedin.com/in/arthur-sterling-partner',
          subject: 'Securing Vanguard Legal in Midtown Manhattan\'s Google 3-Pack',
          body: `Hi Arthur,

I was reviewing commercial litigation practices in Midtown Manhattan on Google Maps. While Vanguard Legal has an exceptional corporate reputation, your Google Business Profile currently ranks outside the top 3 results due to review velocity drag.

The top 3 firms in the local 3-Pack capture over 70% of high-intent organic corporate counsel searches in NYC.

We deploy our 14-Day Google 3-Pack & Review Domination Sprint: automated SMS review generation for satisfied clients, local entity geotagging, and schema synchronization across 40+ verified legal directories.

Would you be open to a 5-minute review of your Manhattan map visibility audit?

Best regards,
Enterprise Solutions Practice
Zenthra Systems Solutions
connect.zenthra@gmail.com`
        }
      ]
    },
    {
      account_id: 'acc_srv11_apex_genomics',
      company_name: 'Apex Clinical Genomics & BioAnalytics',
      domain: 'apexgenomics-bio.com',
      industry: 'BioTech & Genomic Research',
      headcount: 140,
      country: 'United States',
      estimated_revenue_usd: 34000000,
      detected_tech_stack: { cloud: 'AWS & GCP', ai_usage: 'Ungoverned OpenAI API' },
      observed_signals: 'Researchers using public AI tools for genomic protocol summaries, creating severe HIPAA / SOC2 data leakage vulnerabilities.',
      primary_matched_service: 'Enterprise Cloud Security, Data Privacy & SOC2 Guardrails',
      recommended_wedge: '7-Day Enterprise Cloud Security & Compliance Hardening',
      lead_score: 100,
      lead_tier: 'Tier A',
      contacts: [
        {
          contact_id: 'cnt_srv11_samantha_reed',
          first_name: 'Samantha',
          last_name: 'Reed',
          job_title: 'Chief Information Security Officer',
          corporate_email: 'samantha.reed@apexgenomics-bio.com',
          email_verification_status: 'VERIFIED_SMTP',
          linkedin_url: 'https://linkedin.com/in/samantha-reed-ciso',
          subject: 'Zero-retention AI privacy guardrails for clinical genomic datasets',
          body: `Hi Samantha,

In life sciences and clinical research, unauthorized staff use of commercial LLMs creates massive compliance and IP forfeiture risks under HIPAA and SOC2.

Zenthra Systems architects isolated, private VPC AI gateways with hardware-level zero data retention, automated PII scrubbing, and real-time prompt telemetry.

We implement our 7-Day Enterprise Cloud Security Hardening sprint to guarantee your proprietary research never leaks to external training pools.

Would you be open to reviewing our technical security architecture whitepaper this week?

Best regards,
Enterprise Solutions Practice
Zenthra Systems Solutions
connect.zenthra@gmail.com`
        }
      ]
    },
    {
      account_id: 'acc_srv12_nordic_minimalist',
      company_name: 'Nordic Minimalist Apparel & Homewares',
      domain: 'nordicminimalist.se',
      industry: 'E-Commerce & Retail Brands',
      headcount: 55,
      country: 'Sweden',
      estimated_revenue_usd: 16000000,
      detected_tech_stack: { platform: 'Magento 2.4', checkout: 'Multi-step form' },
      observed_signals: 'Mobile checkout bounce rate exceeds 72% due to multi-step address fields and slow European payment gateway redirects.',
      primary_matched_service: 'E-Commerce Headless Replatforming & AI Checkout CRO',
      recommended_wedge: '7-Day Headless E-Commerce & Checkout CRO Sprint',
      lead_score: 96,
      lead_tier: 'Tier A',
      contacts: [
        {
          contact_id: 'cnt_srv12_lars_lindqvist',
          first_name: 'Lars',
          last_name: 'Lindqvist',
          job_title: 'VP of Digital Commerce',
          corporate_email: 'lars.lindqvist@nordicminimalist.se',
          email_verification_status: 'VERIFIED_SMTP',
          linkedin_url: 'https://linkedin.com/in/lars-lindqvist-ecom',
          subject: 'Recovering an estimated €16,000/mo in mobile checkout drop-offs',
          body: `Hi Lars,

Analyzing Nordic Minimalist's mobile shopping experience revealed significant friction across your multi-step checkout funnel. For high-growth Scandinavian brands, slow mobile checkout steps cause over 70% of shoppers to abandon carts.

We deploy our 7-Day Headless Checkout & CRO Sprint: replacing cumbersome forms with 1-click Apple Pay/Klarna express checkouts, sub-second edge page caching, and AI personalized cart bundles that increase Average Order Value by 18-28%.

Would you be open to a 10-minute teardown of the checkout friction audit for Nordic Minimalist?

Best regards,
Enterprise Solutions Practice
Zenthra Systems Solutions
connect.zenthra@gmail.com`
        }
      ]
    }
  ];

  for (const acc of accountsData) {
    db.insertAccount({
      account_id: acc.account_id,
      company_name: acc.company_name,
      domain: acc.domain,
      industry: acc.industry,
      headcount: acc.headcount,
      country: acc.country,
      estimated_revenue_usd: acc.estimated_revenue_usd,
      detected_tech_stack: acc.detected_tech_stack,
      observed_signals: acc.observed_signals,
      primary_matched_service: acc.primary_matched_service,
      recommended_wedge: acc.recommended_wedge,
      lead_score: acc.lead_score,
      lead_tier: acc.lead_tier,
      crm_status: 'READY_TO_EMAIL'
    });

    for (const c of acc.contacts) {
      db.insertContact({
        contact_id: c.contact_id,
        account_id: acc.account_id,
        first_name: c.first_name,
        last_name: c.last_name,
        job_title: c.job_title,
        corporate_email: c.corporate_email,
        email_verification_status: c.email_verification_status,
        linkedin_url: c.linkedin_url,
        outreach_status: 'READY_FOR_DRAFT'
      });

      db.insertDraft({
        draft_id: `drf_${c.contact_id}`,
        account_id: acc.account_id,
        contact_id: c.contact_id,
        channel: 'EMAIL',
        touch_number: 1,
        subject_line: c.subject,
        body_text: c.body,
        status: 'AWAITING_APPROVAL'
      });
    }
  }

  console.log(`[+] Seeded ${accountsData.length} extended service accounts & contacts.`);
}

if (require.main === module) {
  seedExtendedServices();
}

module.exports = { seedExtendedServices };
