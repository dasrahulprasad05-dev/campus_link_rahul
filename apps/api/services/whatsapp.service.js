/* ============================================================
   CAMPUSGRID — WhatsApp Cloud API Service
   Send/receive messages via Meta WhatsApp Business Cloud API.
   Free tier: unlimited user-initiated + 1000 service-initiated/month.
   ============================================================ */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID || '';
const GRAPH_API_URL = `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_ID}/messages`;

/**
 * Send a plain text message to a WhatsApp number.
 */
async function sendTextMessage(to, text) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
    console.warn('[WhatsApp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_ID — message not sent');
    return null;
  }

  try {
    const res = await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(to),
        type: 'text',
        text: { preview_url: false, body: text.slice(0, 4096) },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[WhatsApp] Send error:', res.status, errText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('[WhatsApp] Send exception:', err.message);
    return null;
  }
}

/**
 * Send an interactive button message (up to 3 buttons).
 */
async function sendButtonMessage(to, bodyText, buttons = []) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return null;

  const waButtons = buttons.slice(0, 3).map((btn, i) => ({
    type: 'reply',
    reply: {
      id: btn.id || `btn_${i}`,
      title: (btn.title || btn.label || `Option ${i + 1}`).slice(0, 20),
    },
  }));

  try {
    const res = await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(to),
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: bodyText.slice(0, 1024) },
          action: { buttons: waButtons },
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[WhatsApp] Button msg error:', res.status, errText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('[WhatsApp] Button exception:', err.message);
    return null;
  }
}

/**
 * Send an interactive list message (up to 10 items, 1 section).
 */
async function sendListMessage(to, bodyText, buttonLabel, items = []) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return null;

  const rows = items.slice(0, 10).map((item, i) => ({
    id: item.id || `item_${i}`,
    title: (item.title || `Item ${i + 1}`).slice(0, 24),
    description: (item.description || '').slice(0, 72),
  }));

  try {
    const res = await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: normalizePhone(to),
        type: 'interactive',
        interactive: {
          type: 'list',
          body: { text: bodyText.slice(0, 1024) },
          action: {
            button: (buttonLabel || 'View Options').slice(0, 20),
            sections: [{ title: 'Options', rows }],
          },
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[WhatsApp] List msg error:', res.status, errText);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('[WhatsApp] List exception:', err.message);
    return null;
  }
}

/**
 * Mark a message as read (blue ticks) — improves UX.
 */
async function markAsRead(messageId) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID || !messageId) return;

  try {
    await fetch(GRAPH_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId,
      }),
    });
  } catch (_) {}
}

/**
 * Normalize phone to E.164 format (strip +, spaces, dashes).
 */
function normalizePhone(phone) {
  let cleaned = (phone || '').replace(/[\s\-\(\)\+]/g, '');
  // If starts with 0, assume India
  if (cleaned.startsWith('0')) cleaned = '91' + cleaned.slice(1);
  // If 10 digits, assume India
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) cleaned = '91' + cleaned;
  return cleaned;
}

/**
 * Format a readiness score response as a WhatsApp-friendly text block.
 */
function formatReadinessMessage(data) {
  const score = data.score || 0;
  const emoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴';
  const verdict = score >= 80 ? 'Placement Ready! 🎯' : score >= 60 ? 'Getting There 💪' : 'Needs Work 📚';

  let msg = `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📊 *Your Readiness Score*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `${emoji} Score: *${score}/100* — ${verdict}\n\n`;

  if (data.factors && data.factors.length > 0) {
    msg += `📈 *Breakdown:*\n`;
    data.factors.forEach(f => {
      const bar = f.value >= 80 ? '✅' : f.value >= 60 ? '⚠️' : '❌';
      msg += `${bar} ${f.label}: ${f.value}/100\n`;
    });
    msg += '\n';
  }

  if (score < 70) {
    msg += `💡 *Tip:* Focus on adding more projects and skills to boost your score!\n`;
  } else {
    msg += `💡 *Tip:* You're on track! Keep practicing mock interviews.\n`;
  }

  msg += `━━━━━━━━━━━━━━━━━━━━`;
  return msg;
}

/**
 * Format applications list as WhatsApp text.
 */
function formatApplicationsMessage(apps) {
  if (!apps || apps.length === 0) {
    return `📋 *Your Applications*\n━━━━━━━━━━━━━━━━━━━━\n\nYou haven't applied to any positions yet.\n\n💡 Visit CampusGrid → Job Discovery to browse open roles!`;
  }

  const statusEmoji = {
    applied: '🔵',
    shortlisted: '🟢',
    interview: '🟡',
    offered: '🟣',
    rejected: '🔴',
    withdrawn: '⚪',
  };

  let msg = `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *Your Applications*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  apps.slice(0, 8).forEach((app, i) => {
    const emoji = statusEmoji[app.status] || '🔵';
    msg += `${i + 1}️⃣ *${app.company || app.company_name || 'Company'}*\n`;
    msg += `   Role: ${app.job_title || app.job || 'Position'}\n`;
    msg += `   Status: ${emoji} ${(app.status || 'applied').toUpperCase()}\n`;
    if (app.current_round || app.round) {
      msg += `   Round: ${app.current_round || app.round}\n`;
    }
    msg += '\n';
  });

  const active = apps.filter(a => !['rejected', 'withdrawn'].includes(a.status)).length;
  const offers = apps.filter(a => a.status === 'offered').length;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Total: ${apps.length} | Active: ${active} | Offers: ${offers}`;
  return msg;
}

/**
 * Format interview question for WhatsApp.
 */
function formatInterviewQuestion(question, index, total) {
  let msg = '';
  if (index === 0) {
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `🎤 *Mock Interview Started*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  }
  msg += `❓ *Question ${index + 1}/${total}*`;
  if (question.stage) msg += ` _(${question.stage})_`;
  msg += `\n\n${question.text}\n\n`;
  msg += `_(Type your answer below)_`;
  return msg;
}

/**
 * Format evaluation feedback for WhatsApp.
 */
function formatEvaluationMessage(evalData) {
  const avg = Math.round(
    ((evalData.technical_correctness || 0) + (evalData.relevance || 0) +
     (evalData.completeness || 0) + (evalData.communication || 0)) / 4 * 10
  );

  const grade = avg >= 75 ? '🟢' : avg >= 50 ? '🟡' : '🔴';

  let msg = `\n✅ *Evaluation* ${grade} Score: ${avg}/100\n`;
  msg += `• Technical: ${evalData.technical_correctness || 0}/10\n`;
  msg += `• Relevance: ${evalData.relevance || 0}/10\n`;
  msg += `• Completeness: ${evalData.completeness || 0}/10\n`;
  msg += `• Communication: ${evalData.communication || 0}/10\n`;

  if (evalData.feedback_text) {
    msg += `\n💡 ${evalData.feedback_text}\n`;
  }

  return msg;
}

/**
 * Format final interview report for WhatsApp.
 */
function formatFinalReport(report) {
  const verdict = report.verdict || 'Evaluated';
  const score = report.overall_score || 0;
  const emoji = score >= 75 ? '🏆' : score >= 55 ? '📊' : '📚';

  let msg = `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `${emoji} *Interview Report*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `🎯 Overall: *${score}/100* — ${verdict}\n`;
  msg += `📝 Answered: ${report.answered_count || 0}/${report.total_questions || 0}\n\n`;

  if (report.executive_summary) {
    msg += `📋 *Summary:*\n${report.executive_summary}\n\n`;
  }

  if (report.top_strengths?.length > 0) {
    msg += `💪 *Strengths:*\n`;
    report.top_strengths.forEach(s => { msg += `✅ ${s}\n`; });
    msg += '\n';
  }

  if (report.top_weaknesses?.length > 0) {
    msg += `⚠️ *Areas to Improve:*\n`;
    report.top_weaknesses.forEach(w => { msg += `❌ ${w}\n`; });
    msg += '\n';
  }

  if (report.study_roadmap?.length > 0) {
    msg += `🗺️ *Study Plan:*\n`;
    report.study_roadmap.forEach((r, i) => { msg += `${i + 1}. ${r}\n`; });
  }

  msg += `\n━━━━━━━━━━━━━━━━━━━━`;
  return msg;
}

/**
 * Format drive alert for WhatsApp push notification.
 */
function formatDriveAlert(drive) {
  const dateStr = drive.drive_date
    ? new Date(drive.drive_date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'TBA';

  let msg = `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📢 *New Placement Drive!*\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;
  msg += `🏢 *${drive.company || 'Company'}*\n`;
  msg += `💼 Role: ${drive.role || 'Multiple Positions'}\n`;
  msg += `📅 Date: ${dateStr}\n`;
  msg += `📍 Venue: ${drive.venue || 'Campus'}\n`;
  if (drive.min_cgpa > 0) {
    msg += `📊 Min CGPA: ${drive.min_cgpa}\n`;
  }
  msg += `\n💡 Check CampusGrid for eligibility & details!\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━`;
  return msg;
}

module.exports = {
  sendTextMessage,
  sendButtonMessage,
  sendListMessage,
  markAsRead,
  normalizePhone,
  formatReadinessMessage,
  formatApplicationsMessage,
  formatInterviewQuestion,
  formatEvaluationMessage,
  formatFinalReport,
  formatDriveAlert,
};
