/* ============================================================
   CAMPUSLINK — AI Resume Interview Engine (Frontend)
   4-Phase UI: Resume Input → Config → Active Interview → Report
   All scores come from the server. Client displays only.
   ============================================================ */

const StudentInterview = (() => {
  // ─── State ─────────────────────────────────────────────
  let sessionId = null;
  let resumeData = null;
  let questions = [];
  let currentQ = 0;
  let evaluations = [];   // display copies from server (NOT authoritative)
  let interviewPhase = 'resume'; // resume | config | active | report

  function getCustomApiKey() {
    return localStorage.getItem('CAMPUSLINK_CUSTOM_GROQ_KEY') || '';
  }
  function setCustomApiKey(key) {
    if (key?.trim()) localStorage.setItem('CAMPUSLINK_CUSTOM_GROQ_KEY', key.trim());
    else localStorage.removeItem('CAMPUSLINK_CUSTOM_GROQ_KEY');
  }
  function _getApiKey() {
    const isCustom = document.getElementById('key-choice-custom')?.checked;
    return isCustom ? getCustomApiKey() : '';
  }

  function onKeyOptionChange() {
    const isCustom = document.getElementById('key-choice-custom')?.checked;
    const box = document.getElementById('custom-key-input-box');
    if (box) box.style.display = isCustom ? 'block' : 'none';
  }

  // ─── Main Render ───────────────────────────────────────
  async function render() {
    sessionId = null;
    resumeData = null;
    questions = [];
    currentQ = 0;
    evaluations = [];
    interviewPhase = 'resume';
    _renderResumePhase();
  }

  // ═════════════════════════════════════════════════════════
  // PHASE 1: Resume Input
  // ═════════════════════════════════════════════════════════
  function _renderResumePhase() {
    interviewPhase = 'resume';
    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Resume Interviewer</div>
          <h1 class="page-title">Resume-Powered Mock Interview</h1>
          <p class="page-subtitle">Paste your resume below — AI will extract your skills, projects & experience, then generate a personalized adaptive interview tailored to YOUR background.</p>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up" id="resume-input-card">
            <div class="card-header">
              <h2 class="card-title">📄 Step 1: Paste Your Resume</h2>
              <span class="badge badge-accent">🧠 AI-Powered Extraction</span>
            </div>

            <div class="mb-4">
              <label class="form-label font-bold mb-1" for="resume-text-input">Resume Text</label>
              <textarea class="form-textarea interview-resume-textarea" id="resume-text-input"
                        rows="12"
                        placeholder="Paste your full resume text here...

Example:
ANANYA SHARMA
B.Tech Computer Science, XYZ University (2022-2026) | CGPA: 8.42

SKILLS: Python, SQL, Pandas, Power BI, Machine Learning, Statistics

PROJECTS:
• Credit Card Fraud Detection — Built a Random Forest classifier with 96% recall using Python, Pandas, Scikit-learn
• Sales Dashboard — Interactive Power BI dashboard analyzing 50K+ sales records

EXPERIENCE:
• Data Analytics Intern at DataPulse (May-Jul 2025) — Automated 3 KPI reports

CERTIFICATIONS: Google Data Analytics Certificate, AWS Cloud Practitioner"></textarea>
              <span class="text-xs text-muted mt-1" style="display:block">Paste everything — name, education, skills, projects, experience, certifications. The AI will structure it automatically.</span>
            </div>

            ${_renderKeySelector()}

            <button class="btn btn-primary" id="analyze-resume-btn" onclick="StudentInterview.analyzeResume()"
                    style="width:100%;font-weight:700;font-size:15px;padding:var(--space-3)">
              🧠 Analyze My Resume
            </button>
          </article>

          <div id="resume-extraction-result"></div>
        </div>

        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-3">💡 How This Works</h3>
            <ol style="padding-left:var(--space-5);color:var(--text-secondary)" class="text-sm">
              <li class="mb-2"><strong>Paste Resume:</strong> AI extracts your skills, projects, education & experience.</li>
              <li class="mb-2"><strong>Personalized Questions:</strong> AI generates questions from YOUR actual resume — not generic ones.</li>
              <li class="mb-2"><strong>Per-Answer Evaluation:</strong> Each answer is scored on 4 dimensions with specific feedback.</li>
              <li class="mb-2"><strong>Adaptive Follow-ups:</strong> Weak answers trigger targeted follow-up questions — like a real interview.</li>
              <li class="mb-2"><strong>Final Report:</strong> Comprehensive scorecard with dimension breakdowns, missed concepts, and study roadmap.</li>
            </ol>
          </article>

          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <h3 class="card-title mb-3">🎯 Interview Stages</h3>
            <div class="interview-stages-preview">
              <div class="interview-stage-pill"><span class="stage-num">1</span> Resume & Education</div>
              <div class="interview-stage-pill"><span class="stage-num">2</span> Project Deep-Dives</div>
              <div class="interview-stage-pill"><span class="stage-num">3</span> Skills Probing</div>
              <div class="interview-stage-pill"><span class="stage-num">4</span> Situational Problems</div>
              <div class="interview-stage-pill"><span class="stage-num">5</span> HR & Communication</div>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  function _renderKeySelector() {
    return `
      <div class="mb-5" style="padding:var(--space-3) var(--space-4);background:var(--bg-surface);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
        <div class="text-xs font-bold text-secondary mb-2 uppercase" style="letter-spacing:0.05em">AI Key Provider</div>
        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-xs cursor-pointer" style="user-select:none">
            <input type="radio" name="key-choice" value="platform" id="key-choice-platform" ${getCustomApiKey() ? '' : 'checked'} onchange="StudentInterview.onKeyOptionChange()">
            <span><strong style="color:var(--text-primary)">⚡ CampusLink Free AI (Default)</strong> — Uses our server key. No setup needed.</span>
          </label>
          <label class="flex items-center gap-2 text-xs cursor-pointer" style="user-select:none">
            <input type="radio" name="key-choice" value="custom" id="key-choice-custom" ${getCustomApiKey() ? 'checked' : ''} onchange="StudentInterview.onKeyOptionChange()">
            <span class="text-muted"><strong style="color:var(--text-secondary)">🔑 Use My Own Groq API Key</strong> — Only if you have a personal Groq key.</span>
          </label>
        </div>
        <div id="custom-key-input-box" class="mt-3" style="${getCustomApiKey() ? 'display:block' : 'display:none'};padding-top:var(--space-2);border-top:1px dashed var(--border-subtle)">
          <label class="form-label text-xs mb-1" for="custom-groq-key-input">Your Groq API Key (starts with <code>gsk_...</code>):</label>
          <input class="form-input text-xs" type="password" id="custom-groq-key-input" placeholder="gsk_..." value="${getCustomApiKey()}">
        </div>
      </div>
    `;
  }

  // ─── Analyze Resume ────────────────────────────────────
  async function analyzeResume() {
    const text = document.getElementById('resume-text-input')?.value?.trim();
    if (!text || text.length < 30) {
      Toast.warning('Please paste your resume text (at least a few sentences about your background).');
      return;
    }

    const isCustom = document.getElementById('key-choice-custom')?.checked;
    if (isCustom) {
      const key = document.getElementById('custom-groq-key-input')?.value?.trim();
      setCustomApiKey(key);
    }

    const btn = document.getElementById('analyze-resume-btn');
    btn.textContent = '⏳ AI is analyzing your resume...';
    btn.disabled = true;

    try {
      const result = await API.post('/interviews/parse-resume', {
        resumeText: text,
        apiKey: _getApiKey(),
      });

      if (!result.success && !result.name) {
        throw new Error(result.error?.message || 'Failed to extract resume data');
      }

      resumeData = result.data || result;
      Toast.success('Resume analyzed successfully!');
      _renderExtractionResult();
    } catch (err) {
      btn.textContent = '🧠 Analyze My Resume';
      btn.disabled = false;
      Toast.error(`Could not analyze resume: ${err.message}`);
    }
  }

  function _renderExtractionResult() {
    const el = document.getElementById('resume-extraction-result');
    const d = resumeData;

    el.innerHTML = `
      <article class="card animate-fade-in-up" style="border-top:3px solid var(--success)">
        <div class="card-header">
          <div>
            <span class="page-eyebrow">Resume Extracted Successfully</span>
            <h2 class="card-title">${d.name || 'Candidate'}</h2>
          </div>
          <span class="badge badge-success">✓ Structured</span>
        </div>

        <div class="grid grid-2 mb-4">
          <div>
            <div class="text-xs font-bold text-muted uppercase mb-2">Target Role</div>
            <div class="text-sm font-bold" style="color:var(--text-primary)">${d.target_role || 'Not specified'}</div>
          </div>
          <div>
            <div class="text-xs font-bold text-muted uppercase mb-2">Skills (${(d.skills || []).length})</div>
            <div class="flex flex-wrap gap-1">
              ${(d.skills || []).map(s => `<span class="badge">${s}</span>`).join('')}
            </div>
          </div>
        </div>

        ${(d.projects || []).length ? `
          <div class="mb-4">
            <div class="text-xs font-bold text-muted uppercase mb-2">Projects (${d.projects.length})</div>
            ${d.projects.map(p => `
              <div class="interview-extraction-item">
                <strong>${p.name || 'Project'}</strong>
                <span class="text-xs text-muted">${p.tech || ''}</span>
                <div class="text-xs text-secondary">${p.description || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(d.education || []).length ? `
          <div class="mb-4">
            <div class="text-xs font-bold text-muted uppercase mb-2">Education</div>
            ${d.education.map(e => `
              <div class="interview-extraction-item">
                <strong>${e.degree || 'Degree'}</strong> — ${e.institution || ''}
                <span class="text-xs text-muted">${e.year || ''} ${e.gpa ? '| GPA: ' + e.gpa : ''}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(d.experience || []).length ? `
          <div class="mb-4">
            <div class="text-xs font-bold text-muted uppercase mb-2">Experience</div>
            ${d.experience.map(e => `
              <div class="interview-extraction-item">
                <strong>${e.role || 'Role'}</strong> at ${e.company || ''} <span class="text-xs text-muted">(${e.duration || ''})</span>
                <div class="text-xs text-secondary">${e.description || ''}</div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${(d.certifications || []).length ? `
          <div class="mb-4">
            <div class="text-xs font-bold text-muted uppercase mb-2">Certifications</div>
            <div class="flex flex-wrap gap-1">
              ${d.certifications.map(c => `<span class="badge badge-accent">${c}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <button class="btn btn-primary" onclick="StudentInterview.goToConfig()"
                style="width:100%;font-weight:700;font-size:15px;padding:var(--space-3);margin-top:var(--space-3)">
          ✅ Looks Good — Configure Interview →
        </button>
      </article>
    `;

    // Hide the resume input card
    const inputCard = document.getElementById('resume-input-card');
    if (inputCard) inputCard.style.display = 'none';
  }

  // ═════════════════════════════════════════════════════════
  // PHASE 2: Interview Configuration
  // ═════════════════════════════════════════════════════════
  function goToConfig() {
    interviewPhase = 'config';
    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Resume Interviewer</div>
          <h1 class="page-title">Configure Your Interview</h1>
          <p class="page-subtitle">Your resume has been analyzed. Now customize the interview settings.</p>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <h2 class="card-title">⚙️ Interview Settings</h2>
              <span class="badge badge-accent">${resumeData?.name || 'Candidate'}</span>
            </div>

            <div class="grid grid-2 mb-4">
              <div>
                <label class="form-label font-bold mb-1">Target Role</label>
                <div class="form-input" style="background:var(--bg-elevated);cursor:default">${resumeData?.target_role || 'Software Engineer'}</div>
                <span class="text-xs text-muted mt-1" style="display:block">Auto-detected from your resume</span>
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

            <div class="mb-4">
              <label class="form-label font-bold mb-1" for="interview-count">Number of Questions</label>
              <select class="form-select" id="interview-count">
                <option value="5">5 Questions (Quick Drill)</option>
                <option value="8" selected>8 Questions (Standard Mock)</option>
                <option value="10">10 Questions (Comprehensive)</option>
                <option value="12">12 Questions (Full Technical Round)</option>
              </select>
            </div>

            <div class="mb-4" style="padding:var(--space-3);background:var(--bg-surface);border-radius:var(--radius-md);border:1px solid var(--border-subtle)">
              <div class="text-xs font-bold text-muted uppercase mb-2">Your Resume Profile</div>
              <div class="flex flex-wrap gap-1 mb-2">
                ${(resumeData?.skills || []).slice(0, 10).map(s => `<span class="badge">${s}</span>`).join('')}
              </div>
              <div class="text-xs text-secondary">
                ${(resumeData?.projects || []).length} projects · ${(resumeData?.experience || []).length} experiences · ${(resumeData?.certifications || []).length} certifications
              </div>
            </div>

            <button class="btn btn-primary" id="start-interview-btn" onclick="StudentInterview.startInterview()"
                    style="width:100%;font-weight:700;font-size:15px;padding:var(--space-3)">
              🚀 Begin AI Interview
            </button>

            <button class="btn mt-2" onclick="StudentInterview.render()" style="width:100%;color:var(--text-muted)">
              ← Back to Resume Input
            </button>
          </article>
        </div>

        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-3">📋 What to Expect</h3>
            <div class="text-sm text-secondary">
              <p class="mb-2">AI will generate <strong>personalized questions</strong> from your actual resume:</p>
              <ul style="padding-left:var(--space-4);margin:0">
                <li class="mb-1">Questions about YOUR specific projects</li>
                <li class="mb-1">Deep probes on YOUR listed skills</li>
                <li class="mb-1">Scenario questions relevant to YOUR target role</li>
                <li class="mb-1">Follow-up questions when answers are weak</li>
              </ul>
              <p class="mt-3 text-xs text-muted">Each answer is scored on 4 dimensions: Technical Correctness, Relevance, Completeness, Communication.</p>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  // ─── Start Interview ───────────────────────────────────
  async function startInterview() {
    const difficulty = document.getElementById('interview-difficulty')?.value || 'medium';
    const count = parseInt(document.getElementById('interview-count')?.value || '8', 10);

    const btn = document.getElementById('start-interview-btn');
    btn.textContent = `⏳ AI is generating ${count} personalized questions...`;
    btn.disabled = true;

    try {
      const result = await API.post('/interviews/start', {
        resumeData,
        difficulty,
        count,
        apiKey: _getApiKey(),
      });

      if (!result.success && !result.sessionId) {
        throw new Error(result.error?.message || 'Failed to generate questions');
      }

      const data = result.data || result;
      sessionId = data.sessionId;
      questions = data.questions || [];
      currentQ = 0;
      evaluations = [];

      if (!questions.length) throw new Error('No questions received from AI');

      Toast.success(`AI generated ${questions.length} personalized interview questions!`);
      _renderActivePhase();
    } catch (err) {
      btn.textContent = '🚀 Begin AI Interview';
      btn.disabled = false;
      Toast.error(`Could not start interview: ${err.message}`);
    }
  }

  // ═════════════════════════════════════════════════════════
  // PHASE 3: Active Interview Session
  // ═════════════════════════════════════════════════════════
  function _renderActivePhase() {
    interviewPhase = 'active';
    const qObj = questions[currentQ];
    const pct = Math.round(((currentQ) / questions.length) * 100);
    const stageMap = { resume: '📄 Resume', projects: '🔬 Projects', skills: '⚡ Skills', situational: '🧩 Situational', hr: '🤝 HR' };
    const stageName = stageMap[qObj.stage] || '🎯 Interview';

    document.getElementById('main').innerHTML = `
      <div class="page-header" style="padding-bottom:var(--space-3)">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Resume Interview — ${resumeData?.name || 'Candidate'}</div>
          <div class="interview-stage-indicators">
            ${['resume', 'projects', 'skills', 'situational', 'hr'].map(s => {
              const isActive = qObj.stage === s;
              const isDone = _isStageCompleted(s);
              return `<div class="interview-stage-indicator ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}">${stageMap[s]}</div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up" style="border-top:3px solid var(--accent)" id="active-question-card">
            <div class="card-header">
              <div class="flex items-center gap-2">
                <h2 class="card-title">Question ${currentQ + 1} of ${questions.length}</h2>
                <span class="badge badge-accent">${stageName}</span>
                ${qObj.is_followup ? '<span class="badge badge-warning">🔄 Follow-up</span>' : ''}
              </div>
              <button class="btn btn-sm" onclick="StudentInterview.finishEarly()" style="color:var(--text-muted)">
                🏁 Finish & View Report
              </button>
            </div>

            <div class="progress-group mb-4">
              <div class="progress-label">
                <span class="progress-label-name">${resumeData?.target_role || 'Interview'} · ${questions[0]?.difficulty?.toUpperCase() || 'MEDIUM'}</span>
                <span class="progress-label-value">${currentQ + 1} of ${questions.length} (${pct}%)</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill success" style="width:${pct}%"></div>
              </div>
            </div>

            <div class="interview-chat" id="chat-area">
              <div class="chat-bubble ai">
                <div class="flex items-center justify-between mb-2">
                  <strong>🎤 Question ${currentQ + 1}:</strong>
                  <span class="badge" style="font-size:10px;text-transform:uppercase">${qObj.category || 'Technical'}</span>
                </div>
                <div style="font-size:16px;font-weight:600;line-height:1.5;margin-bottom:8px;color:var(--text-primary)">
                  ${qObj.text}
                </div>
                ${qObj.skill ? `<div class="text-xs text-muted">🎯 Focus: <strong>${qObj.skill}</strong></div>` : ''}
                ${qObj.is_followup && qObj.targets_weakness ? `<div class="text-xs text-warning mt-1">⚡ Targeting: ${qObj.targets_weakness}</div>` : ''}
              </div>
            </div>

            <div class="mt-4">
              <label class="form-label font-bold mb-1" for="interview-answer">Your Response</label>
              ${Forms.textarea({
                id: 'interview-answer',
                placeholder: 'Type your answer here...\n\nTips:\n• Be specific — reference actual tools, libraries, algorithms\n• Explain your reasoning, not just the conclusion\n• Mention edge cases and tradeoffs\n• Use STAR for behavioral: Situation → Task → Action → Result',
                rows: 7
              })}
            </div>

            <div class="flex items-center justify-between mt-4">
              <div class="flex gap-2">
                <button class="btn btn-primary" id="submit-answer-btn" onclick="StudentInterview.submitAnswer()">
                  📤 Submit & Get Feedback
                </button>
                <button class="btn" id="skip-btn" onclick="StudentInterview.skipQuestion()">
                  Skip ⏭️
                </button>
              </div>
              <span class="text-xs text-muted">Scores saved server-side</span>
            </div>
          </article>

          <div id="answer-feedback"></div>
        </div>

        <aside class="stack">
          <article class="card animate-fade-in-up" style="animation-delay:80ms">
            <div class="card-header"><h2 class="card-title">📊 Live Progress</h2></div>
            <div id="session-stats">${_renderSessionStats()}</div>
          </article>

          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">📝 Answered</h2></div>
            <div id="answers-log">${_renderAnswersLog()}</div>
          </article>
        </aside>
      </div>
    `;
  }

  function _isStageCompleted(stage) {
    const stageQs = questions.filter(q => q.stage === stage);
    if (!stageQs.length) return false;
    const stageIndices = stageQs.map(q => questions.indexOf(q));
    return stageIndices.every(i => i < currentQ);
  }

  function _renderSessionStats() {
    const answered = evaluations.length;
    const avgScore = answered > 0
      ? Math.round(evaluations.reduce((s, e) => s + ((e.technical_correctness + e.relevance + e.completeness + e.communication) / 4 * 10), 0) / answered)
      : 0;

    return `
      <div class="progress-group mb-3">
        <div class="progress-label">
          <span class="progress-label-name">Questions Completed</span>
          <span class="progress-label-value">${answered} of ${questions.length}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill success" style="width:${Math.round((answered / Math.max(1, questions.length)) * 100)}%"></div>
        </div>
      </div>
      ${answered > 0 ? `
        <div class="text-xs text-muted mb-2">
          Running Average: <strong style="color:${avgScore >= 70 ? 'var(--success)' : avgScore >= 50 ? 'var(--accent)' : 'var(--warning)'}">${avgScore}/100</strong>
        </div>
      ` : ''}
      <div class="text-xs text-muted">
        Role: <strong>${resumeData?.target_role || 'Interview'}</strong><br>
        Follow-ups: <strong>${evaluations.filter(e => questions[e.questionIndex]?.is_followup).length}</strong>
      </div>
    `;
  }

  function _renderAnswersLog() {
    if (!evaluations.length) return '<div class="text-xs text-muted">No answers submitted yet.</div>';
    return evaluations.map(e => {
      const avg = Math.round((e.technical_correctness + e.relevance + e.completeness + e.communication) / 4 * 10);
      const color = avg >= 70 ? 'var(--success)' : avg >= 50 ? 'var(--accent)' : 'var(--warning)';
      return `
        <div class="interview-answer-log-item">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold" style="color:var(--text-primary)">Q${e.questionIndex + 1}</span>
            <span class="badge" style="background:${color};color:#fff;font-size:10px">${avg}/100</span>
          </div>
          <div class="text-xs text-muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${e.question?.slice(0, 50)}...</div>
        </div>
      `;
    }).join('');
  }

  // ─── Submit Answer ─────────────────────────────────────
  async function submitAnswer() {
    const answerInput = document.getElementById('interview-answer');
    const answer = answerInput?.value?.trim() || '';

    if (!answer || answer.length < 5) {
      Toast.warning('Please type a response (at least a few words), or click "Skip" if unsure.');
      return;
    }

    const btn = document.getElementById('submit-answer-btn');
    const skipBtn = document.getElementById('skip-btn');
    btn.textContent = '⏳ AI is evaluating...';
    btn.disabled = true;
    if (skipBtn) skipBtn.disabled = true;

    try {
      const result = await API.post('/interviews/evaluate-answer', {
        sessionId,
        questionIndex: currentQ,
        answer,
        apiKey: _getApiKey(),
      });

      const evalData = result.data || result;
      evaluations.push(evalData);

      // Show inline feedback
      _renderAnswerFeedback(evalData);

      // Check for follow-up
      if (evalData.should_followup) {
        await _handleFollowup();
      }
    } catch (err) {
      Toast.error(`Evaluation failed: ${err.message}`);
      // Still advance
      evaluations.push({
        questionIndex: currentQ,
        question: questions[currentQ]?.text,
        answer,
        technical_correctness: 5, relevance: 5, completeness: 5, communication: 5,
        missed_concepts: [], feedback_text: 'Evaluation unavailable.', should_followup: false
      });
    }

    // Update sidebar stats
    const statsEl = document.getElementById('session-stats');
    if (statsEl) statsEl.innerHTML = _renderSessionStats();
    const logEl = document.getElementById('answers-log');
    if (logEl) logEl.innerHTML = _renderAnswersLog();
  }

  function _renderAnswerFeedback(evalData) {
    const feedbackEl = document.getElementById('answer-feedback');
    const dims = [
      { label: 'Technical Correctness', value: evalData.technical_correctness, color: '#3b82f6' },
      { label: 'Relevance', value: evalData.relevance, color: '#8b5cf6' },
      { label: 'Completeness', value: evalData.completeness, color: '#f59e0b' },
      { label: 'Communication', value: evalData.communication, color: '#10b981' },
    ];
    const avg = Math.round((dims[0].value + dims[1].value + dims[2].value + dims[3].value) / 4 * 10);

    feedbackEl.innerHTML = `
      <article class="card animate-fade-in-up" style="border-left:4px solid ${avg >= 70 ? 'var(--success)' : avg >= 50 ? 'var(--accent)' : 'var(--warning)'}">
        <div class="card-header">
          <h3 class="card-title">📊 Answer Evaluation</h3>
          <span class="badge ${avg >= 70 ? 'badge-success' : avg >= 50 ? 'badge-accent' : 'badge-warning'}" style="font-size:14px">${avg}/100</span>
        </div>

        <div class="interview-rubric-bars mb-4">
          ${dims.map(d => `
            <div class="rubric-bar-row">
              <span class="rubric-bar-label">${d.label}</span>
              <div class="rubric-bar-track">
                <div class="rubric-bar-fill" style="width:${d.value * 10}%;background:${d.color}"></div>
              </div>
              <span class="rubric-bar-value">${d.value}/10</span>
            </div>
          `).join('')}
        </div>

        <div class="mb-3 text-sm" style="padding:var(--space-2) var(--space-3);background:var(--bg-surface);border-radius:var(--radius-sm)">
          <strong>💬 Feedback:</strong>
          <p style="margin:4px 0 0;color:var(--text-secondary);line-height:1.5">${evalData.feedback_text || 'Answer recorded.'}</p>
        </div>

        ${(evalData.missed_concepts || []).length ? `
          <div class="mb-3 text-xs" style="padding:var(--space-2) var(--space-3);background:hsla(0, 84%, 60%, 0.08);border-left:3px solid var(--danger);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
            <strong style="color:var(--danger)">⚠️ Missed Concepts:</strong>
            <ul style="margin:4px 0 0;padding-left:var(--space-4)">
              ${evalData.missed_concepts.map(c => `<li>${c}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${evalData.should_followup ? `
          <div class="text-xs text-warning font-bold mb-3" style="padding:var(--space-2) var(--space-3);background:hsla(38, 92%, 50%, 0.08);border-radius:var(--radius-sm)">
            🔄 A follow-up question is being generated based on weak areas...
          </div>
        ` : ''}

        <button class="btn btn-primary" id="next-question-btn" onclick="StudentInterview.nextQuestion()"
                style="width:100%;font-weight:700">
          ${currentQ >= questions.length - 1 && !evalData.should_followup
            ? '🏁 View Final Report'
            : 'Next Question →'}
        </button>
      </article>
    `;

    // Hide the answer input section
    const questionCard = document.getElementById('active-question-card');
    if (questionCard) {
      const answerArea = questionCard.querySelector('.mt-4');
      const btns = questionCard.querySelector('.flex.items-center.justify-between.mt-4');
      if (answerArea) answerArea.style.display = 'none';
      if (btns) btns.style.display = 'none';
    }
  }

  async function _handleFollowup() {
    try {
      const result = await API.post('/interviews/generate-followup', {
        sessionId,
        apiKey: _getApiKey(),
      });

      const data = result.data || result;
      if (data.followup) {
        // Follow-up was appended server-side; add to local questions list
        questions.push(data.followup);
      }
    } catch (err) {
      console.warn('[Follow-up generation failed]:', err.message);
    }
  }

  function nextQuestion() {
    currentQ++;
    if (currentQ < questions.length) {
      _renderActivePhase();
    } else {
      _generateFinalReport();
    }
  }

  // ─── Skip Question ─────────────────────────────────────
  async function skipQuestion() {
    const btn = document.getElementById('skip-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳...'; }

    try {
      const result = await API.post('/interviews/evaluate-answer', {
        sessionId,
        questionIndex: currentQ,
        answer: '',
        apiKey: _getApiKey(),
      });
      evaluations.push(result.data || result);
    } catch (_) {
      evaluations.push({
        questionIndex: currentQ,
        question: questions[currentQ]?.text,
        answer: '[Skipped]',
        technical_correctness: 0, relevance: 0, completeness: 0, communication: 0,
        missed_concepts: ['Skipped'], feedback_text: 'Question skipped.', should_followup: false,
      });
    }

    currentQ++;
    if (currentQ < questions.length) {
      _renderActivePhase();
    } else {
      _generateFinalReport();
    }
  }

  // ─── Finish Early ──────────────────────────────────────
  function finishEarly() {
    if (!evaluations.length) {
      Toast.warning('Answer at least one question before finishing.');
      return;
    }
    if (confirm(`Finish now? The AI will evaluate your ${evaluations.length} completed answer(s).`)) {
      _generateFinalReport();
    }
  }

  // ═════════════════════════════════════════════════════════
  // PHASE 4: Final Report
  // ═════════════════════════════════════════════════════════
  async function _generateFinalReport() {
    interviewPhase = 'report';
    document.getElementById('main').innerHTML = `
      <div class="grid grid-main">
        <div class="stack" style="grid-column:1/-1">
          <article class="card animate-fade-in-up" style="text-align:center;padding:var(--space-12) var(--space-6)">
            <div class="empty-state-icon animate-pulse" style="font-size:48px;margin-bottom:var(--space-4)">🧠</div>
            <h2 class="card-title mb-2" style="font-size:24px">Generating Your Interview Report...</h2>
            <p class="text-secondary text-sm max-w-md mx-auto mb-4">
              Computing scores from ${evaluations.length} server-side evaluations and generating your personalized study roadmap.
            </p>
            <div class="progress-bar max-w-md mx-auto">
              <div class="progress-bar-fill accent animate-pulse" style="width:100%"></div>
            </div>
          </article>
        </div>
      </div>
    `;

    try {
      const res = await API.post('/interviews/final-evaluation', {
        sessionId,
        apiKey: _getApiKey(),
      });

      if (!res.success && !res.overall_score) {
        throw new Error(res.error?.message || 'Report generation failed');
      }

      _renderFinalReport(res.data || res);
    } catch (err) {
      Toast.error(`Report generation failed: ${err.message}`);
      _renderFallbackReport();
    }
  }

  function _renderFinalReport(data) {
    const score = data.overall_score || 0;
    const verdict = data.verdict || 'Needs Review';
    const verdictClass = score >= 75 ? 'badge-success' : score >= 55 ? 'badge-accent' : 'badge-warning';
    const dims = data.dimensions || {};

    document.getElementById('main').innerHTML = `
      <div class="grid grid-main">
        <div class="stack" style="grid-column:1/-1">
          <article class="card animate-fade-in-up" style="border:1px solid var(--border-strong)">
            <div class="card-header">
              <div>
                <span class="page-eyebrow">AI Interview Report — ${resumeData?.name || 'Candidate'}</span>
                <h2 class="card-title" style="font-size:24px">Placement Readiness Evaluation</h2>
              </div>
              <span class="badge ${verdictClass}" style="font-size:14px;padding:6px 14px">${verdict}</span>
            </div>

            <!-- KPI Row -->
            <div class="grid grid-kpis my-4">
              <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
                <div class="text-xs text-muted uppercase font-bold">Overall Score</div>
                <div style="font-size:36px;font-weight:900;color:${score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--accent)' : 'var(--warning)'};margin:var(--space-1) 0">${score}/100</div>
                <div class="text-xs text-muted">${data.answered_count || 0} of ${data.total_questions || 0} answered</div>
              </div>
              <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
                <div class="text-xs text-muted uppercase font-bold">Target Role</div>
                <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin:var(--space-2) 0">${data.targetRole || resumeData?.target_role || ''}</div>
                <div class="text-xs text-muted">${(data.difficulty || 'medium').toUpperCase()} · ${data.total_questions || 0} Qs</div>
              </div>
              <div class="card" style="text-align:center;padding:var(--space-4);background:var(--bg-surface)">
                <div class="text-xs text-muted uppercase font-bold">Evaluation Engine</div>
                <div style="font-size:16px;font-weight:700;color:var(--text-primary);margin:var(--space-2) 0">Groq LLM</div>
                <div class="text-xs text-muted">4-Dimension Rubric</div>
              </div>
            </div>

            <!-- Dimension Breakdown -->
            <div class="card mb-6" style="padding:var(--space-4);background:var(--bg-surface)">
              <h4 class="text-sm font-bold text-primary mb-3">📊 Dimension Breakdown</h4>
              <div class="interview-rubric-bars">
                ${[
                  { label: 'Technical Correctness', value: dims.technical_correctness || 0, color: '#3b82f6' },
                  { label: 'Relevance', value: dims.relevance || 0, color: '#8b5cf6' },
                  { label: 'Completeness', value: dims.completeness || 0, color: '#f59e0b' },
                  { label: 'Communication', value: dims.communication || 0, color: '#10b981' },
                ].map(d => `
                  <div class="rubric-bar-row">
                    <span class="rubric-bar-label">${d.label}</span>
                    <div class="rubric-bar-track">
                      <div class="rubric-bar-fill" style="width:${d.value * 10}%;background:${d.color}"></div>
                    </div>
                    <span class="rubric-bar-value">${d.value}/10</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Executive Summary -->
            <div class="insight-card accent mb-6">
              <strong>📋 Executive Summary:</strong><br>
              ${data.executive_summary || 'No summary available.'}
            </div>

            <!-- Stage Breakdown -->
            ${(data.stage_breakdown || []).length ? `
              <div class="card mb-6" style="padding:var(--space-4);background:var(--bg-surface)">
                <h4 class="text-sm font-bold text-primary mb-3">📈 Stage Performance</h4>
                <div class="interview-rubric-bars">
                  ${data.stage_breakdown.map(s => `
                    <div class="rubric-bar-row">
                      <span class="rubric-bar-label" style="text-transform:capitalize">${s.stage} (${s.count} Qs)</span>
                      <div class="rubric-bar-track">
                        <div class="rubric-bar-fill" style="width:${s.avgScore || 0}%;background:${(s.avgScore || 0) >= 70 ? '#10b981' : (s.avgScore || 0) >= 50 ? '#3b82f6' : '#f59e0b'}"></div>
                      </div>
                      <span class="rubric-bar-value">${s.avgScore || 0}/100</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Strengths & Weaknesses -->
            <div class="grid grid-2 mb-6">
              <div class="card" style="background:var(--bg-surface);padding:var(--space-4)">
                <h4 class="text-sm text-success font-bold mb-3">✓ Strengths</h4>
                <ul style="padding-left:var(--space-4);margin:0" class="text-xs text-secondary">
                  ${(data.top_strengths || []).map(s => `<li class="mb-2">${s}</li>`).join('')}
                </ul>
              </div>
              <div class="card" style="background:var(--bg-surface);padding:var(--space-4)">
                <h4 class="text-sm text-warning font-bold mb-3">⚠️ Weaknesses</h4>
                <ul style="padding-left:var(--space-4);margin:0" class="text-xs text-secondary">
                  ${(data.top_weaknesses || []).map(w => `<li class="mb-2">${w}</li>`).join('')}
                </ul>
              </div>
            </div>

            <!-- Question-by-Question Drill-Down -->
            <h3 class="card-title mb-4">🔍 Question-by-Question Analysis</h3>
            <div class="stack mb-6">
              ${(data.question_evaluations || []).map((qEval, idx) => {
                const qScore = qEval.score || 0;
                const qColor = qScore >= 70 ? 'var(--success)' : qScore >= 50 ? 'var(--accent)' : 'var(--warning)';
                return `
                  <div class="card interview-question-drilldown" style="background:var(--bg-surface);border:1px solid var(--border-subtle);padding:var(--space-4)">
                    <div class="flex items-center justify-between mb-2 cursor-pointer" onclick="this.parentElement.classList.toggle('expanded')">
                      <div class="flex items-center gap-2">
                        <strong style="font-size:13px;color:var(--text-primary)">Q${idx + 1}</strong>
                        ${qEval.is_followup ? '<span class="badge badge-warning" style="font-size:9px">🔄 Follow-up</span>' : ''}
                        <span class="text-xs text-secondary" style="max-width:400px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${qEval.question}</span>
                      </div>
                      <span class="badge" style="background:${qColor};color:#fff">${qScore}/100</span>
                    </div>
                    <div class="interview-drilldown-content">
                      <div class="mb-3">
                        <div class="interview-rubric-bars">
                          ${[
                            { l: 'Technical', v: qEval.technical_correctness, c: '#3b82f6' },
                            { l: 'Relevance', v: qEval.relevance, c: '#8b5cf6' },
                            { l: 'Complete', v: qEval.completeness, c: '#f59e0b' },
                            { l: 'Comms', v: qEval.communication, c: '#10b981' },
                          ].map(d => `
                            <div class="rubric-bar-row rubric-bar-compact">
                              <span class="rubric-bar-label">${d.l}</span>
                              <div class="rubric-bar-track">
                                <div class="rubric-bar-fill" style="width:${(d.v || 0) * 10}%;background:${d.c}"></div>
                              </div>
                              <span class="rubric-bar-value">${d.v || 0}</span>
                            </div>
                          `).join('')}
                        </div>
                      </div>
                      <div class="text-xs mb-2" style="padding:var(--space-2) var(--space-3);background:var(--bg-elevated);border-radius:var(--radius-sm)">
                        <strong class="text-muted">Your Answer:</strong>
                        <p style="margin:4px 0 0;font-style:italic;color:var(--text-secondary)">"${qEval.candidate_answer || '[No answer]'}"</p>
                      </div>
                      ${qEval.feedback_text ? `
                        <div class="text-xs mb-2" style="padding:var(--space-2) var(--space-3);background:hsla(217, 91%, 60%, 0.08);border-left:3px solid var(--accent);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
                          <strong style="color:var(--accent)">💬 Feedback:</strong>
                          <p style="margin:4px 0 0;color:var(--text-primary);line-height:1.5">${qEval.feedback_text}</p>
                        </div>
                      ` : ''}
                      ${(qEval.missed_concepts || []).length ? `
                        <div class="text-xs" style="padding:var(--space-2) var(--space-3);background:hsla(0, 84%, 60%, 0.08);border-left:3px solid var(--danger);border-radius:0 var(--radius-sm) var(--radius-sm) 0">
                          <strong style="color:var(--danger)">⚠️ Missed:</strong> ${qEval.missed_concepts.join(', ')}
                        </div>
                      ` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Study Roadmap -->
            ${(data.study_roadmap || []).length ? `
              <div class="card mb-6" style="background:var(--bg-elevated);border:1px solid var(--border-subtle);padding:var(--space-4)">
                <h4 class="text-sm font-bold text-accent mb-2">🎯 Study Roadmap</h4>
                <ol style="padding-left:var(--space-5);margin:0" class="text-xs text-secondary">
                  ${data.study_roadmap.map(step => `<li class="mb-2">${step}</li>`).join('')}
                </ol>
              </div>
            ` : ''}

            <div class="flex gap-3">
              <button class="btn btn-primary" onclick="StudentInterview.render()">🔄 Start New Interview</button>
              <button class="btn" onclick="StudentInterview.render()">📄 Try Different Resume</button>
            </div>
          </article>
        </div>
      </div>
    `;
  }

  function _renderFallbackReport() {
    // Build a basic report from the display copies we have
    const answered = evaluations.filter(e => e.source !== 'skip' && e.answer !== '[Skipped by candidate]');
    const avgDim = (field) => {
      if (!answered.length) return 0;
      return Math.round(answered.reduce((s, e) => s + (e[field] || 0), 0) / answered.length * 10) / 10;
    };
    const overallScore = Math.round(
      (avgDim('technical_correctness') + avgDim('relevance') + avgDim('completeness') + avgDim('communication')) / 4 * 10
    );

    _renderFinalReport({
      overall_score: overallScore,
      verdict: overallScore >= 75 ? 'Placement Ready' : overallScore >= 55 ? 'Solid Potential' : 'Needs Focused Practice',
      dimensions: {
        technical_correctness: avgDim('technical_correctness'),
        relevance: avgDim('relevance'),
        completeness: avgDim('completeness'),
        communication: avgDim('communication'),
      },
      total_questions: evaluations.length,
      answered_count: answered.length,
      skipped_count: evaluations.length - answered.length,
      executive_summary: `Candidate completed ${answered.length} of ${evaluations.length} questions. Overall score: ${overallScore}/100. Report generated from cached evaluation data.`,
      top_strengths: ['Engaged with the interview process'],
      top_weaknesses: ['Full AI analysis was unavailable — review individual question feedback above'],
      study_roadmap: ['Review the per-question feedback above and practice weak areas'],
      question_evaluations: evaluations.map(e => ({
        question: e.question,
        candidate_answer: e.answer,
        technical_correctness: e.technical_correctness || 0,
        relevance: e.relevance || 0,
        completeness: e.completeness || 0,
        communication: e.communication || 0,
        score: Math.round(((e.technical_correctness || 0) + (e.relevance || 0) + (e.completeness || 0) + (e.communication || 0)) / 4 * 10),
        missed_concepts: e.missed_concepts || [],
        feedback_text: e.feedback_text || '',
        is_followup: false,
      })),
      targetRole: resumeData?.target_role || '',
      difficulty: 'medium',
      stage_breakdown: [],
    });
  }

  // ─── Public API ────────────────────────────────────────
  return {
    render,
    onKeyOptionChange,
    getCustomApiKey,
    analyzeResume,
    goToConfig,
    startInterview,
    submitAnswer,
    skipQuestion,
    nextQuestion,
    finishEarly,
  };
})();
