/* CAMPUSLINK — Admin Drives Page */
const AdminDrives = (() => {
  async function render() {
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Placement Drives</div><h1 class="page-title">Drive Management</h1><p class="page-subtitle">Create, configure, and monitor placement drives across your institution.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Create drive wizard coming soon')">+ New Drive</button></div></div>
      <div class="stack">
        ${API.DEMO.admin.drives.map((d, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center">
              <div>
                <div class="flex items-center gap-3 mb-2"><h3>${d.company}</h3><span class="status-badge status-${d.status}">${d.status}</span></div>
                <p class="text-sm text-muted">${d.role} · ${d.venue}</p>
              </div>
              <div class="text-right">
                <div class="font-bold">${d.date}</div>
                <div class="text-sm text-muted">${d.eligible} eligible · ${d.applied} applied</div>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <div class="progress-group" style="flex:1"><div class="progress-label"><span class="progress-label-name">Application Rate</span><span class="progress-label-value">${d.eligible > 0 ? Math.round(d.applied/d.eligible*100) : 0}%</span></div><div class="progress-bar"><div class="progress-bar-fill" style="width:${d.eligible > 0 ? (d.applied/d.eligible*100) : 0}%"></div></div></div>
              <button class="btn btn-sm" onclick="Toast.info('Managing ${d.company} drive')">Manage</button>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }
  return { render };
})();
