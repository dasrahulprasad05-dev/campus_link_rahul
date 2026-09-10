/* ============================================================
   CAMPUSLINK — Company Routes
   Manage hiring companies with repository calls and RBAC.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const companyRepo = require('../repositories/company.repository');
const demoData = require('../data/demo-data');

// GET /api/v1/companies — list companies
router.get('/', async (req, res) => {
  try {
    const companies = await companyRepo.listCompanies();
    res.json({
      success: true,
      data: companies.length ? companies : demoData.admin.companies
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// POST /api/v1/companies — register company (Admin / Recruiter only)
router.post('/', authenticate, authorize('admin', 'recruiter'), async (req, res) => {
  try {
    const { name, industry } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Company name is required' }
      });
    }

    const company = await companyRepo.createCompany({ name, industry });
    res.status(201).json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

module.exports = router;
