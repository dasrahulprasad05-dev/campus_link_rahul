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

    // No demo data fallback — data comes from real DB

    if (!list.length) {
      list = [];
    }

    allStudents = list.map(s => {
      const isActualReal = Boolean(
        s.isReal || 
        (s.email && !s.email.includes('campuslink.in') && !s.email.includes('@university.edu'))
      );
      const skills = Array.isArray(s.skills) 
        ? s.skills 
        : (typeof s.skills === 'string' && s.skills ? s.skills.split(',').map(x=>x.trim()).filter(Boolean) : []);
      const cgpa = (s.cgpa !== null && s.cgpa !== undefined && s.cgpa !== '') ? parseFloat(s.cgpa) : null;
      const readiness = (s.readiness !== undefined && s.readiness !== null) ? parseInt(s.readiness) : 0;

      return {
        id: s.id || s.user_id || 's-' + Math.random(),
        name: s.name || 'Student',
        email: s.email || '',
        branch: s.branch || 'CSE',
        cgpa: cgpa,
        readiness: readiness,
        targetRole: s.target_role || s.targetRole || 'Software Engineer',
        skills: skills,
        phone: s.phone || '',
        linkedin: s.linkedin || '',
        github: s.github || '',
        year: s.year || 'Final Year',
        reg_no: s.reg_no || '',
        applications: s.applications ?? 0,
        status: s.status || (readiness === 0 ? 'pending' : readiness < 60 ? 'at-risk' : readiness < 75 ? 'needs-support' : 'active'),
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
        {
          key: 'cgpa',
          label: 'CGPA',
          render: (v) => (v !== null && v !== undefined && !isNaN(v)) ? Number(v).toFixed(2) : '<span class="text-muted text-xs">Not Set</span>'
        },
        {
          key: 'readiness',
          label: 'Readiness',
          render: (v) => {
            const num = Number(v) || 0;
            if (num === 0) {
              return `<span class="badge" style="background:rgba(255,255,255,0.06);color:var(--text-muted);font-weight:600">⚪ 0/100 (Pending)</span>`;
            }
            return `
              <div class="flex items-center gap-2">
                ${ScoreRing.mini(num)}
                <span class="font-bold">${num}/100</span>
              </div>
            `;
          }
        },
        { key: 'applications', label: 'Applications' },
        {
          key: 'status',
          label: 'Status',
          render: (st, row) => {
            if (row.readiness === 0 || st === 'pending') {
              return `<span class="badge" style="background:rgba(255,255,255,0.08);color:var(--text-muted)">pending assessment</span>`;
            }
            return `<span class="badge badge-${st === 'active' ? 'success' : st === 'at-risk' ? 'danger' : 'warning'}">${st}</span>`;
          }
        },
        {
          key: '_actions',
          label: '',
          render: (_, row) => `
            <button class="btn btn-sm btn-ghost" onclick="AdminStudents.viewStudent('${row.id}')">
              View
            </button>
          `
        },
      ],
      students
    );
  }

  function viewStudent(studentId) {
    const student = allStudents.find(s => String(s.id) === String(studentId)) || allStudents.find(s => s.name === studentId);
    if (!student) {
      Toast.error('Student profile not found');
      return;
    }

    const modalId = 'admin-student-profile-modal';
    const existing = document.getElementById(modalId);
    if (existing) existing.remove();

    const skills = Array.isArray(student.skills) ? student.skills : [];
    const initials = (student.name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const modalHtml = `
      <div class="modal-backdrop open" id="${modalId}" role="dialog" aria-modal="true">
        <div class="modal-dialog" style="max-width:720px;width:95%">
          <div class="modal-header flex justify-between items-center">
            <div class="flex items-center gap-3">
              <div class="avatar avatar-md ${student.isReal ? 'avatar-green' : 'avatar-blue'} font-bold">
                ${initials}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="modal-title font-bold" style="font-size:1.25rem">${student.name}</h2>
                  ${student.isReal ? '<span class="badge badge-success" style="font-size:10px">NEW REGISTERED</span>' : ''}
                </div>
                <div class="text-xs text-muted">${student.email || 'No email'} · ${student.branch}</div>
              </div>
            </div>
            <button class="modal-close" onclick="AdminStudents.closeModal('${modalId}')" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-muted)">✕</button>
          </div>

          <div class="modal-body stack gap-4" style="max-height:75vh;overflow-y:auto;padding:var(--space-5)">
            <!-- Top KPI Cards -->
            <div class="grid grid-3 gap-3">
              <div class="card p-3 text-center" style="background:var(--bg-elevated);border-radius:var(--radius-md)">
                <div class="text-xs text-muted font-bold uppercase mb-1">Readiness Score</div>
                <div class="font-extrabold text-xl ${student.readiness === 0 ? 'text-muted' : 'text-primary'}">${student.readiness}/100</div>
                <div class="text-xs mt-1 ${student.readiness >= 75 ? 'text-success' : student.readiness >= 60 ? 'text-warning' : student.readiness > 0 ? 'text-danger' : 'text-muted'}">
                  ${student.readiness >= 75 ? '🟢 Placement Ready' : student.readiness >= 60 ? '🟡 Needs Support' : student.readiness > 0 ? '🔴 At-Risk' : '⚪ Not Assessed (0%)'}
                </div>
              </div>

              <div class="card p-3 text-center" style="background:var(--bg-elevated);border-radius:var(--radius-md)">
                <div class="text-xs text-muted font-bold uppercase mb-1">Academic CGPA</div>
                <div class="font-extrabold text-xl">${student.cgpa !== null && !isNaN(student.cgpa) ? student.cgpa.toFixed(2) : '—'}</div>
                <div class="text-xs text-muted mt-1">${student.cgpa !== null && !isNaN(student.cgpa) ? 'Scale 10.0' : 'Not Added Yet'}</div>
              </div>

              <div class="card p-3 text-center" style="background:var(--bg-elevated);border-radius:var(--radius-md)">
                <div class="text-xs text-muted font-bold uppercase mb-1">Applications</div>
                <div class="font-extrabold text-xl">${student.applications || 0}</div>
                <div class="text-xs text-muted mt-1">Campus Drives</div>
              </div>
            </div>

            <!-- Profile Details -->
            <div class="card p-4" style="background:var(--bg-elevated);border-radius:var(--radius-md)">
              <div class="text-sm font-bold mb-3 flex items-center gap-2">
                <span>📋</span> Academic & Profile Information
              </div>
              <div class="grid grid-2 gap-3 text-sm">
                <div><strong class="text-muted">Target Career Role:</strong> ${student.targetRole || 'Software Engineer'}</div>
                <div><strong class="text-muted">Department / Branch:</strong> ${student.branch}</div>
                <div><strong class="text-muted">Registered Email:</strong> <a href="mailto:${student.email}" style="color:var(--primary-color)">${student.email || '—'}</a></div>
                <div><strong class="text-muted">Current Status:</strong> <span class="badge ${student.status === 'active' ? 'badge-success' : student.status === 'pending' ? '' : 'badge-warning'}">${student.status}</span></div>
                ${student.reg_no ? `<div><strong class="text-muted">Registration No:</strong> ${student.reg_no}</div>` : ''}
                ${student.year ? `<div><strong class="text-muted">Academic Year:</strong> ${student.year}</div>` : ''}
              </div>
            </div>

            <!-- Skills & Competencies -->
            <div class="card p-4" style="background:var(--bg-elevated);border-radius:var(--radius-md)">
              <div class="text-sm font-bold mb-2 flex items-center justify-between">
                <span class="flex items-center gap-2"><span>🛠️</span> Verified Skills & Competencies</span>
                <span class="text-xs text-muted">${skills.length} skills</span>
              </div>
              ${skills.length > 0 ? `
                <div class="flex gap-2" style="flex-wrap:wrap">
                  ${skills.map(skill => `<span class="badge badge-secondary" style="font-size:12px;padding:4px 8px">${skill}</span>`).join('')}
                </div>
              ` : `
                <div class="p-3 text-sm text-muted text-center" style="background:rgba(255,255,255,0.02);border:1px dashed var(--border-color);border-radius:var(--radius-sm)">
                  ℹ️ No verified skills added yet. Student has not updated their profile or uploaded a resume.
                </div>
              `}
            </div>

            <!-- Readiness Breakdown -->
            <div class="card p-4" style="background:var(--bg-elevated);border-radius:var(--radius-md)">
              <div class="text-sm font-bold mb-3 flex items-center gap-2">
                <span>📊</span> Placement Assessment Breakdown
              </div>
              ${student.readiness === 0 && skills.length === 0 && student.cgpa === null ? `
                <div class="p-3 text-sm text-muted text-center" style="background:rgba(255,255,255,0.02);border:1px dashed var(--border-color);border-radius:var(--radius-sm)">
                  ⚪ Readiness score is currently 0. As the student uploads their resume, verifies skills, or takes mock interviews, this score will calculate dynamically.
                </div>
              ` : `
                <div class="stack gap-3">
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span>Technical & Problem Solving</span>
                      <strong>${Math.min(100, skills.length * 15)}%</strong>
                    </div>
                    <div style="background:var(--border-color);height:6px;border-radius:3px;overflow:hidden">
                      <div style="background:var(--primary-color);height:100%;width:${Math.min(100, skills.length * 15)}%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span>Academics & Core Fundamentals</span>
                      <strong>${student.cgpa ? Math.min(100, Math.round(student.cgpa * 10)) : 0}%</strong>
                    </div>
                    <div style="background:var(--border-color);height:6px;border-radius:3px;overflow:hidden">
                      <div style="background:var(--accent-green);height:100%;width:${student.cgpa ? Math.min(100, Math.round(student.cgpa * 10)) : 0}%"></div>
                    </div>
                  </div>
                  <div>
                    <div class="flex justify-between text-xs mb-1">
                      <span>Aptitude & Interview Readiness</span>
                      <strong>${student.readiness}%</strong>
                    </div>
                    <div style="background:var(--border-color);height:6px;border-radius:3px;overflow:hidden">
                      <div style="background:var(--accent-orange);height:100%;width:${student.readiness}%"></div>
                    </div>
                  </div>
                </div>
              `}
            </div>
          </div>


          <div class="modal-footer flex justify-between items-center p-4" style="border-top:1px solid var(--border-color)">
            <div class="flex gap-2">
              <a class="btn btn-sm btn-primary flex items-center gap-1" href="mailto:${student.email}?subject=Placement%20Cell%20Update%20-%20ABIT&body=Hello%20${encodeURIComponent(student.name)},">
                <span>📧</span> Send Email
              </a>
              <button class="btn btn-sm btn-secondary" onclick="Toast.success('Assigned faculty mentor to ' + '${student.name}')">
                <span>👨‍🏫</span> Assign Mentor
              </button>
            </div>
            <button class="btn btn-sm btn-ghost" onclick="AdminStudents.closeModal('${modalId}')">Close</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.remove();
  }

  return { render, refresh, filter, viewStudent, closeModal };
})();
