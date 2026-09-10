/* ============================================================
   CAMPUSLINK — AI Mock Interview Page
   ============================================================ */
const StudentInterview = (() => {
  const QUESTIONS = [
    { role: 'General', q: 'Tell me about a project where you used data to make a decision.' },
    { role: 'Data Analyst', q: 'How would you handle missing data in a large dataset?' },
    { role: 'Software Engineer', q: 'Describe a time you debugged a complex issue in production.' },
    { role: 'Behavioral', q: 'Tell me about a time you had a conflict in a team. How did you resolve it?' },
    { role: 'Technical', q: 'What is the difference between a LEFT JOIN and an INNER JOIN?' },
  ];
  let currentQ = 0;
  let chatHistory = [];

  async function render() {
    currentQ = 0;
    chatHistory = [];
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">AI Mock Interview</div><h1 class="page-title">Practice Makes Placement</h1><p class="page-subtitle">Role-specific interview practice with AI-generated questions, scoring, and STAR feedback.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Interview Session</h2><span class="badge badge-accent">Question ${currentQ + 1}/${QUESTIONS.length}</span></div>
            <div class="interview-chat" id="chat-area">
              <div class="chat-bubble ai">
                <strong>🎤 ${QUESTIONS[currentQ].role} Question:</strong><br>
                ${QUESTIONS[currentQ].q}
              </div>
            </div>
            ${Forms.textarea({ id: 'interview-answer', placeholder: 'Type your answer here... Use the STAR method: Situation → Task → Action → Result', rows: 5 })}
            <div class="flex gap-3 mt-4">
              <button class="btn btn-primary" id="submit-answer-btn" onclick="StudentInterview.submitAnswer()">Submit Answer</button>
              <button class="btn" onclick="StudentInterview.nextQuestion()">Skip →</button>
            </div>
          </article>
          <div id="interview-feedback"></div>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">🎯 Interview Tips</h3>
            <div class="insight-card accent mb-4"><strong>STAR Method:</strong> Structure your answers using Situation, Task, Action, Result for maximum impact.</div>
            <ul style="padding-left:var(--space-5);color:var(--text-secondary)" class="text-sm">
              <li class="mb-2">Be specific — use real examples from your projects</li>
              <li class="mb-2">Include measurable outcomes (numbers, %, impact)</li>
              <li class="mb-2">Keep answers between 60–120 seconds when spoken</li>
              <li class="mb-2">Highlight your personal contribution, not just the team</li>
            </ul>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">Session Stats</h2></div>
            <div id="session-stats">
              <div class="text-sm text-muted">Answer questions to see your stats.</div>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  async function submitAnswer() {
    const answer = document.getElementById('interview-answer')?.value;
    if (!answer || answer.trim().length < 5) { Toast.warning('Please write a more detailed answer'); return; }

    const btn = document.getElementById('submit-answer-btn');
    btn.textContent = 'Evaluating...'; btn.disabled = true;

    // Add user bubble
    const chat = document.getElementById('chat-area');
    chat.innerHTML += `<div class="chat-bubble user">${answer.replace(/</g, '&lt;')}</div>`;

    const result = await API.post('/interviews/feedback', { answer, question: QUESTIONS[currentQ].q });

    btn.textContent = 'Submit Answer'; btn.disabled = false;

    chatHistory.push({ question: QUESTIONS[currentQ].q, answer, score: result.score, feedback: result.feedback });

    // Add AI feedback bubble
    chat.innerHTML += `
      <div class="chat-bubble ai">
        <strong>Score: ${result.score}/100</strong><br>
        ${result.feedback}<br>
        <em class="text-xs" style="opacity:0.7">💡 ${result.tip || 'Remember STAR: Situation → Task → Action → Result.'}</em>
      </div>
    `;
    chat.scrollTop = chat.scrollHeight;

    document.getElementById('interview-answer').value = '';
    _updateStats();

    document.getElementById('interview-feedback').innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="ai-result-header">
          <div class="ai-result-icon">🤖</div>
          <div><div class="ai-result-title">Answer Evaluation</div><div class="ai-result-subtitle">${QUESTIONS[currentQ].role} question</div></div>
          <span class="match-badge" style="margin-left:auto">${result.score}/100</span>
        </div>
        ${result.strengths?.length ? `<div class="mt-4"><h4 class="text-sm text-success mb-2">✓ Strengths</h4>${result.strengths.map(s => `<div class="text-sm text-muted">• ${s}</div>`).join('')}</div>` : ''}
        ${result.improvements?.length ? `<div class="mt-4"><h4 class="text-sm text-warning mb-2">⚡ Improve</h4>${result.improvements.map(s => `<div class="text-sm text-muted">• ${s}</div>`).join('')}</div>` : ''}
      </article>
    `;
  }

  function nextQuestion() {
    currentQ = (currentQ + 1) % QUESTIONS.length;
    const chat = document.getElementById('chat-area');
    chat.innerHTML += `<div class="chat-bubble ai"><strong>🎤 ${QUESTIONS[currentQ].role} Question:</strong><br>${QUESTIONS[currentQ].q}</div>`;
    chat.scrollTop = chat.scrollHeight;
    document.getElementById('interview-answer').value = '';
    document.querySelector('.card-header .badge').textContent = `Question ${currentQ + 1}/${QUESTIONS.length}`;
  }

  function _updateStats() {
    const el = document.getElementById('session-stats');
    if (!el || !chatHistory.length) return;
    const avg = Math.round(chatHistory.reduce((s, c) => s + c.score, 0) / chatHistory.length);
    el.innerHTML = `
      <div class="progress-group"><div class="progress-label"><span class="progress-label-name">Avg. Score</span><span class="progress-label-value">${avg}/100</span></div><div class="progress-bar"><div class="progress-bar-fill ${avg >= 70 ? 'success' : 'warning'}" style="width:${avg}%"></div></div></div>
      <div class="text-xs text-muted mt-2">${chatHistory.length} answer${chatHistory.length > 1 ? 's' : ''} submitted this session</div>
    `;
  }

  return { render, submitAnswer, nextQuestion };
})();
