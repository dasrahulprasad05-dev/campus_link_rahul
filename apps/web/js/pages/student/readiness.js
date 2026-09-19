/* ============================================================
   CAMPUSLINK — Student Readiness Page (Real Data)
   ============================================================ */
const StudentReadiness = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading readiness...</div></div></div>`;

    // Fetch real readiness data
    const d = await API.get('/students/me/readiness');
    const score = d?.score || 0;
    const factors = d?.factors || [];
    const weights = d?.weights || {};
    const targetRole = d?.targetRole || 'Software Engineer';
    const statusBand = d?.statusBand || { label: 'Unknown', emoji: '⬜' };
    const recommendations = d?.recommendations || [];

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Placement Readiness</div><h1 class="page-title">Your Readiness Score</h1><p class="page-subtitle">A composite, explainable score built from your skills, projects, academics, aptitude, and activity.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Overall Score</h2><span class="badge badge-accent">${statusBand.emoji} ${statusBand.label}</span></div>
            <div class="readiness-grid">
              ${ScoreRing.render(score, { size: 180 })}
              <div>
                ${factors.map(f => `<div class="progress-group"><div class="progress-label"><span class="progress-label-name">${f.label}</span><span class="progress-label-value">${f.value}%</span></div><div class="progress-bar"><div class="progress-bar-fill ${f.value >= 80 ? 'success' : f.value >= 65 ? '' : 'warning'}" style="width:${f.value}%"></div></div></div>`).join('')}
              </div>
            </div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">How is this score calculated?</h2></div>
            <p class="text-sm text-muted mb-4">Your readiness score combines seven weighted dimensions for the <strong>${targetRole}</strong> role. Each dimension is scored independently.</p>
            <div class="table-container">
              <table class="data-table">
                <thead><tr><th>Dimension</th><th>Weight</th><th>Score</th></tr></thead>
                <tbody>
                  ${factors.map(f => {
                    const w = Object.entries(weights).find(([k]) => f.label.toLowerCase().includes(k));
                    return `<tr><td class="font-bold">${f.label}</td><td>${w ? Math.round(w[1] * 100) : '—'}%</td><td>${f.value}</td></tr>`;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </article>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">🎯 Action Plan</h3>
            ${recommendations.length > 0 ? recommendations.map((r, i) => `
              <div class="insight-card ${r.priority === 'high' ? 'warning' : 'accent'} ${i > 0 ? 'mt-3' : ''}">
                <strong>${r.priority === 'high' ? '🔴' : '🟡'} ${r.area}:</strong> ${r.action}
              </div>
            `).join('') : '<p class="text-sm text-muted">Complete your profile to see personalized recommendations.</p>'}
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
