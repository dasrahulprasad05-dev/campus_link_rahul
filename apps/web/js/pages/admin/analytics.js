/* CAMPUSLINK — Admin Analytics Page — Real Data */
const AdminAnalytics = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading analytics...</div></div></div>`;

    // Fetch KPIs from dashboard endpoint
    const dashData = await API.getDashboard('admin');
    const kpis = dashData?.kpis || [];

    // Fetch students for distribution
    const studentResult = await API.get('/students');
    const students = Array.isArray(studentResult?.data) ? studentResult.data : (Array.isArray(studentResult) ? studentResult : []);

    // Readiness distribution
    const distBuckets = [
      { value: students.filter(s => (s.readiness || 0) >= 80).length, label: '80-100' },
      { value: students.filter(s => (s.readiness || 0) >= 60 && (s.readiness || 0) < 80).length, label: '60-79' },
      { value: students.filter(s => (s.readiness || 0) >= 40 && (s.readiness || 0) < 60).length, label: '40-59' },
      { value: students.filter(s => (s.readiness || 0) < 40).length, label: '0-39' },
    ];

    // Branch-wise distribution
    const branchMap = {};
    students.forEach(s => {
      const branch = (s.branch || 'Other').replace('Computer Science & Engineering', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Telecom', 'ETC').replace('Mechanical Engineering', 'ME');
      branchMap[branch] = (branchMap[branch] || 0) + 1;
    });
    const branchBuckets = Object.entries(branchMap).map(([label, value]) => ({ label, value }));

    // Fetch companies
    const compResult = await API.get('/companies');
    const companies = Array.isArray(compResult?.data) ? compResult.data : (Array.isArray(compResult) ? compResult : []);

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Analytics & Reports</div><h1 class="page-title">Placement Analytics</h1><p class="page-subtitle">Comprehensive insights into placement outcomes, trends, and opportunities.</p></div><div class="page-actions"><button class="btn" onclick="Toast.info('Export coming soon')">📥 Export Report</button></div></div>
      ${KPICard.render(kpis)}
      <div class="grid grid-2">
        <article class="card animate-fade-in-up">
          <div class="card-header"><h2 class="card-title">Readiness Distribution</h2></div>
          ${Chart.barChart(distBuckets, { height: 160, color: 'green' })}
          <p class="text-xs text-muted mt-2 text-center">Distribution across ${students.length} students</p>
        </article>
        <article class="card animate-fade-in-up" style="animation-delay:80ms">
          <div class="card-header"><h2 class="card-title">Branch-wise Distribution</h2></div>
          ${Chart.barChart(branchBuckets, { height: 160 })}
          <p class="text-xs text-muted mt-2 text-center">Students per department</p>
        </article>
        <article class="card animate-fade-in-up" style="animation-delay:120ms">
          <div class="card-header"><h2 class="card-title">Registered Companies</h2></div>
          ${companies.length ? DataTable.render(
            [
              { key: 'name', label: 'Company' },
              { key: 'industry', label: 'Industry' },
              { key: 'status', label: 'Status', type: 'status' },
            ],
            companies
          ) : '<p class="text-sm text-muted p-4">No companies registered.</p>'}
        </article>
      </div>
    `;
  }
  return { render };
})();
