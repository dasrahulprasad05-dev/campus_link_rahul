/* ============================================================
   CAMPUSLINK — Career Roadmap Page (Feature 7: Week-Wise & Day-Wise AI Roadmap)
   - Complete 4-Week & Day-by-Day (Day 1 Mon - Day 7 Sun) breakdown
   - Interactive checkboxes for each day and weekly hands-on project
   - Real-time animated live progress bar updating instantly
   - Groq AI personalized strategy and placement coaching insights
   - Graceful fallback when AI is offline
   - All 10 trending roles supported from verified placement curriculum
   - DUAL VIEW: AI-Generated Plan + Offline Fallback Template
   ============================================================ */
const StudentRoadmap = (() => {
  // All 10 trending roles from docx placement curriculum + aliases
  const ROLE_OPTIONS = [
    { value: 'Frontend Developer', label: '🎨 Frontend Developer' },
    { value: 'Backend Developer', label: '⚙️ Backend Developer' },
    { value: 'Data Engineer', label: '🗄️ Data Engineer' },
    { value: 'Data Analyst', label: '📊 Data Analyst' },
    { value: 'Software Engineer', label: '💻 Software Engineer (SDE)' },
    { value: 'Business Analyst', label: '📈 Business Analyst' },
    { value: 'Database Administrator', label: '🗃️ Database Administrator' },
    { value: 'Agentic AI Engineer', label: '🤖 Agentic AI Engineer' },
    { value: 'Cybersecurity Analyst', label: '🛡️ Cybersecurity Analyst' },
    { value: 'Mobile App Developer', label: '📱 Mobile App Developer' },
    { value: 'Cloud Architect', label: '☁️ Cloud Architect' },
    { value: 'Product Manager', label: '🚀 Product Manager' },
  ];

  // Component State
  let state = {
    targetRole: 'Frontend Developer',
    isGenerating: false,
    aiStrategy: null,               // { summary, milestones, source }
    aiError: null,                  // Error message if Groq fails
    aiOffline: false,               // true when AI call failed
    showAiMilestones: false,        // toggle for optional AI sprint view
    expandedWeeks: { 0: true, 1: true, 2: true, 3: true },
    // DUAL VIEW STATE
    activeView: 'ai',               // 'ai' = AI-generated plan, 'fallback' = offline template
    fallbackExpandedWeeks: { 0: true, 1: true, 2: true, 3: true },
  };

  // ─── LocalStorage Helpers ────────────────────────────────────
  function getProgressKey(role, prefix) {
    return `CAMPUSLINK_ROADMAP_CHECKED_${prefix || 'MAIN'}_${role}`;
  }

  function getCheckedState(role, prefix) {
    try {
      const raw = localStorage.getItem(getProgressKey(role, prefix));
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveCheckedState(role, data, prefix) {
    try {
      localStorage.setItem(getProgressKey(role, prefix), JSON.stringify(data));
    } catch (e) {
      console.warn('[Roadmap] Failed to save progress state', e);
    }
  }

  // ─── Curriculum Data Accessor ────────────────────────────────
  function getRoleCurriculum(roleName) {
    const dataset = (typeof window !== 'undefined' && window.ROADMAP_FALLBACK_DATA)
      || (typeof ROADMAP_FALLBACK_DATA !== 'undefined' ? ROADMAP_FALLBACK_DATA : {});
    if (dataset[roleName]) return dataset[roleName];

    const foundKey = Object.keys(dataset).find(k => k.toLowerCase() === (roleName || '').toLowerCase());
    if (foundKey && dataset[foundKey]) return dataset[foundKey];

    // Standard alias mappings
    if (roleName === 'Data Analyst' && dataset['Data Engineer']) return dataset['Data Engineer'];
    if (roleName === 'Software Engineer' && dataset['Backend Developer']) return dataset['Backend Developer'];

    return dataset['Frontend Developer'] || { role: roleName, weeks: [] };
  }

  // ─── Progress Calculations ───────────────────────────────────
  function calculateProgress(role, prefix) {
    const curriculum = getRoleCurriculum(role);
    const checkedMap = getCheckedState(role, prefix);

    let total = 0;
    let completed = 0;
    let totalHours = 0;

    (curriculum.weeks || []).forEach((w, wIdx) => {
      // 1 task per weekly project
      total += 1;
      if (checkedMap[`proj-${role}-w${wIdx}`]) completed += 1;

      // 1 task per day (Day 1..7)
      (w.days || []).forEach((d, dIdx) => {
        total += 1;
        totalHours += Number(d.hours) || 2;
        if (checkedMap[`day-${role}-w${wIdx}-d${dIdx}`]) completed += 1;
      });
    });

    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pct, totalHours };
  }

  // ─── Initialization ──────────────────────────────────────────
  function init() {
    const profile = Store.getProfile();
    const profileRole = profile?.targetRole || 'Frontend Developer';

    const matched = ROLE_OPTIONS.find(r => r.value.toLowerCase() === profileRole.toLowerCase());
    state.targetRole = matched ? matched.value : 'Frontend Developer';

    // Migrate old localStorage keys (single-view format → prefixed MAIN format)
    ROLE_OPTIONS.forEach(r => {
      const oldKey = `CAMPUSLINK_ROADMAP_CHECKED_${r.value}`;
      const newKey = `CAMPUSLINK_ROADMAP_CHECKED_MAIN_${r.value}`;
      try {
        const oldData = localStorage.getItem(oldKey);
        if (oldData && !localStorage.getItem(newKey)) {
          localStorage.setItem(newKey, oldData);
        }
      } catch { /* ignore */ }
    });

    // Retrieve saved AI strategy if present
    try {
      const savedAI = localStorage.getItem(`CAMPUSLINK_ROADMAP_AI_STRATEGY_${state.targetRole}`);
      if (savedAI) {
        state.aiStrategy = JSON.parse(savedAI);
        state.aiOffline = false;
        state.activeView = 'ai';
      } else {
        state.aiStrategy = null;
      }
    } catch {
      state.aiStrategy = null;
    }
  }

  // ─── Main Render ─────────────────────────────────────────────
  async function render() {
    if (!state.targetRole) init();

    // Auto-fetch AI strategy on first visit if not yet fetched
    if (!state.aiStrategy && !state.isGenerating && !state.aiOffline && !state.aiError) {
      fetchAIStrategy(true);
    }

    const mainEl = document.getElementById('main');
    if (!mainEl) return;

    // Determine which progress to show based on active view
    const isAIView = state.activeView === 'ai';
    const prefix = isAIView ? 'MAIN' : 'FALLBACK';
    const curriculum = getRoleCurriculum(state.targetRole);
    const checkedMap = getCheckedState(state.targetRole, prefix);
    const { total, completed, pct, totalHours } = calculateProgress(state.targetRole, prefix);

    const hasAIPlan = !!(state.aiStrategy && state.aiStrategy.milestones && state.aiStrategy.milestones.length > 0);

    mainEl.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Career Placement Intelligence</div>
          <h1 class="page-title">Career Roadmap & Day-by-Day Preparation</h1>
          <p class="page-subtitle">
            Week-wise and day-wise study schedule with weekly projects, interactive checkboxes, and live Groq AI placement coaching.
          </p>
        </div>
      </div>

      <!-- AI Offline Notice Banner (shows only when AI generation fails) -->
      ${state.aiOffline ? `
        <div class="roadmap-alert-box animate-fade-in-up">
          <div class="flex items-center justify-between" style="flex-wrap:wrap;gap:12px">
            <div class="flex items-center gap-3">
              <span style="font-size:26px">⚠️</span>
              <div>
                <strong style="color:var(--danger);font-size:14px">Groq AI Engine Offline / Unreachable</strong>
                <p class="text-xs text-muted mt-1">
                  ${state.aiError || 'Live AI generation unavailable. You can use the verified 4-week placement curriculum below.'}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="btn btn-sm btn-primary" onclick="StudentRoadmap.fetchAIStrategy()" ${state.isGenerating ? 'disabled' : ''}>
                ${state.isGenerating ? '🤖 Retrying...' : '🔄 Retry AI Generation'}
              </button>
              <button class="btn btn-sm btn-ghost" onclick="StudentRoadmap.switchView('fallback')" style="border:1px solid var(--border-default)">
                📋 Use Ready-Made Template
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- DUAL VIEW TAB NAVIGATION -->
      <div class="roadmap-view-tabs animate-fade-in-up">
        <button class="roadmap-view-tab ${isAIView ? 'active' : ''}" onclick="StudentRoadmap.switchView('ai')">
          <span class="roadmap-view-tab-icon">🤖</span>
          <span class="roadmap-view-tab-label">AI Generated Plan</span>
          ${hasAIPlan ? '<span class="roadmap-view-tab-badge live">LIVE</span>' : state.isGenerating ? '<span class="roadmap-view-tab-badge loading">Loading...</span>' : '<span class="roadmap-view-tab-badge offline">Not Available</span>'}
        </button>
        <button class="roadmap-view-tab ${!isAIView ? 'active' : ''}" onclick="StudentRoadmap.switchView('fallback')">
          <span class="roadmap-view-tab-icon">📋</span>
          <span class="roadmap-view-tab-label">Ready-Made Template</span>
          <span class="roadmap-view-tab-badge template">Verified 4-Week Plan</span>
        </button>
      </div>

      <div class="grid grid-main">
        <div class="stack">
          ${isAIView ? renderAIView(curriculum, checkedMap, total, completed, pct, totalHours, hasAIPlan) : renderFallbackView(curriculum, checkedMap, total, completed, pct, totalHours)}
        </div>

        <!-- Sidebar: Role Selector & Controls -->
        <aside class="stack">
          <!-- Target Role Selection Card -->
          <article class="card card-accent animate-fade-in-up" style="animation-delay:60ms">
            <h3 class="card-title mb-2">🎯 Target Placement Role</h3>
            <p class="text-xs text-muted mb-4">Select your domain to adapt the week & day plan:</p>

            <div class="form-group mb-4">
              <select id="roadmap-role-select" class="form-select" onchange="StudentRoadmap.onRoleChange(this.value)" style="width:100%;padding:10px 12px;border-radius:var(--radius-md);background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-default);font-weight:600">
                ${ROLE_OPTIONS.map(r => `
                  <option value="${r.value}" ${state.targetRole === r.value ? 'selected' : ''}>${r.label}</option>
                `).join('')}
              </select>
            </div>

            <button class="btn btn-primary" style="width:100%" id="generate-roadmap-btn" onclick="StudentRoadmap.fetchAIStrategy()" ${state.isGenerating ? 'disabled' : ''}>
              ${state.isGenerating ? '🤖 Groq AI Generating...' : '🤖 Generate with Groq AI'}
            </button>
            <p class="text-xs text-muted mt-3" style="line-height:1.4">
              ⚡ Analyzes your skills, CGPA, and goals with Groq AI to personalize your study strategy and priorities.
            </p>
          </article>

          <!-- View Switch Card -->
          <article class="card animate-fade-in-up" style="animation-delay:80ms">
            <div class="card-header"><h2 class="card-title">🔀 Switch View</h2></div>
            <div class="text-xs text-muted mb-3">Compare AI-generated and verified template plans:</div>
            <div class="stack" style="gap:var(--space-2)">
              <button class="btn btn-sm ${isAIView ? 'btn-primary' : 'btn-ghost'}" style="width:100%;justify-content:flex-start;gap:8px" onclick="StudentRoadmap.switchView('ai')">
                🤖 AI Generated Plan ${hasAIPlan ? '✅' : '❌'}
              </button>
              <button class="btn btn-sm ${!isAIView ? 'btn-primary' : 'btn-ghost'}" style="width:100%;justify-content:flex-start;gap:8px" onclick="StudentRoadmap.switchView('fallback')">
                📋 Ready-Made Template ✅
              </button>
            </div>
          </article>

          <!-- Checkbox How-To & Legend -->
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header"><h2 class="card-title">💡 Interactive Progress</h2></div>
            <div class="text-xs text-muted stack" style="gap:var(--space-3)">
              <div class="flex items-start gap-2">
                <span class="text-success font-bold" style="font-size:16px">☑️</span>
                <span>Click any day or weekly project checkbox to mark it complete.</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-accent font-bold" style="font-size:16px">📊</span>
                <span>The progress bar and metrics update live with smooth animation.</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-warning font-bold" style="font-size:16px">💾</span>
                <span>Your checked progress stays saved on your device across reloads.</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-accent font-bold" style="font-size:16px">🔀</span>
                <span>Both AI and Template views have independent progress tracking.</span>
              </div>
            </div>
          </article>

          <!-- Mentor Review Card -->
          <article class="card animate-fade-in-up" style="animation-delay:140ms">
            <div class="card-header"><h2 class="card-title">Mentor Review</h2></div>
            <div class="insight-card accent">
              <strong>Ready for verification?</strong> Submit your completed daily tasks and GitHub project deliverables to your faculty mentor.
            </div>
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Toast.info('Roadmap progress submitted to your mentor for review!')">
              Request Mentor Review
            </button>
          </article>
        </aside>
      </div>
    `;
  }

  // ─── AI Generated Plan View ──────────────────────────────────
  function renderAIView(curriculum, checkedMap, total, completed, pct, totalHours, hasAIPlan) {
    if (state.isGenerating) {
      return `
        <article class="card animate-fade-in-up">
          <div class="roadmap-loading-state">
            <div class="roadmap-loading-spinner"></div>
            <h3 class="font-bold text-accent mt-3">🤖 Groq AI is generating your personalized roadmap...</h3>
            <p class="text-sm text-muted mt-2">Analyzing your skills, CGPA, and career goals to create a tailored study plan for <strong>${state.targetRole}</strong></p>
            <p class="text-xs text-muted mt-3">This usually takes 5-10 seconds. If it fails, you can switch to the verified Ready-Made Template.</p>
          </div>
        </article>
      `;
    }

    if (!hasAIPlan) {
      // AI not available - show prompt to use fallback
      return `
        <article class="card animate-fade-in-up">
          <div class="roadmap-empty-state">
            <div class="roadmap-empty-icon">🤖</div>
            <h3 class="font-bold mt-2" style="color:var(--text-primary)">AI Roadmap Not Available</h3>
            <p class="text-sm text-muted mt-2" style="max-width:500px;margin:0 auto">
              ${state.aiError || 'The Groq AI engine could not generate a personalized roadmap at this time. This could be due to network issues or service unavailability.'}
            </p>
            <div class="flex items-center gap-3 mt-4" style="justify-content:center;flex-wrap:wrap">
              <button class="btn btn-primary" onclick="StudentRoadmap.fetchAIStrategy()">
                🔄 Retry AI Generation
              </button>
              <button class="btn btn-ghost" onclick="StudentRoadmap.switchView('fallback')" style="border:1px solid var(--border-default)">
                📋 Use Ready-Made Template Instead
              </button>
            </div>
            <p class="text-xs text-muted mt-3">
              💡 The Ready-Made Template contains a verified 4-week placement curriculum with day-wise breakdown, projects, and resources.
            </p>
          </div>
        </article>
      `;
    }

    // AI Plan is available - show full interactive view
    const summaryText = state.aiStrategy?.summary || `Personalized 4-week preparation strategy for ${state.targetRole}.`;
    const milestones = state.aiStrategy?.milestones || [];

    return `
      <article class="card animate-fade-in-up">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              🤖 AI-Generated Roadmap: <span class="text-accent">${state.targetRole}</span>
            </h2>
            <div class="text-xs text-muted mt-1">
              <span class="badge badge-accent text-xs">🤖 Live Groq AI Enhanced</span>
              <span class="text-xs text-muted ml-2">Generated: ${state.aiStrategy?.timestamp ? new Date(state.aiStrategy.timestamp).toLocaleDateString() : 'Recently'}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge ${pct >= 100 ? 'badge-success' : 'badge-accent'}" id="progress-count-badge">
              ${completed} / ${total} Tasks Completed
            </span>
            <button class="btn btn-sm btn-ghost text-xs" onclick="StudentRoadmap.resetCheckboxes()" title="Reset all checkboxes for this role">
              🔄 Reset
            </button>
          </div>
        </div>

        <!-- Dynamic Animated Progress Bar -->
        <div class="progress-group mb-4">
          <div class="progress-label">
            <span class="progress-label-name font-bold">Overall Roadmap Completion</span>
            <span class="progress-label-value font-bold text-accent" id="progress-pct-label">${pct}%</span>
          </div>
          <div class="progress-bar" style="height:10px">
            <div class="progress-bar-fill ${pct >= 100 ? 'success' : ''}" id="progress-bar-fill-el" style="width:${pct}%"></div>
          </div>
        </div>

        <!-- Live Metrics Grid -->
        <div class="roadmap-stats-grid">
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val text-accent" id="stat-tasks-done">${completed}</div>
            <div class="roadmap-stat-lbl">Tasks Done</div>
          </div>
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val" id="stat-tasks-remaining">${Math.max(0, total - completed)}</div>
            <div class="roadmap-stat-lbl">Remaining</div>
          </div>
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val">4</div>
            <div class="roadmap-stat-lbl">Hands-On Projects</div>
          </div>
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val">~${totalHours} hrs</div>
            <div class="roadmap-stat-lbl">Estimated Study</div>
          </div>
        </div>

        <!-- Groq AI Personalized Strategy Summary -->
        <div class="roadmap-ai-summary-card mb-4">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="badge badge-accent">🧠 AI Strategy Summary</span>
            </div>
            <button class="btn btn-sm btn-ghost text-xs" onclick="StudentRoadmap.fetchAIStrategy()" title="Regenerate strategy with Groq AI">
              🔄 Refresh
            </button>
          </div>
          <p class="text-sm" style="color:var(--text-primary);line-height:1.6;margin:0">
            ${typeof AIText !== 'undefined' ? AIText.formatInline(summaryText) : summaryText}
          </p>

          ${milestones.length > 0 ? `
            <div class="mt-3 pt-2" style="border-top:1px solid rgba(59,130,246,0.2)">
              <button class="btn btn-sm btn-ghost text-xs" onclick="StudentRoadmap.toggleAiMilestonesView()" style="padding:2px 6px">
                ${state.showAiMilestones ? '▲ Hide AI Priority Highlights' : `▼ View Groq AI Priority Highlights (${milestones.length})`}
              </button>

              ${state.showAiMilestones ? `
                <div class="grid grid-cols-2 gap-2 mt-2">
                  ${milestones.slice(0, 4).map(m => `
                    <div class="p-2 rounded text-xs" style="background:var(--bg-surface);border:1px solid var(--border-subtle)">
                      <div class="font-bold text-accent">${m.title}</div>
                      <div class="text-muted mt-1">${m.description}</div>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        <!-- Full 4-Week & Day-by-Day Interactive Curriculum -->
        <div class="mt-4" id="curriculum-weeks-container">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-sm text-muted" style="letter-spacing:0.04em;text-transform:uppercase">
              📅 Week-by-Week & Day-by-Day Schedule (32 Checkpoints):
            </h3>
            <span class="text-xs text-muted">Click any checkbox to record progress</span>
          </div>

          ${renderWeekCards(curriculum, checkedMap, 'MAIN', state.expandedWeeks)}
        </div>
      </article>
    `;
  }

  // ─── Fallback Template View ──────────────────────────────────
  function renderFallbackView(curriculum, checkedMap, total, completed, pct, totalHours) {
    return `
      <article class="card animate-fade-in-up">
        <div class="card-header">
          <div>
            <h2 class="card-title">
              📋 Ready-Made Template: <span class="text-accent">${state.targetRole}</span>
            </h2>
            <div class="text-xs text-muted mt-1">
              <span class="badge badge-warning text-xs">📋 Verified 4-Week Placement Curriculum</span>
              <span class="text-xs text-muted ml-2">Offline Template — Always Available</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="badge ${pct >= 100 ? 'badge-success' : 'badge-accent'}" id="progress-count-badge">
              ${completed} / ${total} Tasks Completed
            </span>
            <button class="btn btn-sm btn-ghost text-xs" onclick="StudentRoadmap.resetCheckboxes()" title="Reset all checkboxes for this role">
              🔄 Reset
            </button>
          </div>
        </div>

        <!-- Fallback Info Banner -->
        <div class="roadmap-fallback-info mb-4">
          <div class="flex items-center gap-2 mb-2">
            <span style="font-size:20px">📋</span>
            <strong class="text-sm">Verified Placement Curriculum</strong>
          </div>
          <p class="text-xs text-muted" style="line-height:1.5">
            This is a pre-built, expert-verified 4-week study plan with day-wise breakdown, hands-on projects, and curated resources. 
            Progress is tracked independently from the AI-generated plan. You can switch to the AI plan anytime using the tabs above.
          </p>
        </div>

        <!-- Dynamic Animated Progress Bar -->
        <div class="progress-group mb-4">
          <div class="progress-label">
            <span class="progress-label-name font-bold">Template Completion Progress</span>
            <span class="progress-label-value font-bold text-accent" id="progress-pct-label">${pct}%</span>
          </div>
          <div class="progress-bar" style="height:10px">
            <div class="progress-bar-fill ${pct >= 100 ? 'success' : ''}" id="progress-bar-fill-el" style="width:${pct}%"></div>
          </div>
        </div>

        <!-- Live Metrics Grid -->
        <div class="roadmap-stats-grid">
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val text-accent" id="stat-tasks-done">${completed}</div>
            <div class="roadmap-stat-lbl">Tasks Done</div>
          </div>
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val" id="stat-tasks-remaining">${Math.max(0, total - completed)}</div>
            <div class="roadmap-stat-lbl">Remaining</div>
          </div>
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val">4</div>
            <div class="roadmap-stat-lbl">Hands-On Projects</div>
          </div>
          <div class="roadmap-stat-card">
            <div class="roadmap-stat-val">~${totalHours} hrs</div>
            <div class="roadmap-stat-lbl">Estimated Study</div>
          </div>
        </div>

        <!-- Full 4-Week & Day-by-Day Interactive Curriculum -->
        <div class="mt-4" id="curriculum-weeks-container">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-sm text-muted" style="letter-spacing:0.04em;text-transform:uppercase">
              📅 Week-by-Week & Day-by-Day Schedule (32 Checkpoints):
            </h3>
            <span class="text-xs text-muted">Click any checkbox to record progress</span>
          </div>

          ${renderWeekCards(curriculum, checkedMap, 'FALLBACK', state.fallbackExpandedWeeks)}
        </div>
      </article>
    `;
  }

  // ─── Render 4 Weeks with Days & Projects ─────────────────────
  function renderWeekCards(curriculum, checkedMap, prefix, expandedWeeksMap) {
    const weeks = curriculum.weeks || [];
    if (weeks.length === 0) {
      return `<p class="text-muted p-4">No curriculum found for ${state.targetRole}.</p>`;
    }

    return weeks.map((w, wIdx) => {
      const isExpanded = expandedWeeksMap[wIdx] !== false;
      const projKey = `proj-${state.targetRole}-w${wIdx}`;
      const isProjDone = !!checkedMap[projKey];

      // Week stats
      let weekTotal = 1 + (w.days ? w.days.length : 0);
      let weekDone = isProjDone ? 1 : 0;
      (w.days || []).forEach((_, dIdx) => {
        if (checkedMap[`day-${state.targetRole}-w${wIdx}-d${dIdx}`]) weekDone += 1;
      });
      const weekPct = Math.round((weekDone / weekTotal) * 100);

      return `
        <section class="roadmap-week-card mb-4" id="week-card-${prefix}-${wIdx}">
          <!-- Week Header with Accordion Toggle -->
          <div class="roadmap-week-header" onclick="StudentRoadmap.toggleWeek(${wIdx}, '${prefix}')">
            <div class="roadmap-week-title-row">
              <span class="roadmap-week-pill">Week ${w.week || wIdx + 1}</span>
              <strong style="font-size:15px;color:var(--text-primary)">${w.title || `Week ${wIdx + 1}`}</strong>
            </div>
            <div class="flex items-center gap-3">
              <span class="badge ${weekDone === weekTotal ? 'badge-success' : 'badge-accent'}" id="week-badge-${prefix}-${wIdx}" style="font-size:11px">
                ${weekDone}/${weekTotal} Done (${weekPct}%)
              </span>
              <span style="font-size:12px;color:var(--text-muted)" id="week-arrow-${prefix}-${wIdx}">${isExpanded ? '▲' : '▼'}</span>
            </div>
          </div>

          ${isExpanded ? `
            <div class="p-4" style="border-bottom:1px solid var(--border-subtle);background:var(--bg-primary)">
              <div class="text-xs text-muted"><strong>🎯 Goal:</strong> ${w.goal || 'Complete weekly curriculum'}</div>
            </div>

            <!-- Weekly Project Deliverable Card -->
            ${w.project ? `
              <div class="roadmap-project-box ${isProjDone ? 'is-done' : ''}" id="row-${prefix}-${projKey}">
                <div class="roadmap-project-header">
                  <div class="flex items-start gap-3">
                    <input type="checkbox"
                           class="roadmap-checkbox-custom"
                           id="chk-${prefix}-${projKey}"
                           ${isProjDone ? 'checked' : ''}
                           onchange="StudentRoadmap.onToggleProject('${state.targetRole}', ${wIdx}, this.checked, '${prefix}')">
                    <div>
                      <label for="chk-${prefix}-${projKey}" class="font-bold text-sm ${isProjDone ? 'text-muted' : ''}" id="label-${prefix}-${projKey}" style="cursor:pointer;${isProjDone ? 'text-decoration:line-through' : ''}">
                        📦 ${w.project.title || 'Weekly Hands-On Project'}
                      </label>
                      <div class="text-xs text-muted mt-1">${w.project.deliverable || ''}</div>
                      ${w.project.tools ? `<div class="mt-2"><span class="badge badge-accent" style="font-size:10px">Tech Stack: ${w.project.tools}</span></div>` : ''}
                    </div>
                  </div>
                  <span class="badge ${isProjDone ? 'badge-success' : 'badge-ghost'}" id="badge-${prefix}-${projKey}" style="font-size:10px">
                    ${isProjDone ? '✓ Shipped' : 'Project Deliverable'}
                  </span>
                </div>
              </div>
            ` : ''}

            <!-- Day-by-Day Tasks Checklist (Day 1 to Day 7) -->
            <div class="roadmap-day-list">
              <div class="text-xs font-bold text-muted mb-1 px-1">Daily Study Schedule (Day 1 – Day 7):</div>
              ${(w.days || []).map((d, dIdx) => {
                const dayKey = `day-${state.targetRole}-w${wIdx}-d${dIdx}`;
                const isDayDone = !!checkedMap[dayKey];

                return `
                  <div class="roadmap-day-row ${isDayDone ? 'is-done' : ''}" id="row-${prefix}-${dayKey}">
                    <input type="checkbox"
                           class="roadmap-checkbox-custom"
                           id="chk-${prefix}-${dayKey}"
                           ${isDayDone ? 'checked' : ''}
                           onchange="StudentRoadmap.onToggleDay('${state.targetRole}', ${wIdx}, ${dIdx}, this.checked, '${prefix}')">
                    <div class="roadmap-day-content">
                      <div class="roadmap-day-header">
                        <label for="chk-${prefix}-${dayKey}" class="roadmap-day-name ${isDayDone ? 'done' : ''}" id="label-${prefix}-${dayKey}" style="cursor:pointer">
                          ${d.day}: ${d.focus}
                        </label>
                        <span class="badge badge-ghost" style="font-size:10px">⏱️ ${d.hours || 2}h</span>
                      </div>

                      ${d.tasks && d.tasks.length ? `
                        <ul class="roadmap-task-list">
                          ${d.tasks.map(t => `<li style="${isDayDone ? 'text-decoration:line-through;opacity:0.75' : ''}">${t}</li>`).join('')}
                        </ul>
                      ` : ''}

                      <div class="roadmap-meta-row">
                        ${d.resources && d.resources !== '-' ? `
                          <span>📚 <strong class="text-accent">${d.resources}</strong></span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}

              ${w.successCriteria ? `
                <div class="text-xs text-muted mt-2 px-2 pb-2" style="font-style:italic">
                  ✅ <strong>Success Criteria:</strong> ${w.successCriteria}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </section>
      `;
    }).join('');
  }

  // ─── Live Checkbox Toggle Handlers (Instant UI Update) ──────
  function onToggleDay(role, weekIdx, dayIdx, isChecked, prefix) {
    prefix = prefix || 'MAIN';
    const checkedMap = getCheckedState(role, prefix);
    const dayKey = `day-${role}-w${weekIdx}-d${dayIdx}`;

    if (isChecked) {
      checkedMap[dayKey] = true;
    } else {
      delete checkedMap[dayKey];
    }
    saveCheckedState(role, checkedMap, prefix);

    // Live update DOM elements without page re-render
    const row = document.getElementById(`row-${prefix}-${dayKey}`);
    if (row) row.classList.toggle('is-done', isChecked);

    const label = document.getElementById(`label-${prefix}-${dayKey}`);
    if (label) label.classList.toggle('done', isChecked);

    updateLiveProgress(role, weekIdx, prefix);
    if (isChecked) Toast.success('Day marked as completed!');
  }

  function onToggleProject(role, weekIdx, isChecked, prefix) {
    prefix = prefix || 'MAIN';
    const checkedMap = getCheckedState(role, prefix);
    const projKey = `proj-${role}-w${weekIdx}`;

    if (isChecked) {
      checkedMap[projKey] = true;
    } else {
      delete checkedMap[projKey];
    }
    saveCheckedState(role, checkedMap, prefix);

    // Live update DOM elements
    const row = document.getElementById(`row-${prefix}-${projKey}`);
    if (row) row.classList.toggle('is-done', isChecked);

    const label = document.getElementById(`label-${prefix}-${projKey}`);
    if (label) {
      label.classList.toggle('text-muted', isChecked);
      label.style.textDecoration = isChecked ? 'line-through' : 'none';
    }

    const badge = document.getElementById(`badge-${prefix}-${projKey}`);
    if (badge) {
      badge.className = `badge ${isChecked ? 'badge-success' : 'badge-ghost'}`;
      badge.textContent = isChecked ? '✓ Shipped' : 'Project Deliverable';
    }

    updateLiveProgress(role, weekIdx, prefix);
    if (isChecked) Toast.success('Weekly project deliverable marked as shipped! 🎉');
  }

  function updateLiveProgress(role, weekIdx, prefix) {
    prefix = prefix || 'MAIN';
    const { total, completed, pct } = calculateProgress(role, prefix);

    // Update overall progress bar
    const fill = document.getElementById('progress-bar-fill-el');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.classList.toggle('success', pct >= 100);
    }

    const pctLabel = document.getElementById('progress-pct-label');
    if (pctLabel) pctLabel.textContent = `${pct}%`;

    const countBadge = document.getElementById('progress-count-badge');
    if (countBadge) {
      countBadge.textContent = `${completed} / ${total} Tasks Completed`;
      countBadge.className = `badge ${pct >= 100 ? 'badge-success' : 'badge-accent'}`;
    }

    const statDone = document.getElementById('stat-tasks-done');
    if (statDone) statDone.textContent = completed;

    const statRem = document.getElementById('stat-tasks-remaining');
    if (statRem) statRem.textContent = Math.max(0, total - completed);

    // Update week-level badge
    if (typeof weekIdx === 'number') {
      const curriculum = getRoleCurriculum(role);
      const checkedMap = getCheckedState(role, prefix);
      const w = curriculum.weeks?.[weekIdx];
      if (w) {
        let weekTotal = 1 + (w.days ? w.days.length : 0);
        let weekDone = checkedMap[`proj-${role}-w${weekIdx}`] ? 1 : 0;
        (w.days || []).forEach((_, dIdx) => {
          if (checkedMap[`day-${role}-w${weekIdx}-d${dIdx}`]) weekDone += 1;
        });
        const weekPct = Math.round((weekDone / weekTotal) * 100);
        const weekBadge = document.getElementById(`week-badge-${prefix}-${weekIdx}`);
        if (weekBadge) {
          weekBadge.textContent = `${weekDone}/${weekTotal} Done (${weekPct}%)`;
          weekBadge.className = `badge ${weekDone === weekTotal ? 'badge-success' : 'badge-accent'}`;
        }
      }
    }
  }

  function toggleWeek(weekIdx, prefix) {
    if (prefix === 'FALLBACK') {
      state.fallbackExpandedWeeks[weekIdx] = !state.fallbackExpandedWeeks[weekIdx];
    } else {
      state.expandedWeeks[weekIdx] = !state.expandedWeeks[weekIdx];
    }
    render();
  }

  function toggleAiMilestonesView() {
    state.showAiMilestones = !state.showAiMilestones;
    render();
  }

  function switchView(viewName) {
    state.activeView = viewName;
    render();
    if (viewName === 'ai') {
      Toast.info('Switched to AI Generated Plan');
    } else {
      Toast.info('Switched to Ready-Made Template');
    }
  }

  function onRoleChange(newRole) {
    state.targetRole = newRole;
    state.aiError = null;
    state.aiOffline = false;

    // Check saved AI strategy for new role
    try {
      const saved = localStorage.getItem(`CAMPUSLINK_ROADMAP_AI_STRATEGY_${newRole}`);
      state.aiStrategy = saved ? JSON.parse(saved) : null;
    } catch {
      state.aiStrategy = null;
    }

    render();
    Toast.info(`Switched roadmap to ${newRole}`);
  }

  function resetCheckboxes() {
    const prefix = state.activeView === 'ai' ? 'MAIN' : 'FALLBACK';
    const viewLabel = state.activeView === 'ai' ? 'AI Generated Plan' : 'Ready-Made Template';
    if (!confirm(`Reset all completed checkboxes for ${state.targetRole} (${viewLabel})?`)) return;
    saveCheckedState(state.targetRole, {}, prefix);
    render();
    Toast.info(`Progress checklist reset for ${viewLabel}.`);
  }

  // ─── Fetch AI Strategy from Groq ─────────────────────────────
  async function fetchAIStrategy(isInitial = false) {
    state.isGenerating = true;
    state.aiError = null;
    state.activeView = 'ai'; // Switch to AI view when generating
    render();

    const profile = Store.getProfile() || {};
    const targetRole = state.targetRole || profile.targetRole || 'Frontend Developer';
    const customKey = localStorage.getItem('CAMPUSLINK_CUSTOM_GROQ_KEY') || '';

    let result = null;
    try {
      result = await API.post('/ai/generate-roadmap', {
        targetRole,
        currentSkills: profile.skills || [],
        skillGaps: [],
        cgpa: profile.cgpa || 7.5,
        projectsCount: 2,
        weeksUntilPlacement: 4,
        customApiKey: customKey,
      });
    } catch (err) {
      console.warn('[Roadmap] Error calling /ai/generate-roadmap:', err);
    }

    state.isGenerating = false;

    const milestones = result?.milestones || result?.data?.milestones || [];
    const summary = result?.summary || result?.data?.summary || '';
    const source = result?.source || result?.data?.source || '';
    const errorMsg = result?.error || result?.data?.error || '';

    if (!milestones || milestones.length === 0 || source === 'ai-unavailable') {
      state.aiOffline = true;
      state.aiError = errorMsg || 'Groq AI service is currently unreachable. Click "Use Ready-Made Template" to access the verified 4-week placement curriculum with full progress tracking.';
      render();
      if (!isInitial) Toast.error('AI unavailable — Use the Ready-Made Template for offline study plan.');
      return;
    }

    // AI Succeeded
    state.aiOffline = false;
    state.aiError = null;
    state.aiStrategy = {
      summary,
      milestones,
      source: source || 'groq-llm',
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(`CAMPUSLINK_ROADMAP_AI_STRATEGY_${targetRole}`, JSON.stringify(state.aiStrategy));
    } catch (e) {
      console.warn('[Roadmap] Failed to persist AI strategy', e);
    }

    render();
    if (!isInitial) Toast.success(`Live Groq AI roadmap strategy updated for ${targetRole}!`);
  }

  return {
    render,
    onRoleChange,
    toggleWeek,
    onToggleDay,
    onToggleProject,
    fetchAIStrategy,
    resetCheckboxes,
    toggleAiMilestonesView,
    switchView,
  };
})();
