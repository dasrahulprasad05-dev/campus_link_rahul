/* CAMPUSLINK — Admin Interventions Page */
const AdminInterventions = (() => {
  async function render() {
    const risk = API.DEMO.admin.risk;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">At-Risk Student Prediction</div><h1 class="page-title">Intervention Queue</h1><p class="page-subtitle">Advisory signals for students who may need additional support. Predictions are transparent, reviewable, and never automatic.</p></div></div>
      <div class="insight-card warning mb-6"><strong>⚠️ Advisory Only:</strong> These signals are generated from transparent indicators (readiness decline, incomplete activities, inactivity). They require human review before any action is taken. No high-stakes decisions are automated.</div>
      <div class="stack">
        ${risk.map((r, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <div class="avatar avatar-lg ${r.severity === 'high' ? 'avatar-orange' : 'avatar-blue'}">${r.name.split(' ').map(w=>w[0]).join('')}</div>
                <div>
                  <div class="font-bold" style="font-size:16px">${r.name}</div>
                  <div class="text-sm text-muted">${r.branch}</div>
                  <div class="text-sm mt-2">${r.reason}</div>
                </div>
              </div>
              <div class="text-center">
                ${ScoreRing.render(r.score, { size: 80, label: 'readiness' })}
              </div>
            </div>
            <div class="flex gap-3 mt-4" style="justify-content:flex-end">
              <span class="badge badge-${r.severity === 'high' ? 'danger' : 'warning'}">${r.severity} priority</span>
              <button class="btn btn-sm" onclick="Toast.info('Scheduling check-in with ${r.name}')">Schedule Check-in</button>
              <button class="btn btn-sm btn-ghost" onclick="Toast.info('Reviewed — ${r.name} flagged as reviewed')">Mark Reviewed</button>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }
  return { render };
})();
