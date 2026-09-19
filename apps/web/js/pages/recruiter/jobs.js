/* CAMPUSLINK — Recruiter Jobs Page — Real Data */
const RecruiterJobs = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading jobs...</div></div></div>`;

    const result = await API.get('/jobs');
    const allJobs = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    // Also fetch applications to show pipeline counts
    const appResult = await API.get('/applications');
    const apps = Array.isArray(appResult?.data) ? appResult.data : (Array.isArray(appResult) ? appResult : []);

    const jobs = allJobs.map(j => {
      const jobApps = apps.filter(a => a.job_id === j.id);
      return {
        ...j,
        applications: jobApps.length,
        shortlisted: jobApps.filter(a => a.status === 'shortlisted' || a.status === 'interview' || a.status === 'offered').length,
        interviewed: jobApps.filter(a => a.status === 'interview' || a.status === 'offered').length,
      };
    });

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Job Management</div><h1 class="page-title">My Job Postings</h1><p class="page-subtitle">Manage your open positions and track application pipelines.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Job posting form coming soon')">+ Post New Job</button></div></div>
      <div class="stack">
        ${jobs.length ? jobs.map((j, i) => `
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
        `).join('') : '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">No job postings</div><p class="empty-state-text">Post your first job to start receiving applications.</p></div>'}
      </div>
    `;
  }
  return { render };
})();
