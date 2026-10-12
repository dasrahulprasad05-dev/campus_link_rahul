/* ============================================================
   CAMPUSGRID — Placement Drive Routes
   Manage recruitment drives with drive repository and RBAC.
   All data comes from the database — no demo data fallbacks.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const driveRepo = require('../repositories/drive.repository');
const notifService = require('../services/notification.service');

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

// POST /api/v1/drives — create drive (Admin & Super Admin)
router.post('/', authenticate, authorize('admin', 'super_admin'), async (req, res) => {
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

    // Real-time broadcast notice to all students
    notifService.broadcastToStudents({
      type: 'drive_announced',
      title: `📅 Placement Drive Announced: ${drive.company}`,
      message: `${drive.company} has scheduled a campus drive for ${drive.role} on ${new Date(drive.drive_date).toLocaleDateString()} at ${drive.venue}. Check Drives section.`,
      metadata: { driveId: drive.id, company: drive.company, role: drive.role, date: drive.drive_date },
    }).catch(err => console.warn('[Notif] Drive broadcast error:', err.message));

    res.status(201).json({ success: true, data: drive });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
