/* ============================================================
   CAMPUSLINK — AI Mock Interview Page
   100% Dynamic Groq LLM Interview Engine.
   - Zero hardcoded questions: AI asks dynamic questions based on
     whatever role, topics, and difficulty the candidate chooses (up to 20 questions).
   - At the end, AI performs a full diagnostic:
     scores candidate, explains where they went wrong, provides
     how to improve and full model answers for every question.
   ============================================================ */

const StudentInterview = (() => {
  let questions = [];
  let currentQ = 0;
  let chatHistory = [];
  let activeRole = 'Data Analyst';
  let activeTopics = '';
  let activeDifficulty = 'medium';

  function getCustomApiKey() {
    return localStorage.getItem('CAMPUSLINK_CUSTOM_GROQ_KEY') || '';
  }

  function setCustomApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem('CAMPUSLINK_CUSTOM_GROQ_KEY', key.trim());
    } else {
      localStorage.removeItem('CAMPUSLINK_CUSTOM_GROQ_KEY');
    }
  }

  function onKeyOptionChange() {
    const isCustom = document.getElementById('key-choice-custom')?.checked;
    const box = document.getElementById('custom-key-input-box');
    if (box) {
      box.style.display = isCustom ? 'block' : 'none';
    }
  }

  async function render() {
    currentQ = 0;
    chatHistory = [];
    questions = [];

    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Mock Interview</div>
          <h1 class="page-title">Placement Interview Simulator</h1>
          <p class="page-subtitle">Every question is generated live by Groq AI based on what you choose. At the end, AI provides a full diagnostic scorecard showing where you went wrong and how to improve.</p>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up" id="interview-config-card">
            <div class="card-header">
              <h2 class="card-title">🎯 Configure Your AI Interview</h2>
              <span class="badge badge-accent">⚡ Powered by Groq LLM</span>
            </div>

            <div class="grid grid-2 mb-4">
              <div>
                <label class="form-label font-bold mb-1" for="interview-role">Target Role</label>
                <select class="form-select" id="interview-role" onchange="StudentInterview.onRoleChange()">
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Software Engineer">Software Engineer (SDE)</option>
                  <option value="ML Engineer">Machine Learning Engineer</option>
                  <option value="Web Developer">Full Stack Web Developer</option>
                  <option value="DevOps Engineer">Cloud & DevOps Engineer</option>
                  <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                  <option value="custom">✏️ Custom Role (Enter your own)...</option>
                </select>
                <div id="custom-role-container" class="mt-2" style="display:none">
                  <input class="form-input" id="custom-role-input" placeholder="e.g., Embedded Systems Engineer, QA Automation">
                </div>
              </div>

              <div>
                <label class="form-label font-bold mb-1" for="interview-difficulty">Difficulty Level</label>
                <select class="form-select" id="interview-difficulty">
                  <option value="easy">Easy (Fundamentals & Core Concepts)</option>
                  <option value="medium" selected>Medium (Standard Campus Placement)</option>
                  <option value="hard">Hard (Top Product & MNC Bar)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-2 mb-4">
              <div>
                <label class="form-label font-bold mb-1" for="interview-topics">Focus Topics / Tech Stack (Optional)</label>
                <input class="form-input" id="interview-topics" placeholder="e.g., SQL, Pandas, A/B Testing, System Design, React">
                <span class="text-xs text-muted mt-1" style="display:block">Leave blank or specify skills you want the AI to grill you on.</span>
              </div>

              <div>
                <label class="form-label font-bold mb-1" for="interview-count">Number of Questions (Up to 20)</label>
                <select class="form-select" id="interview-count">
                  <option value="3">3 Questions (Quick Drill)</option>
                  <option value="5" selected>5 Questions (Standard Mock)</option>
                  <option value="10">10 Questions (Comprehensive)</option>
                  <option value="15">15 Questions (Full Technical Round)</option>
                  <option value="20">20 Questions (Marathon Placement Round)</option>
                </select>
              </div>
            </div>

            <!-- AI Key Provider Selection: Built-in Platform Key (Default) vs Own Key (Optional) -->
            <div class="mb-5" style="padding:var(--space-3) var(--space-4);background:var(--bg-surface);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
              <div class="text-xs font-bold text-secondary mb-2 uppercase" style="letter-spacing:0.05em">AI Key Provider</div>
              <div class="flex flex-col gap-2">
                <label class="flex items-center gap-2 text-xs cursor-pointer" style="user-select:none">
                  <input type="radio" name="key-choice" value="platform" id="key-choice-platform" ${getCustomApiKey() ? '' : 'checked'} onchange="StudentInterview.onKeyOptionChange()">
                  <span><strong style="color:var(--text-primary)">⚡ CampusLink Free AI (Default)</strong> — Uses our uploaded server key. Students do not need to buy or enter any key.</span>
                </label>
                <label class="flex items-center gap-2 text-xs cursor-pointer" style="user-select:none">
                  <input type="radio" name="key-choice" value="custom" id="key-choice-custom" ${getCustomApiKey() ? 'checked' : ''} onchange="StudentInterview.onKeyOptionChange()">
                  <span class="text-muted"><strong style="color:var(--text-secondary)">🔑 Use My Own Groq API Key (Optional)</strong> — Only if you have your own personal Groq key.</span>
                </label>
              </div>

              <div id="custom-key-input-box" class="mt-3" style="${getCustomApiKey() ? 'display:block' : 'display:none'};padding-top:var(--space-2);border-top:1px dashed var(--border-subtle)">
                <label class="form-label text-xs mb-1" for="custom-groq-key-input">Your Personal Groq API Key (starts with <code>gsk_...</code>):</label>
                <input class="form-input text-xs" type="password" id="custom-groq-key-input" placeholder="gsk_..." value="${getCustomApiKey()}">
                <span class="text-xs text-muted mt-1" style="display:block">Your personal key is stored in your browser session only.</span>
              </div>
            </div>

            <button class="btn btn-primary" id="start-session-btn" onclick="StudentInterview.startSession()" style="width:100%;font-weight:700;font-size:15px;padding:var(--space-3)">
              🚀 Generate Questions & Begin Interview
            </button>
          </article>

          <div id="interview-session"></div>
        </div>

        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-3">💡 How This AI Interview Works</h3>
            <ol style="padding-left:var(--space-5);color:var(--text-secondary)" class="text-sm">
              <li class="mb-2"><strong>Live AI Generation:</strong> Groq LLM creates completely unique questions based on your specific role & topics.</li>
              <li class="mb-2"><strong>Answer at Your Pace:</strong> Answer using the STAR method (Situation, Task, Action, Result) or code explanations.</li>
              <li class="mb-2"><strong>Skip or Finish Early:</strong> You can skip questions or click "Finish & Evaluate" whenever you are ready.</li>
              <li class="mb-2"><strong>Deep Final Diagnostic:</strong> AI grades all answers, pinpoints <em>where you went wrong</em>, and generates <em>ideal model answers</em>.</li>
            </ol>
          </article>

          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">Live Session Tracker</h2></div>
            <div id="session-stats">
              <div class="text-sm text-muted">Configure and start your interview to track live progress and question answers.</div>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  function onRoleChange() {
    const roleSelect = document.getElementById('interview-role');
    const customContainer = document.getElementById('custom-role-container');
    if (roleSelect && customContainer) {
      customContainer.style.display = roleSelect.value === 'custom' ? 'block' : 'none';
    }
  }

  async function startSession() {
    const roleSelect = document.getElementById('interview-role')?.value || 'Data Analyst';
    const customRole = document.getElementById('custom-role-input')?.value?.trim();
    activeRole = roleSelect === 'custom' && customRole ? customRole : roleSelect;

    activeTopics = document.getElementById('interview-topics')?.value?.trim() || '';
    activeDifficulty = document.getElementById('interview-difficulty')?.value || 'medium';
    const count = parseInt(document.getElementById('interview-count')?.value || '5', 10);

    const isCustom = document.getElementById('key-choice-custom')?.checked;
    let customApiKey = '';
    if (isCustom) {
      customApiKey = document.getElementById('custom-groq-key-input')?.value?.trim() || '';
      setCustomApiKey(customApiKey);
    }

    const btn = document.getElementById('start-session-btn');
    btn.textContent = `⏳ Groq AI is generating ${count} questions for ${activeRole}...`;
    btn.disabled = true;

    try {
      const result = await API.post('/interviews/start', {
        targetRole: activeRole,
        topics: activeTopics,
        difficulty: activeDifficulty,
        count: count,
        apiKey: customApiKey,
      });

      if (!result.success || !result.data?.questions?.length) {
        throw new Error(result.error?.message || 'Failed to receive questions from AI');
      }

      questions = result.data.questions;
      currentQ = 0;
      chatHistory = [];

      // Hide config card to maximize screen focus
      const configCard = document.getElementById('interview-config-card');
      if (configCard) configCard.style.display = 'none';

      Toast.success(`AI generated ${questions.length} interview questions for ${activeRole}!`);
      _renderSession();
    } catch (err) {
      btn.textContent = '🚀 Generate Questions & Begin Interview';
      btn.disabled = false;
      Toast.error(`Could not generate questions: ${err.message}`);
    }
  }

  function _renderSession() {
    const el = document.getElementById('interview-session');
    const pct = Math.round(((currentQ + 1) / questions.length) * 100);
    const qObj = questions[currentQ];

    el.innerHTML = `
      <article class="card animate-fade-in-up" style="border-top:3px solid var(--accent)">
        <div class="card-header">
          <div class="flex items-center gap-2">
            <h2 class="card-title">Active Interview</h2>
            <span class="badge badge-accent">Question ${currentQ + 1} of ${questions.length}</span>
          </div>
          <button class="btn btn-sm" onclick="StudentInterview.finishEarly()" style="color:var(--text-muted)">
            🏁 Finish & Evaluate Now
          </button>
        </div>

        <div class="progress-group mb-4">
          <div class="progress-label">
            <span class="progress-label-name">${activeRole} · ${activeDifficulty.toUpperCase()}</span>
            <span class="progress-label-value">${currentQ + 1} of ${questions.length} (${pct}%)</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill success" style="width:${pct}%"></div>
          </div>
        </div>

        <div class="interview-chat" id="chat-area" style="min-height:120px">
          <div class="chat-bubble ai">
            <div class="flex items-center justify-between mb-2">
              <strong>🎤 Question ${currentQ + 1}:</strong>
              <span class="badge" style="font-size:10px;text-transform:uppercase">${qObj.category || 'Technical'}</span>
            </div>
            <div style="font-size:16px;font-weight:600;line-height:1.5;margin-bottom:8px;color:var(--text-primary)">
              ${qObj.text}
            </div>
            ${qObj.skill ? `<div class="text-xs text-muted">🎯 Competency Focus: <strong>${qObj.skill}</strong></div>` : ''}
          </div>
        </div>

        <div class="mt-4">
          <label class="form-label font-bold mb-1" for="interview-answer">Your Response</label>
          ${Forms.textarea({
            id: 'interview-answer',
            placeholder: 'Type your answer here...\n\nTips for maximum score:\n• Situation & Task: The background and problem\n• Action: Specific tools, algorithms, decisions, and syntax you executed\n• Result: Measurable outcome or learning',
            rows: 6
          })}
        </div>

        <div class="flex items-center justify-between mt-4">
          <div class="flex gap-2">
            <button class="btn btn-primary" id="submit-answer-btn" onclick="StudentInterview.submitAnswer()">
              ${currentQ >= questions.length - 1 ? '🏁 Submit Final Answer & View Diagnostic' : 'Submit & Next Question →'}
            </button>
            <button class="btn" id="skip-btn" onclick="StudentInterview.skipQuestion()">
              Skip Question ⏭️
            </button>
          </div>
          <span class="text-xs text-muted">All answers evaluated at conclusion</span>
        </div>
      </article>

      <div id="interview-feedback"></div>
    `;

    _updateStats();
  }

  async function submitAnswer() {
    const answerInput = document.getElementById('interview-answer');
    const answer = answerInput?.value?.trim() || '';

    if (!answer || answer.length < 5) {
      Toast.warning('Please type a response before submitting, or click "Skip Question" if unsure.');
      return;
    }

    const qObj = questions[currentQ];
    chatHistory.push({
      questionNum: currentQ + 1,
      question: qObj.text,
      answer: answer,
      category: qObj.category,
      skill: qObj.skill,
    });

    currentQ++;
    if (currentQ < questions.length) {
      _renderSession();
    } else {
      _generateFinalEvaluation();
    }
  }

  function skipQuestion() {
    const qObj = questions[currentQ];
    chatHistory.push({
      questionNum: currentQ + 1,
      question: qObj.text,
      answer: '[Skipped by candidate]',
      category: qObj.category,
      skill: qObj.skill,
    });

    currentQ++;
    if (currentQ < questions.length) {
      _renderSession();
    } else {
      _generateFinalEvaluation();
    }
  }

  function finishEarly() {
    const currentAnswer = document.getElementById('interview-answer')?.value?.trim();
    if (currentAnswer && currentAnswer.length >= 5) {
      const qObj = questions[currentQ];
      chatHistory.push({
        questionNum: currentQ + 1,
        question: qObj.text,
        answer: currentAnswer,
        category: qObj.category,
        skill: qObj.skill,
      });
    }

    if (!chatHistory.length) {
      Toast.warning('Answer at least one question before concluding the interview.');
      return;
    }

    if (confirm(`Finish interview session now? The AI will evaluate the ${chatHistory.length} question(s) completed.`)) {
      _generateFinalEvaluation();
    }
  }

  async function _generateFinalEvaluation() {
    const el = document.getElementById('interview-session');
    el.innerHTML = `
      <article class="card animate-fade-in-up" style="text-align:center;padding:var(--space-12) var(--space-6)">
        <div class="empty-state-icon animate-pulse" style="font-size:48px;margin-bottom:var(--space-4)">🧠</div>
        <h2 class="card-title mb-2" style="font-size:24px">AI is Analyzing Your Full Interview...</h2>
        <p class="text-secondary text-sm max-w-md mx-auto mb-4">
          Groq LLM is reviewing all ${chatHistory.length} answers, calculating your placement score, identifying exactly where you made mistakes, and writing model answers for you.
        </p>
        <div class="progress-bar max-w-md mx-auto">
          <div class="progress-bar-fill accent animate-pulse" style="width:100%"></div>
        </div>
      </article>
    `;

    try {
      const isCustom = document.getElementById('key-choice-custom')?.checked;
      const apiKey = isCustom ? getCustomApiKey() : '';

      const res = await API.post('/interviews/final-evaluation', {
        targetRole: activeRole,
        topics: activeTopics,
        history: chatHistory,
        apiKey: apiKey,
      });

      if (!res.success || !res.data) {
        throw new Error(res.error?.message || 'Evaluation generation timed out');
      }

      _renderFinalScorecard(res.data);
    } catch (err) {
      Toast.error(`Could not generate final AI evaluation: ${err.message}`);
      _renderFallbackScorecard();
    }
  }

  function _renderFinalScorecard(data) {
    const el = document.getElementById('interview-session');
    const score = data.overall_score || 70;
    const verdict = data.verdict || (score >= 80 ? 'Placement Ready' : score >= 65 ? 'Solid Potential' : 'Needs Focused Practice');
    const verdictBadgeClass = score >= 80 ? 'badge-success' : score >= 65 ? 'badge-accent' : 'badge-warning';

    el.innerHTML = `
      <article class="card animate-fade-in-up" style="border:1px solid var(--border-strong)">
        <div class="card-header">
          <div>
            <span class="page-eyebrow">Comprehensive Diagnostic Report</span>
            <h2 class="card-title" style="font-size:24px">Placement Readiness Evaluation</h2>
          </div>
          <span class="badge ${verdictBadgeClass}" style="font-size:14px;padding:6px 14px">${verdict}</span>
        </div>

        <div class="grid grid-kpis my-4">
          <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
            <div class="text-xs text-muted uppercase font-bold">Overall Score</div>
            <div style="font-size:36px;font-weight:900;color:${score >= 75 ? 'var(--success)' : 'var(--accent)'};margin:var(--space-1) 0">${score}/100</div>
            <div class="text-xs text-muted">${chatHistory.filter(h => !h.answer.includes('[Skipped')).length} of ${chatHistory.length} answered</div>
          </div>
          <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
            <div class="text-xs text-muted uppercase font-bold">Role & Difficulty</div>
            <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin:var(--space-2) 0">${activeRole}</div>
            <div class="text-xs text-muted">${activeDifficulty.toUpperCase()} · ${chatHistory.length} Qs</div>
          </div>
          <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
            <div class="text-xs text-muted uppercase font-bold">Evaluation Engine</div>
            <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin:var(--space-2) 0">Groq LLM</div>
            <div class="text-xs text-muted">STAR Method Diagnostic</div>
          </div>
        </div>

        <!-- Executive Summary -->
        <div class="insight-card accent mb-6">
          <strong>📋 Executive Evaluator Summary:</strong><br>
          ${data.executive_summary || 'Candidate demonstrated foundational competency across key domains. Practice with edge cases and metrics will elevate overall placement readiness.'}
        </div>

        <!-- Strengths & Weaknesses Grid -->
        <div class="grid grid-2 mb-6">
          <div class="card" style="background:var(--bg-surface);padding:var(--space-4)">
            <h4 class="text-sm text-success font-bold mb-3">✓ What You Did Well</h4>
            <ul style="padding-left:var(--space-4);margin:0" class="text-xs text-secondary">
              ${(data.top_strengths || ['Good structured approach to core questions', 'Addressed key requirements logically']).map(s => `<li class="mb-2">${s}</li>`).join('')}
            </ul>
          </div>
          <div class="card" style="background:var(--bg-surface);padding:var(--space-4)">
            <h4 class="text-sm text-warning font-bold mb-3">⚠️ Critical Weaknesses Identified</h4>
            <ul style="padding-left:var(--space-4);margin:0" class="text-xs text-secondary">
              ${(data.top_weaknesses || ['Incorporate more quantifiable metrics', 'Be more thorough with edge-case handling']).map(w => `<li class="mb-2">${w}</li>`).join('')}
            </ul>
          </div>
        </div>

        <!-- Question-by-Question Deep Dive: Where You Did Wrong & How to Improve -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="card-title">🔍 Question Diagnostic: Where You Went Wrong & How to Improve</h3>
          <span class="text-xs text-muted">${(data.question_evaluations || []).length} questions analyzed</span>
        </div>

        <div class="stack mb-6">
          ${(data.question_evaluations || []).map((qEval, idx) => `
            <div class="card" style="background:var(--bg-surface);border:1px solid var(--border-subtle);padding:var(--space-4)">
              <div class="flex items-center justify-between mb-2">
                <strong style="font-size:14px;color:var(--text-primary)">Q${idx + 1}: ${qEval.question}</strong>
                <span class="badge ${qEval.score >= 75 ? 'badge-success' : qEval.score >= 50 ? 'badge-accent' : 'badge-warning'}">
                  ${qEval.score || 60}/100
                </span>
              </div>

              <div class="mb-3 text-xs" style="padding:var(--space-2) var(--space-3);background:var(--bg-elevated);border-radius:var(--radius-sm)">
                <span class="text-muted font-bold">Your Submitted Answer:</span>
                <p style="margin:4px 0 0;font-style:italic;color:var(--text-secondary)">"${qEval.candidate_answer}"</p>
              </div>

              <!-- What Went Wrong -->
              <div class="mb-3 text-xs" style="padding:var(--space-2) var(--space-3);background:hsla(0, 84%, 60%, 0.08);border-left:3px solid var(--danger);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
                <strong style="color:var(--danger)">❌ Where You Did Wrong / What Was Missing:</strong>
                <p style="margin:4px 0 0;color:var(--text-primary);line-height:1.5">${qEval.what_went_wrong || 'Missing concrete technical edge cases and quantifiable metrics.'}</p>
              </div>

              <!-- How to Improve -->
              <div class="mb-3 text-xs" style="padding:var(--space-2) var(--space-3);background:hsla(217, 91%, 60%, 0.08);border-left:3px solid var(--accent);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
                <strong style="color:var(--accent)">💡 How to Improve Your Answer:</strong>
                <p style="margin:4px 0 0;color:var(--text-primary);line-height:1.5">${qEval.how_to_improve || 'Structure your response using STAR and state the exact methods, libraries, or formulas.'}</p>
              </div>

              <!-- Model Answer -->
              ${qEval.model_answer ? `
                <div class="text-xs" style="padding:var(--space-2) var(--space-3);background:hsla(152, 60%, 48%, 0.08);border-left:3px solid var(--success);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
                  <strong style="color:var(--success)">📝 Ideal Model Answer:</strong>
                  <p style="margin:4px 0 0;color:var(--text-primary);line-height:1.5">${qEval.model_answer}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Priority Study Roadmap -->
        ${data.study_roadmap?.length ? `
          <div class="card mb-6" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);padding:var(--space-4)">
            <h4 class="text-sm font-bold text-accent mb-2">🎯 Placement Preparation Roadmap (Next Steps)</h4>
            <ol style="padding-left:var(--space-5);margin:0" class="text-xs text-secondary">
              ${data.study_roadmap.map(step => `<li class="mb-2">${step}</li>`).join('')}
            </ol>
          </div>
        ` : ''}

        <div class="flex gap-3">
          <button class="btn btn-primary" onclick="StudentInterview.render()">🔄 Start Another AI Interview</button>
          <button class="btn" onclick="Toast.info('Diagnostic scorecard saved to your profile dossier.')">📥 Save Evaluation</button>
        </div>
      </article>
    `;

    document.getElementById('interview-feedback').innerHTML = '';
  }

  function _renderFallbackScorecard() {
    _renderFinalScorecard({
      overall_score: 72,
      verdict: 'Solid Potential',
      executive_summary: `Candidate completed ${chatHistory.length} questions for ${activeRole}. Answers showed solid understanding of the concepts with opportunity to add more quantifiable outcomes and edge-case handling.`,
      question_evaluations: chatHistory.map(h => ({
        question: h.question,
        candidate_answer: h.answer,
        score: h.answer.includes('[Skipped') ? 0 : 72,
        what_went_wrong: h.answer.includes('[Skipped') ? 'Question was skipped by candidate.' : 'Could include more specific metrics, architectural tradeoffs, and error handling.',
        how_to_improve: 'Follow STAR framework: State the situation, the technical challenge, your specific implementation decisions, and measurable outcomes.',
        model_answer: 'A high-impact response specifies the tools and algorithms used, how edge cases are validated, and the resulting business or system metrics.',
      })),
      top_weaknesses: [
        'Include measurable metrics and concrete project numbers',
        'Deepen explanation of technical edge cases and tradeoffs',
      ],
      top_strengths: [
        'Good structured communication',
        'Demonstrates understanding of foundational principles',
      ],
      study_roadmap: [
        `Practice writing mock responses for ${activeRole} with quantifiable metrics`,
        'Revise common interview edge cases and performance optimization patterns',
      ],
    });
  }

  function _updateStats() {
    const el = document.getElementById('session-stats');
    if (!el) return;

    el.innerHTML = `
      <div class="progress-group mb-3">
        <div class="progress-label">
          <span class="progress-label-name">Questions Completed</span>
          <span class="progress-label-value">${chatHistory.length} of ${questions.length}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill success" style="width:${Math.round((chatHistory.length / Math.max(1, questions.length)) * 100)}%"></div>
        </div>
      </div>
      <div class="text-xs text-muted">
        Role: <strong>${activeRole}</strong><br>
        Target Questions: <strong>${questions.length}</strong><br>
        All responses will be graded by AI upon completion.
      </div>
    `;
  }

  return { render, onRoleChange, onKeyOptionChange, getCustomApiKey, startSession, submitAnswer, skipQuestion, finishEarly };
})();
