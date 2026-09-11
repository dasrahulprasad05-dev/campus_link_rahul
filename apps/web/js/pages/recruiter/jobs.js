/* CAMPUSLINK — Recruiter Jobs Page */
const RecruiterJobs = (() => {
  async function render() {
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Job Management</div><h1 class="page-title">My Job Postings</h1><p class="page-subtitle">Manage your open positions and track application pipelines.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Job posting form coming soon')">+ Post New Job</button></div></div>
      <div class="stack">
        ${API.DEMO.recruiter.jobs.map((j, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center mb-4"><h3>${j.title}</h3><span class="status-badge status-${j.status === 'active' ? 'confirmed' : 'draft'}">${j.status}</span></div>
            <div class="job-metrics-grid">
              <div><div class="text-xs text-muted">Applications</div><div class="font-bold">${j.applications}</div></div>
              <div><div class="text-xs text-muted">Shortlisted</div><div class="font-bold">${j.shortlisted}</div></div>
              <div><div class="text-xs text-muted">Interviewed</div><div class="font-bold">${j.interviewed}</div></div>
              <div><div class="text-xs text-muted">Conversion</div><div class="font-bold">${j.applications > 0 ? Math.round(j.shortlisted/j.applications*100) : 0}%</div></div>
            </div>
            <div class="progress-group mt-4"><div class="progress-label"><span class="progress-label-name">Pipeline Progress</span><span class="progress-label-value">${j.interviewed}/${j.applications}</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:${j.applications > 0 ? (j.interviewed/j.applications*100) : 0}%"></div></div></div>
          </article>
        `).join('')}
      </div>
    `;
  }
  return { render };
})();
