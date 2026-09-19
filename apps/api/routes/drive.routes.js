/* ============================================================
   CAMPUSLINK — Placement Drive Routes
   Manage recruitment drives with drive repository and RBAC.
   All data comes from the database — no demo data fallbacks.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const driveRepo = require('../repositories/drive.repository');

// GET /api/v1/drives — list placement drives
router.get('/', async (req, res) => {
  try {
    const drives = await driveRepo.listDrives();
    res.json({
      success: true,
      data: drives || []
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/v1/drives — create drive (Strictly Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { company, role, date, drive_date, venue, min_cgpa, branches } = req.body;
    if (!company || !role) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Company and role are required' }
      });
    }

    const rawDate = drive_date || date;
    let validDriveDate;
    if (rawDate && !isNaN(new Date(rawDate).getTime())) {
      validDriveDate = new Date(rawDate).toISOString();
    } else {
      validDriveDate = new Date(Date.now() + 14 * 86400000).toISOString();
    }

    const drive = await driveRepo.createDrive({
      company,
      role,
      drive_date: validDriveDate,
      venue: venue || 'Auditorium Hall A',
      min_cgpa: min_cgpa || 0,
      branches: Array.isArray(branches) ? branches : (branches ? branches.split(',').map(b => b.trim()) : []),
      status: 'scheduled',
    });

    res.status(201).json({ success: true, data: drive });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
