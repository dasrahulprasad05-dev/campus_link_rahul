/* ============================================================
   CAMPUSLINK — Jobs Discovery Page
   Eligibility-aware job discovery with real apply action.
   ============================================================ */
const StudentJobs = (() => {
  let _allJobs = [];
  let _showEligibleOnly = false;

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading jobs...</div></div></div>`;

    // Fetch jobs + current applications in parallel
    const [jobResult, appResult] = await Promise.all([
      API.get('/jobs'),
      API.get('/students/me/applications'),
    ]);
    _allJobs = Array.isArray(jobResult?.data) ? jobResult.data : (Array.isArray(jobResult) ? jobResult : []);
    const myApps = Array.isArray(appResult?.data) ? appResult.data : (Array.isArray(appResult) ? appResult : []);
    const appliedJobIds = new Set(myApps.map(a => a.job_id));

    // Get student profile for eligibility checking
    const profile = Store.getProfile();
    const studentCgpa = parseFloat(profile.cgpa) || 0;
    const studentBranch = _normalizeBranch(profile.branch || '');
    const studentBacklogs = parseInt(profile.backlogs) || 0;

    // Enrich jobs with eligibility info
    _allJobs = _allJobs.map(j => {
      const reasons = [];
      const minCgpa = parseFloat(j.min_cgpa) || 0;
      const maxBacklogs = j.max_backlogs !== undefined ? parseInt(j.max_backlogs) : 99;
      const eligibleBranches = (j.eligible_branches || []).map(b => b.toUpperCase());

      if (minCgpa > 0 && studentCgpa > 0 && studentCgpa < minCgpa) {
        reasons.push(`CGPA ${studentCgpa} < required ${minCgpa}`);
      }
      if (eligibleBranches.length > 0 && studentBranch && !eligibleBranches.includes(studentBranch)) {
        reasons.push(`Branch ${studentBranch} not in [${eligibleBranches.join(', ')}]`);
      }
      if (maxBacklogs < 99 && studentBacklogs > maxBacklogs) {
        reasons.push(`${studentBacklogs} backlogs > max ${maxBacklogs}`);
      }

      const hasProfile = studentCgpa > 0 || (profile.skills && profile.skills.length > 0);
      return {
        ...j,
        eligible: reasons.length === 0,
        eligibilityReasons: reasons,
        applied: appliedJobIds.has(j.id),
        hasProfile,
      };
    });

    _renderPage();
  }

  function _renderPage() {
    const main = document.getElementById('main');
    const profile = Store.getProfile();
    const hasProfile = parseFloat(profile.cgpa) > 0 || (profile.skills && profile.skills.length > 0);
    const eligibleCount = _allJobs.filter(j => j.eligible).length;
    const appliedCount = _allJobs.filter(j => j.applied).length;

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Job Discovery</div><h1 class="page-title">Explore Opportunities</h1><p class="page-subtitle">AI-matched jobs ranked by fit — eligibility is auto-checked against your profile.</p></div></div>
      ${!hasProfile ? `
        <div class="card mb-6" style="border-left:4px solid var(--warning);background:var(--warning-bg, hsla(38,92%,50%,0.08))">
          <div class="flex items-center gap-3">
            <span style="font-size:24px">⚠️</span>
            <div>
              <div class="font-bold">Complete your profile for eligibility checks</div>
              <div class="text-sm text-muted">Paste your resume or edit your profile to enable accurate eligibility filtering.</div>
            </div>
            <button class="btn btn-sm btn-primary ml-auto" onclick="Router.navigate('student/profile')">Go to Profile</button>
          </div>
        </div>
      ` : ''}
      <div class="flex gap-3 mb-4 items-center flex-wrap">
        <div class="topbar-search" style="flex:1;min-width:200px"><span class="topbar-search-icon">🔍</span><input class="form-input" placeholder="Search by role, company, or skill..." style="padding-left:var(--space-8)" id="job-search"></div>
        <select class="form-select" style="width:160px" id="job-type-filter">
          <option value="">All Types</option><option value="Full-time">Full-time</option><option value="Internship">Internship</option>
        </select>
        <button class="btn btn-sm ${_showEligibleOnly ? 'btn-primary' : ''}" id="eligibility-toggle" style="white-space:nowrap">
          ${_showEligibleOnly ? '✅ Eligible Only' : '📋 Show All'}
        </button>
      </div>
      <div class="flex gap-3 mb-6 flex-wrap">
        <div class="badge badge-default">${_allJobs.length} Total</div>
        <div class="badge badge-success">✅ ${eligibleCount} Eligible</div>
        <div class="badge badge-warning">⚠️ ${_allJobs.length - eligibleCount} Restricted</div>
        ${appliedCount > 0 ? `<div class="badge badge-default">📝 ${appliedCount} Applied</div>` : ''}
      </div>
      <div class="stack" id="jobs-list">
        ${_renderJobList(_getFiltered())}
      </div>
    `;
    document.getElementById('job-search')?.addEventListener('input', _filter);
    document.getElementById('job-type-filter')?.addEventListener('change', _filter);
    document.getElementById('eligibility-toggle')?.addEventListener('click', () => {
      _showEligibleOnly = !_showEligibleOnly;
      _renderPage();
    });
  }

  function _getFiltered() {
    const search = (document.getElementById('job-search')?.value || '').toLowerCase();
    const type = document.getElementById('job-type-filter')?.value || '';
    return _allJobs.filter(j => {
      const skills = j.skills_required || j.skills || [];
      const company = j.company_name || j.company || '';
      const matchesSearch = !search || j.title.toLowerCase().includes(search) || company.toLowerCase().includes(search) || skills.some(s => s.toLowerCase().includes(search));
      const matchesType = !type || j.type === type;
      const matchesEligibility = !_showEligibleOnly || j.eligible;
      return matchesSearch && matchesType && matchesEligibility;
    });
  }

  function _filter() {
    document.getElementById('jobs-list').innerHTML = _renderJobList(_getFiltered());
  }

  function _renderJobList(jobs) {
    if (!jobs.length) {
      return `<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">${_showEligibleOnly ? 'No eligible jobs found' : 'No jobs found'}</div><p class="empty-state-text">${_showEligibleOnly ? 'Try turning off the eligibility filter, or update your profile.' : 'Try adjusting your search or filters.'}</p></div>`;
    }
    return jobs.map((j, i) => _jobCard(j, i)).join('');
  }

  function _jobCard(j, index) {
    const skills = j.skills_required || j.skills || [];
    const deadline = j.deadline ? new Date(j.deadline).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Open';
    const company = j.company_name || j.company || '';
    const isExpired = j.deadline && new Date(j.deadline) < new Date();

    let eligibilityBadge = '';
    let applyBtn = '';

    if (j.applied) {
      eligibilityBadge = `<span class="badge badge-default" style="background:var(--accent-bg);color:var(--accent)">📝 Applied</span>`;
      applyBtn = `<button class="btn btn-sm" disabled style="opacity:0.5">Already Applied</button>`;
    } else if (isExpired) {
      eligibilityBadge = `<span class="badge badge-default" style="background:var(--danger-bg);color:var(--danger)">⏰ Expired</span>`;
      applyBtn = `<button class="btn btn-sm" disabled style="opacity:0.5">Deadline Passed</button>`;
    } else if (!j.eligible) {
      eligibilityBadge = `<span class="badge badge-default" style="background:var(--danger-bg);color:var(--danger)">🚫 Not Eligible</span>`;
      applyBtn = `<button class="btn btn-sm" disabled style="opacity:0.5" title="${j.eligibilityReasons.join('; ')}">Not Eligible</button>`;
    } else {
      eligibilityBadge = `<span class="badge badge-success">✅ Eligible</span>`;
      applyBtn = `<button class="btn btn-sm btn-primary" onclick="StudentJobs.applyToJob('${j.id}', '${j.title.replace(/'/g, "\\'")}')">Apply →</button>`;
    }

    return `
      <article class="card card-interactive animate-fade-in-up" style="animation-delay:${index * 60}ms;${!j.eligible && !j.applied ? 'opacity:0.7' : ''}">
        <div class="job-card-top">
          <div>
            <div class="job-card-title">${j.title}</div>
            <div class="job-card-company">${company}</div>
          </div>
          <div class="flex gap-2">${eligibilityBadge}<span class="badge badge-default">${j.type || 'Full-time'}</span></div>
        </div>
        <div class="job-card-meta"><span>📍 ${j.location || 'Remote'}</span><span>💼 ${j.type || 'Full-time'}</span><span>⏰ ${deadline}</span>${j.min_cgpa ? `<span>📊 Min CGPA: ${j.min_cgpa}</span>` : ''}${(j.eligible_branches || []).length > 0 ? `<span>🎓 ${j.eligible_branches.join(', ')}</span>` : ''}${j.max_backlogs !== undefined && j.max_backlogs < 99 ? `<span>📝 Max Backlogs: ${j.max_backlogs}</span>` : ''}</div>
        ${!j.eligible && j.eligibilityReasons.length > 0 ? `<div class="text-xs mt-2" style="color:var(--danger)">⚠️ ${j.eligibilityReasons.join(' · ')}</div>` : ''}
        <div class="flex justify-between items-center mt-4">
          ${SkillBadge.render(skills)}
          <div class="flex gap-2">
            <button class="btn btn-sm" onclick="StudentResume.openAnalyzer('${j.title}', '${skills.join(', ')}')">Analyze Fit</button>
            ${applyBtn}
          </div>
        </div>
      </article>
    `;
  }

  async function applyToJob(jobId, jobTitle) {
    try {
      const result = await API.post('/applications', { job_id: jobId });
      if (result?.success !== false) {
        Toast.success(`Application submitted for ${jobTitle}!`);
        // Mark as applied locally
        const job = _allJobs.find(j => j.id === jobId);
        if (job) job.applied = true;
        _filter();
      } else {
        Toast.error(result?.error?.message || 'Failed to submit application');
      }
    } catch (err) {
      Toast.error('Failed to submit application: ' + (err.message || 'Unknown error'));
    }
  }

  function _normalizeBranch(branch) {
    const b = branch.toUpperCase();
    if (b.includes('COMPUTER') || b === 'CSE') return 'CSE';
    if (b.includes('INFORMATION') || b === 'IT') return 'IT';
    if (b.includes('ELECTRONICS') || b.includes('TELECOM') || b === 'ETC') return 'ETC';
    if (b.includes('MECHANICAL') || b === 'ME') return 'ME';
    if (b.includes('ELECTRICAL') || b === 'EE') return 'EE';
    if (b.includes('CIVIL') || b === 'CE') return 'CE';
    return b;
  }

  return { render, applyToJob };
})();
