/* CAMPUSLINK — Admin Analytics Page */
const AdminAnalytics = (() => {
  async function render() {
    const d = API.DEMO.admin;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Analytics & Reports</div><h1 class="page-title">Placement Analytics</h1><p class="page-subtitle">Comprehensive insights into placement outcomes, trends, and opportunities.</p></div><div class="page-actions"><button class="btn" onclick="Toast.info('Export coming soon')">📥 Export Report</button></div></div>
      ${KPICard.render(d.kpis)}
      <div class="grid grid-2">
        <article class="card animate-fade-in-up">
          <div class="card-header"><h2 class="card-title">Application Funnel</h2></div>
          ${Chart.funnelChart(d.funnel)}
        </article>
        <article class="card animate-fade-in-up" style="animation-delay:80ms">
          <div class="card-header"><h2 class="card-title">Readiness Distribution</h2></div>
          ${Chart.barChart([
            { value: 42, label: '90-100' }, { value: 128, label: '70-89' }, { value: 286, label: '50-69' },
            { value: 248, label: '30-49' }, { value: 138, label: '0-29' },
          ], { height: 160, color: 'green' })}
        </article>
        <article class="card animate-fade-in-up" style="animation-delay:120ms">
          <div class="card-header"><h2 class="card-title">Branch-wise Placement Rate</h2></div>
          ${Chart.barChart([
            { value: 74, label: 'CSE' }, { value: 68, label: 'IT' }, { value: 55, label: 'ETC' },
            { value: 48, label: 'ME' }, { value: 42, label: 'CE' },
          ], { height: 160 })}
          <p class="text-xs text-muted mt-2 text-center">Percentage of students with at least one offer</p>
        </article>
        <article class="card animate-fade-in-up" style="animation-delay:160ms">
          <div class="card-header"><h2 class="card-title">Top Recruiting Companies</h2></div>
          ${DataTable.render(
            [
              { key: 'name', label: 'Company' },
              { key: 'hires', label: 'Hires' },
              { key: 'jobs', label: 'Roles' },
              { key: 'status', label: 'Status', type: 'status' },
            ],
            d.companies.sort((a, b) => b.hires - a.hires)
          )}
        </article>
      </div>
    `;
  }
  return { render };
})();
