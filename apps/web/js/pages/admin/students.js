/* ============================================================
   CAMPUSLINK — Admin Students Page
   Real-time student directory with live database query,
   search, filtering, and instant refresh.
   ============================================================ */

const AdminStudents = (() => {
  let allStudents = [];

  async function render() {
    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Student Management</div>
          <h1 class="page-title">All Students</h1>
          <p class="page-subtitle" id="student-count-subtitle">Manage student profiles, readiness, and placement status.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-sm" id="btn-refresh-students" onclick="AdminStudents.refresh()">
            🔄 Refresh Directory
          </button>
        </div>
      </div>

      <div class="flex gap-3 mb-6" style="flex-wrap:wrap">
        <div class="topbar-search" style="flex:1;min-width:240px">
          <span class="topbar-search-icon">🔍</span>
          <input class="form-input" placeholder="Search by name, email, or branch..." style="padding-left:var(--space-8)" id="student-search" oninput="AdminStudents.filter()">
        </div>
        <select class="form-select" style="width:160px" id="branch-filter" onchange="AdminStudents.filter()">
          <option value="">All Branches</option>
          <option value="CSE">CSE</option>
          <option value="IT">IT</option>
          <option value="ETC">ETC / ECE</option>
        </select>
        <select class="form-select" style="width:160px" id="status-filter" onchange="AdminStudents.filter()">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="at-risk">At-Risk</option>
          <option value="needs-support">Needs Support</option>
        </select>
      </div>

      <div id="students-table-container">
        <div class="text-sm text-muted p-4">⏳ Loading student directory...</div>
      </div>
    `;

    await refresh();
  }

  async function refresh() {
    const btn = document.getElementById('btn-refresh-students');
    if (btn) btn.textContent = '⏳ Loading...';

    let list = [];
    try {
      const res = await API.get('/students');
      if (res) {
        if (Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (typeof res === 'object') {
          const numericKeys = Object.keys(res).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
          if (numericKeys.length > 0) {
            list = numericKeys.map(k => res[k]);
          }
        }
      }
    } catch (e) {
      console.warn('[AdminStudents] API.get error, trying direct fetch:', e);
    }

    // Direct fallback fetch if list is still empty or not loaded
    if (!list.length || list.length <= 6) {
      try {
        const root = (window.__API_URL__ || localStorage.getItem('CAMPUSLINK_API_URL') || 'https://node-js-web-app.onrender.com').replace(/\/+$/, '');
        const directRes = await fetch(`${root}/api/v1/students`);
        if (directRes.ok) {
          const json = await directRes.json();
          if (json && Array.isArray(json.data) && json.data.length > 0) {
            list = json.data;
          }
        }
      } catch (err) {
        console.warn('[AdminStudents] Direct fetch error:', err);
      }
    }

    // Default demo students if still empty
    const demoList = API.DEMO.admin.students || [];

    if (!list.length) {
      list = demoList;
    }

    allStudents = list.map(s => {
      const isActualReal = Boolean(
        s.isReal || 
        (s.email && !s.email.includes('campuslink.in') && !s.email.includes('@university.edu'))
      );
      return {
        id: s.id || s.user_id || 's-' + Math.random(),
        name: s.name || 'Student',
        email: s.email || '',
        branch: s.branch || 'CSE',
        cgpa: s.cgpa ? parseFloat(s.cgpa) : 8.0,
        readiness: s.readiness ? parseInt(s.readiness) : 75,
        applications: s.applications ?? 0,
        status: s.status || (s.readiness < 60 ? 'at-risk' : s.readiness < 70 ? 'needs-support' : 'active'),
        isReal: isActualReal,
      };
    });

    // Sort so real registered students are always at the top
    allStudents.sort((a, b) => (b.isReal ? 1 : 0) - (a.isReal ? 1 : 0));

    const realCount = allStudents.filter(s => s.isReal).length;
    const subTitle = document.getElementById('student-count-subtitle');
    if (subTitle) {
      subTitle.textContent = `Manage student profiles, readiness, and placement status · ${allStudents.length} total (${realCount} registered students)`;
    }

    if (btn) btn.textContent = '🔄 Refresh Directory';
    filter();
  }

  function filter() {
    const query = (document.getElementById('student-search')?.value || '').toLowerCase().trim();
    const branch = document.getElementById('branch-filter')?.value || '';
    const status = document.getElementById('status-filter')?.value || '';

    const filtered = allStudents.filter(s => {
      const matchQuery = !query ||
        s.name.toLowerCase().includes(query) ||
        (s.email && s.email.toLowerCase().includes(query)) ||
        s.branch.toLowerCase().includes(query);

      const matchBranch = !branch || s.branch.toUpperCase().includes(branch.toUpperCase());
      const matchStatus = !status || s.status.toLowerCase() === status.toLowerCase();

      return matchQuery && matchBranch && matchStatus;
    });

    renderTable(filtered);
  }

  function renderTable(students) {
    const container = document.getElementById('students-table-container');
    if (!container) return;

    if (!students.length) {
      container.innerHTML = `
        <div class="empty-state p-6 text-center">
          <div class="empty-state-icon" style="font-size:36px;margin-bottom:8px">🔍</div>
          <div class="empty-state-title font-bold mb-2">No students match your criteria</div>
          <p class="text-sm text-muted">Try changing your search term or clear the branch/status filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = DataTable.render(
      [
        {
          key: 'name',
          label: 'Student',
          render: (name, row) => `
            <div class="flex items-center gap-3">
              <div class="avatar avatar-sm ${row.isReal ? 'avatar-green' : 'avatar-blue'}">
                ${(name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div class="table-cell-main font-bold flex items-center gap-2">
                  <span>${name}</span>
                  ${row.isReal ? '<span class="badge badge-success" style="font-size:9px;padding:1px 5px">NEW REGISTERED</span>' : ''}
                </div>
                <div class="table-cell-sub text-xs text-muted">
                  ${row.branch} ${row.email ? `· ${row.email}` : ''}
                </div>
              </div>
            </div>
          `
        },
        { key: 'cgpa', label: 'CGPA' },
        {
          key: 'readiness',
          label: 'Readiness',
          render: (v) => `
            <div class="flex items-center gap-2">
              ${ScoreRing.mini(v)}
              <span class="font-bold">${v}/100</span>
            </div>
          `
        },
        { key: 'applications', label: 'Applications' },
        { key: 'status', label: 'Status', type: 'status' },
        {
          key: '_actions',
          label: '',
          render: (_, row) => `
            <button class="btn btn-sm btn-ghost" onclick="Toast.info('${row.name} (${row.email || row.branch})')">
              View
            </button>
          `
        },
      ],
      students
    );
  }

  return { render, refresh, filter };
})();
