/* ============================================================
   CAMPUSLINK — Student Readiness Page (Real Data)
   ============================================================ */
const StudentReadiness = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading readiness...</div></div></div>`;

    // Fetch real readiness data
    let d = await API.get('/students/me/readiness');

    // If server returned empty factors or offline, compute explainable readiness from Store.getProfile()
    if (!d || !d.factors || d.factors.length === 0) {
      const p = Store.getProfile();
      const skillCount = Array.isArray(p.skills) ? p.skills.length : 0;
      const certCount = Array.isArray(p.certifications) ? p.certifications.length : 0;
      const cgpa = parseFloat(p.cgpa) || 0;
      const projectCount = Array.isArray(p.projects) ? p.projects.length : (p.projects_count || 0);

      const weights = { technical: 0.25, projects: 0.15, academics: 0.15, aptitude: 0.15, certifications: 0.10, communication: 0.10, interview: 0.10 };
      const factors = [
        { label: 'Technical Skills', value: Math.min(100, skillCount * 12), weight: weights.technical },
        { label: 'Projects & Portfolio', value: Math.min(100, projectCount * 25), weight: weights.projects },
        { label: 'Academics (CGPA)', value: Math.min(100, Math.round((cgpa / 10) * 100)), weight: weights.academics },
        { label: 'Aptitude & Reasoning', value: p.aptitude_score || (skillCount > 0 ? 65 : 0), weight: weights.aptitude },
        { label: 'Certifications', value: Math.min(100, certCount * 35), weight: weights.certifications },
        { label: 'Communication', value: p.communication_score || (skillCount > 0 ? 70 : 0), weight: weights.communication },
        { label: 'Interview Performance', value: p.interview_score || (skillCount > 0 ? 60 : 0), weight: weights.interview },
      ];

      const score = Math.round(factors.reduce((sum, f) => sum + (f.value * f.weight), 0));
      let statusBand;
      if (score >= 80) statusBand = { label: 'Highly Employable', color: 'success', emoji: '🟢' };
      else if (score >= 60) statusBand = { label: 'Ready', color: 'accent', emoji: '🔵' };
      else if (score >= 40) statusBand = { label: 'Developing', color: 'warning', emoji: '🟡' };
      else if (score > 0) statusBand = { label: 'Needs Improvement', color: 'danger', emoji: '🔴' };
      else statusBand = { label: 'Profile Pending', color: 'muted', emoji: '⏳' };

      const sortedFactors = [...factors].sort((a, b) => a.value - b.value);
      const recommendations = score === 0 ? [] : sortedFactors.slice(0, 3).map(f => ({
        area: f.label,
        score: f.value,
        action: f.value < 40 ? `Urgently improve ${f.label} — currently at ${f.value}%` : `Continue building ${f.label} (currently ${f.value}%)`,
        priority: f.value < 40 ? 'high' : f.value < 60 ? 'medium' : 'low',
      }));

      d = { score, factors, weights, targetRole: p.targetRole || 'Software Engineer', statusBand, recommendations };
    }

    const score = d?.score || 0;
    const factors = d?.factors || [];
    const weights = d?.weights || {};
    const targetRole = d?.targetRole || 'Software Engineer';
    const statusBand = d?.statusBand || { label: 'Unknown', emoji: '⬜' };
    const recommendations = d?.recommendations || [];

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Placement Readiness</div><h1 class="page-title">Your Readiness Score</h1><p class="page-subtitle">A composite, explainable score built from your skills, projects, academics, aptitude, and activity.</p></div></div>
      ${score === 0 ? `
        <div class="notice mb-6 animate-fade-in-up" style="background:rgba(59, 130, 246, 0.08); border:1px solid rgba(59, 130, 246, 0.25); border-radius:var(--radius-lg); padding:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;">
          <div>
            <h3 style="font-size:16px; margin-bottom:4px; color:var(--text-primary);">🚀 Complete Your Profile to Unlock Your Readiness Score</h3>
            <p class="text-sm text-muted" style="margin:0;">Paste your resume text or edit your profile. CampusLink will automatically extract your skills, projects, and academics to calculate your 7-factor placement score.</p>
          </div>
          <div class="flex gap-2">
            <button class="btn btn-primary" onclick="StudentProfile.openResumeModal()">📄 Paste Resume</button>
            <button class="btn btn-secondary" onclick="Router.navigate('student/profile')">✏️ Edit Profile</button>
          </div>
        </div>
      ` : ''}
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
                <strong>${r.priority === 'high' ? '🔴' : '🟡'} ${r.area}:</strong> ${AIText.formatInline(r.action)}
              </div>
            `).join('') : '<p class="text-sm text-muted">Complete your profile to see personalized recommendations.</p>'}
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
