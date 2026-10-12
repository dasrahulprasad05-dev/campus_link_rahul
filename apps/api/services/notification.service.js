/* ============================================================
   CAMPUSGRID — Real-Time Notification & Notice Board Service
   Supports in-memory fallback, database persistence,
   and Server-Sent Events (SSE) for instantaneous real-time alerts.
   ============================================================ */

const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/pool');

// In-memory fallback notification store (seeds initial announcements)
const _notifications = [
  {
    id: 'notif-001',
    user_id: 'all_students',
    type: 'drive_announced',
    title: '📅 TechNova Campus Placement Drive Scheduled',
    message: 'TechNova Solutions is conducting campus drive on Oct 24, 2026 at Campus Auditorium Hall A. Eligible branches: CSE, IT. Min CGPA: 7.0.',
    metadata: { company: 'TechNova Solutions', date: '2026-10-24' },
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'notif-002',
    user_id: 'all_students',
    type: 'job_posted',
    title: '🚀 CloudScale Systems is Hiring: DevOps Engineer',
    message: 'New job posting for DevOps Engineer (CTC: ₹9.5 LPA). Requires Docker, Kubernetes, AWS. Check Jobs section to apply before deadline.',
    metadata: { company: 'CloudScale Systems', role: 'DevOps Engineer' },
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'notif-003',
    user_id: 'all_students',
    type: 'system_alert',
    title: '📋 Resume Screening Window Open',
    message: 'Please review your skills and target role in your student profile before upcoming recruiter shortlisting rounds.',
    metadata: {},
    is_read: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// Active SSE client connections map: userId -> Set<Response>
const _sseClients = new Map();

/**
 * Register a client's SSE connection for real-time push alerts
 */
function registerSSEConnection(userId, res) {
  if (!_sseClients.has(userId)) {
    _sseClients.set(userId, new Set());
  }
  _sseClients.get(userId).add(res);

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

  // Periodic keep-alive ping (avoids proxy/browser connection timeout)
  const interval = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch {
      clearInterval(interval);
    }
  }, 25000);

  reqCloseHandler = () => {
    clearInterval(interval);
    const clients = _sseClients.get(userId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) _sseClients.delete(userId);
    }
  };

  return reqCloseHandler;
}

/**
 * Push an event to active SSE clients
 */
function _pushSSE(targetUserId, payload) {
  const message = `data: ${JSON.stringify(payload)}\n\n`;

  // Direct user connections
  if (targetUserId && targetUserId !== 'all_students') {
    const clients = _sseClients.get(targetUserId);
    if (clients) {
      clients.forEach(res => {
        try { res.write(message); } catch {}
      });
    }
  }

  // If broadcast, send to all currently connected clients
  if (targetUserId === 'all_students') {
    _sseClients.forEach(clientSet => {
      clientSet.forEach(res => {
        try { res.write(message); } catch {}
      });
    });
  }
}

/**
 * Create a new notification for a user or broadcast to all students
 */
async function createNotification({ userId = 'all_students', type = 'system_alert', title, message, metadata = {} }) {
  const notif = {
    id: uuidv4(),
    user_id: userId,
    type,
    title,
    message,
    metadata,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // Add to in-memory store
  _notifications.unshift(notif);

  // Also try to insert into PostgreSQL notifications table if database exists
  try {
    await query(
      `INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [notif.id, userId === 'all_students' ? null : userId, type, title, message, JSON.stringify(metadata), false, notif.created_at]
    );
  } catch (err) {
    // Falls back gracefully to memory store
  }

  // Push SSE real-time event to connected browser tabs
  _pushSSE(userId, notif);

  return notif;
}

/**
 * Broadcast notification to all students (e.g. new job or placement drive)
 */
async function broadcastToStudents({ type, title, message, metadata = {} }) {
  return createNotification({
    userId: 'all_students',
    type,
    title,
    message,
    metadata,
  });
}

/**
 * Get all notifications relevant for a user (their direct notifications + broadcast announcements)
 */
async function listUserNotifications(userId, { unreadOnly = false, limit = 50 } = {}) {
  // Query DB first if connected
  try {
    const dbRes = await query(
      `SELECT * FROM notifications 
       WHERE (user_id = $1 OR user_id IS NULL)
       ${unreadOnly ? 'AND is_read = false' : ''}
       ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    if (dbRes && dbRes.rows && dbRes.rows.length > 0) {
      return dbRes.rows.map(r => ({
        ...r,
        metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {})
      }));
    }
  } catch (err) {
    // Fall back to in-memory store
  }

  // Filter in-memory
  return _notifications
    .filter(n => (n.user_id === userId || n.user_id === 'all_students') && (!unreadOnly || !n.is_read))
    .slice(0, limit);
}

/**
 * Mark a single notification as read
 */
async function markAsRead(notificationId, userId) {
  const notif = _notifications.find(n => n.id === notificationId);
  if (notif) notif.is_read = true;

  try {
    await query('UPDATE notifications SET is_read = true WHERE id = $1', [notificationId]);
  } catch {}

  return { success: true };
}

/**
 * Mark all notifications as read for a user
 */
async function markAllAsRead(userId) {
  _notifications.forEach(n => {
    if (n.user_id === userId || n.user_id === 'all_students') {
      n.is_read = true;
    }
  });

  try {
    await query('UPDATE notifications SET is_read = true WHERE user_id = $1 OR user_id IS NULL', [userId]);
  } catch {}

  return { success: true };
}

/**
 * Get count of unread notifications for user
 */
async function getUnreadCount(userId) {
  const notifs = await listUserNotifications(userId, { unreadOnly: true });
  return notifs.length;
}

module.exports = {
  registerSSEConnection,
  createNotification,
  broadcastToStudents,
  listUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
