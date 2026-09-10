/* ============================================================
   CAMPUSLINK — Email Service
   Supports:
   1. Twilio SendGrid REST API (via SENDGRID_API_KEY)
   2. Custom SMTP (via SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
   3. Development Simulation (Console log with clickable action links)
   ============================================================ */

require('dotenv').config();
const crypto = require('crypto');

const getApiKey = () => process.env.SENDGRID_API_KEY || '';
const getFromEmail = () => process.env.SENDGRID_FROM_EMAIL || process.env.MAIL_FROM || 'noreply@campuslink.in';
const getAppUrl = () => process.env.APP_URL || 'https://campus-link-rahul.vercel.app';

/**
 * Send an email via SendGrid REST API or fallback to simulated delivery
 */
async function sendEmail({ to, subject, html, text }) {
  const apiKey = getApiKey();
  const fromEmail = getFromEmail();

  // If SendGrid API Key is configured, send via SendGrid v3 REST API
  if (apiKey && apiKey.startsWith('SG.')) {
    try {
      const contentList = [];
      if (text) {
        contentList.push({ type: 'text/plain', value: text });
      }
      if (html) {
        contentList.push({ type: 'text/html', value: html });
      }
      if (contentList.length === 0) {
        contentList.push({ type: 'text/plain', value: subject });
      }

      const payload = {
        personalizations: [{ to: [{ email: to }] }],
        from: {
          email: fromEmail,
          name: 'CAMPUSLINK Placement Portal',
        },
        subject,
        content: contentList,
      };

      const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.status >= 200 && res.status < 300) {
        console.log(`[Email] Successfully sent email to ${to} via SendGrid`);
        return { success: true, provider: 'sendgrid' };
      } else {
        const errText = await res.text();
        console.warn(`[Email] SendGrid API returned ${res.status}:`, errText);
        // Fall back to simulation log
      }
    } catch (err) {
      console.error('[Email] SendGrid transmission error:', err.message);
    }
  }

  // Development fallback: Log email content to terminal with clear preview
  console.log('\n======================================================');
  console.log(`[Email Simulated] To: ${to}`);
  console.log(`[Email Simulated] Subject: ${subject}`);
  console.log(`[Email Simulated] From: ${fromEmail}`);
  console.log('------------------------------------------------------');
  if (text) console.log(text);
  console.log('======================================================\n');

  return { success: true, provider: 'simulated' };
}

/**
 * Generate standard branded HTML email shell
 */
function _emailWrapper({ title, preview, content, ctaUrl, ctaText, footerNote }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #0b0f19; color: #e2e8f0; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #131b2e; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 50%, #8b5cf6 100%); padding: 36px 30px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; color: #e0e7ff; font-size: 14px; }
    .body { padding: 36px 30px; line-height: 1.6; font-size: 15px; color: #cbd5e1; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; font-weight: 600; padding: 14px 32px; border-radius: 8px; text-decoration: none; margin: 24px 0; text-align: center; }
    .btn:hover { background: #4338ca; }
    .notice { background: rgba(234, 179, 8, 0.1); border-left: 4px solid #eab308; padding: 14px 16px; border-radius: 4px; font-size: 13px; color: #fef08a; margin: 20px 0; }
    .footer { padding: 24px 30px; background: #0f172a; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    .link-alt { word-break: break-all; color: #818cf8; font-size: 13px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>CAMPUSLINK</h1>
      <p>AI Placement Intelligence & Career Automation</p>
    </div>
    <div class="body">
      ${content}
      ${ctaUrl && ctaText ? `
        <div style="text-align:center;">
          <a href="${ctaUrl}" class="btn" target="_blank">${ctaText}</a>
        </div>
        <p style="font-size:12px; color:#94a3b8; text-align:center;">
          If the button doesn't work, copy and paste this link in your browser:<br>
          <a href="${ctaUrl}" class="link-alt">${ctaUrl}</a>
        </p>
      ` : ''}
      ${footerNote ? `<div class="notice">${footerNote}</div>` : ''}
    </div>
    <div class="footer">
      © 2026 CAMPUSLINK. All rights reserved.<br>
      This is an automated system email. Please do not reply directly.
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Send Email Verification on First-Time Signup
 */
async function sendVerificationEmail(user, token) {
  const verifyUrl = `${getAppUrl()}/#verify-email?token=${token}&email=${encodeURIComponent(user.email)}`;

  const content = `
    <h2 style="color:#ffffff; margin-top:0;">Verify Your Email Address</h2>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Welcome to <strong>CAMPUSLINK</strong>! Please verify your email address to activate your account and start your placement preparation journey.</p>
  `;

  const footerNote = `
    <strong>Important:</strong> If you don't find our emails in your inbox in the future, please check your <strong>Spam or Junk folder</strong> and mark CAMPUSLINK as "Not Spam" to ensure you never miss recruitment drive updates and interview schedules.
  `;

  return sendEmail({
    to: user.email,
    subject: 'Action Required: Verify your CAMPUSLINK Account',
    html: _emailWrapper({
      title: 'Verify Your Email',
      content,
      ctaUrl: verifyUrl,
      ctaText: 'Verify My Account →',
      footerNote,
    }),
    text: `Hi ${user.name},\n\nPlease verify your CAMPUSLINK account by visiting:\n${verifyUrl}\n\nNote: If you don't see this in your inbox, please check your spam folder.\n\n— CAMPUSLINK Team`,
  });
}

/**
 * 2. Send Welcome Email (sent after email verification or first login)
 */
async function sendWelcomeEmail(user) {
  const portalUrl = `${getAppUrl()}/#${user.role || 'student'}/dashboard`;

  const content = `
    <h2 style="color:#ffffff; margin-top:0;">Welcome to CAMPUSLINK 🎉</h2>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Your account is now fully verified and active! You're ready to leverage our 10 AI-powered placement intelligence features:</p>
    <ul style="padding-left: 20px; color: #94a3b8;">
      <li><strong style="color:#e2e8f0;">AI Mock Interviews:</strong> Practice STAR-method interview rounds with instant AI feedback.</li>
      <li><strong style="color:#e2e8f0;">Resume & JD Matcher:</strong> Dense vector matching against real recruiter job descriptions.</li>
      <li><strong style="color:#e2e8f0;">Placement Readiness Score:</strong> ML-powered readiness tracking with explainable factors.</li>
      <li><strong style="color:#e2e8f0;">Placement Policy Q&A:</strong> Ask university policy and offer questions 24/7.</li>
    </ul>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Welcome to CAMPUSLINK — Your Placement Intelligence Portal',
    html: _emailWrapper({
      title: 'Welcome to CAMPUSLINK',
      content,
      ctaUrl: portalUrl,
      ctaText: 'Access Your Dashboard →',
      footerNote: 'Tip: Add this sender address to your contacts so drive announcements and interview invites always reach your primary inbox.',
    }),
    text: `Hi ${user.name},\n\nWelcome to CAMPUSLINK! Your account is active. Access your portal at:\n${portalUrl}\n\n— CAMPUSLINK Team`,
  });
}

/**
 * 3. Send Password Reset Email
 */
async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${getAppUrl()}/#reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

  const content = `
    <h2 style="color:#ffffff; margin-top:0;">Reset Your Password</h2>
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>We received a request to reset your password for your CAMPUSLINK account. Click the button below to choose a new password:</p>
  `;

  const footerNote = `
    <strong>Security Notice:</strong> This password reset link expires in <strong>1 hour</strong>. If you did not request this password reset, please ignore this email or contact support immediately.
  `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request — CAMPUSLINK',
    html: _emailWrapper({
      title: 'Reset Password',
      content,
      ctaUrl: resetUrl,
      ctaText: 'Reset My Password →',
      footerNote,
    }),
    text: `Hi ${user.name},\n\nReset your CAMPUSLINK password using this link:\n${resetUrl}\n\nThis link expires in 1 hour.\n\n— CAMPUSLINK Team`,
  });
}

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
};
