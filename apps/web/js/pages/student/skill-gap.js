/* ============================================================
   CAMPUSLINK — Skill-Gap Analyzer Page
   ============================================================ */
const StudentSkillGap = (() => {
  async function render() {
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">AI Skill-Gap Analyzer</div><h1 class="page-title">Identify Your Missing Skills</h1><p class="page-subtitle">Compare your current skill profile against a target role. Get a prioritized learning plan.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Run Analysis</h2></div>
            ${Forms.select({ id: 'gap-role', label: 'Target Role', choices: [
              { value: 'Data Analyst', label: 'Data Analyst' },
              { value: 'Software Engineer', label: 'Software Engineer' },
              { value: 'ML Engineer', label: 'ML Engineer' },
              { value: 'Web Developer', label: 'Web Developer' },
            ]})}
            <button class="btn btn-primary" id="run-gap-btn" onclick="StudentSkillGap.analyze()">🔍 Analyze Skill Gap</button>
          </article>
          <div id="gap-results"></div>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">Your Current Skills</h3>
            ${SkillBadge.render(API.DEMO.student.profile.skills)}
            <p class="text-xs text-muted mt-4">These are the skills from your profile. Keep them updated for accurate analysis.</p>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">How It Works</h2></div>
            <div class="stack" style="gap:var(--space-3)">
              <div class="flex items-center gap-3"><div class="milestone-number">1</div><div><div class="text-sm font-bold">Select Target Role</div><div class="text-xs text-muted">Choose the role you're preparing for</div></div></div>
              <div class="flex items-center gap-3"><div class="milestone-number">2</div><div><div class="text-sm font-bold">AI Comparison</div><div class="text-xs text-muted">Your skills are compared against role requirements</div></div></div>
              <div class="flex items-center gap-3"><div class="milestone-number">3</div><div><div class="text-sm font-bold">Get Action Plan</div><div class="text-xs text-muted">Prioritized list of skills to learn next</div></div></div>
            </div>
          </article>
        </aside>
      </div>
    `;
    // Auto-run analysis
    setTimeout(() => StudentSkillGap.analyze(), 300);
  }

  async function analyze() {
    const role = document.getElementById('gap-role')?.value || 'Data Analyst';
    const btn = document.getElementById('run-gap-btn');
    if (btn) { btn.textContent = 'Analyzing...'; btn.disabled = true; }

    const result = await API.post('/analyze/skill-gap', { targetRole: role, skills: API.DEMO.student.profile.skills });

    if (btn) { btn.textContent = '🔍 Analyze Skill Gap'; btn.disabled = false; }

    const el = document.getElementById('gap-results');
    if (!el) return;

    el.innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="card-header">
          <h2 class="card-title">Gap Analysis: ${result.targetRole}</h2>
          <span class="badge badge-accent">Engine: ${result.engineVersion || 'rules-v1'}</span>
        </div>
        ${result.matched?.length ? `
          <h4 class="mb-2 text-success">✓ Skills You Already Have</h4>
          ${SkillBadge.render(result.matched.map(s => ({ name: s, status: 'matched' })))}
          <div class="divider"></div>
        ` : ''}
        ${result.missing?.length ? `
          <h4 class="mb-2 text-danger">✗ Skills to Develop</h4>
          ${result.missing.map(s => `
            <div class="list-item">
              <div class="list-item-content">
                <div class="list-item-title">${s.name}</div>
                <div class="list-item-sub">${s.reason || ''}</div>
                ${s.resource ? `<div class="text-xs text-accent mt-2">📚 ${s.resource}</div>` : ''}
              </div>
              <span class="skill-tag ${s.priority}">${s.priority}</span>
            </div>
          `).join('')}
        ` : '<div class="insight-card success"><strong>🎉 No gaps detected!</strong> Your skills match all requirements for this role.</div>'}
      </article>
    `;
  }

  return { render, analyze };
})();
