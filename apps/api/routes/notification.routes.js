/* ============================================================
   CAMPUSGRID — Notification & Notice Board Routes
   Endpoints for student & user notifications, unread counts,
   and Server-Sent Events (SSE) live stream.
   ============================================================ */

const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const notifService = require('../services/notification.service');

// GET /api/v1/notifications/stream — Real-Time SSE Stream
router.get('/stream', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const cleanup = notifService.registerSSEConnection(req.user.id, res);

  req.on('close', cleanup);
});

// GET /api/v1/notifications — List notifications for user
router.get('/', authenticate, async (req, res) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const limit = parseInt(req.query.limit, 10) || 50;
    const notifications = await notifService.listUserNotifications(req.user.id, { unreadOnly, limit });

    res.json({
      success: true,
      data: notifications,
      meta: { total: notifications.length }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/notifications/unread-count — Quick unread count badge
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await notifService.getUnreadCount(req.user.id);
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/notifications/:id/read — Mark single notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await notifService.markAsRead(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/v1/notifications/mark-all-read — Mark all notifications as read
router.post('/mark-all-read', authenticate, async (req, res) => {
  try {
    await notifService.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
