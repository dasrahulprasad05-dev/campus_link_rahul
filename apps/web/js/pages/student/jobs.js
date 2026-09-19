/* ============================================================
   CAMPUSLINK — Jobs Discovery Page (Real Data)
   ============================================================ */
const StudentJobs = (() => {
  let _allJobs = [];

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading jobs...</div></div></div>`;

    const result = await API.get('/jobs');
    _allJobs = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Job Discovery</div><h1 class="page-title">Explore Opportunities</h1><p class="page-subtitle">AI-matched jobs ranked by fit with your profile, skills, and target role.</p></div></div>
      <div class="flex gap-3 mb-6">
        <div class="topbar-search" style="flex:1"><span class="topbar-search-icon">🔍</span><input class="form-input" placeholder="Search by role, company, or skill..." style="padding-left:var(--space-8)" id="job-search"></div>
        <select class="form-select" style="width:180px" id="job-type-filter">
          <option value="">All Types</option><option value="Full-time">Full-time</option><option value="Internship">Internship</option>
        </select>
      </div>
      <div class="stack" id="jobs-list">
        ${_allJobs.length ? _allJobs.map(j => _jobCard(j)).join('') : '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">No jobs available</div><p class="empty-state-text">Check back later for new opportunities.</p></div>'}
      </div>
    `;
    document.getElementById('job-search')?.addEventListener('input', _filter);
    document.getElementById('job-type-filter')?.addEventListener('change', _filter);
  }

  function _jobCard(j) {
    const skills = j.skills_required || j.skills || [];
    const deadline = j.deadline ? new Date(j.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open';
    const company = j.company_name || j.company || '';
    return `
      <article class="card card-interactive animate-fade-in-up">
        <div class="job-card-top">
          <div>
            <div class="job-card-title">${j.title}</div>
            <div class="job-card-company">${company}</div>
          </div>
          ${j.match ? `<span class="match-badge">${j.match}% match</span>` : `<span class="badge badge-default">${j.type || 'Full-time'}</span>`}
        </div>
        <div class="job-card-meta"><span>📍 ${j.location || 'Remote'}</span><span>💼 ${j.type || 'Full-time'}</span><span>⏰ ${deadline}</span>${j.min_cgpa ? `<span>📊 Min CGPA: ${j.min_cgpa}</span>` : ''}</div>
        <div class="flex justify-between items-center mt-4">
          ${SkillBadge.render(skills)}
          <div class="flex gap-2">
            <button class="btn btn-sm" onclick="StudentResume.openAnalyzer('${j.title}', '${skills.join(', ')}')">Analyze Fit</button>
            <button class="btn btn-sm btn-primary" onclick="Toast.success('Application submitted for ${j.title}!')">Apply →</button>
          </div>
        </div>
      </article>
    `;
  }

  function _filter() {
    const search = (document.getElementById('job-search')?.value || '').toLowerCase();
    const type = document.getElementById('job-type-filter')?.value || '';
    const filtered = _allJobs.filter(j => {
      const skills = j.skills_required || j.skills || [];
      const company = j.company_name || j.company || '';
      const matchesSearch = !search || j.title.toLowerCase().includes(search) || company.toLowerCase().includes(search) || skills.some(s => s.toLowerCase().includes(search));
      const matchesType = !type || j.type === type;
      return matchesSearch && matchesType;
    });
    document.getElementById('jobs-list').innerHTML = filtered.length ? filtered.map(j => _jobCard(j)).join('') : '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No jobs found</div><p class="empty-state-text">Try adjusting your search or filters.</p></div>';
  }

  return { render };
})();
