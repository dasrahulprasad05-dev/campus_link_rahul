/* ============================================================
   CAMPUSLINK — Career Roadmap Page (Feature 7: LLM Roadmap)
   Now supports AI-generated personalized milestone plans.
   ============================================================ */
const StudentRoadmap = (() => {
  async function render() {
    const milestones = API.DEMO.student.roadmap;
    const completed = milestones.filter(m => m.status === 'completed').length;
    const pct = Math.round((completed / milestones.length) * 100);

    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Career Roadmap</div><h1 class="page-title">Your Learning Journey</h1><p class="page-subtitle">A milestone-based learning plan aligned to your target role and skill gaps. Your mentor can review and adjust.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Roadmap Progress</h2><span class="badge badge-accent">${completed}/${milestones.length} completed</span></div>
            <div class="progress-group mb-6"><div class="progress-label"><span class="progress-label-name">Overall Progress</span><span class="progress-label-value">${pct}%</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:${pct}%"></div></div></div>
            <div class="schedule-timeline">
              ${milestones.map((m, i) => `
                <div class="schedule-event animate-fade-in-up" style="animation-delay:${i * 80}ms;border-left-color:${m.status === 'completed' ? 'var(--success)' : m.status === 'in-progress' ? 'var(--accent)' : 'var(--border-default)'}">
                  <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-3">
                      <div class="milestone-number ${m.status === 'completed' ? 'completed' : ''}">${m.status === 'completed' ? '✓' : i + 1}</div>
                      <div class="font-bold">${m.title}</div>
                    </div>
                    <span class="status-badge status-${m.status === 'completed' ? 'accepted' : m.status === 'in-progress' ? 'interview' : 'draft'}">${m.status}</span>
                  </div>
                  <p class="text-sm text-muted">${m.desc}</p>
                  <div class="text-xs text-muted mt-2">📅 Due: ${m.due}</div>
                </div>
              `).join('')}
            </div>
          </article>
          <div id="ai-roadmap-results"></div>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">🎯 Target Role</h3>
            <div class="font-bold" style="font-size:18px;margin-bottom:var(--space-3)">${API.DEMO.student.profile.targetRole}</div>
            <p class="text-sm text-muted mb-4">This roadmap is generated based on your target role and current skill gaps.</p>
            <button class="btn btn-primary" style="width:100%" id="generate-roadmap-btn" onclick="StudentRoadmap.generateAIRoadmap()">🤖 Generate AI Roadmap</button>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">Mentor Review</h2></div>
            <div class="insight-card accent"><strong>Pending review</strong> Your mentor can approve, adjust, or add milestones to this roadmap.</div>
            <button class="btn btn-sm mt-4" style="width:100%" onclick="Toast.info('Request sent to your mentor')">Request Review</button>
          </article>
        </aside>
      </div>
    `;
  }

  async function generateAIRoadmap() {
    const btn = document.getElementById('generate-roadmap-btn');
    btn.textContent = '🤖 Generating...'; btn.disabled = true;

    const profile = API.DEMO.student.profile;
    const result = await API.post('/ai/generate-roadmap', {
      targetRole: profile.targetRole,
      currentSkills: profile.skills,
      skillGaps: API.DEMO.student.skills?.map(s => s.name) || [],
      cgpa: profile.cgpa,
      projectsCount: profile.projects?.length || 0,
      weeksUntilPlacement: 12,
    });

    btn.textContent = '🤖 Generate AI Roadmap'; btn.disabled = false;

    const milestones = result.milestones || result.data?.milestones || [];
    const source = result.source || result.data?.source || 'rule-engine';

    if (milestones.length === 0) {
      Toast.warning('Could not generate roadmap. Is the AI service running?');
      return;
    }

    const el = document.getElementById('ai-roadmap-results');
    el.innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="card-header">
          <h2 class="card-title">🤖 AI-Generated Roadmap</h2>
          <span class="badge badge-accent">${source === 'groq-llm' ? 'LLM Personalized' : 'Template'} · ${milestones.length} milestones</span>
        </div>
        ${result.summary || result.data?.summary ? `<div class="insight-card accent mb-4">${result.summary || result.data?.summary}</div>` : ''}
        <div class="schedule-timeline">
          ${milestones.map((m, i) => `
            <div class="schedule-event animate-fade-in-up" style="animation-delay:${i * 80}ms;border-left-color:${m.priority === 'critical' ? 'var(--danger)' : m.priority === 'high' ? 'var(--warning)' : 'var(--accent)'}">
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-3">
                  <div class="milestone-number">${m.week || i + 1}</div>
                  <div>
                    <div class="font-bold">${m.title}</div>
                    <span class="badge badge-${m.priority === 'critical' ? 'danger' : m.priority === 'high' ? 'warning' : 'ghost'}">${m.priority || 'medium'}</span>
                    <span class="badge badge-ghost">${m.category || 'skill'}</span>
                  </div>
                </div>
                <span class="text-xs text-muted">Week ${m.week || i + 1}</span>
              </div>
              <p class="text-sm text-muted">${m.description}</p>
              ${m.resources?.length ? `<div class="text-xs text-accent mt-2">📚 ${m.resources.join(' · ')}</div>` : ''}
              ${m.success_criteria ? `<div class="text-xs text-muted mt-1">✅ Done when: ${m.success_criteria}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </article>
    `;
  }

  return { render, generateAIRoadmap };
})();
