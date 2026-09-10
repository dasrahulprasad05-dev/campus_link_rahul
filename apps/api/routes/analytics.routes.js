/* CAMPUSLINK — Analytics Routes */
const router = require('express').Router();
const demoData = require('../data/demo-data');

router.get('/funnel', (req, res) => {
  res.json({ success: true, data: demoData.admin.funnel });
});

router.get('/readiness-distribution', (req, res) => {
  res.json({ success: true, data: [
    { range: '90-100', count: 42 }, { range: '70-89', count: 128 },
    { range: '50-69', count: 286 }, { range: '30-49', count: 248 }, { range: '0-29', count: 138 },
  ]});
});

router.get('/branch-placement', (req, res) => {
  res.json({ success: true, data: [
    { branch: 'CSE', rate: 74 }, { branch: 'IT', rate: 68 }, { branch: 'ETC', rate: 55 },
    { branch: 'ME', rate: 48 }, { branch: 'CE', rate: 42 },
  ]});
});

router.get('/risk', (req, res) => {
  res.json({ success: true, data: demoData.admin.risk });
});

module.exports = router;
