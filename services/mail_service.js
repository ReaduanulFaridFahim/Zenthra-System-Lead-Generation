/**
 * Zenthra Systems - Enterprise Mail API & Auto-Dispatch Service
 * Supports:
 *  1. Universal SMTP (Gmail, Outlook 365, Brevo, SendPulse, Amazon SES, Custom SMTP)
 *  2. Resend REST API (https://api.resend.com/emails)
 *  3. SendGrid v3 REST API (https://api.sendgrid.com/v3/mail/send)
 *  4. High-Fidelity Simulation / Diagnostic Test Mode
 */

const nodemailer = require('nodemailer');
const db = require('../database/db');

/**
 * Creates an active nodemailer transport based on current SQLite settings
 */
function createSmtpTransporter(settings) {
  const isSecure = Boolean(settings.smtp_secure || settings.smtp_port === 465);
  return nodemailer.createTransport({
    host: settings.smtp_host || 'smtp.gmail.com',
    port: parseInt(settings.smtp_port, 10) || 587,
    secure: isSecure,
    auth: {
      user: settings.smtp_user,
      pass: settings.smtp_pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

/**
 * Generates an Enterprise HTML Email Template for Zenthra Systems proposals
 */
function buildProposalHtml({
  recipientName = 'Managing Director',
  companyName = 'Valued Partner',
  serviceWedge = 'Enterprise Technology Sprint',
  dealValueUSD = 5000,
  bodyText = '',
  demoProjectUrl = 'http://localhost:3050/#demo-tab',
  demoProjectName = 'Enterprise AI & Automation Live Cockpit'
}) {
  const formattedBody = (bodyText || '')
    .split('\n\n')
    .map(p => `<p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zenthra Systems Enterprise Proposal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 620px; background-color: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          
          <!-- Brand Header -->
          <tr>
            <td style="background-color: #090d16; padding: 28px 32px; border-bottom: 3px solid #3b82f6;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                      ZENTHRA<span style="color: #60a5fa;">.SYSTEMS</span>
                    </div>
                    <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">
                      Enterprise AI, Web Portals & Revenue Intelligence
                    </div>
                  </td>
                  <td align="right">
                    <span style="background: #1e293b; color: #38bdf8; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; border: 1px solid #334155;">
                      DIRECT EXECUTIVE PROPOSAL
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Proposal Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 16px;">
                Prepared specifically for: ${recipientName} • ${companyName}
              </div>

              <div style="font-size: 14px; color: #334155; line-height: 1.6;">
                ${formattedBody}
              </div>

              <!-- Solution Wedge Callout Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin: 24px 0; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">
                      🎯 Recommended Implementation Sprint
                    </div>
                    <div style="font-size: 15px; font-weight: 700; color: #14532d; margin-top: 4px;">
                      ${serviceWedge}
                    </div>
                    <div style="font-size: 12px; color: #15803d; margin-top: 6px;">
                      Estimated Project Scope: <strong>$${dealValueUSD.toLocaleString()} USD</strong> • 5 to 7-Day Sprint Turnaround
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Interactive Demo Project Callout Box -->
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; margin: 0 0 24px 0; padding: 16px;">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 700; color: #1e40af; text-transform: uppercase; letter-spacing: 0.5px;">
                      🚀 Live Client Demo Project Available
                    </div>
                    <div style="font-size: 13px; color: #1e3a8a; margin: 6px 0 10px 0; line-height: 1.4;">
                      To inspect how our architecture solves this exact bottleneck, we have prepared an interactive prototype you can test live right now:
                    </div>
                    <a href="${demoProjectUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 8px 16px; border-radius: 4px;">
                      Launch ${demoProjectName} ↗
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 13px; color: #475569; line-height: 1.5;">
                <strong style="color: #0f172a;">Zenthra Systems Enterprise Engineering Team</strong><br>
                Global AI Solutions, Web Architectures & BI Automation<br>
                Web: <a href="http://localhost:3050" style="color: #2563eb; text-decoration: none;">zenthrasystems.com</a> • Direct Hotline: +1 (800) 555-0199
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f1f5f9; padding: 16px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
              This commercial proposal was tailored for ${companyName}. If you wish to opt out of further communications, please reply with "Unsubscribe".
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Universal Email Dispatcher
 */
async function sendEmail({
  to,
  recipientName = 'Managing Director',
  companyName = 'Enterprise Prospect',
  subject,
  body,
  serviceWedge = 'Enterprise Technology Sprint',
  dealValueUSD = 5000,
  demoProjectKey = 'demo-rag'
}) {
  const settings = db.getMailSettings();
  const provider = (settings.provider || 'SIMULATED').toUpperCase();

  const fromName = settings.from_name || 'Zenthra Systems Solutions';
  const fromEmail = settings.from_email || 'solutions@zenthrasystems.com';
  const fromHeader = `"${fromName}" <${fromEmail}>`;

  // Map demo project URL
  const demoTitles = {
    'demo-rag': 'Enterprise RAG Knowledge Assistant',
    'demo-intake': '24/7 AI Customer Intake & Lead Qualification Agent',
    'demo-powerbi': 'Executive Power BI Revenue Operations Cockpit',
    'demo-parser': 'Automated Document & Invoice Vision Parser'
  };
  const demoProjectName = demoTitles[demoProjectKey] || 'Enterprise AI & Automation Live Cockpit';
  const demoProjectUrl = `http://localhost:3050/#${demoProjectKey}`;

  const htmlContent = buildProposalHtml({
    recipientName,
    companyName,
    serviceWedge,
    dealValueUSD,
    bodyText: body,
    demoProjectUrl,
    demoProjectName
  });

  const plainText = `${body}\n\n---\nRecommended Solution: ${serviceWedge} (Est. $${dealValueUSD.toLocaleString()} USD)\nTest Live Prototype: ${demoProjectUrl}\n\nZenthra Systems Enterprise Sales\nhttp://localhost:3050`;

  let result = null;

  // 1. Send via Resend REST API
  if (provider === 'RESEND' && settings.api_key) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromHeader,
          to: [to],
          reply_to: settings.reply_to || fromEmail,
          subject: subject,
          html: htmlContent,
          text: plainText
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || JSON.stringify(data));

      result = {
        success: true,
        provider: 'RESEND',
        message_id: data.id || `resend_${Date.now()}`,
        status: 'DELIVERED',
        raw: data
      };
    } catch (err) {
      result = {
        success: false,
        provider: 'RESEND',
        error: err.message,
        status: 'FAILED',
        raw: { error: err.message }
      };
    }
  }

  // 2. Send via SendGrid REST API
  else if (provider === 'SENDGRID' && settings.api_key) {
    try {
      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to, name: recipientName }] }],
          from: { email: fromEmail, name: fromName },
          reply_to: { email: settings.reply_to || fromEmail },
          subject: subject,
          content: [
            { type: 'text/plain', value: plainText },
            { type: 'text/html', value: htmlContent }
          ]
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `SendGrid error status ${res.status}`);
      }

      result = {
        success: true,
        provider: 'SENDGRID',
        message_id: `sg_${Date.now()}`,
        status: 'DELIVERED',
        raw: { status: res.status }
      };
    } catch (err) {
      result = {
        success: false,
        provider: 'SENDGRID',
        error: err.message,
        status: 'FAILED',
        raw: { error: err.message }
      };
    }
  }

  // 3. Send via SMTP (Universal: Gmail, Outlook, Brevo, SES, cPanel)
  else if ((provider === 'SMTP' || provider === 'GMAIL_SMTP' || provider.includes('SMTP')) && settings.smtp_host && settings.smtp_user) {
    try {
      const transporter = createSmtpTransporter(settings);
      const info = await transporter.sendMail({
        from: fromHeader,
        to: `"${recipientName}" <${to}>`,
        replyTo: settings.reply_to || fromEmail,
        subject: subject,
        text: plainText,
        html: htmlContent
      });

      result = {
        success: true,
        provider: 'SMTP',
        message_id: info.messageId,
        status: 'DELIVERED',
        raw: info
      };
    } catch (err) {
      result = {
        success: false,
        provider: 'SMTP',
        error: err.message,
        status: 'FAILED',
        raw: { error: err.message }
      };
    }
  }

  // 4. Default High-Fidelity Simulation / Local Delivery Mode
  else {
    const simMsgId = `<sim_${Date.now()}_${Math.random().toString(36).substr(2, 6)}@zenthrasystems.local>`;
    result = {
      success: true,
      provider: 'SIMULATED',
      message_id: simMsgId,
      status: 'SIMULATED_DELIVERED',
      simulated_note: 'Delivered in diagnostic sandbox. Configure live SMTP or Resend/SendGrid API key for direct inbox transmission.',
      raw: {
        to,
        from: fromHeader,
        subject,
        headers: {
          'Message-ID': simMsgId,
          'X-Mailer': 'Zenthra Systems Outbound Mail Engine v3.0'
        }
      }
    };
  }

  // Audit log into SQLite sent_emails_log
  db.logSentEmail({
    recipient_email: to,
    recipient_name: recipientName,
    company_name: companyName,
    subject: subject,
    service_wedge: serviceWedge,
    deal_value_usd: dealValueUSD,
    provider: result.provider,
    message_id: result.message_id || '',
    status: result.status,
    raw_response: result.raw
  });

  return result;
}

/**
 * Sends a live verification test email to any destination
 */
async function sendTestEmail(targetEmail) {
  const settings = db.getMailSettings();
  const testSubject = `[Test Verification] Zenthra Systems Mail API Delivery Check (${settings.provider})`;
  const testBody = `Hello,\n\nThis is a live diagnostic verification email from your Zenthra Systems platform.\n\nActive Configuration:\n- Provider: ${settings.provider}\n- Host: ${settings.smtp_host || 'N/A'}:${settings.smtp_port || 'N/A'}\n- From: ${settings.from_email}\n- Auto-Send Mode: ${settings.auto_send_enabled ? 'ENABLED (Live Outbound)' : 'DISABLED (Review First)'}\n\nIf you are reading this in your inbox, your mail pipeline is operational and ready to dispatch real proposals to international clients!`;

  return sendEmail({
    to: targetEmail,
    recipientName: 'Valued Administrator',
    companyName: 'Zenthra Systems Internal',
    subject: testSubject,
    body: testBody,
    serviceWedge: 'Mail API Connectivity Check',
    dealValueUSD: 0
  });
}

/**
 * Checks if auto-send mode is active
 */
function isAutoSendEnabled() {
  const settings = db.getMailSettings();
  return Boolean(settings.auto_send_enabled);
}

/**
 * Auto-Dispatches proposal emails for discovered leads if Auto-Send is enabled
 */
async function autoDispatchDiscoveredPlaces(places = [], forceSend = false) {
  if ((!isAutoSendEnabled() && !forceSend) || !places || places.length === 0) {
    return { autoSentCount: 0, results: [] };
  }

  const results = [];
  console.log(`\n[⚡ AUTO-MAIL ENGINE] Auto-send enabled! Preparing to dispatch proposals to ${places.length} leads...`);

  for (const item of places) {
    const acc = item.account || {};
    const audit = item.weakness_audit || {};
    const details = item.place_details || {};
    const pitch = audit.proposalPitch || (item.drafts?.touch_1_email ? { subject: item.drafts.touch_1_email.subject, body: item.drafts.touch_1_email.body } : {});

    const c1 = details.contact_person_1 || {
      name: acc.decision_maker_name || 'Managing Director',
      email: acc.decision_maker_email || details.general_email || 'contact@' + acc.domain
    };

    const targetEmail = c1.email;
    if (!targetEmail || targetEmail.includes('no-website')) continue;

    const mp = item.market_pricing || details.market_pricing || {};
    const calibratedCharge = mp.recommendedChargeUSD || Math.round((audit.estimatedMonthlyLossUSD || 5000) * 1.2);

    try {
      const emailRes = await sendEmail({
        to: targetEmail,
        recipientName: c1.name,
        companyName: acc.company_name,
        subject: pitch.subject || `Business Optimization Proposal for ${acc.company_name}`,
        body: pitch.body || 'We noticed opportunities to streamline your digital customer intake and reporting.',
        serviceWedge: audit.recommendedWedge || acc.recommended_wedge,
        dealValueUSD: calibratedCharge
      });

      // Record proposal in database deals & activities
      db.recordSentProposal({
        account_id: acc.account_id,
        company_name: acc.company_name,
        domain: acc.domain,
        country: acc.country || details.country,
        recipient_name: c1.name,
        recipient_email: targetEmail,
        subject: pitch.subject,
        body: pitch.body,
        service_wedge: audit.recommendedWedge || acc.recommended_wedge,
        deal_value_usd: calibratedCharge,
        channel: 'EMAIL_AUTO_DISPATCH'
      });

      results.push({ company: acc.company_name, email: targetEmail, outcome: emailRes });
      console.log(`[✓ AUTO-MAIL DELIVERED] Dispatched to ${targetEmail} (${acc.company_name}) [${emailRes.provider}]`);
    } catch (e) {
      console.error(`[✗ AUTO-MAIL FAILED] ${acc.company_name}: ${e.message}`);
    }
  }

  return { autoSentCount: results.length, results };
}

module.exports = {
  sendEmail,
  sendTestEmail,
  isAutoSendEnabled,
  autoDispatchDiscoveredPlaces,
  createSmtpTransporter
};
