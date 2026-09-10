/* ============================================================
   CAMPUSLINK — AI Mock Interview Page (Feature 4 + 5)
   Now fetches adaptive questions from the AI service (Feature 5)
   and gets LLM-powered feedback (Feature 4).
   ============================================================ */
const StudentInterview = (() => {
  let questions = [];
  let currentQ = 0;
  let chatHistory = [];
  let sessionSource = 'loading';

  async function render() {
    currentQ = 0;
    chatHistory = [];
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">AI Mock Interview</div><h1 class="page-title">Practice Makes Placement</h1><p class="page-subtitle">Role-specific interview practice with AI-generated questions, scoring, and STAR feedback.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Configure Session</h2></div>
            <div class="flex gap-3 mb-4">
              ${Forms.select({ id: 'interview-role', label: 'Target Role', choices: [
                { value: 'Data Analyst', label: 'Data Analyst' },
                { value: 'Software Engineer', label: 'Software Engineer' },
                { value: 'ML Engineer', label: 'ML Engineer' },
                { value: 'Web Developer', label: 'Web Developer' },
                { value: 'General', label: 'General' },
              ]})}
              ${Forms.select({ id: 'interview-difficulty', label: 'Difficulty', choices: [
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]})}
            </div>
            <button class="btn btn-primary" id="start-session-btn" onclick="StudentInterview.startSession()">🎤 Start Interview Session</button>
          </article>
          <div id="interview-session"></div>
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
              <div class="text-sm text-muted">Start a session to see your stats.</div>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  async function startSession() {
    const role = document.getElementById('interview-role')?.value || 'General';
    const difficulty = document.getElementById('interview-difficulty')?.value || 'medium';
    const btn = document.getElementById('start-session-btn');
    btn.textContent = 'Generating questions...'; btn.disabled = true;

    // Fetch adaptive questions from AI service (Feature 5)
    const result = await API.post('/interviews/start', {
      targetRole: role,
      difficulty,
      skillGaps: API.DEMO.student.skills?.map(s => s.name) || [],
    });

    sessionSource = result.data?.source || result.source || 'rule-engine';
    const fetched = result.data?.questions || result.questions || [];
    questions = fetched.map((q, i) => ({
      role: role,
      q: typeof q === 'string' ? q : q.text || q.q || `Question ${i + 1}`,
      skill: typeof q === 'object' ? (q.skill_tested || q.category || '') : '',
    }));

    if (questions.length === 0) {
      questions = [
        { role, q: 'Tell me about a project where you used data to make a decision.', skill: '' },
        { role, q: 'Describe a challenging problem you solved recently.', skill: '' },
      ];
    }

    currentQ = 0;
    chatHistory = [];
    btn.textContent = '🎤 Start Interview Session'; btn.disabled = false;

    _renderSession();
  }

  function _renderSession() {
    const el = document.getElementById('interview-session');
    el.innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="card-header"><h2 class="card-title">Interview Session</h2><span class="badge badge-accent">Q ${currentQ + 1}/${questions.length} · ${sessionSource === 'groq-llm' ? '🤖 AI-Generated' : '📋 Curated'}</span></div>
        <div class="interview-chat" id="chat-area">
          <div class="chat-bubble ai">
            <strong>🎤 ${questions[currentQ].role} Question:</strong><br>
            ${questions[currentQ].q}
            ${questions[currentQ].skill ? `<br><span class="text-xs text-muted">Testing: ${questions[currentQ].skill}</span>` : ''}
          </div>
        </div>
        ${Forms.textarea({ id: 'interview-answer', placeholder: 'Type your answer here... Use the STAR method: Situation → Task → Action → Result', rows: 5 })}
        <div class="flex gap-3 mt-4">
          <button class="btn btn-primary" id="submit-answer-btn" onclick="StudentInterview.submitAnswer()">Submit Answer</button>
          <button class="btn" onclick="StudentInterview.nextQuestion()">Skip →</button>
        </div>
      </article>
      <div id="interview-feedback"></div>
    `;
  }

  async function submitAnswer() {
    const answer = document.getElementById('interview-answer')?.value;
    if (!answer || answer.trim().length < 5) { Toast.warning('Please write a more detailed answer'); return; }

    const btn = document.getElementById('submit-answer-btn');
    btn.textContent = 'Evaluating...'; btn.disabled = true;

    const chat = document.getElementById('chat-area');
    chat.innerHTML += `<div class="chat-bubble user">${answer.replace(/</g, '&lt;')}</div>`;

    // Feature 4: LLM-powered feedback
    const result = await API.post('/interviews/feedback', {
      answer,
      question: questions[currentQ].q,
      targetRole: questions[currentQ].role,
    });
    const data = result.data || result;

    btn.textContent = 'Submit Answer'; btn.disabled = false;

    chatHistory.push({ question: questions[currentQ].q, answer, score: data.score, feedback: data.feedback });

    // AI feedback bubble
    chat.innerHTML += `
      <div class="chat-bubble ai">
        <strong>Score: ${data.score}/100</strong> ${data.source === 'groq-llm' ? '<span class="badge badge-accent" style="font-size:10px">LLM</span>' : ''}<br>
        ${data.feedback || ''}<br>
        ${data.follow_up_question ? `<br><em class="text-xs" style="opacity:0.8">🎯 Follow-up: ${data.follow_up_question}</em>` : ''}
        <em class="text-xs" style="opacity:0.5;display:block;margin-top:var(--space-2)">💡 ${data.tip || 'Remember STAR: Situation → Task → Action → Result.'}</em>
      </div>
    `;
    chat.scrollTop = chat.scrollHeight;
    document.getElementById('interview-answer').value = '';
    _updateStats();

    // Detailed feedback card
    document.getElementById('interview-feedback').innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="ai-result-header">
          <div class="ai-result-icon">🤖</div>
          <div><div class="ai-result-title">Answer Evaluation</div><div class="ai-result-subtitle">${questions[currentQ].role} · Engine: ${data.source || 'rule-engine'}</div></div>
          <span class="match-badge" style="margin-left:auto">${data.score}/100</span>
        </div>
        ${data.strengths?.length ? `<div class="mt-4"><h4 class="text-sm text-success mb-2">✓ Strengths</h4>${data.strengths.map(s => `<div class="text-sm text-muted">• ${s}</div>`).join('')}</div>` : ''}
        ${data.improvements?.length ? `<div class="mt-4"><h4 class="text-sm text-warning mb-2">⚡ Improve</h4>${data.improvements.map(s => `<div class="text-sm text-muted">• ${s}</div>`).join('')}</div>` : ''}
        ${data.model_answer ? `<div class="divider"></div><div class="insight-card accent"><strong>📝 Model Answer:</strong> ${data.model_answer}</div>` : ''}
      </article>
    `;
  }

  function nextQuestion() {
    currentQ = (currentQ + 1) % questions.length;
    const chat = document.getElementById('chat-area');
    chat.innerHTML += `<div class="chat-bubble ai"><strong>🎤 ${questions[currentQ].role} Question:</strong><br>${questions[currentQ].q}</div>`;
    chat.scrollTop = chat.scrollHeight;
    document.getElementById('interview-answer').value = '';
    const badge = document.querySelector('.card-header .badge');
    if (badge) badge.textContent = `Q ${currentQ + 1}/${questions.length} · ${sessionSource === 'groq-llm' ? '🤖 AI-Generated' : '📋 Curated'}`;
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

  return { render, startSession, submitAnswer, nextQuestion };
})();
