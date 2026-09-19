/* ============================================================
   CAMPUSLINK — Resume ↔ JD Analyzer Page
   ============================================================ */
const StudentResume = (() => {
  async function render() {
    const p = Store.getProfile();
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Resume ↔ Job Description Analyzer</div><h1 class="page-title">Analyze Your Fit</h1><p class="page-subtitle">Paste a job description to see how your profile and resume match. Get actionable improvement tips.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Job Description</h2></div>
            ${Forms.textarea({ id: 'resume-jd', placeholder: 'Paste a job description here...\n\nExample: We are looking for a Data Analyst with experience in SQL, Python, Power BI, statistical analysis, communication skills, and data visualization.', rows: 8 })}
            <button class="btn btn-primary" id="resume-analyze-btn" onclick="StudentResume.analyze()">🔍 Analyze Match</button>
          </article>
          <div id="resume-results"></div>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">📄 Your Profile Snapshot</h3>
            <div class="mb-4"><div class="text-xs text-muted">Skills</div>${SkillBadge.render(p.skills || [])}</div>
            <div class="mb-4"><div class="text-xs text-muted">Target Role</div><div class="font-bold text-accent">${p.targetRole || 'Software Engineer'}</div></div>
            <div><div class="text-xs text-muted">CGPA</div><div class="font-bold">${p.cgpa || '8.0'}</div></div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">Tips</h2></div>
            <div class="insight-card accent mb-4"><strong>Pro tip:</strong> Copy the entire job description — the more context, the better the analysis.</div>
            <p class="text-xs text-muted">The analyzer compares keyword overlap (40%), project relevance (25%), certification alignment (15%), and profile completeness (20%).</p>
          </article>
        </aside>
      </div>
    `;
  }

  async function analyze() {
    const jd = document.getElementById('resume-jd')?.value;
    if (!jd || jd.trim().length < 10) { Toast.warning('Please paste a job description (at least 10 characters)'); return; }
    const btn = document.getElementById('resume-analyze-btn');
    if (btn) { btn.textContent = 'Analyzing...'; btn.disabled = true; }
    const p = Store.getProfile();
    const result = await API.post('/analyze/resume-match', { jobDescription: jd, studentSkills: p.skills || [] });
    if (btn) { btn.textContent = '🔍 Analyze Match'; btn.disabled = false; }

    document.getElementById('resume-results').innerHTML = `
      <article class="card animate-fade-in-up">
        <div class="ai-result-header">
          <div class="ai-result-icon">🤖</div>
          <div><div class="ai-result-title">Match Analysis Complete</div><div class="ai-result-subtitle">AI-powered resume ↔ JD comparison</div></div>
          <span class="match-badge" style="margin-left:auto;font-size:16px;padding:8px 16px">${result.score}% match</span>
        </div>
        <div class="divider"></div>
        <h4 class="mb-2">🎯 Skill Comparison</h4>
        ${SkillBadge.comparison(result.matched, result.missing)}
        ${result.strengths?.length ? `<div class="divider"></div><h4 class="mb-2 text-success">✓ Strengths</h4><ul style="padding-left:var(--space-5);color:var(--text-secondary)">${result.strengths.map(s => `<li class="text-sm mb-2">${AIText.formatInline(s)}</li>`).join('')}</ul>` : ''}
        ${result.improvements?.length ? `<div class="divider"></div><h4 class="mb-2 text-warning">⚡ Improvements</h4><ul style="padding-left:var(--space-5);color:var(--text-secondary)">${result.improvements.map(s => `<li class="text-sm mb-2">${AIText.formatInline(s)}</li>`).join('')}</ul>` : ''}
        <div class="divider"></div>
        <div class="insight-card accent"><strong>📝 Scoring Method:</strong> ${AIText.formatInline(result.explanation)}</div>
      </article>
    `;
  }

  function openAnalyzer(jobTitle, skills) {
    Router.navigate('student/resume');
    setTimeout(() => {
      const ta = document.getElementById('resume-jd');
      if (ta) { ta.value = `Role: ${jobTitle}\nRequired Skills: ${skills}\n\nWe are looking for a candidate with strong experience in ${skills}. The ideal candidate should demonstrate practical project work, relevant certifications, and excellent communication skills.`; }
    }, 200);
  }

  return { render, analyze, openAnalyzer };
})();
