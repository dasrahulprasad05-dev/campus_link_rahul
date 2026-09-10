/* CAMPUSLINK — Admin Students Page */
const AdminStudents = (() => {
  async function render() {
    const students = API.DEMO.admin.students;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Student Management</div><h1 class="page-title">All Students</h1><p class="page-subtitle">Manage student profiles, readiness, and placement status.</p></div></div>
      <div class="flex gap-3 mb-6">
        <div class="topbar-search" style="flex:1"><span class="topbar-search-icon">🔍</span><input class="form-input" placeholder="Search students..." style="padding-left:var(--space-8)" id="student-search"></div>
        <select class="form-select" style="width:180px"><option>All Branches</option><option>CSE</option><option>IT</option><option>ETC</option></select>
        <select class="form-select" style="width:180px"><option>All Status</option><option>Active</option><option>At-Risk</option><option>Needs Support</option></select>
      </div>
      ${DataTable.render(
        [
          { key: 'name', label: 'Student', type: 'avatar', subKey: 'branch' },
          { key: 'cgpa', label: 'CGPA' },
          { key: 'readiness', label: 'Readiness', render: (v) => `<div class="flex items-center gap-2">${ScoreRing.mini(v)}<span class="font-bold">${v}</span></div>` },
          { key: 'applications', label: 'Applications' },
          { key: 'status', label: 'Status', type: 'status' },
          { key: '_actions', label: '', render: (_, row) => `<button class="btn btn-sm btn-ghost" onclick="Toast.info('View ${row.name} profile')">View</button>` },
        ],
        students
      )}
    `;
  }
  return { render };
})();
