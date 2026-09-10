/* CAMPUSLINK — Mentor Students Page */
const MentorStudents = (() => {
  async function render() {
    const students = API.DEMO.mentor.students;
    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">My Students</div><h1 class="page-title">Student Monitoring</h1><p class="page-subtitle">Track assigned students' readiness, activity, and upcoming actions.</p></div></div>
      <div class="stack">
        ${students.map((s, i) => `
          <article class="card card-interactive animate-fade-in-up" style="animation-delay:${i * 80}ms">
            <div class="flex justify-between items-center">
              <div class="flex items-center gap-4">
                <div class="avatar avatar-lg ${s.trend === 'down' ? 'avatar-orange' : 'avatar-blue'}">${s.name.split(' ').map(w=>w[0]).join('')}</div>
                <div>
                  <div class="font-bold" style="font-size:16px">${s.name}</div>
                  <div class="text-sm text-muted">Last active: ${s.lastActive}</div>
                  <div class="mt-2"><strong class="text-sm">Next action:</strong> <span class="text-sm text-muted">${s.next}</span></div>
                </div>
              </div>
              <div class="text-center">
                ${ScoreRing.render(s.score, { size: 90, label: 'readiness' })}
                <div class="text-xs mt-2 ${s.trend === 'up' ? 'text-success' : s.trend === 'down' ? 'text-danger' : 'text-muted'}">
                  ${s.trend === 'up' ? '↑ Improving' : s.trend === 'down' ? '↓ Declining' : '— Stable'}
                </div>
              </div>
            </div>
            <div class="flex gap-3 mt-4" style="justify-content:flex-end">
              <button class="btn btn-sm btn-ghost" onclick="Toast.info('Viewing ${s.name} roadmap')">View Roadmap</button>
              <button class="btn btn-sm" onclick="Toast.info('Adding feedback for ${s.name}')">Add Feedback</button>
              ${s.trend === 'down' ? `<button class="btn btn-sm btn-danger" onclick="Toast.info('Scheduling intervention for ${s.name}')">Schedule Intervention</button>` : ''}
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }
  return { render };
})();
