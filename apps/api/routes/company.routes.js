/* CAMPUSLINK — Company Routes */
const router = require('express').Router();
const demoData = require('../data/demo-data');

router.get('/', (req, res) => {
  res.json({ success: true, data: demoData.admin.companies });
});

router.post('/', (req, res) => {
  const { name, industry } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { message: 'Company name is required' } });
  const company = { name, industry: industry || 'Other', jobs: 0, hires: 0, status: 'new' };
  demoData.admin.companies.push(company);
  res.status(201).json({ success: true, data: company });
});

module.exports = router;
