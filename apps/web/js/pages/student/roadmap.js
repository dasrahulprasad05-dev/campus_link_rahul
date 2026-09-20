/* ============================================================
   CAMPUSLINK — Career Roadmap Page (Feature 7: AI-First Dynamic Roadmap)
   - ALWAYS prioritizes and tries to display live Groq AI-generated roadmap
   - ONLY falls back to the verified 4-week template when AI generation fails
   - Interactive checkboxes for both AI plan and fallback template
   - Real-time animated progress bar updating on every checkbox click
   - Full persistence via localStorage
   ============================================================ */
const StudentRoadmap = (() => {
  // All 10 trending roles from docx curriculum + standard aliases
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
    aiRoadmap: null,               // { summary, milestones, source, timestamp }
    aiError: null,                 // Error string when AI generation fails
    showingFallbackTemplate: false,// Set to TRUE only when AI fails
    expandedWeeks: { 0: true, 1: true, 2: true, 3: true },
  };

  // ─── LocalStorage Checkbox Helpers ───────────────────────────
  function getAIChecked(role) {
    try {
      const raw = localStorage.getItem(`CAMPUSLINK_ROADMAP_AI_CHECKED_${role}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveAIChecked(role, data) {
    try {
      localStorage.setItem(`CAMPUSLINK_ROADMAP_AI_CHECKED_${role}`, JSON.stringify(data));
    } catch (e) {
      console.warn('[Roadmap] Failed to save AI checkbox state', e);
    }
  }

  function getTemplateChecked(role) {
    try {
      const raw = localStorage.getItem(`CAMPUSLINK_ROADMAP_CHECKED_${role}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveTemplateChecked(role, data) {
    try {
      localStorage.setItem(`CAMPUSLINK_ROADMAP_CHECKED_${role}`, JSON.stringify(data));
    } catch (e) {
      console.warn('[Roadmap] Failed to save template checkbox state', e);
    }
  }

  // ─── Data Accessor for Fallback Template ─────────────────────
  function getFallbackRoleData(roleName) {
    const dataset = window.ROADMAP_FALLBACK_DATA || {};
    if (dataset[roleName]) return dataset[roleName];

    // Alias fallbacks
    if (roleName === 'Data Analyst' && dataset['Data Engineer']) return dataset['Data Engineer'];
    if (roleName === 'Software Engineer' && dataset['Backend Developer']) return dataset['Backend Developer'];

    return dataset['Frontend Developer'] || { role: roleName, weeks: [] };
  }

  // ─── Initialization ──────────────────────────────────────────
  function init() {
    const profile = Store.getProfile();
    const profileRole = profile?.targetRole || 'Frontend Developer';

    const matched = ROLE_OPTIONS.find(r => r.value.toLowerCase() === profileRole.toLowerCase());
    state.targetRole = matched ? matched.value : 'Frontend Developer';

    // Check if an AI roadmap was previously generated for this role
    try {
      const savedAI = localStorage.getItem(`CAMPUSLINK_ROADMAP_AI_DATA_${state.targetRole}`);
      if (savedAI) {
        state.aiRoadmap = JSON.parse(savedAI);
        state.showingFallbackTemplate = false;
        state.aiError = null;
      } else {
        state.aiRoadmap = null;
        state.showingFallbackTemplate = false;
        state.aiError = null;
      }
    } catch {
      state.aiRoadmap = null;
    }
  }

  // ─── Main Render ─────────────────────────────────────────────
  async function render() {
    if (!state.targetRole) init();

    const mainEl = document.getElementById('main');
    if (!mainEl) return;

    // AUTO-FETCH: Always try to generate AI roadmap if not present yet
    if (!state.aiRoadmap && !state.showingFallbackTemplate && !state.isGenerating && !state.aiError) {
      generateAIRoadmap(true); // background initial fetch
    }

    // Determine current progress depending on whether AI or Fallback is active
    let currentPct = 0;
    let currentCompleted = 0;
    let currentTotal = 0;

    if (!state.showingFallbackTemplate && state.aiRoadmap) {
      // AI Roadmap Progress
      const milestones = state.aiRoadmap.milestones || [];
      const aiChecked = getAIChecked(state.targetRole);
      currentTotal = milestones.length;
      currentCompleted = milestones.filter((_, idx) => aiChecked[`ai-${state.targetRole}-m${idx}`]).length;
      currentPct = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;
    } else if (state.showingFallbackTemplate) {
      // Fallback Template Progress
      const roleData = getFallbackRoleData(state.targetRole);
      const checkedMap = getTemplateChecked(state.targetRole);
      (roleData.weeks || []).forEach((w, wIdx) => {
        currentTotal += 1; // 1 project
        if (checkedMap[`proj-${state.targetRole}-w${wIdx}`]) currentCompleted += 1;
        (w.days || []).forEach((_, dIdx) => {
          currentTotal += 1; // 1 day
          if (checkedMap[`day-${state.targetRole}-w${wIdx}-d${dIdx}`]) currentCompleted += 1;
        });
      });
      currentPct = currentTotal > 0 ? Math.round((currentCompleted / currentTotal) * 100) : 0;
    }

    mainEl.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Career Placement Intelligence</div>
          <h1 class="page-title">Personalized Career Roadmap</h1>
          <p class="page-subtitle">
            ${state.showingFallbackTemplate
              ? 'Showing verified 4-week placement curriculum (AI engine currently offline).'
              : 'Dynamically personalized preparation plan powered by Groq AI.'}
          </p>
        </div>
      </div>

      <!-- AI Unavailable Alert: ONLY SHOWN WHEN AI FAILS -->
      ${state.showingFallbackTemplate ? `
        <div class="roadmap-alert-box animate-fade-in-up">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span style="font-size:26px">⚠️</span>
              <div>
                <strong style="color:var(--danger);font-size:14px">AI Roadmap Generation Unavailable</strong>
                <p class="text-xs text-muted mt-1">
                  ${state.aiError || 'Groq AI service is currently unreachable. Displaying the verified 4-week placement curriculum below with full interactive checkbox tracking.'}
                </p>
              </div>
            </div>
            <button class="btn btn-sm btn-primary" onclick="StudentRoadmap.generateAIRoadmap()" ${state.isGenerating ? 'disabled' : ''}>
              ${state.isGenerating ? '🤖 Retrying...' : '🔄 Retry AI Generation'}
            </button>
          </div>
        </div>
      ` : ''}

      <div class="grid grid-main">
        <div class="stack">
          <!-- Main Progress Card -->
          <article class="card animate-fade-in-up">
            <div class="card-header">
              <div>
                <h2 class="card-title">
                  Roadmap: <span class="text-accent">${state.targetRole}</span>
                </h2>
                <div class="text-xs text-muted mt-1">
                  ${state.showingFallbackTemplate
                    ? '<span class="badge badge-warning text-xs">Verified 4-Week Curriculum (Fallback)</span>'
                    : '<span class="badge badge-accent text-xs">🤖 Live Groq AI Generated</span>'}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span class="badge ${currentPct >= 100 ? 'badge-success' : 'badge-accent'}" id="progress-count-badge">
                  ${currentCompleted} / ${currentTotal} Completed
                </span>
                <button class="btn btn-sm btn-ghost text-xs" onclick="StudentRoadmap.resetCheckboxes()" title="Reset progress">
                  🔄 Reset
                </button>
              </div>
            </div>

            <!-- Dynamic Animated Progress Bar -->
            <div class="progress-group mb-4">
              <div class="progress-label">
                <span class="progress-label-name font-bold">Overall Roadmap Progress</span>
                <span class="progress-label-value font-bold text-accent" id="progress-pct-label">${currentPct}%</span>
              </div>
              <div class="progress-bar" style="height:10px">
                <div class="progress-bar-fill ${currentPct >= 100 ? 'success' : ''}" id="progress-bar-fill-el" style="width:${currentPct}%"></div>
              </div>
            </div>

            <!-- Quick Metrics Grid -->
            <div class="roadmap-stats-grid">
              <div class="roadmap-stat-card">
                <div class="roadmap-stat-val text-accent">${currentCompleted}</div>
                <div class="roadmap-stat-lbl">Tasks Done</div>
              </div>
              <div class="roadmap-stat-card">
                <div class="roadmap-stat-val">${Math.max(0, currentTotal - currentCompleted)}</div>
                <div class="roadmap-stat-lbl">Remaining</div>
              </div>
              <div class="roadmap-stat-card">
                <div class="roadmap-stat-val">${state.showingFallbackTemplate ? '4' : (state.aiRoadmap?.milestones?.length || 4)}</div>
                <div class="roadmap-stat-lbl">${state.showingFallbackTemplate ? 'Projects' : 'Milestones'}</div>
              </div>
              <div class="roadmap-stat-card">
                <div class="roadmap-stat-val">${state.showingFallbackTemplate ? 'Template' : 'Groq AI'}</div>
                <div class="roadmap-stat-lbl">Source Engine</div>
              </div>
            </div>

            <!-- Main Content Area: AI Plan OR Fallback Template -->
            <div id="roadmap-main-content">
              ${state.isGenerating ? renderLoadingState() : (
                state.showingFallbackTemplate ? renderFallbackTemplateView() : renderAIPlanView()
              )}
            </div>
          </article>
        </div>

        <!-- Sidebar: Role Selector & AI Generator Controls -->
        <aside class="stack">
          <!-- Target Role Selection Card -->
          <article class="card card-accent animate-fade-in-up" style="animation-delay:60ms">
            <h3 class="card-title mb-2">🎯 Target Placement Role</h3>
            <p class="text-xs text-muted mb-4">Change your role to generate a fresh AI roadmap:</p>

            <div class="form-group mb-4">
              <select id="roadmap-role-select" class="form-select" onchange="StudentRoadmap.onRoleChange(this.value)" style="width:100%;padding:10px 12px;border-radius:var(--radius-md);background:var(--bg-primary);color:var(--text-primary);border:1px solid var(--border-default);font-weight:600">
                ${ROLE_OPTIONS.map(r => `
                  <option value="${r.value}" ${state.targetRole === r.value ? 'selected' : ''}>${r.label}</option>
                `).join('')}
              </select>
            </div>

            <button class="btn btn-primary" style="width:100%" id="generate-roadmap-btn" onclick="StudentRoadmap.generateAIRoadmap()" ${state.isGenerating ? 'disabled' : ''}>
              ${state.isGenerating ? '🤖 Generating Plan...' : '🤖 Regenerate with Groq AI'}
            </button>
            <p class="text-xs text-muted mt-3" style="line-height:1.4">
              ⚡ Always dynamically generated via Groq AI. Ready-made fallback plan is only shown when AI fails.
            </p>
          </article>

          <!-- Checkbox Instructions Card -->
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header"><h2 class="card-title">💡 How it Works</h2></div>
            <div class="text-xs text-muted stack" style="gap:var(--space-3)">
              <div class="flex items-start gap-2">
                <span class="text-accent font-bold" style="font-size:16px">🤖</span>
                <span>The platform always creates and displays an AI-generated roadmap.</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-success font-bold" style="font-size:16px">☑️</span>
                <span>Click any checkbox to record completed milestones or daily tasks.</span>
              </div>
              <div class="flex items-start gap-2">
                <span class="text-warning font-bold" style="font-size:16px">🛡️</span>
                <span>If Groq AI is temporarily unreachable, the verified 4-week template takes over seamlessly.</span>
              </div>
            </div>
          </article>

          <!-- Mentor Review Card -->
          <article class="card animate-fade-in-up" style="animation-delay:140ms">
            <div class="card-header"><h2 class="card-title">Mentor Review</h2></div>
            <div class="insight-card accent">
              <strong>Progress Tracking</strong> Completed roadmap tasks can be submitted to your assigned placement mentor for review.
            </div>
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Toast.info('Roadmap progress submitted to your mentor for review!')">
              Request Mentor Review
            </button>
          </article>
        </aside>
      </div>
    `;
  }

  // ─── Render AI Plan View (PRIORITY VIEW) ─────────────────────
  function renderAIPlanView() {
    if (!state.aiRoadmap) {
      return `
        <div class="empty-state p-6 text-center" style="padding:var(--space-8) var(--space-4)">
          <div style="font-size:44px;margin-bottom:var(--space-2)">🤖</div>
          <h3 class="font-bold text-base mb-1">Generating AI Roadmap...</h3>
          <p class="text-sm text-muted mb-4">Click below to generate a tailored preparation plan with Groq AI.</p>
          <button class="btn btn-primary" onclick="StudentRoadmap.generateAIRoadmap()">
            🤖 Generate AI Roadmap Now
          </button>
        </div>
      `;
    }

    const milestones = state.aiRoadmap.milestones || [];
    const aiChecked = getAIChecked(state.targetRole);

    return `
      <div class="stack">
        <!-- AI Summary Card -->
        <div class="card card-accent mb-4" style="background:rgba(59,130,246,0.06);border:1px solid var(--accent);padding:var(--space-4)">
          <div class="flex items-center justify-between mb-2">
            <span class="badge badge-accent">🤖 Groq AI Personalized Strategy</span>
            <span class="text-xs text-muted">Target: ${state.targetRole}</span>
          </div>
          <p class="text-sm" style="color:var(--text-primary);line-height:1.5;margin:0">
            ${typeof AIText !== 'undefined' ? AIText.formatInline(state.aiRoadmap.summary) : state.aiRoadmap.summary}
          </p>
        </div>

        <!-- AI Milestones Checklist -->
        <div class="roadmap-day-list">
          <div class="text-xs font-bold text-muted mb-2">AI-Generated Milestone Checklist:</div>
          ${milestones.map((m, idx) => {
            const aiKey = `ai-${state.targetRole}-m${idx}`;
            const isDone = !!aiChecked[aiKey];
            const priorityColor = m.priority === 'critical' ? 'var(--danger)' : m.priority === 'high' ? 'var(--warning)' : 'var(--accent)';

            return `
              <div class="roadmap-day-row ${isDone ? 'is-done' : ''}" style="border-left-color:${isDone ? 'var(--success)' : priorityColor}">
                <input type="checkbox"
                       class="roadmap-checkbox-custom"
                       id="chk-${aiKey}"
                       ${isDone ? 'checked' : ''}
                       onchange="StudentRoadmap.toggleAICheck('${state.targetRole}', ${idx}, this.checked)">
                <div class="roadmap-day-content">
                  <div class="roadmap-day-header">
                    <span class="roadmap-day-name ${isDone ? 'done' : ''}">
                      ${m.week ? `Week ${m.week}: ` : ''}${m.title || `Milestone ${idx + 1}`}
                    </span>
                    <div class="flex items-center gap-2">
                      <span class="badge badge-${m.priority === 'critical' ? 'danger' : m.priority === 'high' ? 'warning' : 'ghost'}" style="font-size:10px">
                        ${m.priority || 'medium'}
                      </span>
                      <span class="badge badge-ghost" style="font-size:10px">${m.category || 'skill'}</span>
                    </div>
                  </div>

                  <p class="text-xs text-muted mb-2" style="${isDone ? 'text-decoration:line-through;opacity:0.75' : ''}">${m.description || ''}</p>

                  ${m.tasks && m.tasks.length ? `
                    <ul class="roadmap-task-list">
                      ${m.tasks.map(t => `<li style="${isDone ? 'text-decoration:line-through;opacity:0.75' : ''}">${t}</li>`).join('')}
                    </ul>
                  ` : ''}

                  ${m.project ? `
                    <div class="text-xs mt-1 mb-2" style="color:var(--accent)">
                      📦 <strong>Project Deliverable:</strong> ${m.project}
                    </div>
                  ` : ''}

                  <div class="roadmap-meta-row">
                    ${m.resources && m.resources.length ? `
                      <span>📚 <strong class="text-accent">${Array.isArray(m.resources) ? m.resources.join(' · ') : m.resources}</strong></span>
                    ` : ''}
                    ${m.success_criteria ? `
                      <span>✅ <em>Done when: ${m.success_criteria}</em></span>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // ─── Render Fallback Template View (ONLY WHEN AI FAILS) ───────
  function renderFallbackTemplateView() {
    const roleData = getFallbackRoleData(state.targetRole);
    const checkedMap = getTemplateChecked(state.targetRole);
    const weeks = roleData.weeks || [];

    return weeks.map((w, wIdx) => {
      const isExpanded = state.expandedWeeks[wIdx] !== false;
      const projKey = `proj-${state.targetRole}-w${wIdx}`;
      const isProjDone = !!checkedMap[projKey];

      let weekTasksTotal = 1 + (w.days ? w.days.length : 0);
      let weekTasksDone = isProjDone ? 1 : 0;
      (w.days || []).forEach((_, dIdx) => {
        if (checkedMap[`day-${state.targetRole}-w${wIdx}-d${dIdx}`]) weekTasksDone += 1;
      });
      const weekPct = Math.round((weekTasksDone / weekTasksTotal) * 100);

      return `
        <section class="roadmap-week-card">
          <!-- Week Header with Accordion Toggle -->
          <div class="roadmap-week-header" onclick="StudentRoadmap.toggleWeek(${wIdx})">
            <div class="roadmap-week-title-row">
              <span class="roadmap-week-pill">Week ${w.week || wIdx + 1}</span>
              <strong style="font-size:15px;color:var(--text-primary)">${w.title || `Week ${wIdx + 1}`}</strong>
            </div>
            <div class="flex items-center gap-3">
              <span class="badge ${weekTasksDone === weekTasksTotal ? 'badge-success' : 'badge-accent'}" style="font-size:11px">
                ${weekTasksDone}/${weekTasksTotal} Done (${weekPct}%)
              </span>
              <span style="font-size:12px;color:var(--text-muted)">${isExpanded ? '▲' : '▼'}</span>
            </div>
          </div>

          ${isExpanded ? `
            <div class="p-4" style="border-bottom:1px solid var(--border-subtle);background:var(--bg-primary)">
              <div class="text-xs text-muted"><strong>🎯 Goal:</strong> ${w.goal || 'Complete weekly curriculum'}</div>
            </div>

            <!-- Weekly Project -->
            ${w.project ? `
              <div class="roadmap-project-box">
                <div class="roadmap-project-header">
                  <div class="flex items-start gap-3">
                    <input type="checkbox"
                           class="roadmap-checkbox-custom"
                           id="chk-${projKey}"
                           ${isProjDone ? 'checked' : ''}
                           onchange="StudentRoadmap.toggleProjectCheck('${state.targetRole}', ${wIdx}, this.checked)">
                    <div>
                      <div class="font-bold text-sm ${isProjDone ? 'text-muted' : ''}" style="${isProjDone ? 'text-decoration:line-through' : ''}">
                        📦 ${w.project.title || 'Weekly Hands-On Project'}
                      </div>
                      <div class="text-xs text-muted mt-1">${w.project.deliverable || ''}</div>
                      ${w.project.tools ? `<div class="mt-2"><span class="badge badge-accent" style="font-size:10px">Tech: ${w.project.tools}</span></div>` : ''}
                    </div>
                  </div>
                  <span class="badge ${isProjDone ? 'badge-success' : 'badge-ghost'}" style="font-size:10px">
                    ${isProjDone ? '✓ Shipped' : 'Project Deliverable'}
                  </span>
                </div>
              </div>
            ` : ''}

            <!-- Day-by-Day Tasks Checklist -->
            <div class="roadmap-day-list">
              <div class="text-xs font-bold text-muted mb-1 px-1">Daily Schedule & Tasks:</div>
              ${(w.days || []).map((d, dIdx) => {
                const dayKey = `day-${state.targetRole}-w${wIdx}-d${dIdx}`;
                const isDayDone = !!checkedMap[dayKey];

                return `
                  <div class="roadmap-day-row ${isDayDone ? 'is-done' : ''}">
                    <input type="checkbox"
                           class="roadmap-checkbox-custom"
                           id="chk-${dayKey}"
                           ${isDayDone ? 'checked' : ''}
                           onchange="StudentRoadmap.toggleDayCheck('${state.targetRole}', ${wIdx}, ${dIdx}, this.checked)">
                    <div class="roadmap-day-content">
                      <div class="roadmap-day-header">
                        <span class="roadmap-day-name ${isDayDone ? 'done' : ''}">
                          ${d.day}: ${d.focus}
                        </span>
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
                <div class="text-xs text-muted mt-2 px-2" style="font-style:italic">
                  ✅ <strong>Success Criteria:</strong> ${w.successCriteria}
                </div>
              ` : ''}
            </div>
          ` : ''}
        </section>
      `;
    }).join('');
  }

  // ─── Loading Skeleton View ───────────────────────────────────
  function renderLoadingState() {
    return `
      <div class="p-8 text-center animate-pulse" style="padding:var(--space-8) var(--space-4)">
        <div style="font-size:48px;margin-bottom:var(--space-3);animation:pulse 1.5s infinite">🤖</div>
        <h3 class="font-bold text-base mb-2">Generating Personalized AI Roadmap with Groq LLM...</h3>
        <p class="text-sm text-muted" style="max-width:480px;margin:0 auto">
          Analyzing role competencies for <strong>${state.targetRole}</strong>, structuring week-by-week sprints, and assembling hands-on project deliverables.
        </p>
      </div>
    `;
  }

  // ─── Checkbox Event Handlers ─────────────────────────────────
  function toggleAICheck(role, milestoneIdx, isChecked) {
    const aiChecked = getAIChecked(role);
    const key = `ai-${role}-m${milestoneIdx}`;
    if (isChecked) {
      aiChecked[key] = true;
    } else {
      delete aiChecked[key];
    }
    saveAIChecked(role, aiChecked);
    render();
    if (isChecked) Toast.success('Milestone marked as complete! 🚀');
  }

  function toggleDayCheck(role, weekIdx, dayIdx, isChecked) {
    const checkedMap = getTemplateChecked(role);
    const key = `day-${role}-w${weekIdx}-d${dayIdx}`;
    if (isChecked) {
      checkedMap[key] = true;
    } else {
      delete checkedMap[key];
    }
    saveTemplateChecked(role, checkedMap);
    render();
    if (isChecked) Toast.success('Day marked as completed!');
  }

  function toggleProjectCheck(role, weekIdx, isChecked) {
    const checkedMap = getTemplateChecked(role);
    const key = `proj-${role}-w${weekIdx}`;
    if (isChecked) {
      checkedMap[key] = true;
    } else {
      delete checkedMap[key];
    }
    saveTemplateChecked(role, checkedMap);
    render();
    if (isChecked) Toast.success('Weekly Project deliverable marked as shipped! 🎉');
  }

  function toggleWeek(weekIdx) {
    state.expandedWeeks[weekIdx] = !state.expandedWeeks[weekIdx];
    render();
  }

  function onRoleChange(newRole) {
    state.targetRole = newRole;
    state.aiError = null;

    // Check if an AI roadmap is saved for this role
    try {
      const savedAI = localStorage.getItem(`CAMPUSLINK_ROADMAP_AI_DATA_${newRole}`);
      if (savedAI) {
        state.aiRoadmap = JSON.parse(savedAI);
        state.showingFallbackTemplate = false;
      } else {
        state.aiRoadmap = null;
        state.showingFallbackTemplate = false;
        // Auto-generate for the new role!
        generateAIRoadmap();
        return;
      }
    } catch {
      state.aiRoadmap = null;
    }

    render();
    Toast.info(`Switched roadmap to ${newRole}`);
  }

  function resetCheckboxes() {
    if (!confirm(`Reset all completed tasks for ${state.targetRole}?`)) return;
    saveAIChecked(state.targetRole, {});
    saveTemplateChecked(state.targetRole, {});
    render();
    Toast.info('Progress checklist reset.');
  }

  // ─── AI Roadmap Generation Call ──────────────────────────────
  async function generateAIRoadmap(isInitial = false) {
    state.isGenerating = true;
    state.aiError = null;
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

    // If AI failed or returned ai-unavailable:
    // ONLY THEN show the fallback template with error alert!
    if (!milestones || milestones.length === 0 || source === 'ai-unavailable') {
      state.showingFallbackTemplate = true;
      state.aiRoadmap = null;
      state.aiError = errorMsg || 'AI roadmap generation is currently unavailable. Displaying the verified 4-week placement curriculum below with full checkbox tracking.';
      render();
      Toast.error('AI unavailable: Showing verified 4-week placement plan.');
      return;
    }

    // AI Succeeded: Show ONLY the AI plan!
    state.showingFallbackTemplate = false;
    state.aiError = null;
    state.aiRoadmap = {
      summary,
      milestones,
      source: source || 'groq-llm',
      timestamp: new Date().toISOString(),
    };

    // Save AI roadmap to localStorage
    try {
      localStorage.setItem(`CAMPUSLINK_ROADMAP_AI_DATA_${targetRole}`, JSON.stringify(state.aiRoadmap));
    } catch (e) {
      console.warn('[Roadmap] Failed to persist AI roadmap', e);
    }

    render();
    if (!isInitial) {
      Toast.success(`Live Groq AI Roadmap generated for ${targetRole}!`);
    }
  }

  return {
    render,
    onRoleChange,
    toggleWeek,
    toggleAICheck,
    toggleDayCheck,
    toggleProjectCheck,
    generateAIRoadmap,
    resetCheckboxes,
  };
})();
