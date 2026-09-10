/* ============================================================
   CAMPUSLINK — Placement Drive Routes
   Manage recruitment drives with drive repository and RBAC.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const driveRepo = require('../repositories/drive.repository');
const demoData = require('../data/demo-data');

// GET /api/v1/drives — list placement drives
router.get('/', async (req, res) => {
  try {
    const drives = await driveRepo.listDrives();
    res.json({
      success: true,
      data: drives.length ? drives : demoData.admin.drives
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/v1/drives — create drive (Strictly Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { company, role, date, venue, eligible } = req.body;
    if (!company || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Company and role are required' }
      });
    }

    const drive = await driveRepo.createDrive({
      company,
      role,
      date: date || 'TBD',
      venue: venue || 'Seminar Hall A',
      eligible: eligible || 0,
      applied: 0,
      status: 'scheduled',
    });

    res.status(201).json({ success: true, data: drive });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
