/* ============================================================
   CAMPUSLINK — Mentor Students Page
   Real-time student monitoring for faculty mentors.
   ============================================================ */

const MentorStudents = (() => {
  async function render() {
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
      console.warn('[MentorStudents] Could not fetch live students:', e);
    }

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
        console.warn('[MentorStudents] Direct fetch error:', err);
      }
    }

    const demoList = API.DEMO.mentor.students || [];
    
    // Map live students
    const liveMapped = list.map(s => {
      const isActualReal = Boolean(
        s.isReal || 
        (s.email && !s.email.includes('campuslink.in') && !s.email.includes('@university.edu'))
      );
      return {
        name: s.name,
        email: s.email,
        score: s.readiness || 75,
        trend: s.readiness > 70 ? 'up' : 'stable',
        lastActive: 'Active recently',
        next: `Review ${s.target_role || 'Software Engineer'} roadmap`,
        isReal: isActualReal,
      };
    });

    const liveEmails = new Set(liveMapped.map(s => (s.email || '').toLowerCase()).filter(Boolean));
    const uniqueDemo = demoList.filter(d => !liveEmails.has(d.name.toLowerCase()));
    const students = [...liveMapped, ...uniqueDemo];

    // Real registered students at the top
    students.sort((a, b) => (b.isReal ? 1 : 0) - (a.isReal ? 1 : 0));

    document.getElementById('main').innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">My Students</div>
          <h1 class="page-title">Student Monitoring</h1>
          <p class="page-subtitle">Track assigned students' readiness, activity, and roadmap guidance.</p>
        </div>
        <div class="page-actions">
          <button class="btn btn-sm" onclick="MentorStudents.render()">🔄 Refresh</button>
        </div>
      </div>

      <div class="stack">
        ${students.map((s, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center" style="flex-wrap:wrap;gap:var(--space-4)">
              <div class="flex items-center gap-4">
                <div class="avatar avatar-lg ${s.isReal ? 'avatar-green' : s.trend === 'down' ? 'avatar-orange' : 'avatar-blue'}">
                  ${(s.name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div class="font-bold flex items-center gap-2" style="font-size:16px">
                    <span>${s.name}</span>
                    ${s.isReal ? '<span class="badge badge-success" style="font-size:9px;padding:1px 5px">NEW STUDENT</span>' : ''}
                  </div>
                  <div class="text-sm text-muted">${s.email ? s.email + ' · ' : ''}Last active: ${s.lastActive}</div>
                  <div class="mt-2"><strong class="text-sm">Next action:</strong> <span class="text-sm text-muted">${s.next}</span></div>
                </div>
              </div>
              <div class="text-center">
                ${ScoreRing.render(s.score, { size: 85, label: 'readiness' })}
                <div class="text-xs mt-2 ${s.trend === 'up' ? 'text-success' : s.trend === 'down' ? 'text-danger' : 'text-muted'}">
                  ${s.trend === 'up' ? '↑ Improving' : s.trend === 'down' ? '↓ Declining' : '— Stable'}
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-4" style="justify-content:flex-end;flex-wrap:wrap">
              <button class="btn btn-sm btn-ghost" onclick="Router.navigate('mentor/roadmaps')">View Roadmap</button>
              <button class="btn btn-sm btn-primary" onclick="Toast.info('Adding mentor guidance for ' + '${s.name}')">Add Feedback</button>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  return { render };
})();
