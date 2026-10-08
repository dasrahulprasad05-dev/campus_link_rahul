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

    // Fetch Skill Demand Heatmap
    const heatmapRes = await API.get('/analytics/skill-heatmap');
    const skills = Array.isArray(heatmapRes?.skills) ? heatmapRes.skills : [];
    const priorities = Array.isArray(heatmapRes?.institutionalPriorities) ? heatmapRes.institutionalPriorities : [];

    const renderHeatmapRow = (item) => {
      const isCritical = item.gap < -15;
      const isDeficit = item.gap < 0;
      const statusBadge = isCritical
        ? `<span class="badge" style="background:rgba(244,63,94,0.18);color:#fb7185;border:1px solid rgba(244,63,94,0.3)">Critical Shortage</span>`
        : isDeficit
        ? `<span class="badge" style="background:rgba(245,158,11,0.18);color:#fbbf24;border:1px solid rgba(245,158,11,0.3)">Deficit</span>`
        : `<span class="badge" style="background:rgba(16,185,129,0.18);color:#34d399;border:1px solid rgba(16,185,129,0.3)">Healthy Surplus</span>`;

      const gapArrow = item.gap > 0 ? `+${item.gap}%` : `${item.gap}%`;
      const gapColor = isCritical ? '#fb7185' : isDeficit ? '#fbbf24' : '#34d399';

      return `
        <tr style="border-bottom:1px solid var(--border-color);transition:background 0.15s ease">
          <td style="padding:14px 16px;font-weight:600;font-size:14px">
            <span style="display:inline-block;padding:2px 8px;background:rgba(255,255,255,0.06);border-radius:6px">${esc(item.skill)}</span>
          </td>
          <td style="padding:14px 16px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:999px;height:8px;overflow:hidden">
                <div style="width:${Math.min(item.demand, 100)}%;background:linear-gradient(90deg,#3b82f6,#60a5fa);height:100%;border-radius:999px"></div>
              </div>
              <span style="font-weight:600;font-size:13px;min-width:38px">${item.demand}%</span>
            </div>
          </td>
          <td style="padding:14px 16px">
            <div style="display:flex;align-items:center;gap:8px">
              <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:999px;height:8px;overflow:hidden">
                <div style="width:${Math.min(item.supply, 100)}%;background:linear-gradient(90deg,#8b5cf6,#a78bfa);height:100%;border-radius:999px"></div>
              </div>
              <span style="font-weight:600;font-size:13px;min-width:38px">${item.supply}%</span>
            </div>
          </td>
          <td style="padding:14px 16px;font-weight:700;font-size:14px;color:${gapColor}">
            ${gapArrow}
          </td>
          <td style="padding:14px 16px">
            ${statusBadge}
          </td>
        </tr>
      `;
    };

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Institutional Analytics & Closed Loop Intelligence</div>
          <h1 class="page-title">Placement Analytics & Skill Heatmap</h1>
          <p class="page-subtitle">Real-time data telemetry tracking student readiness, department distributions, and market-demand alignment.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-primary" onclick="Toast.info('Analytics exported as CSV')">📥 Export Report</button>
        </div>
      </div>

      ${KPICard.render(kpis)}

      <!-- Skill Demand Heatmap (Institutional Digital Twin) -->
      <article class="card animate-fade-in-up mb-6" style="border:1px solid rgba(59,130,246,0.3);background:linear-gradient(180deg,rgba(30,41,59,0.5) 0%,rgba(15,23,42,0.7) 100%)">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px">
          <div>
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
              <span style="font-size:18px">🔥</span>
              <h2 class="card-title" style="margin:0">Industry Skill Demand vs Student Supply Heatmap</h2>
              <span class="badge badge-accent" style="font-size:11px">Live Curriculum Alignment</span>
            </div>
            <p class="text-xs text-muted mb-0">Computes real-time market shortages across ${heatmapRes?.totalJobs || 0} active corporate requisitions vs ${heatmapRes?.totalStudents || 0} enrolled student skill profiles.</p>
          </div>
          <div style="display:flex;align-items:center;gap:12px;font-size:12px">
            <span style="display:inline-flex;align-items:center;gap:6px">
              <span style="width:10px;height:10px;border-radius:50%;background:#3b82f6;display:inline-block"></span> Market Demand
            </span>
            <span style="display:inline-flex;align-items:center;gap:6px">
              <span style="width:10px;height:10px;border-radius:50%;background:#8b5cf6;display:inline-block"></span> Student Supply
            </span>
          </div>
        </div>

        ${priorities.length > 0 ? `
          <div style="margin:16px 20px;padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:8px;display:flex;align-items:center;gap:12px">
            <span style="font-size:20px">🎯</span>
            <div style="font-size:13px">
              <strong style="color:#fca5a5">Priority Institutional Interventions:</strong>
              <span style="color:var(--text-secondary);margin-left:6px">Urgent bootcamps recommended for:</span>
              <span style="font-weight:600;color:var(--text-primary);margin-left:4px">${priorities.map(p => esc(p)).join(' · ')}</span>
            </div>
          </div>
        ` : ''}

        <div style="overflow-x:auto;padding:0 8px">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="border-bottom:1px solid var(--border-color);text-align:left;color:var(--text-secondary);font-size:12px;text-transform:uppercase;letter-spacing:0.05em">
                <th style="padding:10px 16px">Skill Domain</th>
                <th style="padding:10px 16px;min-width:180px">Recruiter Demand (%)</th>
                <th style="padding:10px 16px;min-width:180px">Student Talent (%)</th>
                <th style="padding:10px 16px">Net Gap</th>
                <th style="padding:10px 16px">Institutional Status</th>
              </tr>
            </thead>
            <tbody>
              ${skills.length > 0 ? skills.map(renderHeatmapRow).join('') : '<tr><td colspan="5" class="p-4 text-center text-muted">No skill telemetry available yet.</td></tr>'}
            </tbody>
          </table>
        </div>
      </article>

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
        <article class="card animate-fade-in-up" style="animation-delay:120ms;grid-column:span 2">
          <div class="card-header"><h2 class="card-title">Registered Corporate Partners</h2></div>
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
