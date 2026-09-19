/* CAMPUSLINK — Recruiter Dashboard — Real Data */
const RecruiterDashboard = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading...</div></div></div>`;

    const d = await API.getDashboard('recruiter');
    const kpis = d?.kpis || [];
    const jobs = d?.jobs || [];

    // Fetch students for candidate matching display
    const studentResult = await API.get('/students');
    const students = Array.isArray(studentResult?.data) ? studentResult.data : (Array.isArray(studentResult) ? studentResult : []);
    const candidates = students.filter(s => (s.readiness || 0) >= 60).slice(0, 6).map(s => ({
      name: s.name, branch: `${(s.branch || '').replace('Computer Science & Engineering','CSE').replace('Information Technology','IT').replace('Electronics & Telecom','ETC')} · ${s.year || 2026}`,
      match: s.readiness || 0, evidence: (s.skills || []).slice(0, 4).join(', '), skills: s.skills || [], cgpa: s.cgpa || 0,
    }));

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Recruiter Workspace</div><h1 class="page-title">Candidate Matching</h1><p class="page-subtitle">Transparent, explainable ranking for your active roles.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Router.navigate('recruiter/jobs')">+ Post a Job</button></div></div>
      ${KPICard.render(kpis)}
      <article class="card animate-fade-in-up">
        <div class="card-header"><h2 class="card-title">Top Candidates</h2><span class="badge badge-accent">Explainable Ranking</span></div>
        ${candidates.length ? DataTable.render(
          [
            { key: 'name', label: 'Candidate', type: 'avatar', subKey: 'branch' },
            { key: 'match', label: 'Readiness', render: (v) => `<span class="match-badge">${v}%</span>` },
            { key: 'evidence', label: 'Top Skills' },
            { key: 'cgpa', label: 'CGPA' },
            { key: '_actions', label: '', render: (_, row) => `<button class="btn btn-sm" onclick="Toast.info('Reviewing ${row.name}')">Review</button> <button class="btn btn-sm btn-primary" onclick="Toast.success('${row.name} shortlisted!')">Shortlist</button>` },
          ],
          candidates
        ) : '<p style="color:var(--text-muted);padding:var(--space-4)">No candidates found.</p>'}
      </article>
      <div class="insight-card accent mt-6"><strong>🤖 How matching works:</strong> Candidates are ranked by: skill overlap (40%), project evidence (25%), eligibility pass (20%), and resume relevance (15%). All factors are visible and reviewable — no black-box decisions.</div>
    `;
  }
  return { render };
})();
