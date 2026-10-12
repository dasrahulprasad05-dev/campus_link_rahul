/* CAMPUSLINK — Admin Scheduler Page — Real Data */
const AdminScheduler = (() => {
  async function render() {
    const result = await API.get('/drives');
    const drives = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

    document.getElementById('main').innerHTML = `
      <div class="page-header"><div class="page-header-content"><div class="page-eyebrow">Conflict-Free Scheduler</div><h1 class="page-title">Drive Scheduler</h1><p class="page-subtitle">Create schedules while checking venue, time, and participant conflicts. Override suggestions manually if needed.</p></div></div>
      <div class="grid grid-main">
        <div class="stack">
          <article class="card animate-fade-in-up">
            <div class="card-header"><h2 class="card-title">Schedule Checker</h2></div>
            <p class="text-sm text-muted mb-4">Test a set of events for conflicts. The system checks for overlapping venues and time slots.</p>
            <div class="form-row mb-4">
              ${Forms.input({ id: 'sched-venue1', label: 'Event 1 Venue', placeholder: 'Seminar Hall A', value: 'Seminar Hall A' })}
              ${Forms.input({ id: 'sched-time1', label: 'Event 1 Time', placeholder: '9:00 – 11:00', value: '9:00 – 11:00' })}
            </div>
            <div class="form-row mb-4">
              ${Forms.input({ id: 'sched-venue2', label: 'Event 2 Venue', placeholder: 'Seminar Hall A', value: 'Seminar Hall A' })}
              ${Forms.input({ id: 'sched-time2', label: 'Event 2 Time', placeholder: '10:00 – 12:00', value: '10:00 – 12:00' })}
            </div>
            <button class="btn btn-primary" onclick="AdminScheduler.checkConflicts()">🔍 Check Conflicts</button>
            <div id="schedule-result" class="mt-4"></div>
          </article>
          <article class="card animate-fade-in-up" style="animation-delay:100ms">
            <div class="card-header"><h2 class="card-title">Scheduled Events</h2></div>
            <div class="schedule-timeline">
              ${drives.length ? drives.map(d => `
                <div class="schedule-event">
                  <div class="flex justify-between items-center"><div class="font-bold">${d.company_name || d.company || ''} — ${d.role}</div><span class="status-badge status-${d.status}">${d.status}</span></div>
                  <div class="text-sm text-muted mt-2">📅 ${d.drive_date ? new Date(d.drive_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBD'} · 📍 ${d.venue} · Branches: ${(d.branches || []).join(', ')}</div>
                </div>
              `).join('') : '<p class="text-sm text-muted p-4">No scheduled events.</p>'}
            </div>
          </article>
        </div>
        <aside class="stack">
          <article class="card card-accent animate-fade-in-up" style="animation-delay:80ms">
            <h3 class="card-title mb-4">How It Works</h3>
            <div class="text-sm text-muted">
              <p class="mb-4">The scheduler automatically detects conflicts when:</p>
              <ul style="padding-left:var(--space-5)">
                <li class="mb-2">Two events share the same venue and overlapping times</li>
                <li class="mb-2">A student is scheduled for multiple events at the same time</li>
                <li class="mb-2">Venue capacity is exceeded</li>
              </ul>
              <p class="mt-4">Admins can manually override any suggestion when needed.</p>
            </div>
          </article>
        </aside>
      </div>
    `;
  }

  async function checkConflicts() {
    const v1 = document.getElementById('sched-venue1')?.value || '';
    const v2 = document.getElementById('sched-venue2')?.value || '';
    const result = await API.post('/scheduler/check', {
      events: [
        { venue: v1, start: 900, end: 1100, title: 'Event 1' },
        { venue: v2, start: 1000, end: 1200, title: 'Event 2' },
      ],
    });

    const el = document.getElementById('schedule-result');
    if (result.valid) {
      el.innerHTML = '<div class="insight-card success"><strong>✅ No conflicts detected!</strong> All events can be scheduled as configured.</div>';
    } else {
      el.innerHTML = `<div class="insight-card danger"><strong>⚠️ Conflict detected!</strong> ${result.conflicts.length} event(s) have overlapping venue and time. Please adjust the schedule or choose a different venue.</div>`;
    }
  }

  return { render, checkConflicts };
})();
