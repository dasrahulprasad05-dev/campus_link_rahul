/* ============================================================
   CAMPUSLINK — AI Career Path Finder (Frontend)
   3-Phase UI: Questions → Results → Roadmap
   Scoring is server-side. Client only displays.
   ============================================================ */

const StudentCareerFinder = (() => {
  let questions = [];
  let answers = [];       // [{ questionId, optionId }]
  let currentQ = 0;
  let scoreResult = null; // { percentages, sorted, topDomain, topName, topScore }
  let explanation = '';
  let roadmapData = null;
  let phase = 'loading';  // loading | questions | results | roadmap

  function _getApiKey() {
    return localStorage.getItem('CAMPUSLINK_CUSTOM_GROQ_KEY') || '';
  }

  // ─── Main Render ───────────────────────────────────────
  async function render() {
    questions = [];
    answers = [];
    currentQ = 0;
    scoreResult = null;
    explanation = '';
    roadmapData = null;
    phase = 'loading';

    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Career Path Finder</div>
          <h1 class="page-title">Discover Your CSE Career Fit</h1>
          <p class="page-subtitle">Answer 7 quick questions — no resume needed. AI will analyze your interests and show which CSE career paths match your natural strengths.</p>
        </div>
      </div>
      <div class="grid grid-main">
        <div class="stack" style="grid-column:1/-1">
          <article class="card animate-fade-in-up" style="text-align:center;padding:var(--space-8)">
            <div class="empty-state-icon animate-pulse" style="font-size:40px;margin-bottom:var(--space-3)">🧭</div>
            <p class="text-secondary text-sm">Loading assessment questions...</p>
          </article>
        </div>
      </div>
    `;

    try {
      const res = await API.get('/career-finder/questions');
      const data = res.data || res;
      questions = data.questions || [];
      if (!questions.length) throw new Error('No questions received');
      currentQ = 0;
      _renderQuestionsPhase();
    } catch (err) {
      Toast.error('Could not load questions: ' + err.message);
    }
  }

  // ═══════════════════════════════════════════════════════
  // PHASE 1: Questions (one at a time)
  // ═══════════════════════════════════════════════════════
  function _renderQuestionsPhase() {
    phase = 'questions';
    const q = questions[currentQ];
    const pct = Math.round((currentQ / questions.length) * 100);
    const existing = answers.find(a => a.questionId === q.id);

    document.getElementById('main').innerHTML = `
      <div class="page-header" style="padding-bottom:var(--space-2)">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Career Path Finder</div>
          <h1 class="page-title" style="font-size:22px">Question ${currentQ + 1} of ${questions.length}</h1>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack" style="grid-column:1/-1;max-width:720px;margin:0 auto;width:100%">
          <!-- Progress -->
          <div class="progress-group mb-2">
            <div class="progress-label">
              <span class="progress-label-name">Career Assessment</span>
              <span class="progress-label-value">${currentQ + 1} / ${questions.length}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill accent" style="width:${pct}%;transition:width 0.4s ease"></div>
            </div>
          </div>

          <!-- Question Card -->
          <article class="card animate-fade-in-up career-question-card">
            <h2 class="card-title" style="font-size:20px;line-height:1.5;margin-bottom:var(--space-5);text-align:center">
              ${q.text}
            </h2>

            <div class="career-options-grid" id="options-grid">
              ${q.options.map((opt, idx) => `
                <button class="career-option-btn ${existing?.optionId === opt.id ? 'selected' : ''}"
                        id="opt-${opt.id}"
                        onclick="StudentCareerFinder.selectOption('${q.id}', '${opt.id}')">
                  <span class="career-option-letter">${String.fromCharCode(65 + idx)}</span>
                  <span class="career-option-text">${opt.text}</span>
                </button>
              `).join('')}
            </div>

            <div class="flex items-center justify-between mt-5">
              <div>
                ${currentQ > 0 ? `
                  <button class="btn" onclick="StudentCareerFinder.prevQuestion()">
                    ← Back
                  </button>
                ` : '<div></div>'}
              </div>
              <div class="flex gap-2">
                <button class="btn" onclick="StudentCareerFinder.render()" style="color:var(--text-muted)">
                  🔄 Restart
                </button>
              </div>
            </div>
          </article>

          <!-- Stage dots -->
          <div class="career-progress-dots">
            ${questions.map((_, i) => `
              <div class="career-dot ${i < currentQ ? 'done' : ''} ${i === currentQ ? 'active' : ''}"
                   ${i < currentQ ? `onclick="StudentCareerFinder.goToQuestion(${i})" style="cursor:pointer"` : ''}>
                ${i + 1}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function selectOption(questionId, optionId) {
    // Update or add answer
    const existing = answers.findIndex(a => a.questionId === questionId);
    if (existing >= 0) {
      answers[existing].optionId = optionId;
    } else {
      answers.push({ questionId, optionId });
    }

    // Visual feedback — highlight selected
    document.querySelectorAll('.career-option-btn').forEach(btn => btn.classList.remove('selected'));
    const selected = document.getElementById(`opt-${optionId}`);
    if (selected) selected.classList.add('selected');

    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        currentQ++;
        _renderQuestionsPhase();
      } else {
        _submitAssessment();
      }
    }, 400);
  }

  function prevQuestion() {
    if (currentQ > 0) {
      currentQ--;
      _renderQuestionsPhase();
    }
  }

  function goToQuestion(idx) {
    if (idx >= 0 && idx < questions.length && idx < currentQ) {
      currentQ = idx;
      _renderQuestionsPhase();
    }
  }

  // ─── Submit to server ──────────────────────────────────
  async function _submitAssessment() {
    phase = 'scoring';
    document.getElementById('main').innerHTML = `
      <div class="grid grid-main">
        <div class="stack" style="grid-column:1/-1">
          <article class="card animate-fade-in-up" style="text-align:center;padding:var(--space-12) var(--space-6)">
            <div class="empty-state-icon animate-pulse" style="font-size:48px;margin-bottom:var(--space-4)">🧠</div>
            <h2 class="card-title mb-2" style="font-size:24px">Analyzing Your Career Fit...</h2>
            <p class="text-secondary text-sm max-w-md mx-auto mb-4">
              Computing compatibility scores across 6 CSE career domains.
            </p>
            <div class="progress-bar max-w-md mx-auto">
              <div class="progress-bar-fill accent animate-pulse" style="width:100%"></div>
            </div>
          </article>
        </div>
      </div>
    `;

    try {
      const res = await API.post('/career-finder/score', { answers });
      scoreResult = res.data || res;

      if (!scoreResult.sorted?.length) throw new Error('No scores returned');

      _renderResultsPhase();

      // Load LLM explanation async (results show immediately)
      _loadExplanation();
    } catch (err) {
      Toast.error('Scoring failed: ' + err.message);
    }
  }

  async function _loadExplanation() {
    try {
      const res = await API.post('/career-finder/explain', {
        percentages: scoreResult.percentages,
        topDomain: scoreResult.topDomain,
        topName: scoreResult.topName,
        apiKey: _getApiKey(),
      });
      explanation = (res.data || res).explanation || '';
      const el = document.getElementById('career-explanation');
      if (el && explanation) {
        el.innerHTML = `<p style="margin:0;line-height:1.7">${explanation}</p>`;
        el.style.opacity = '1';
      }
    } catch (err) {
      console.warn('[Career explain failed]:', err.message);
    }
  }

  // ═══════════════════════════════════════════════════════
  // PHASE 2: Results
  // ═══════════════════════════════════════════════════════
  function _renderResultsPhase() {
    phase = 'results';
    const sorted = scoreResult.sorted || [];
    const top = sorted[0] || {};

    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Career Path Finder</div>
          <h1 class="page-title">Your CSE Career Fit</h1>
          <p class="page-subtitle">Based on your 7 responses, here's how your interests align with major CSE career domains.</p>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <!-- Top Result Highlight -->
          <article class="card animate-fade-in-up career-top-result" style="border-top:4px solid ${top.color || 'var(--accent)'}">
            <div style="text-align:center;padding:var(--space-4) 0">
              <div style="font-size:48px;margin-bottom:var(--space-2)">${top.icon || '🎯'}</div>
              <div class="text-xs text-muted uppercase font-bold mb-1">Your Strongest Current Fit</div>
              <h2 style="font-size:28px;font-weight:900;color:var(--text-primary);margin:0 0 var(--space-1)">${top.name || 'Unknown'}</h2>
              <div style="font-size:42px;font-weight:900;color:${top.color || 'var(--accent)'}">${top.score || 0}%</div>
              <p class="text-xs text-muted mt-2" style="max-width:400px;margin:var(--space-2) auto 0">
                This reflects your <strong>current interests</strong> from a short assessment — not a fixed career verdict.
              </p>
            </div>
          </article>

          <!-- All Domain Scores -->
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header">
              <h2 class="card-title">📊 Career Compatibility Scores</h2>
            </div>
            <div class="career-results-bars">
              ${sorted.map((d, idx) => `
                <div class="career-result-row animate-fade-in-up" style="animation-delay:${150 + idx * 80}ms">
                  <div class="career-result-meta">
                    <span class="career-result-icon">${d.icon}</span>
                    <span class="career-result-name">${d.name}</span>
                  </div>
                  <div class="career-result-bar-wrap">
                    <div class="career-result-bar-track">
                      <div class="career-result-bar-fill" style="width:${d.score}%;background:${d.color};animation:careerBarGrow 0.8s ease ${200 + idx * 100}ms both"></div>
                    </div>
                    <span class="career-result-pct" style="color:${d.color}">${d.score}%</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </article>

          <!-- AI Explanation (loads async) -->
          <article class="card animate-fade-in-up" style="animation-delay:200ms">
            <div class="card-header">
              <h2 class="card-title">🧠 AI Insight</h2>
              <span class="badge badge-accent">Powered by AI</span>
            </div>
            <div id="career-explanation" class="text-sm text-secondary" style="transition:opacity 0.5s ease;opacity:0.5;min-height:60px">
              <p style="margin:0;color:var(--text-muted);font-style:italic">Generating personalized explanation...</p>
            </div>
          </article>
        </div>

        <aside class="stack">
          <!-- Actions -->
          <article class="card card-accent animate-fade-in-up" style="animation-delay:150ms">
            <h3 class="card-title mb-3">🎯 Next Steps</h3>
            <div class="stack" style="gap:var(--space-2)">
              <button class="btn btn-primary" onclick="StudentCareerFinder.viewRoadmap('${top.domain}')"
                      style="width:100%;font-weight:700">
                📍 View ${top.name} Roadmap
              </button>
              ${sorted[1] ? `
                <button class="btn" onclick="StudentCareerFinder.viewRoadmap('${sorted[1].domain}')" style="width:100%">
                  Also explore: ${sorted[1].name} (${sorted[1].score}%)
                </button>
              ` : ''}
              <button class="btn" onclick="StudentCareerFinder.render()" style="width:100%;color:var(--text-muted);margin-top:var(--space-2)">
                🔄 Retake Assessment
              </button>
            </div>
          </article>

          <!-- Domain Quick View -->
          <article class="card animate-fade-in-up" style="animation-delay:250ms">
            <h3 class="card-title mb-3">🗂️ All Domains</h3>
            <div class="stack" style="gap:var(--space-1)">
              ${sorted.map(d => `
                <button class="career-domain-quick-btn" onclick="StudentCareerFinder.viewRoadmap('${d.domain}')">
                  <span>${d.icon} ${d.name}</span>
                  <span class="badge" style="background:${d.color};color:#fff;font-size:10px">${d.score}%</span>
                </button>
              `).join('')}
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════
  // PHASE 3: Roadmap
  // ═══════════════════════════════════════════════════════
  async function viewRoadmap(domain) {
    phase = 'roadmap';

    // Show loading
    document.getElementById('main').innerHTML = `
      <div class="grid grid-main">
        <div class="stack" style="grid-column:1/-1">
          <article class="card animate-fade-in-up" style="text-align:center;padding:var(--space-8)">
            <div class="empty-state-icon animate-pulse" style="font-size:40px;margin-bottom:var(--space-3)">📍</div>
            <p class="text-secondary text-sm">Loading roadmap...</p>
          </article>
        </div>
      </div>
    `;

    try {
      const res = await API.get(`/career-finder/roadmap/${domain}`);
      roadmapData = res.data || res;
      _renderRoadmapPhase();
    } catch (err) {
      Toast.error('Could not load roadmap: ' + err.message);
    }
  }

  function _renderRoadmapPhase() {
    const rd = roadmapData;
    const score = scoreResult?.percentages?.[rd.domain] || 0;

    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Career Path Finder → Roadmap</div>
          <h1 class="page-title">${rd.icon || '📍'} ${rd.name || 'Career'} Roadmap</h1>
          <p class="page-subtitle">Your step-by-step learning path to build skills for a career in ${rd.name}.</p>
        </div>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up" style="border-top:4px solid ${rd.color || 'var(--accent)'}">
            <div class="card-header">
              <div>
                <h2 class="card-title">${rd.name} Learning Path</h2>
                <span class="text-xs text-muted">${(rd.steps || []).length} milestones</span>
              </div>
              <span class="badge" style="background:${rd.color || 'var(--accent)'};color:#fff;font-size:13px">${score}% Fit</span>
            </div>

            <div class="career-roadmap-steps">
              ${(rd.steps || []).map((step, idx) => `
                <div class="career-roadmap-step animate-fade-in-up" style="animation-delay:${100 + idx * 80}ms">
                  <div class="career-roadmap-step-num" style="background:${rd.color || 'var(--accent)'}20;color:${rd.color || 'var(--accent)'}">${step.step || idx + 1}</div>
                  <div class="career-roadmap-step-content">
                    <div class="career-roadmap-step-title">${step.title}</div>
                    <div class="career-roadmap-step-desc">${step.desc}</div>
                    <span class="text-xs text-muted">⏱️ ${step.duration || 'Self-paced'}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </article>
        </div>

        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:100ms">
            <h3 class="card-title mb-3">📊 Your Full Results</h3>
            <div class="stack" style="gap:var(--space-1)">
              ${(scoreResult?.sorted || []).map(d => `
                <button class="career-domain-quick-btn ${d.domain === rd.domain ? 'active' : ''}"
                        onclick="StudentCareerFinder.viewRoadmap('${d.domain}')">
                  <span>${d.icon} ${d.name}</span>
                  <span class="badge" style="background:${d.color};color:#fff;font-size:10px">${d.score}%</span>
                </button>
              `).join('')}
            </div>
          </article>

          <article class="card animate-fade-in-up" style="animation-delay:200ms">
            <div class="stack" style="gap:var(--space-2)">
              <button class="btn btn-primary" onclick="StudentCareerFinder._renderResultsPhase()" style="width:100%">
                ← Back to Results
              </button>
              <button class="btn" onclick="StudentCareerFinder.render()" style="width:100%;color:var(--text-muted)">
                🔄 Retake Assessment
              </button>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  // ─── Public API ────────────────────────────────────────
  return {
    render,
    selectOption,
    prevQuestion,
    goToQuestion,
    viewRoadmap,
    _renderResultsPhase,
  };
})();
