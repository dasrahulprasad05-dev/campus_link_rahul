/* ============================================================
   CAMPUSLINK — Offer Routes
   Offer lifecycle: list, accept/decline, document management.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { logAudit } = require('../middleware/audit');
const { query } = require('../db/pool');

// GET /api/v1/offers — list offers (student sees own, admin/recruiter sees all)
router.get('/', authenticate, async (req, res) => {
  try {
    let offers;
    if (req.user.role === 'student') {
      // Find student profile ID from user ID
      const profileResult = await query('SELECT * FROM student_profiles WHERE user_id = $1', [req.user.id]);
      const profileId = profileResult.rows[0]?.id;
      if (!profileId) return res.json({ success: true, data: [] });
      offers = await query('SELECT * FROM offers WHERE student_id = $1', [profileId]);
    } else {
      offers = await query('SELECT * FROM offers', []);
    }
    res.json({ success: true, data: offers.rows || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/offers/:id — get offer details with documents
router.get('/:id', authenticate, async (req, res) => {
  try {
    const offerResult = await query('SELECT * FROM offers WHERE id = $1', [req.params.id]);
    if (offerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }
    const offer = offerResult.rows[0];

    // Get documents for this offer
    const docsResult = await query('SELECT * FROM offer_documents WHERE offer_id = $1', [offer.id]);

    res.json({
      success: true,
      data: { ...offer, documents: docsResult.rows || [] },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/offers/:id/accept — student accepts offer
router.patch('/:id/accept', authenticate, authorize('student'), async (req, res) => {
  try {
    const result = await query('UPDATE offers SET status = $1 WHERE id = $2', ['accepted', req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }
    logAudit({ userId: req.user.id, userRole: 'student', action: 'offer.accept', entityType: 'offer', entityId: req.params.id, newValue: { status: 'accepted' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/offers/:id/decline — student declines offer
router.patch('/:id/decline', authenticate, authorize('student'), async (req, res) => {
  try {
    const result = await query('UPDATE offers SET status = $1 WHERE id = $2', ['declined', req.params.id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Offer not found' } });
    }
    logAudit({ userId: req.user.id, userRole: 'student', action: 'offer.decline', entityType: 'offer', entityId: req.params.id, newValue: { status: 'declined' } });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// PATCH /api/v1/offers/:id/documents/:docId — update document status
router.patch('/:id/documents/:docId', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const result = await query('UPDATE offer_documents SET status = $1 WHERE id = $2', [status, req.params.docId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }
    logAudit({ userId: req.user.id, userRole: req.user.role, action: `document.${status}`, entityType: 'offer_document', entityId: req.params.docId, newValue: { status } });
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
