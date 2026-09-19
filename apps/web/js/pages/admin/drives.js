/* CAMPUSLINK — Admin Drives Page — Real Data */
const AdminDrives = (() => {
  async function render() {
    const main = document.getElementById('main');
    main.innerHTML = `<div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Loading drives...</div></div></div>`;

    const result = await API.get('/drives');
    const drives = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    main.innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Placement Drives</div><h1 class="page-title">Drive Management</h1><p class="page-subtitle">Create, configure, and monitor placement drives across your institution.</p></div><div class="page-actions"><button class="btn btn-primary" onclick="Toast.info('Create drive wizard coming soon')">+ New Drive</button></div></div>
      <div class="stack">
        ${drives.length ? drives.map((d, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center">
              <div>
                <div class="flex items-center gap-3 mb-2"><h3>${d.company_name || d.company || ''}</h3><span class="status-badge status-${d.status}">${d.status}</span></div>
                <p class="text-sm text-muted">${d.role} · ${d.venue}</p>
              </div>
              <div class="text-right">
                <div class="font-bold">${d.drive_date ? new Date(d.drive_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'}</div>
                <div class="text-sm text-muted">Min CGPA: ${d.min_cgpa || 0} · ${(d.branches || []).join(', ')}</div>
              </div>
            </div>
            <div class="flex gap-3 mt-4">
              <button class="btn btn-sm" onclick="Toast.info('Managing ${d.company_name || d.company || ''} drive')">Manage</button>
            </div>
          </article>
        `).join('') : '<div class="empty-state"><div class="empty-state-icon">📭</div><div class="empty-state-title">No drives scheduled</div></div>'}
      </div>
    `;
  }
  return { render };
})();
