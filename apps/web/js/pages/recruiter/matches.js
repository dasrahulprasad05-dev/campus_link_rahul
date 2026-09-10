/* CAMPUSLINK — Recruiter AI Matches Page */
const RecruiterMatches = (() => {
  async function render() {
    const cands = API.DEMO.recruiter.candidates;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">AI Candidate Matching</div><h1 class="page-title">Matched Candidates</h1><p class="page-subtitle">Transparent, explainable candidate rankings. Every score shows why.</p></div></div>
      <div class="stack">
        ${cands.map((c, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <div class="avatar avatar-lg avatar-blue">${c.name.split(' ').map(w=>w[0]).join('')}</div>
                <div>
                  <div class="font-bold" style="font-size:16px">${c.name}</div>
                  <div class="text-sm text-muted">${c.branch} · CGPA ${c.cgpa}</div>
                  <div class="mt-2">${SkillBadge.render(c.skills)}</div>
                </div>
              </div>
              <div class="text-center">
                ${ScoreRing.render(c.match, { size: 80, label: 'match' })}
              </div>
            </div>
            <div class="divider"></div>
            <div class="flex justify-between items-center">
              <div class="text-sm text-muted"><strong>Evidence:</strong> ${c.evidence}</div>
              <div class="flex gap-2">
                <button class="btn btn-sm" onclick="Toast.info('Viewing ${c.name} full profile')">View Profile</button>
                <button class="btn btn-sm btn-primary" onclick="Toast.success('${c.name} shortlisted!')">Shortlist</button>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }
  return { render };
})();
