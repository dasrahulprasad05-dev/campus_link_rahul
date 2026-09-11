/* CAMPUSLINK — Recruiter Pipeline Page */
const RecruiterPipeline = (() => {
  async function render() {
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Recruitment Pipeline</div><h1 class="page-title">Application Pipeline</h1><p class="page-subtitle">Track candidates through your recruitment funnel — from application to offer.</p></div></div>
      <div class="grid pipeline-grid">
        ${[
          { stage: 'Applied', count: 198, color: 'blue', candidates: ['Ananya S.', 'Vikram R.', 'Soham D.', '+195'] },
          { stage: 'Shortlisted', count: 42, color: 'orange', candidates: ['Ananya S.', 'Vikram R.', 'Priti M.', '+39'] },
          { stage: 'Interview', count: 18, color: 'green', candidates: ['Ananya S.', 'Vikram R.', '+16'] },
          { stage: 'Offered', count: 5, color: 'blue', candidates: ['Ananya S.', '+4'] },
        ].map((s, i) => `
          <article class="card animate-fade-in-up" style="animation-delay:${i * 80}ms;border-top:3px solid var(--${s.color === 'blue' ? 'accent' : s.color === 'green' ? 'success' : 'warning'})">
            <div class="text-xs text-muted uppercase font-bold mb-2">${s.stage}</div>
            <div class="font-bold" style="font-size:28px;margin-bottom:var(--space-4)">${s.count}</div>
            ${s.candidates.map(c => `<div class="text-sm text-muted mb-2">• ${c}</div>`).join('')}
          </article>
        `).join('')}
      </div>
    `;
  }
  return { render };
})();
