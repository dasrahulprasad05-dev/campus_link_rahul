/* CAMPUSLINK — Drive Routes */
const router = require('express').Router();
const demoData = require('../data/demo-data');

router.get('/', (req, res) => {
  res.json({ success: true, data: demoData.admin.drives });
});

router.post('/', (req, res) => {
  const { company, role, date, venue } = req.body;
  if (!company || !role) return res.status(400).json({ success: false, error: { message: 'Company and role are required' } });
  const drive = { company, role, date: date || 'TBD', eligible: 0, applied: 0, status: 'draft', venue: venue || 'TBD' };
  demoData.admin.drives.push(drive);
  res.status(201).json({ success: true, data: drive });
});

module.exports = router;
