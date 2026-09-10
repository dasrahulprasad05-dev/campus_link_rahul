/* CAMPUSLINK — Recruiter Dashboard */
const RecruiterDashboard = (() => {
  async function render() {
    const d = API.DEMO.recruiter;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Recruiter Workspace</div><h1 class="page-title">Candidate Matching</h1><p class="page-subtitle">Transparent, explainable ranking for your active roles.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Router.navigate('recruiter/jobs')">+ Post a Job</button></div></div>
      ${KPICard.render(d.kpis)}
      <article class="card animate-fade-in-up">
        <div class="card-header"><h2 class="card-title">Top Matches — Graduate Data Analyst</h2><span class="badge badge-accent">Explainable Ranking</span></div>
        ${DataTable.render(
          [
            { key: 'name', label: 'Candidate', type: 'avatar', subKey: 'branch' },
            { key: 'match', label: 'Match', render: (v) => `<span class="match-badge">${v}%</span>` },
            { key: 'evidence', label: 'Top Evidence' },
            { key: 'cgpa', label: 'CGPA' },
            { key: '_skills', label: 'Skills', render: (_, row) => SkillBadge.render(row.skills) },
            { key: '_actions', label: '', render: (_, row) => `<button class="btn btn-sm" onclick="Toast.info('Reviewing ${row.name}')">Review</button> <button class="btn btn-sm btn-primary" onclick="Toast.success('${row.name} shortlisted!')">Shortlist</button>` },
          ],
          d.candidates
        )}
      </article>
      <div class="insight-card accent mt-6"><strong>🤖 How matching works:</strong> Candidates are ranked by: skill overlap (40%), project evidence (25%), eligibility pass (20%), and resume relevance (15%). All factors are visible and reviewable — no black-box decisions.</div>
    `;
  }
  return { render };
})();
