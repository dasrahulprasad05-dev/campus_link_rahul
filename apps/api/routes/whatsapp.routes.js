/* ============================================================
   CAMPUSGRID — WhatsApp Chatbot Routes
   Webhook verification + message handler + intent routing.
   Features: readiness score, mock interview, application
   tracking, policy Q&A, drive alerts (push notifications).
   
   Zero-cost stack:
   - Meta WhatsApp Cloud API (free tier)
   - Existing Express API + AI Service
   - 3-tier intent recognition (keyword → regex → Groq LLM)
   ============================================================ */

const router = require('express').Router();
const whatsapp = require('../services/whatsapp.service');
const studentRepo = require('../repositories/student.repository');
const appRepo = require('../repositories/application.repository');
const { calculateReadiness } = require('../services/readiness.service');
const { query } = require('../db/pool');

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'campusgrid_verify_2026';

// ─── In-Memory Session Store (WhatsApp Interview Sessions) ──
const waSessions = new Map();
const WA_SESSION_TTL = 30 * 60 * 1000; // 30 minutes

// Clean up expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [phone, session] of waSessions) {
    if (now - session.lastActivity > WA_SESSION_TTL) {
      waSessions.delete(phone);
    }
  }
}, 5 * 60 * 1000);

// ─── Student Phone Linking Store (email OTP verification) ────
const linkingStore = new Map(); // phone → { email, otp, expiresAt }

// ─── AI Service proxy helper ────────────────────────────────
function normalizeAiUrl(raw) {
  if (!raw) return 'http://localhost:8000';
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
  return raw.includes('.') ? `https://${raw}` : `http://${raw}:8000`;
}
const AI_SERVICE_URL = normalizeAiUrl(process.env.AI_SERVICE_URL);

async function proxyAI(path, body) {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(`${AI_SERVICE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (r.ok) return await r.json();
  } catch (_) {}
  return null;
}

// ─── Groq LLM for intent classification fallback ────────────
async function classifyIntentWithLLM(text) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return 'UNKNOWN';

  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Classify the user message into exactly ONE category. Reply with ONLY the category name, nothing else. Categories: READINESS, INTERVIEW, APPLICATION, POLICY, HELP, GREETING, UNKNOWN'
          },
          { role: 'user', content: text.slice(0, 500) },
        ],
        temperature: 0.1,
        max_tokens: 20,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const category = (data.choices?.[0]?.message?.content || '').trim().toUpperCase();
      const valid = ['READINESS', 'INTERVIEW', 'APPLICATION', 'POLICY', 'HELP', 'GREETING', 'UNKNOWN'];
      return valid.includes(category) ? category : 'UNKNOWN';
    }
  } catch (_) {}
  return 'UNKNOWN';
}

// ─── 3-Tier Intent Recognition Engine ───────────────────────

function recognizeIntent(text) {
  const msg = (text || '').toLowerCase().trim();

  // Tier 1: Exact keyword match
  const keywordMap = {
    'readiness': 'READINESS', 'score': 'READINESS', 'ready': 'READINESS',
    'interview': 'INTERVIEW', 'mock': 'INTERVIEW', 'practice': 'INTERVIEW',
    'track': 'APPLICATION', 'application': 'APPLICATION', 'applications': 'APPLICATION', 'status': 'APPLICATION',
    'policy': 'POLICY', 'eligible': 'POLICY', 'eligibility': 'POLICY', 'rules': 'POLICY',
    'help': 'HELP', 'menu': 'HELP', 'commands': 'HELP',
    'hi': 'GREETING', 'hello': 'GREETING', 'hey': 'GREETING', 'start': 'GREETING',
    'stop': 'STOP', 'quit': 'STOP', 'exit': 'STOP', 'cancel': 'STOP', 'end': 'STOP',
  };

  for (const [keyword, intent] of Object.entries(keywordMap)) {
    if (msg === keyword || msg.startsWith(keyword + ' ') || msg.endsWith(' ' + keyword)) {
      return intent;
    }
  }

  // Tier 2: Regex pattern matching
  if (/\b(readiness|score|how.*(ready|prepared|placement))\b/i.test(msg)) return 'READINESS';
  if (/\b(interview|mock|practice|prepare|prep)\b/i.test(msg)) return 'INTERVIEW';
  if (/\b(track|status|application|where|stage|applied|shortlist)\b/i.test(msg)) return 'APPLICATION';
  if (/\b(policy|eligible|rule|criteria|cgpa.*require|min.*cgpa|placement.*policy)\b/i.test(msg)) return 'POLICY';
  if (/\b(help|what.*can|command|option|menu)\b/i.test(msg)) return 'HELP';
  if (/^(hi|hello|hey|hola|namaste|good\s*(morning|afternoon|evening))/i.test(msg)) return 'GREETING';

  // Tier 3: Falls through — caller will use LLM fallback
  return null;
}

// ═══════════════════════════════════════════════════════════
// GET /api/v1/whatsapp/webhook — Meta Verification Handshake
// ═══════════════════════════════════════════════════════════

router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verified successfully');
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp] Webhook verification failed');
  return res.sendStatus(403);
});

// ═══════════════════════════════════════════════════════════
// POST /api/v1/whatsapp/webhook — Incoming Message Handler
// ═══════════════════════════════════════════════════════════

router.post('/webhook', async (req, res) => {
  // Always respond 200 immediately to Meta (they retry on failure)
  res.sendStatus(200);

  try {
    const body = req.body;
    if (!body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]) return;

    const change = body.entry[0].changes[0].value;
    const message = change.messages[0];
    const from = message.from; // sender's phone number
    const msgId = message.id;

    // Mark as read (blue ticks)
    whatsapp.markAsRead(msgId);

    // Extract message text (supports text, interactive button replies, and list replies)
    let text = '';
    if (message.type === 'text') {
      text = message.text?.body || '';
    } else if (message.type === 'interactive') {
      if (message.interactive?.type === 'button_reply') {
        text = message.interactive.button_reply?.id || message.interactive.button_reply?.title || '';
      } else if (message.interactive?.type === 'list_reply') {
        text = message.interactive.list_reply?.id || message.interactive.list_reply?.title || '';
      }
    } else {
      // Unsupported message type
      await whatsapp.sendTextMessage(from, '📱 I can only process text messages. Please type your question!');
      return;
    }

    if (!text.trim()) return;

    // ─── Check if user is in an active interview session ────
    const session = waSessions.get(from);
    if (session && session.state === 'interview_active') {
      // Check for stop command
      const stopIntent = recognizeIntent(text);
      if (stopIntent === 'STOP') {
        await handleInterviewEnd(from, session);
        return;
      }
      // Otherwise, treat as interview answer
      await handleInterviewAnswer(from, text, session);
      return;
    }

    // ─── Check if user is in linking flow ────────────────────
    if (session && session.state === 'awaiting_email') {
      await handleLinkEmail(from, text);
      return;
    }
    if (session && session.state === 'awaiting_otp') {
      await handleLinkOTP(from, text);
      return;
    }

    // ─── Identify student by phone number ────────────────────
    const student = await studentRepo.findByPhone(whatsapp.normalizePhone(from));

    if (!student) {
      // Student not linked yet — start linking flow
      await handleUnlinkedUser(from);
      return;
    }

    // ─── Recognize intent (3-tier) ───────────────────────────
    let intent = recognizeIntent(text);
    if (!intent) {
      // Tier 3: LLM fallback
      intent = await classifyIntentWithLLM(text);
    }

    // ─── Route to handler ────────────────────────────────────
    switch (intent) {
      case 'READINESS':
        await handleReadiness(from, student);
        break;
      case 'INTERVIEW':
        await handleInterviewStart(from, student);
        break;
      case 'APPLICATION':
        await handleApplicationTracking(from, student);
        break;
      case 'POLICY':
        await handlePolicyQA(from, text);
        break;
      case 'GREETING':
        await handleGreeting(from, student);
        break;
      case 'HELP':
        await handleHelp(from, student);
        break;
      case 'STOP':
        await whatsapp.sendTextMessage(from, '✅ No active session to stop. Type *help* to see what I can do!');
        break;
      default:
        await handleUnknown(from, text, student);
        break;
    }
  } catch (err) {
    console.error('[WhatsApp] Webhook processing error:', err);
  }
});

// ═══════════════════════════════════════════════════════════
// Feature Handlers
// ═══════════════════════════════════════════════════════════

// ── Greeting ─────────────────────────────────────────────────
async function handleGreeting(from, student) {
  const name = student.name ? student.name.split(' ')[0] : 'there';
  const msg = `👋 Hey *${name}*! Welcome to *CampusGrid Bot* 🎓\n\nI can help you with:\n\n📊 *Readiness* — Check your placement readiness score\n🎤 *Interview* — Start a 5-question mock interview\n📋 *Track* — View your application statuses\n📖 *Policy* — Ask placement policy questions\n\nJust type a keyword or ask naturally!`;

  await whatsapp.sendButtonMessage(from, msg, [
    { id: 'readiness', title: '📊 My Score' },
    { id: 'interview', title: '🎤 Mock Interview' },
    { id: 'track', title: '📋 Applications' },
  ]);
}

// ── Help Menu ────────────────────────────────────────────────
async function handleHelp(from, student) {
  const msg = `🤖 *CampusGrid Bot — Commands*\n━━━━━━━━━━━━━━━━━━━━\n\n📊 *"readiness"* or *"score"*\n→ Get your placement readiness score\n\n🎤 *"interview"* or *"mock"*\n→ Start a 5-question AI mock interview\n\n📋 *"track"* or *"applications"*\n→ View all your application statuses\n\n📖 *"policy"* + your question\n→ Ask about placement rules & eligibility\n\n🛑 *"stop"* or *"exit"*\n→ End an active interview session\n\n━━━━━━━━━━━━━━━━━━━━\n💡 You can also ask questions naturally!\nExample: "What's my readiness score?"`;

  await whatsapp.sendTextMessage(from, msg);
}

// ── Readiness Score ──────────────────────────────────────────
async function handleReadiness(from, student) {
  await whatsapp.sendTextMessage(from, '⏳ Calculating your readiness score...');

  try {
    const profile = {
      skills: Array.isArray(student.skills) ? student.skills : [],
      projects: [],
      cgpa: parseFloat(student.cgpa) || 7.0,
      aptitudeScore: student.aptitude_score || 65,
      profileCompletion: student.profile_completion || 70,
    };

    // Try to get projects count
    try {
      const projRes = await query('SELECT COUNT(*) as count FROM projects WHERE student_id = $1', [student.id]);
      if (projRes.rows?.[0]) {
        profile.projects = new Array(parseInt(projRes.rows[0].count) || 0);
      }
    } catch (_) {}

    const readinessData = await calculateReadiness(profile);
    const msg = whatsapp.formatReadinessMessage(readinessData);
    await whatsapp.sendTextMessage(from, msg);
  } catch (err) {
    console.error('[WhatsApp] Readiness error:', err.message);
    // Use stored readiness score as fallback
    const fallbackScore = student.readiness_score || student.readiness || 0;
    await whatsapp.sendTextMessage(from,
      `📊 Your readiness score: *${fallbackScore}/100*\n\nVisit CampusGrid web for detailed breakdown!`
    );
  }
}

// ── Application Tracking ─────────────────────────────────────
async function handleApplicationTracking(from, student) {
  await whatsapp.sendTextMessage(from, '⏳ Fetching your applications...');

  try {
    const apps = await appRepo.listByStudent(student.id);
    const msg = whatsapp.formatApplicationsMessage(apps || []);
    await whatsapp.sendTextMessage(from, msg);
  } catch (err) {
    console.error('[WhatsApp] Application tracking error:', err.message);
    await whatsapp.sendTextMessage(from,
      '❌ Could not fetch your applications right now. Please try again or check on CampusGrid web.'
    );
  }
}

// ── Mock Interview — Start ───────────────────────────────────
async function handleInterviewStart(from, student) {
  const targetRole = student.target_role || 'Software Engineer';
  const skills = Array.isArray(student.skills) ? student.skills : [];

  await whatsapp.sendTextMessage(from,
    `🎤 *Starting Mock Interview*\n\nRole: *${targetRole}*\nQuestions: *5*\nDifficulty: *Medium*\n\n⏳ Generating personalized questions from your profile...`
  );

  try {
    // Build resume data from student profile
    const resumeData = {
      name: student.name || 'Candidate',
      target_role: targetRole,
      skills: skills,
      projects: [],
      education: [{ institution: 'University', degree: student.branch || 'B.Tech', year: student.year || 2026 }],
      experience: [],
    };

    // Try to fetch projects
    try {
      const projRes = await query('SELECT name, tech, description FROM projects WHERE student_id = $1 LIMIT 5', [student.id]);
      if (projRes.rows?.length > 0) {
        resumeData.projects = projRes.rows;
      }
    } catch (_) {}

    // Call the interview start endpoint via internal HTTP
    const API_BASE = `http://localhost:${process.env.PORT || 3000}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);

    const startRes = await fetch(`${API_BASE}/api/v1/interviews/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeData,
        difficulty: 'medium',
        count: 5,
        apiKey: process.env.GROQ_API_KEY,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    if (!startRes.ok) throw new Error('Interview start failed');

    const startData = await startRes.json();
    if (!startData.success || !startData.data?.questions?.length) {
      throw new Error('No questions generated');
    }

    const { sessionId, questions } = startData.data;

    // Store WhatsApp interview session
    waSessions.set(from, {
      state: 'interview_active',
      sessionId,
      questions,
      currentIndex: 0,
      studentId: student.id,
      targetRole,
      lastActivity: Date.now(),
    });

    // Send first question
    const firstQ = whatsapp.formatInterviewQuestion(questions[0], 0, questions.length);
    await whatsapp.sendTextMessage(from, firstQ);

  } catch (err) {
    console.error('[WhatsApp] Interview start error:', err.message);
    await whatsapp.sendTextMessage(from,
      '❌ Could not start the interview right now. The AI service may be loading. Please try again in a minute!'
    );
  }
}

// ── Mock Interview — Answer Processing ───────────────────────
async function handleInterviewAnswer(from, answerText, session) {
  session.lastActivity = Date.now();
  const { sessionId, questions, currentIndex } = session;

  await whatsapp.sendTextMessage(from, '⏳ Evaluating your answer...');

  try {
    const API_BASE = `http://localhost:${process.env.PORT || 3000}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);

    const evalRes = await fetch(`${API_BASE}/api/v1/interviews/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        questionIndex: currentIndex,
        answer: answerText,
        apiKey: process.env.GROQ_API_KEY,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    const evalData = await evalRes.json();
    const evaluation = evalData.data || evalData;

    // Send evaluation feedback
    const evalMsg = whatsapp.formatEvaluationMessage(evaluation);
    await whatsapp.sendTextMessage(from, evalMsg);

    // Move to next question or finish
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      session.currentIndex = nextIndex;
      session.lastActivity = Date.now();

      // Small delay before next question for readability
      setTimeout(async () => {
        const nextQ = whatsapp.formatInterviewQuestion(questions[nextIndex], nextIndex, questions.length);
        await whatsapp.sendTextMessage(from, nextQ);
      }, 1500);
    } else {
      // Interview complete — get final report
      await handleInterviewEnd(from, session);
    }
  } catch (err) {
    console.error('[WhatsApp] Answer evaluation error:', err.message);
    // Move to next question anyway
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      session.currentIndex = nextIndex;
      await whatsapp.sendTextMessage(from, '⚠️ Could not evaluate that answer. Moving to next question...\n');
      const nextQ = whatsapp.formatInterviewQuestion(questions[nextIndex], nextIndex, questions.length);
      await whatsapp.sendTextMessage(from, nextQ);
    } else {
      await whatsapp.sendTextMessage(from, '✅ Interview complete! Could not generate full report at this time. Check CampusGrid web for details.');
      waSessions.delete(from);
    }
  }
}

// ── Mock Interview — End & Report ────────────────────────────
async function handleInterviewEnd(from, session) {
  const { sessionId } = session;

  await whatsapp.sendTextMessage(from, '⏳ Generating your interview report...');

  try {
    const API_BASE = `http://localhost:${process.env.PORT || 3000}`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 25000);

    const reportRes = await fetch(`${API_BASE}/api/v1/interviews/final-evaluation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        apiKey: process.env.GROQ_API_KEY,
      }),
      signal: ctrl.signal,
    });
    clearTimeout(timer);

    const reportData = await reportRes.json();
    if (reportData.success && reportData.data) {
      const report = whatsapp.formatFinalReport(reportData.data);
      await whatsapp.sendTextMessage(from, report);
    } else {
      await whatsapp.sendTextMessage(from, '✅ Interview ended! Visit CampusGrid web for your detailed report.');
    }
  } catch (err) {
    console.error('[WhatsApp] Final report error:', err.message);
    await whatsapp.sendTextMessage(from, '✅ Interview ended! Visit CampusGrid web for your detailed report.');
  }

  // Cleanup session
  waSessions.delete(from);
}

// ── Policy Q&A (RAG) ─────────────────────────────────────────
async function handlePolicyQA(from, text) {
  await whatsapp.sendTextMessage(from, '⏳ Searching placement policies...');

  // Extract the actual question (remove "policy" keyword if present)
  const question = text.replace(/^\s*(policy|eligible|eligibility|rules?)\s*/i, '').trim() || text;

  try {
    const result = await proxyAI('/v1/policy-qa', { question });
    if (result && result.answer) {
      let msg = `📖 *Policy Answer*\n━━━━━━━━━━━━━━━━━━━━\n\n${result.answer}`;
      if (result.sources?.length > 0) {
        msg += `\n\n📑 Sources: ${result.sources.join(', ')}`;
      }
      msg += `\n\n━━━━━━━━━━━━━━━━━━━━`;
      await whatsapp.sendTextMessage(from, msg);
    } else {
      await whatsapp.sendTextMessage(from,
        '📖 I couldn\'t find specific policy info for that question. Try asking:\n• "What is the minimum CGPA for placement?"\n• "How many offers can a student accept?"\n• "What are the placement rules?"'
      );
    }
  } catch (err) {
    console.error('[WhatsApp] Policy QA error:', err.message);
    await whatsapp.sendTextMessage(from,
      '❌ Policy service is currently unavailable. Please try again later or visit CampusGrid web.'
    );
  }
}

// ── Unlinked User (Phone not registered) ─────────────────────
async function handleUnlinkedUser(from) {
  waSessions.set(from, {
    state: 'awaiting_email',
    lastActivity: Date.now(),
  });

  await whatsapp.sendTextMessage(from,
    `👋 Welcome to *CampusGrid Bot*! 🎓\n\nI don't recognize your phone number yet.\n\nTo link your CampusGrid account, please type your *registered email address*:\n\n💡 Example: ananya.sharma@campusgrid.online`
  );
}

// ── Handle Email Linking ─────────────────────────────────────
async function handleLinkEmail(from, emailText) {
  const email = emailText.trim().toLowerCase();

  // Basic email validation
  if (!email.includes('@') || !email.includes('.')) {
    await whatsapp.sendTextMessage(from, '❌ That doesn\'t look like a valid email. Please try again:');
    return;
  }

  // Look up user by email
  try {
    const userRes = await query('SELECT id, name, email, role FROM users WHERE LOWER(email) = $1', [email]);
    if (!userRes.rows?.[0]) {
      await whatsapp.sendTextMessage(from,
        `❌ No CampusGrid account found with *${email}*.\n\nPlease register at campusgrid.online first, then come back here!`
      );
      waSessions.delete(from);
      return;
    }

    const user = userRes.rows[0];
    if (user.role !== 'student') {
      await whatsapp.sendTextMessage(from, '❌ WhatsApp bot is currently available for student accounts only.');
      waSessions.delete(from);
      return;
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Store OTP
    linkingStore.set(from, {
      email,
      userId: user.id,
      name: user.name,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    waSessions.set(from, {
      state: 'awaiting_otp',
      lastActivity: Date.now(),
    });

    // Send OTP via email
    try {
      const { sendVerificationEmail } = require('../services/email.service');
      // We'll use the email service to send OTP
      const emailSent = await sendOTPEmail(email, user.name, otp);
      if (!emailSent) {
        // If email fails, show OTP in WhatsApp itself (dev/demo mode)
        await whatsapp.sendTextMessage(from,
          `📧 Email delivery issue. For demo purposes, your OTP is: *${otp}*\n\nType the 6-digit code to verify:`
        );
        return;
      }
    } catch (_) {
      // Fallback: show OTP directly (acceptable for demo/hackathon)
      await whatsapp.sendTextMessage(from,
        `📧 Your verification code is: *${otp}*\n\n_(In production, this would be sent to your email)_\n\nType the 6-digit code to link your account:`
      );
      return;
    }

    await whatsapp.sendTextMessage(from,
      `📧 Verification code sent to *${email}*!\n\nPlease check your inbox (and spam folder) and type the 6-digit OTP here:`
    );
  } catch (err) {
    console.error('[WhatsApp] Email linking error:', err.message);
    await whatsapp.sendTextMessage(from, '❌ Something went wrong. Please try again later.');
    waSessions.delete(from);
  }
}

// ── Handle OTP Verification ─────────────────────────────────
async function handleLinkOTP(from, otpText) {
  const enteredOtp = otpText.trim().replace(/\s/g, '');
  const linkData = linkingStore.get(from);

  if (!linkData) {
    await whatsapp.sendTextMessage(from, '❌ Session expired. Please type *hi* to start again.');
    waSessions.delete(from);
    return;
  }

  if (Date.now() > linkData.expiresAt) {
    await whatsapp.sendTextMessage(from, '❌ OTP expired. Please type *hi* to start the linking process again.');
    linkingStore.delete(from);
    waSessions.delete(from);
    return;
  }

  if (enteredOtp !== linkData.otp) {
    await whatsapp.sendTextMessage(from, '❌ Wrong OTP. Please try again or type *hi* to restart.');
    return;
  }

  // OTP verified — link phone number to student profile
  try {
    const normalizedPhone = whatsapp.normalizePhone(from);
    await query(
      `UPDATE student_profiles SET phone = $1, updated_at = NOW() WHERE user_id = $2`,
      [normalizedPhone, linkData.userId]
    );

    linkingStore.delete(from);
    waSessions.delete(from);

    await whatsapp.sendTextMessage(from,
      `✅ *Account Linked Successfully!*\n\nWelcome, *${linkData.name}*! 🎉\n\nYour WhatsApp is now connected to CampusGrid. You'll receive:\n• 📢 Drive alerts & notifications\n• 📊 Readiness updates\n\nType *help* to see all commands!`
    );

    // Send the help menu
    const student = await studentRepo.findByPhone(normalizedPhone);
    if (student) {
      setTimeout(() => handleHelp(from, student), 1500);
    }
  } catch (err) {
    console.error('[WhatsApp] Phone linking error:', err.message);
    await whatsapp.sendTextMessage(from, '❌ Could not link your account. Please try again.');
    linkingStore.delete(from);
    waSessions.delete(from);
  }
}

// ── Unknown Intent ───────────────────────────────────────────
async function handleUnknown(from, text, student) {
  // Try to give a helpful response based on what they said
  await whatsapp.sendButtonMessage(from,
    `🤔 I'm not sure what you mean by that.\n\nHere's what I can help with:`,
    [
      { id: 'readiness', title: '📊 My Score' },
      { id: 'interview', title: '🎤 Mock Interview' },
      { id: 'track', title: '📋 Applications' },
    ]
  );
}

// ── OTP Email Helper ─────────────────────────────────────────
async function sendOTPEmail(email, name, otp) {
  const sgKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@campusgrid.online';

  if (!sgKey) return false;

  try {
    const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sgKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: fromEmail, name: 'CampusGrid' },
        subject: `CampusGrid WhatsApp Verification: ${otp}`,
        content: [{
          type: 'text/html',
          value: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #4f46e5;">CampusGrid WhatsApp Verification</h2>
              <p>Hi ${name},</p>
              <p>Your verification code to link WhatsApp with CampusGrid is:</p>
              <div style="background: #f0f0ff; border: 2px solid #4f46e5; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
              </div>
              <p>This code expires in 10 minutes.</p>
              <p style="color: #888; font-size: 12px;">If you didn't request this, please ignore this email.</p>
            </div>
          `,
        }],
      }),
    });

    return res.ok || res.status === 202;
  } catch (_) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// Push Notification API — Called by other services
// ═══════════════════════════════════════════════════════════

/**
 * Send a WhatsApp push notification to all students with linked phones.
 * Used for drive alerts, application status changes, etc.
 */
async function broadcastToLinkedStudents(message) {
  try {
    const res = await query(
      `SELECT phone FROM student_profiles WHERE phone IS NOT NULL AND phone != '' AND phone != '+91 98765 43210'`
    );
    if (!res.rows?.length) return;

    for (const row of res.rows) {
      const phone = whatsapp.normalizePhone(row.phone);
      if (phone && phone.length >= 10) {
        await whatsapp.sendTextMessage(phone, message);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  } catch (err) {
    console.error('[WhatsApp] Broadcast error:', err.message);
  }
}

/**
 * Send WhatsApp notification to a specific student by their user_id.
 */
async function notifyStudent(userId, message) {
  try {
    const res = await query(
      `SELECT phone FROM student_profiles WHERE user_id = $1 AND phone IS NOT NULL AND phone != ''`,
      [userId]
    );
    if (res.rows?.[0]?.phone) {
      const phone = whatsapp.normalizePhone(res.rows[0].phone);
      if (phone && phone.length >= 10) {
        await whatsapp.sendTextMessage(phone, message);
      }
    }
  } catch (err) {
    console.error('[WhatsApp] Notify student error:', err.message);
  }
}

// Export for use by drive.routes.js and notification service
router.broadcastToLinkedStudents = broadcastToLinkedStudents;
router.notifyStudent = notifyStudent;

module.exports = router;
