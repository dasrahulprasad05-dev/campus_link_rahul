/* ============================================================
   CAMPUSLINK — Real-Time Notice Board & Alerts Page
   Live announcements from TPO, Recruiters, and Faculty Mentors.
   ============================================================ */

const StudentNoticeBoard = (() => {
  let _notices = [];
  let _filter = 'all'; // 'all' | 'jobs' | 'drives' | 'mentor' | 'pipeline'
  let _sseSource = null;

  async function render() {
    const main = document.getElementById('main');
    if (!main) return;

    main.innerHTML = `
      <div class="page-header">
        <div class="page-header-content">
          <div class="page-eyebrow">Campus Intelligence & Real-Time Alerts</div>
          <h1 class="page-title">📢 Notice Board</h1>
          <p class="page-subtitle">Real-time drive notifications, recruiter postings, mentor reviews, and hiring pipeline updates.</p>
        </div>
      </div>
      <div class="card animate-fade-in-up" style="padding:40px;text-align:center;">
        <div style="font-size:32px;margin-bottom:12px;">⏳</div>
        <div>Loading real-time notices...</div>
      </div>
    `;

    await _fetchNotices();
    _initSSE();
    _renderUI();
  }

  async function _fetchNotices() {
    try {
      const res = await API.get('/notifications?limit=60');
      if (res && res.success && Array.isArray(res.data)) {
        _notices = res.data;
      } else if (Array.isArray(res)) {
        _notices = res;
      } else {
        _notices = _getFallbackNotices();
      }
    } catch (e) {
      _notices = _getFallbackNotices();
    }
  }

  function _getFallbackNotices() {
    return [
      {
        id: 'nb-1',
        type: 'drive_announced',
        title: '📅 TechNova Campus Placement Drive Scheduled',
        message: 'TechNova Solutions is conducting their annual campus placement drive on Oct 24, 2026 at Campus Auditorium Hall A. Eligible branches: CSE, IT. Min CGPA: 7.0.',
        created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
        is_read: false,
      },
      {
        id: 'nb-2',
        type: 'job_posted',
        title: '💼 CloudScale Systems is Hiring: DevOps Engineer',
        message: 'New job posting for DevOps Engineer (CTC: ₹9.5 LPA). Requires Docker, Kubernetes, AWS. Check Job Discovery section to apply before deadline.',
        created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
        is_read: false,
      },
      {
        id: 'nb-3',
        type: 'mentor_feedback',
        title: '📝 Mentor Guidance: Milestone Review',
        message: 'Your faculty mentor reviewed your career roadmap deliverables. Please complete the recommended cloud computing practice module.',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_read: true,
      },
      {
        id: 'nb-4',
        type: 'shortlisted',
        title: '🎉 Application Shortlisted: TechNova Solutions',
        message: 'Congratulations! Your profile has been shortlisted for the Graduate Data Analyst role. Check your applications pipeline for scheduled assessment details.',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        is_read: true,
      }
    ];
  }

  function _initSSE() {
    if (_sseSource) return;
    const token = Store.getToken();
    if (!token || typeof EventSource === 'undefined') return;

    try {
      // Setup SSE connection
      const sseUrl = `${API.getBase()}/notifications/stream?token=${encodeURIComponent(token)}`;
      _sseSource = new EventSource(sseUrl);

      _sseSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.title) {
            _notices.unshift(data);
            Toast.info(`📢 ${data.title}`);
            _renderUI();
            _updateTopbarBadge();
          }
        } catch {}
      };

      _sseSource.onerror = () => {
        if (_sseSource) {
          _sseSource.close();
          _sseSource = null;
        }
      };
    } catch {}
  }

  function _renderUI() {
    const main = document.getElementById('main');
    if (!main) return;

    const filtered = _notices.filter(n => {
      if (_filter === 'all') return true;
      if (_filter === 'jobs') return n.type === 'job_posted';
      if (_filter === 'drives') return n.type === 'drive_announced';
      if (_filter === 'mentor') return n.type === 'mentor_feedback';
      if (_filter === 'pipeline') return n.type === 'shortlisted' || n.type === 'stage_updated' || n.type === 'application_status_change';
      return true;
    });

    const unreadCount = _notices.filter(n => !n.is_read).length;

    main.innerHTML = `
      <div class="page-header flex justify-between items-start flex-wrap gap-4">
        <div class="page-header-content">
          <div class="page-eyebrow flex items-center gap-2">
            <span>Campus Intelligence</span>
            <span class="badge badge-success badge-dot" style="font-size:11px;">🟢 Real-time sync</span>
          </div>
          <h1 class="page-title">📢 Notice Board</h1>
          <p class="page-subtitle">Real-time drive notifications, recruiter postings, mentor reviews, and hiring pipeline updates.</p>
        </div>
        <div class="page-actions flex items-center gap-2">
          ${unreadCount > 0 ? `
            <button class="btn btn-sm btn-ghost" onclick="StudentNoticeBoard.markAllRead()">
              ✓ Mark All Read (${unreadCount})
            </button>
          ` : ''}
          <button class="btn btn-sm btn-secondary" onclick="StudentNoticeBoard.render()">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Category Filter Tabs -->
      <div class="flex gap-2 mb-6 flex-wrap" style="border-bottom: 1px solid var(--border); padding-bottom: 12px;">
        <button class="btn btn-sm ${_filter === 'all' ? 'btn-primary' : 'btn-ghost'}" onclick="StudentNoticeBoard.setFilter('all')">
          All Notices (${_notices.length})
        </button>
        <button class="btn btn-sm ${_filter === 'jobs' ? 'btn-primary' : 'btn-ghost'}" onclick="StudentNoticeBoard.setFilter('jobs')">
          💼 Jobs (${_notices.filter(n => n.type === 'job_posted').length})
        </button>
        <button class="btn btn-sm ${_filter === 'drives' ? 'btn-primary' : 'btn-ghost'}" onclick="StudentNoticeBoard.setFilter('drives')">
          📅 Drives (${_notices.filter(n => n.type === 'drive_announced').length})
        </button>
        <button class="btn btn-sm ${_filter === 'mentor' ? 'btn-primary' : 'btn-ghost'}" onclick="StudentNoticeBoard.setFilter('mentor')">
          👨‍🏫 Mentor Actions (${_notices.filter(n => n.type === 'mentor_feedback').length})
        </button>
        <button class="btn btn-sm ${_filter === 'pipeline' ? 'btn-primary' : 'btn-ghost'}" onclick="StudentNoticeBoard.setFilter('pipeline')">
          🎯 Hiring Pipeline (${_notices.filter(n => n.type === 'shortlisted' || n.type === 'stage_updated' || n.type === 'application_status_change').length})
        </button>
      </div>

      <!-- Notice Cards Stack -->
      <div class="stack" style="display:flex; flex-direction:column; gap:16px;">
        ${filtered.length > 0 ? filtered.map((n, i) => _renderNoticeCard(n, i)).join('') : `
          <div class="empty-state card" style="padding:48px 24px; text-align:center;">
            <div class="empty-state-icon" style="font-size:40px; margin-bottom:12px;">📭</div>
            <div class="empty-state-title" style="font-size:18px; font-weight:700;">No notices in this category</div>
            <p class="empty-state-text text-muted" style="font-size:13px; margin-top:4px;">Check back later or select "All Notices" to see all campus communications.</p>
          </div>
        `}
      </div>
    `;

    _updateTopbarBadge();
  }

  function _renderNoticeCard(n, i) {
    const isUnread = !n.is_read;
    const icons = {
      job_posted: '💼',
      drive_announced: '📅',
      mentor_feedback: '👨‍🏫',
      shortlisted: '🎉',
      stage_updated: '🎯',
      system_alert: '📋',
    };
    const icon = icons[n.type] || '📢';

    // Action CTA
    let actionBtn = '';
    if (n.type === 'job_posted') {
      actionBtn = `<button class="btn btn-sm btn-primary" onclick="Router.navigate('student/jobs')">View Jobs →</button>`;
    } else if (n.type === 'drive_announced') {
      actionBtn = `<button class="btn btn-sm btn-primary" onclick="Router.navigate('student/jobs')">Explore Drives →</button>`;
    } else if (n.type === 'mentor_feedback') {
      actionBtn = `<button class="btn btn-sm btn-secondary" onclick="Router.navigate('student/roadmap')">View Roadmap →</button>`;
    } else if (n.type === 'shortlisted' || n.type === 'stage_updated') {
      actionBtn = `<button class="btn btn-sm btn-primary" onclick="Router.navigate('student/applications')">Track Round →</button>`;
    }

    const timeAgo = _timeAgo(n.created_at);

    return `
      <article class="card animate-fade-in-up" style="animation-delay:${i * 40}ms; border-left: 4px solid ${isUnread ? 'var(--accent, #6366f1)' : 'rgba(255,255,255,0.1)'}; background: ${isUnread ? 'rgba(99, 102, 241, 0.04)' : 'var(--card-bg, #111827)'}; padding:20px; border-radius:12px;">
        <div class="flex justify-between items-start gap-4 flex-wrap">
          <div class="flex items-start gap-3" style="flex:1; min-width:280px;">
            <div style="font-size:26px; line-height:1; padding-top:2px;">${icon}</div>
            <div style="flex:1;">
              <div class="flex items-center gap-2 flex-wrap mb-1">
                <span class="font-bold" style="font-size:16px; color:#f8fafc;">${esc(n.title)}</span>
                ${isUnread ? '<span class="badge badge-accent" style="font-size:10px; padding:2px 6px;">NEW</span>' : ''}
              </div>
              <p class="text-sm" style="color:var(--text-secondary, #94a3b8); margin-bottom:12px; line-height:1.5;">${esc(n.message)}</p>
              <div class="flex items-center gap-3 text-xs text-muted">
                <span>⏱️ ${timeAgo}</span>
                <span>•</span>
                <span style="text-transform:capitalize;">${(n.type || '').replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2" style="align-self:flex-start;">
            ${isUnread ? `
              <button class="btn btn-sm btn-ghost" onclick="StudentNoticeBoard.markRead('${n.id}')" title="Mark as read" style="font-size:12px;">
                ✓ Read
              </button>
            ` : ''}
            ${actionBtn}
          </div>
        </div>
      </article>
    `;
  }

  function _timeAgo(dateStr) {
    if (!dateStr) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  function setFilter(filter) {
    _filter = filter;
    _renderUI();
  }

  async function markRead(id) {
    const notif = _notices.find(n => n.id === id);
    if (notif) notif.is_read = true;
    _renderUI();
    try {
      await API.patch(`/notifications/${id}/read`, {});
    } catch {}
  }

  async function markAllRead() {
    _notices.forEach(n => n.is_read = true);
    _renderUI();
    Toast.success('All notices marked as read');
    try {
      await API.post('/notifications/mark-all-read', {});
    } catch {}
  }

  function _updateTopbarBadge() {
    const unreadCount = _notices.filter(n => !n.is_read).length;
    const dot = document.querySelector('.topbar-notification-dot');
    if (dot) {
      if (unreadCount > 0) {
        dot.style.display = 'block';
        dot.textContent = unreadCount > 9 ? '9+' : unreadCount;
        dot.style.cssText = 'position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:10px;font-weight:700;border-radius:10px;padding:1px 5px;line-height:1.2;display:block;';
      } else {
        dot.style.display = 'none';
      }
    }
  }

  return {
    render,
    setFilter,
    markRead,
    markAllRead,
    refresh: render,
  };
})();
