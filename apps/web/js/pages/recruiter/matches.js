/* ============================================================
   CAMPUSLINK — Recruiter AI Matching Page (Real Data)
   Job-specific candidate matching with explainable scoring.
   ============================================================ */
const RecruiterMatches = (() => {
  let _students = [];
  let _jobs = [];
  let _selectedJobId = '';

  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading candidates...</div></div></div>`;

    const [stuResult, jobResult] = await Promise.all([
      API.get('/students'),
      API.get('/jobs'),
    ]);
    _students = Array.isArray(stuResult?.data) ? stuResult.data : (Array.isArray(stuResult) ? stuResult : []);
    _jobs = Array.isArray(jobResult?.data) ? jobResult.data : (Array.isArray(jobResult) ? jobResult : []);

    _selectedJobId = _jobs.length > 0 ? _jobs[0].id : '';
    _renderPage();
  }

  function _renderPage() {
    const main = document.getElementById('main');
    const selectedJob = _jobs.find(j => j.id === _selectedJobId);
    const ranked = selectedJob ? _rankCandidates(_students, selectedJob) : [];

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">AI Candidate Matching</div>
          <h1 class="page-title">Smart Candidate Ranking</h1>
          <p class="page-subtitle">Select a job to see candidates ranked by skill match, CGPA, eligibility, and readiness — every score is explainable.</p>
        </div>
      </div>
      <div class="flex gap-3 mb-6 items-center flex-wrap">
        <label class="font-bold text-sm" style="white-space:nowrap">Match against:</label>
        <select class="form-select" style="flex:1;max-width:400px" id="match-job-select">
          ${_jobs.map(j => `<option value="${j.id}" ${j.id === _selectedJobId ? 'selected' : ''}>${j.title} — ${j.company_name || j.company || ''}</option>`).join('')}
        </select>
        ${selectedJob ? `<span class="text-sm text-muted">Required: ${(selectedJob.skills_required || selectedJob.skills || []).join(', ')}</span>` : ''}
      </div>
      <div class="stack">
        ${ranked.length > 0 ? ranked.map((c, i) => _candidateCard(c, i)).join('') : '<div class="empty-state"><div class="empty-state-icon">🔍</div><div class="empty-state-title">No candidates found</div></div>'}
      </div>
    `;
    document.getElementById('match-job-select')?.addEventListener('change', (e) => {
      _selectedJobId = e.target.value;
      _renderPage();
    });
  }

  function _rankCandidates(students, job) {
    const jobSkills = (job.skills_required || job.skills || []).map(s => s.toLowerCase());
    const minCgpa = parseFloat(job.min_cgpa) || 0;
    const eligBranches = (job.eligible_branches || []).map(b => b.toUpperCase());
    const maxBacklogs = job.max_backlogs !== undefined ? parseInt(job.max_backlogs) : 99;

    return students.map(s => {
      const studentSkills = (s.skills || []).map(sk => sk.toLowerCase());
      const branch = _normalizeBranch(s.branch || '');
      const cgpa = parseFloat(s.cgpa) || 0;
      const backlogs = parseInt(s.backlogs) || 0;

      // Skill match score (0-100)
      const matchedSkills = jobSkills.filter(js => studentSkills.some(ss => ss.includes(js) || js.includes(ss)));
      const skillScore = jobSkills.length > 0 ? Math.round(matchedSkills.length / jobSkills.length * 100) : 50;

      // CGPA score (0-100)
      const cgpaScore = cgpa > 0 ? Math.min(100, Math.round((cgpa / 10) * 100)) : 0;

      // Readiness score (already computed)
      const readinessScore = s.readiness || 0;

      // Eligibility check
      const eligible = (
        (minCgpa === 0 || cgpa >= minCgpa) &&
        (eligBranches.length === 0 || eligBranches.includes(branch)) &&
        (backlogs <= maxBacklogs)
      );

      // Composite score: Skill Match 40% + Readiness 30% + CGPA 20% + Eligible Bonus 10%
      const compositeScore = Math.round(
        skillScore * 0.40 +
        readinessScore * 0.30 +
        cgpaScore * 0.20 +
        (eligible ? 10 : 0)
      );

      // Explanation breakdown
      const explanation = [
        { factor: 'Skill Match', score: skillScore, weight: '40%', detail: `${matchedSkills.length}/${jobSkills.length} required skills`, color: skillScore >= 70 ? 'var(--success)' : skillScore >= 40 ? 'var(--warning)' : 'var(--danger)' },
        { factor: 'Readiness', score: readinessScore, weight: '30%', detail: `Readiness score from profile`, color: readinessScore >= 70 ? 'var(--success)' : readinessScore >= 40 ? 'var(--warning)' : 'var(--danger)' },
        { factor: 'Academics', score: cgpaScore, weight: '20%', detail: `CGPA ${cgpa}/10`, color: cgpaScore >= 70 ? 'var(--success)' : cgpaScore >= 40 ? 'var(--warning)' : 'var(--danger)' },
        { factor: 'Eligibility', score: eligible ? 100 : 0, weight: '10%', detail: eligible ? 'Meets all criteria' : 'Does not meet criteria', color: eligible ? 'var(--success)' : 'var(--danger)' },
      ];

      return {
        ...s,
        compositeScore,
        skillScore,
        matchedSkills: matchedSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        missingSkills: jobSkills.filter(js => !matchedSkills.includes(js)).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        eligible,
        explanation,
        initials: (s.name || 'S').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      };
    }).sort((a, b) => b.compositeScore - a.compositeScore);
  }

  function _candidateCard(c, index) {
    const tierColor = c.compositeScore >= 75 ? 'var(--success)' : c.compositeScore >= 50 ? 'var(--warning)' : 'var(--danger)';
    const tierLabel = c.compositeScore >= 75 ? 'Strong Match' : c.compositeScore >= 50 ? 'Moderate Match' : 'Weak Match';
    const branchShort = (c.branch || '').replace('Computer Science & Engineering', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Telecom', 'ETC').replace('Mechanical Engineering', 'ME');

    return `
      <article class="card card-interactive animate-fade-in-up" style="animation-delay:${index * 60}ms;${!c.eligible ? 'border-left:3px solid var(--danger);opacity:0.8' : 'border-left:3px solid ' + tierColor}">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center gap-4">
            <div class="avatar avatar-lg" style="background:${tierColor}20;color:${tierColor};font-weight:800">${c.initials}</div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold" style="font-size:16px">${c.name}</span>
                <span class="badge" style="background:${tierColor}20;color:${tierColor};font-size:10px">${tierLabel}</span>
                ${!c.eligible ? '<span class="badge badge-default" style="background:var(--danger-bg);color:var(--danger);font-size:10px">🚫 Ineligible</span>' : ''}
              </div>
              <div class="text-sm text-muted">${branchShort} · ${c.year || 2026} · CGPA ${c.cgpa || '—'} · ${c.target_role || 'Student'}</div>
              <div class="mt-2">${SkillBadge.render(c.skills || [])}</div>
            </div>
          </div>
          <div class="text-center" style="min-width:90px">
            ${ScoreRing.render(c.compositeScore, { size: 80, label: 'match' })}
          </div>
        </div>
        <div class="divider"></div>
        <div class="grid" style="grid-template-columns:repeat(4,1fr);gap:var(--space-3);margin-bottom:var(--space-3)">
          ${c.explanation.map(e => `
            <div style="text-align:center">
              <div class="text-xs text-muted">${e.factor} (${e.weight})</div>
              <div class="font-bold" style="color:${e.color};font-size:18px">${e.score}%</div>
              <div class="text-xs text-muted">${e.detail}</div>
            </div>
          `).join('')}
        </div>
        <div class="flex gap-3 mb-2 flex-wrap">
          ${c.matchedSkills.length > 0 ? `<span class="text-xs" style="color:var(--success)">✅ Matched: ${c.matchedSkills.join(', ')}</span>` : ''}
          ${c.missingSkills.length > 0 ? `<span class="text-xs" style="color:var(--warning)">⚠️ Missing: ${c.missingSkills.join(', ')}</span>` : ''}
        </div>
        <div class="flex justify-end gap-2">
          <button class="btn btn-sm" onclick="Toast.info('Full profile for ${c.name}')">View Profile</button>
          <button class="btn btn-sm btn-primary" onclick="Toast.success('${c.name} shortlisted!')">Shortlist</button>
        </div>
      </article>
    `;
  }

  function _normalizeBranch(branch) {
    const b = branch.toUpperCase();
    if (b.includes('COMPUTER') || b === 'CSE') return 'CSE';
    if (b.includes('INFORMATION') || b === 'IT') return 'IT';
    if (b.includes('ELECTRONICS') || b.includes('TELECOM') || b === 'ETC') return 'ETC';
    if (b.includes('MECHANICAL') || b === 'ME') return 'ME';
    return b;
  }

  return { render };
})();
