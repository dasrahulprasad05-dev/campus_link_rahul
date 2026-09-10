/* ============================================================
   CAMPUSLINK — Student Readiness Page
   ============================================================ */
const StudentReadiness = (() => {
  async function render() {
    const d = API.DEMO.student;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Placement Readiness</div><h1 class="page-title">Your Readiness Score</h1><p class="page-subtitle">A composite, explainable score built from your skills, projects, academics, aptitude, and activity.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Overall Score</h2><span class="badge badge-accent">Updated today</span></div>
            <div class="readiness-grid">
              ${ScoreRing.render(d.readiness.score, { size: 180 })}
              <div>
                ${d.readiness.factors.map(f => `<div class="progress-group"><div class="progress-label"><span class="progress-label-name">${f.label}</span><span class="progress-label-value">${f.value}%</span></div><div class="progress-bar"><div class="progress-bar-fill ${f.value >= 80 ? 'success' : f.value >= 65 ? '' : 'warning'}" style="width:${f.value}%"></div></div></div>`).join('')}
              </div>
            </div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header"><h2 class="card-title">Score Trend (6 months)</h2><span class="kpi-delta positive">↑ +24 pts overall</span></div>
            ${Chart.trendChart(d.trend, d.trendLabels, { height: 200 })}
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:150ms">
            <div class="card-header"><h2 class="card-title">How is this score calculated?</h2></div>
            <p class="text-sm text-muted mb-4">Your readiness score combines five weighted dimensions. Each dimension is scored independently and contributes to the overall composite.</p>
            <div class="table-container">
              <table class="data-table">
                <thead><tr><th>Dimension</th><th>Weight</th><th>Score</th><th>How it's measured</th></tr></thead>
                <tbody>
                  <tr><td class="font-bold">Technical Skills</td><td>30%</td><td>82</td><td>Verified skills count, assessment scores, skill diversity</td></tr>
                  <tr><td class="font-bold">Projects & Portfolio</td><td>25%</td><td>76</td><td>Number of projects, tech diversity, measurable outcomes</td></tr>
                  <tr><td class="font-bold">Academics</td><td>20%</td><td>74</td><td>CGPA, relevant coursework, academic consistency</td></tr>
                  <tr><td class="font-bold">Aptitude & Reasoning</td><td>15%</td><td>69</td><td>Mock test scores, practice frequency, improvement trend</td></tr>
                  <tr><td class="font-bold">Profile Completeness</td><td>10%</td><td>91</td><td>All sections filled, resume uploaded, certifications added</td></tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">🎯 Action Plan</h3>
            <div class="insight-card warning mb-4"><strong>Top priority:</strong> Your Aptitude score (69%) is below target. Complete 3 mock tests this week.</div>
            <div class="insight-card accent"><strong>Quick win:</strong> Add measurable outcomes to 2 project descriptions to boost Portfolio score.</div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:180ms">
            <div class="card-header"><h2 class="card-title">Compared to Peers</h2></div>
            <div class="progress-group"><div class="progress-label"><span class="progress-label-name">You</span><span class="progress-label-value">78</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:78%"></div></div></div>
            <div class="progress-group"><div class="progress-label"><span class="progress-label-name">Branch Average</span><span class="progress-label-value">64</span></div><div class="progress-bar"><div class="progress-bar-fill success" style="width:64%"></div></div></div>
            <div class="progress-group"><div class="progress-label"><span class="progress-label-name">College Average</span><span class="progress-label-value">58</span></div><div class="progress-bar"><div class="progress-bar-fill warning" style="width:58%"></div></div></div>
            <p class="text-xs text-muted mt-4">Peer data is anonymized. You are in the <strong class="text-accent">top 18%</strong> of your batch.</p>
          </article>
        </aside>
      </div>
    `;
  }
  return { render };
})();
