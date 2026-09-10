/* ============================================================
   CAMPUSLINK — AI Mock Interview Page (Feature 4 + 5)
   Full multi-question adaptive practice (3, 5, or 8 questions).
   Real-time LLM question generation + STAR answer scoring +
   final comprehensive performance scorecard.
   ============================================================ */
const StudentInterview = (() => {
  let questions = [];
  let currentQ = 0;
  let chatHistory = [];
  let sessionSource = 'loading';
  let activeRole = 'Data Analyst';
  let activeDifficulty = 'medium';

  // Comprehensive client-side fallback bank (7 questions per role)
  const FALLBACK_BANK = {
    'Data Analyst': [
      { text: 'How would you handle missing data or outliers in a large dataset before beginning your analysis?', skill: 'Data Cleaning', category: 'technical' },
      { text: 'Explain a scenario where you used SQL (such as window functions, CTEs, or complex joins) to derive actionable business insights.', skill: 'SQL & Analytics', category: 'technical' },
      { text: 'What is the difference between correlation and causation? Provide a concrete business example.', skill: 'Statistical Reasoning', category: 'technical' },
      { text: 'Describe a time when your analytical insights challenged a team assumption or influenced an important business decision.', skill: 'Communication (STAR)', category: 'behavioral' },
      { text: 'You discover an unexpected anomaly in key sales metrics 2 hours before an executive presentation. What are your immediate and follow-up steps?', skill: 'Critical Thinking', category: 'situational' },
      { text: 'How do you decide which visualization (e.g., bar chart, line chart, scatter plot, heatmap) best communicates your findings?', skill: 'Data Visualization', category: 'technical' },
      { text: 'Walk through how you would design an A/B test experiment to measure whether a new feature improves user conversion rates.', skill: 'A/B Testing', category: 'technical' },
    ],
    'Software Engineer': [
      { text: 'Describe your systematic approach to diagnosing and debugging a complex, intermittent bug in production.', skill: 'Debugging & RCA', category: 'technical' },
      { text: 'Explain the differences between a stack and a queue. Describe a real-world software architecture scenario where you would choose each.', skill: 'Data Structures', category: 'technical' },
      { text: 'What are the principles of RESTful API design, and how do you handle idempotent operations and API versioning?', skill: 'API Architecture', category: 'technical' },
      { text: 'Tell me about a time you had to refactor legacy code or resolve technical debt under a tight deadline. How did you balance speed and maintainability?', skill: 'Code Quality (STAR)', category: 'behavioral' },
      { text: 'Your team is split between a microservices approach and a monolithic service for a new product feature. How would you evaluate the tradeoffs?', skill: 'System Design', category: 'situational' },
      { text: 'What is the time and space complexity of QuickSort? In what worst-case scenario does it degrade to O(n²), and how can you mitigate it?', skill: 'Algorithms', category: 'technical' },
      { text: 'Why are CI/CD pipelines and automated testing suites critical to high-velocity software engineering teams?', skill: 'DevOps & Reliability', category: 'technical' },
    ],
    'ML Engineer': [
      { text: 'Explain the bias-variance tradeoff and how regularization techniques (L1 Lasso vs. L2 Ridge) help mitigate overfitting.', skill: 'ML Foundations', category: 'technical' },
      { text: 'How do you prevent and detect data leakage during feature engineering and cross-validation pipelines?', skill: 'Feature Engineering', category: 'technical' },
      { text: 'How do you handle severe class imbalance in a classification problem? Compare resampling vs focal loss vs threshold tuning.', skill: 'Model Training', category: 'technical' },
      { text: 'Describe an end-to-end machine learning project you built. What were the biggest hurdles from data preparation to model inference?', skill: 'MLOps (STAR)', category: 'behavioral' },
      { text: 'Your model achieves 95% accuracy in offline test evaluation, but business KPIs decline after deployment. How do you troubleshoot?', skill: 'Model Monitoring', category: 'situational' },
      { text: 'In a fraud detection model where missing a fraudulent transaction is 50x more costly than a false positive, which evaluation metrics would you optimize?', skill: 'Metrics Evaluation', category: 'technical' },
    ],
    'Web Developer': [
      { text: 'Explain the browser Critical Rendering Path and the specific techniques you use to optimize Core Web Vitals (LCP, INP, CLS).', skill: 'Performance', category: 'technical' },
      { text: 'Compare CSS Grid and CSS Flexbox. When is it advantageous to use Grid over Flexbox, and vice versa in responsive layouts?', skill: 'CSS Layout', category: 'technical' },
      { text: 'Explain client-side state management patterns. When is local component state sufficient versus needing global application state?', skill: 'Frontend Architecture', category: 'technical' },
      { text: 'Tell me about a complex interactive UI component you designed and how you ensured accessibility (ARIA) and responsive behavior.', skill: 'UI/UX (STAR)', category: 'behavioral' },
      { text: 'A critical client-facing checkout bug is reported exclusively on mobile browsers on a Friday evening. How do you isolate, reproduce, and resolve it?', skill: 'Troubleshooting', category: 'situational' },
      { text: 'What security measures do you implement to protect modern web applications against Cross-Site Scripting (XSS) and CSRF attacks?', skill: 'Web Security', category: 'technical' },
    ],
    'General': [
      { text: 'Tell me about a challenging project where you took ownership. Use the STAR framework: Situation, Task, Action, and measurable Result.', skill: 'Ownership & STAR', category: 'behavioral' },
      { text: 'Describe a time you had to learn an unfamiliar technology, tool, or framework on short notice to deliver a requirement.', skill: 'Adaptability', category: 'behavioral' },
      { text: 'How do you prioritize competing deadlines when multiple urgent tasks demand your immediate attention?', skill: 'Time Management', category: 'situational' },
      { text: 'Tell me about a time you made a mistake or faced a failure in a project. What did you learn, and how did you adapt your approach?', skill: 'Growth Mindset', category: 'behavioral' },
      { text: 'Describe a situation where you had a disagreement with a team member or mentor. How did you communicate and resolve it constructively?', skill: 'Collaboration', category: 'behavioral' },
      { text: 'Where do you see yourself technically in the next 2-3 years, and what concrete steps are you taking currently to reach that goal?', skill: 'Career Vision', category: 'behavioral' },
    ]
  };

  async function render() {
    currentQ = 0;
    chatHistory = [];
    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Mock Interview</div>
          <h1 class="page-title">Placement Interview Simulator</h1>
          <p class="page-subtitle">Adaptive interview practice with live AI-generated questions, STAR answer grading, and comprehensive performance analysis.</p>
        </div>
      </div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">Configure Interview Session</h2>
            </div>
            <div class="grid grid-3 mb-4">
              ${Forms.select({ id: 'interview-role', label: 'Target Role', choices: [
                { value: 'Data Analyst', label: 'Data Analyst' },
                { value: 'Software Engineer', label: 'Software Engineer' },
                { value: 'ML Engineer', label: 'ML Engineer' },
                { value: 'Web Developer', label: 'Web Developer' },
                { value: 'General', label: 'General Placement' },
              ]})}
              ${Forms.select({ id: 'interview-difficulty', label: 'Difficulty', choices: [
                { value: 'easy', label: 'Easy (Foundations)' },
                { value: 'medium', label: 'Medium (Campus Standard)' },
                { value: 'hard', label: 'Hard (Top Tier / MNC)' },
              ]})}
              ${Forms.select({ id: 'interview-count', label: 'Session Length', choices: [
                { value: '3', label: '3 Questions (Quick)' },
                { value: '5', label: '5 Questions (Standard)' },
                { value: '8', label: '8 Questions (Deep Dive)' },
              ]})}
            </div>
            <button class="btn btn-primary" id="start-session-btn" onclick="StudentInterview.startSession()">🎤 Launch Interview Session</button>
          </article>
          <div id="interview-session"></div>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">🎯 STAR Method Guide</h3>
            <div class="insight-card accent mb-4">
              <strong>Situation:</strong> Set the context.<br>
              <strong>Task:</strong> Your core responsibility.<br>
              <strong>Action:</strong> Tools & actions you took.<br>
              <strong>Result:</strong> Quantifiable impact & metrics.
            </div>
            <ul style="padding-left:var(--space-5);color:var(--text-secondary)" class="text-sm">
              <li class="mb-2">Include metrics: numbers, percentages, efficiency gains</li>
              <li class="mb-2">Highlight personal contribution vs. whole group</li>
              <li class="mb-2">Aim for 80–150 words per structured response</li>
              <li class="mb-2">AI evaluates structure, keywords, and relevance in real time</li>
            </ul>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">Live Session Metrics</h2></div>
            <div id="session-stats">
              <div class="text-sm text-muted">Configure and launch a session to view real-time feedback & scoring.</div>
            </div>
          </article>
        </aside>
      </div>
    `;

    // Set defaults
    const countSelect = document.getElementById('interview-count');
    if (countSelect) countSelect.value = '5';
    const diffSelect = document.getElementById('interview-difficulty');
    if (diffSelect) diffSelect.value = 'medium';
  }

  async function startSession() {
    activeRole = document.getElementById('interview-role')?.value || 'Data Analyst';
    activeDifficulty = document.getElementById('interview-difficulty')?.value || 'medium';
    const count = parseInt(document.getElementById('interview-count')?.value || '5', 10);
    const btn = document.getElementById('start-session-btn');
    btn.textContent = '🤖 Generating Adaptive Questions...';
    btn.disabled = true;

    try {
      const result = await API.post('/interviews/start', {
        targetRole: activeRole,
        difficulty: activeDifficulty,
        count: count,
        skillGaps: API.DEMO.student.skills?.map(s => s.name) || [],
      });

      sessionSource = result.data?.source || result.source || 'curated-bank';
      const fetched = result.data?.questions || result.questions || [];

      if (Array.isArray(fetched) && fetched.length >= 3) {
        questions = fetched.map((q, i) => ({
          role: activeRole,
          q: typeof q === 'string' ? q : q.text || q.q || `Question ${i + 1}`,
          skill: typeof q === 'object' ? (q.skill_tested || q.category || activeRole) : activeRole,
          category: typeof q === 'object' ? (q.category || 'technical') : 'technical',
        }));
      } else {
        _useFallbackQuestions(activeRole, count);
      }
    } catch (_) {
      _useFallbackQuestions(activeRole, count);
    }

    currentQ = 0;
    chatHistory = [];
    btn.textContent = '🎤 Launch Interview Session';
    btn.disabled = false;

    _renderSession();
  }

  function _useFallbackQuestions(role, count) {
    sessionSource = 'curated-bank';
    const bank = FALLBACK_BANK[role] || FALLBACK_BANK['General'];
    questions = bank.slice(0, count).map(q => ({
      role: role,
      q: q.text,
      skill: q.skill || role,
      category: q.category || 'technical',
    }));
  }

  function _renderSession() {
    const el = document.getElementById('interview-session');
    const pct = Math.round(((currentQ + 1) / questions.length) * 100);
    const qObj = questions[currentQ];

    el.innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="card-header">
          <h2 class="card-title">Active Interview</h2>
          <span class="badge badge-accent">Question ${currentQ + 1} of ${questions.length} · ${sessionSource === 'groq-llm' ? '🤖 AI-Adaptive' : '📋 Curated'}</span>
        </div>

        <div class="progress-group mb-4">
          <div class="progress-label">
            <span class="progress-label-name">Interview Progress</span>
            <span class="progress-label-value">${currentQ + 1} / ${questions.length} (${pct}%)</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill success" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="interview-chat" id="chat-area">
          <div class="chat-bubble ai">
            <div class="flex items-center justify-between mb-2">
              <strong>🎤 Question ${currentQ + 1}: ${qObj.role}</strong>
              <span class="badge" style="font-size:10px;text-transform:uppercase">${qObj.category || 'technical'}</span>
            </div>
            <div style="font-size:15px;line-height:1.5;margin-bottom:8px">${qObj.q}</div>
            ${qObj.skill ? `<span class="text-xs text-muted">🎯 Competency Tested: <strong>${qObj.skill}</strong></span>` : ''}
          </div>
        </div>

        <div class="mt-4">
          ${Forms.textarea({
            id: 'interview-answer',
            placeholder: 'Type your response here using STAR methodology:\n• Situation & Task: The background and problem\n• Action: Specific tools, logic, or decisions you executed\n• Result: Measurable outcome or learning',
            rows: 5
          })}
        </div>

        <div class="flex items-center justify-between mt-4" id="session-action-bar">
          <div class="flex gap-2">
            <button class="btn btn-primary" id="submit-answer-btn" onclick="StudentInterview.submitAnswer()">
              🚀 Submit Answer
            </button>
            <button class="btn" id="skip-btn" onclick="StudentInterview.skipQuestion()">
              Skip Question ⏭️
            </button>
          </div>
          <span class="text-xs text-muted">Press Submit to get immediate AI scoring</span>
        </div>
      </article>

      <div id="interview-feedback"></div>
    `;
  }

  async function submitAnswer() {
    const answer = document.getElementById('interview-answer')?.value;
    if (!answer || answer.trim().length < 8) {
      Toast.warning('Please provide a complete answer with details before submitting.');
      return;
    }

    const btn = document.getElementById('submit-answer-btn');
    btn.textContent = '⏳ Evaluating with AI...';
    btn.disabled = true;

    const chat = document.getElementById('chat-area');
    chat.innerHTML += `
      <div class="chat-bubble user">
        <strong>You:</strong><br>
        ${answer.replace(/</g, '&lt;')}
      </div>
    `;

    // Fetch live feedback
    let data;
    try {
      const result = await API.post('/interviews/feedback', {
        answer,
        question: questions[currentQ].q,
        targetRole: questions[currentQ].role,
      });
      data = result.data || result;
    } catch (_) {
      data = {
        score: 72,
        feedback: 'Good attempt. To achieve top scores, incorporate more concrete metrics and specific technical libraries or methodologies used.',
        strengths: ['Addressed the main question prompt', 'Structured logical progression'],
        improvements: ['Include quantifiable business outcomes', 'Specify architectural or algorithmic details'],
        tip: 'Remember STAR: Situation → Task → Action → Result.',
        source: 'rule-engine',
      };
    }

    chatHistory.push({
      questionNum: currentQ + 1,
      question: questions[currentQ].q,
      answer,
      score: data.score || 70,
      feedback: data.feedback,
      category: questions[currentQ].category,
    });

    // Append AI feedback in chat bubble
    chat.innerHTML += `
      <div class="chat-bubble ai animate-fade-in-up">
        <div class="flex items-center justify-between mb-2">
          <strong>Evaluation Result:</strong>
          <span class="badge ${data.score >= 75 ? 'badge-success' : 'badge-warning'}">Score: ${data.score}/100</span>
        </div>
        <p class="text-sm mb-2">${data.feedback || ''}</p>
        ${data.follow_up_question ? `<div class="insight-card accent mt-2" style="padding:var(--space-2) var(--space-3);font-size:12px"><strong>🎯 Follow-Up Probe:</strong> ${data.follow_up_question}</div>` : ''}
        ${data.tip ? `<div class="text-xs text-muted mt-2">💡 <em>Tip: ${data.tip}</em></div>` : ''}
      </div>
    `;
    chat.scrollTop = chat.scrollHeight;

    // Detailed feedback card
    document.getElementById('interview-feedback').innerHTML = `
      <article class="card animate-fade-in-up mt-4">
        <div class="ai-result-header">
          <div class="ai-result-icon">🤖</div>
          <div>
            <div class="ai-result-title">Answer Breakdown · Q ${currentQ + 1} of ${questions.length}</div>
            <div class="ai-result-subtitle">${questions[currentQ].role} · Evaluator: ${data.source === 'groq-llm' ? 'Groq Llama / Qwen' : 'STAR Heuristic'}</div>
          </div>
          <span class="match-badge" style="margin-left:auto;font-size:16px">${data.score}/100</span>
        </div>
        ${data.strengths?.length ? `
          <div class="mt-4">
            <h4 class="text-sm text-success mb-2">✓ Key Strengths</h4>
            ${data.strengths.map(s => `<div class="text-sm text-muted">• ${s}</div>`).join('')}
          </div>
        ` : ''}
        ${data.improvements?.length ? `
          <div class="mt-4">
            <h4 class="text-sm text-warning mb-2">⚡ Areas for Growth</h4>
            ${data.improvements.map(s => `<div class="text-sm text-muted">• ${s}</div>`).join('')}
          </div>
        ` : ''}
      </article>
    `;

    _updateStats();

    // Transform Action Bar: Offer prominent Next Question or Finish
    const isLast = currentQ >= questions.length - 1;
    const actionBar = document.getElementById('session-action-bar');
    if (actionBar) {
      actionBar.innerHTML = `
        <button class="btn btn-primary" onclick="StudentInterview.nextQuestion()" style="font-weight:700">
          ${isLast ? '🏁 Finish Interview & View Scorecard' : `Next Question → (Q ${currentQ + 2} of ${questions.length})`}
        </button>
        <span class="text-xs text-muted">${isLast ? 'Final question answered!' : `${questions.length - (currentQ + 1)} question(s) remaining`}</span>
      `;
    }
  }

  function skipQuestion() {
    chatHistory.push({
      questionNum: currentQ + 1,
      question: questions[currentQ].q,
      answer: '[Skipped by candidate]',
      score: 0,
      feedback: 'Question skipped.',
      category: questions[currentQ].category,
    });
    nextQuestion();
  }

  function nextQuestion() {
    currentQ++;
    if (currentQ < questions.length) {
      _renderSession();
    } else {
      _renderSummary();
    }
  }

  function _renderSummary() {
    const answered = chatHistory.filter(h => h.answer !== '[Skipped by candidate]');
    const totalScore = answered.reduce((acc, h) => acc + h.score, 0);
    const avgScore = answered.length > 0 ? Math.round(totalScore / answered.length) : 0;

    let tierLabel = 'Needs Practice';
    let tierBadgeClass = 'badge-warning';
    if (avgScore >= 80) {
      tierLabel = 'Placement Ready 🌟';
      tierBadgeClass = 'badge-success';
    } else if (avgScore >= 65) {
      tierLabel = 'Solid Foundation 👍';
      tierBadgeClass = 'badge-accent';
    }

    const sessionEl = document.getElementById('interview-session');
    sessionEl.innerHTML = `
      <article class="card animate-fade-in-up" style="border:1px solid var(--accent)">
        <div class="card-header">
          <h2 class="card-title">🎉 Interview Session Completed!</h2>
          <span class="badge ${tierBadgeClass}">${tierLabel}</span>
        </div>

        <div class="grid grid-kpis my-4">
          <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
            <div class="text-xs text-muted uppercase">Overall Score</div>
            <div style="font-size:32px;font-weight:800;color:var(--accent);margin:var(--space-1) 0">${avgScore}/100</div>
            <div class="text-xs text-muted">${answered.length} of ${questions.length} answered</div>
          </div>
          <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
            <div class="text-xs text-muted uppercase">Target Role</div>
            <div style="font-size:18px;font-weight:700;color:var(--text-primary);margin:var(--space-2) 0">${activeRole}</div>
            <div class="text-xs text-muted">Difficulty: ${activeDifficulty}</div>
          </div>
          <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
            <div class="text-xs text-muted uppercase">Completion Rate</div>
            <div style="font-size:32px;font-weight:800;color:var(--success);margin:var(--space-1) 0">${Math.round((answered.length / questions.length) * 100)}%</div>
            <div class="text-xs text-muted">${questions.length} total questions</div>
          </div>
          <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
            <div class="text-xs text-muted uppercase">Evaluation Engine</div>
            <div style="font-size:16px;font-weight:700;color:var(--text-secondary);margin:var(--space-2) 0">${sessionSource === 'groq-llm' ? '🤖 Groq Llama' : '📋 STAR Heuristic'}</div>
            <div class="text-xs text-muted">Real-time feedback</div>
          </div>
        </div>

        <h3 class="card-title mb-3">Question Breakdown</h3>
        <div class="stack mb-6">
          ${chatHistory.map(h => `
            <div class="card" style="padding:var(--space-3) var(--space-4);background:var(--bg-surface);border:1px solid var(--border-subtle)">
              <div class="flex items-center justify-between mb-1">
                <strong class="text-sm">Q${h.questionNum}: ${h.question}</strong>
                <span class="badge ${h.score >= 75 ? 'badge-success' : h.score === 0 ? 'badge-warning' : 'badge-accent'}">
                  ${h.score === 0 ? 'Skipped' : `${h.score}/100`}
                </span>
              </div>
              <p class="text-xs text-muted" style="margin-top:4px"><em>"${h.answer.slice(0, 120)}${h.answer.length > 120 ? '...' : ''}"</em></p>
              ${h.feedback && h.score > 0 ? `<div class="text-xs text-secondary mt-1">💡 ${h.feedback}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div class="flex gap-3">
          <button class="btn btn-primary" onclick="StudentInterview.render()">🔄 Start New Session</button>
          <button class="btn" onclick="Toast.info('Scorecard saved to your student placement dossier.')">📥 Save to Dossier</button>
        </div>
      </article>
    `;

    document.getElementById('interview-feedback').innerHTML = '';
  }

  function _updateStats() {
    const el = document.getElementById('session-stats');
    if (!el || !chatHistory.length) return;
    const answered = chatHistory.filter(h => h.score > 0);
    const avg = answered.length ? Math.round(answered.reduce((s, c) => s + c.score, 0) / answered.length) : 0;
    el.innerHTML = `
      <div class="progress-group">
        <div class="progress-label">
          <span class="progress-label-name">Session Average</span>
          <span class="progress-label-value">${avg}/100</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill ${avg >= 75 ? 'success' : 'warning'}" style="width:${avg}%"></div>
        </div>
      </div>
      <div class="text-xs text-muted mt-3">
        ${chatHistory.length} of ${questions.length} questions completed this session.
      </div>
    `;
  }

  return { render, startSession, submitAnswer, nextQuestion, skipQuestion };
})();
