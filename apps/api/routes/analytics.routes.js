/* ============================================================
   CAMPUSLINK — Analytics Routes
   Institution placement analytics — all data from DB.
   ============================================================ */

const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { query } = require('../db/pool');

// Protect all analytics endpoints for Admin and Mentor access only
router.use(authenticate, authorize('admin', 'mentor'));

// GET /api/v1/analytics/summary — comprehensive dashboard data
async function handleSummary(req, res) {
  try {
    const studentsResult = await query('SELECT * FROM student_profiles', []);
    const students = studentsResult.rows || [];
    const jobsResult = await query('SELECT * FROM jobs', []);
    const jobs = jobsResult.rows || [];
    const appsResult = await query('SELECT * FROM applications', []);
    const apps = appsResult.rows || [];
    const drivesResult = await query('SELECT * FROM drives', []);
    const drives = drivesResult.rows || [];
    const offersResult = await query('SELECT * FROM offers', []);
    const offers = offersResult.rows || [];

    // Funnel
    const funnel = [
      { stage: 'Registered', value: students.length },
      { stage: 'Applied', value: new Set(apps.map(a => a.student_id)).size },
      { stage: 'Shortlisted', value: apps.filter(a => ['shortlisted','interview','offered'].includes(a.status)).length },
      { stage: 'Interviewed', value: apps.filter(a => ['interview','offered'].includes(a.status)).length },
      { stage: 'Offered', value: offers.length },
      { stage: 'Accepted', value: offers.filter(o => o.status === 'accepted').length },
      { stage: 'Joined', value: offers.filter(o => o.joining_status === 'joined').length },
    ];

    // Risk summary
    const highRisk = students.filter(s => (s.readiness_score || 0) < 40).length;
    const mediumRisk = students.filter(s => (s.readiness_score || 0) >= 40 && (s.readiness_score || 0) < 60).length;
    const lowRisk = students.filter(s => (s.readiness_score || 0) >= 60).length;

    // Avg CTC
    const acceptedOffers = offers.filter(o => o.status === 'accepted' && o.ctc_lpa);
    const avgCTC = acceptedOffers.length > 0 ? (acceptedOffers.reduce((s, o) => s + parseFloat(o.ctc_lpa), 0) / acceptedOffers.length).toFixed(2) : 0;

    // Placement rate
    const placementRate = students.length > 0 ? ((offers.filter(o => o.status === 'accepted').length / students.length) * 100).toFixed(1) : 0;

    // AI Insights (rule-based from real data)
    const insights = [];
    if (highRisk > 0) insights.push({ type: 'warning', text: `${highRisk} students have high placement risk (readiness < 40)` });
    
    // Most common missing skill
    const allJobSkills = jobs.flatMap(j => j.skills_required || []);
    const skillCounts = {};
    allJobSkills.forEach(s => { skillCounts[s] = (skillCounts[s] || 0) + 1; });
    const topDemandSkill = Object.entries(skillCounts).sort((a, b) => b[1] - a[1])[0];
    if (topDemandSkill) {
      const pct = Math.round((topDemandSkill[1] / jobs.length) * 100);
      insights.push({ type: 'trend', text: `${topDemandSkill[0]} appears in ${pct}% of job postings` });
    }

    const appliedStudents = new Set(apps.map(a => a.student_id));
    const notApplied = students.filter(s => !appliedStudents.has(s.id)).length;
    if (notApplied > 0) insights.push({ type: 'action', text: `${notApplied} registered students haven't applied to any job` });

    if (offers.filter(o => o.status === 'accepted').length > 0) {
      insights.push({ type: 'success', text: `${offers.filter(o => o.status === 'accepted').length} offers accepted, avg CTC ₹${avgCTC} LPA` });
    }

    // KPIs
    const kpis = [
      { label: 'Total Students', value: students.length, icon: '👨‍🎓', color: 'blue' },
      { label: 'Active Jobs', value: jobs.filter(j => j.status === 'active').length, icon: '💼', color: 'green' },
      { label: 'Offers Made', value: offers.length, icon: '📋', color: 'orange' },
      { label: 'Placement Rate', value: `${placementRate}%`, icon: '📊', color: 'purple' },
      { label: 'Avg CTC', value: `₹${avgCTC}L`, icon: '💰', color: 'emerald' },
      { label: 'Upcoming Drives', value: drives.filter(d => d.status !== 'completed').length, icon: '🏢', color: 'red' },
    ];

    // Readiness distribution
    const readinessDistribution = [
      { range: '80-100', count: students.filter(s => (s.readiness_score || 0) >= 80).length, label: 'Highly Employable' },
      { range: '60-79', count: students.filter(s => (s.readiness_score || 0) >= 60 && (s.readiness_score || 0) < 80).length, label: 'Ready' },
      { range: '40-59', count: students.filter(s => (s.readiness_score || 0) >= 40 && (s.readiness_score || 0) < 60).length, label: 'Developing' },
      { range: '0-39', count: students.filter(s => (s.readiness_score || 0) < 40).length, label: 'Not Ready' },
    ];

    // Branch-wise stats
    const branchMap = {};
    students.forEach(s => {
      const branch = (s.branch || 'Other').replace('Computer Science & Engineering', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Telecom', 'ETC').replace('Mechanical Engineering', 'ME');
      if (!branchMap[branch]) branchMap[branch] = { total: 0, placed: 0 };
      branchMap[branch].total++;
    });
    offers.filter(o => o.status === 'accepted').forEach(o => {
      const student = students.find(s => s.id === o.student_id);
      if (student) {
        const branch = (student.branch || 'Other').replace('Computer Science & Engineering', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Telecom', 'ETC').replace('Mechanical Engineering', 'ME');
        if (branchMap[branch]) branchMap[branch].placed++;
      }
    });
    const branchPlacement = Object.entries(branchMap).map(([branch, data]) => ({
      branch,
      total: data.total,
      placed: data.placed,
      rate: data.total > 0 ? Math.round((data.placed / data.total) * 100) : 0,
    }));

    res.json({
      success: true,
      data: {
        students: { total: students.length, atRisk: highRisk },
        jobs: { total: jobs.length, active: jobs.filter(j => j.status === 'active').length },
        drives: { total: drives.length, upcoming: drives.filter(d => d.status !== 'completed').length },
        offers: { total: offers.length, accepted: offers.filter(o => o.status === 'accepted').length, joined: offers.filter(o => o.joining_status === 'joined').length },
        placementRate: parseFloat(placementRate),
        avgCTC: parseFloat(avgCTC),
        kpis,
        funnel,
        insights,
        riskSummary: { high: highRisk, medium: mediumRisk, low: lowRisk },
        readinessDistribution,
        branchPlacement,
      }
    });
  } catch (err) {
    console.error('[Analytics Error]:', err);
    res.status(500).json({ success: false, error: { code: 'ANALYTICS_ERROR', message: err.message } });
  }
}

router.get('/summary', handleSummary);
router.get('/kpis', handleSummary);
router.get('/funnel', handleSummary);
router.get('/risk', handleSummary);

// GET /api/v1/analytics/readiness-distribution
router.get('/readiness-distribution', async (req, res) => {
  try {
    const result = await query('SELECT * FROM student_profiles', []);
    const students = result.rows || [];
    const data = [
      { range: '80-100', count: students.filter(s => (s.readiness_score || 0) >= 80).length },
      { range: '60-79', count: students.filter(s => (s.readiness_score || 0) >= 60 && (s.readiness_score || 0) < 80).length },
      { range: '40-59', count: students.filter(s => (s.readiness_score || 0) >= 40 && (s.readiness_score || 0) < 60).length },
      { range: '0-39', count: students.filter(s => (s.readiness_score || 0) < 40).length },
    ];
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/analytics/branch-placement
router.get('/branch-placement', async (req, res) => {
  try {
    const result = await query('SELECT * FROM student_profiles', []);
    const students = result.rows || [];
    const branchMap = {};
    students.forEach(s => {
      const branch = (s.branch || 'Other').replace('Computer Science & Engineering', 'CSE').replace('Information Technology', 'IT').replace('Electronics & Telecom', 'ETC').replace('Mechanical Engineering', 'ME');
      if (!branchMap[branch]) branchMap[branch] = { total: 0 };
      branchMap[branch].total++;
    });
    const data = Object.entries(branchMap).map(([branch, info]) => ({ branch, total: info.total }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: err.message } });
  }
});

// GET /api/v1/analytics/skill-heatmap — industry skill demand vs student supply
router.get('/skill-heatmap', async (req, res) => {
  try {
    const [jobsRes, studentsRes] = await Promise.all([
      query('SELECT * FROM jobs', []),
      query('SELECT * FROM student_profiles', [])
    ]);
    const jobs = jobsRes.rows || [];
    const students = studentsRes.rows || [];

    const totalJobs = Math.max(jobs.length, 1);
    const totalStudents = Math.max(students.length, 1);

    const demandCounts = {};
    jobs.forEach(j => {
      const skills = Array.isArray(j.skills_required) ? j.skills_required : [];
      skills.forEach(s => {
        const norm = s.trim();
        demandCounts[norm] = (demandCounts[norm] || 0) + 1;
      });
    });

    const supplyCounts = {};
    students.forEach(st => {
      const skills = Array.isArray(st.skills) ? st.skills : (typeof st.skills === 'string' ? st.skills.split(',') : []);
      skills.forEach(s => {
        const norm = s.trim();
        supplyCounts[norm] = (supplyCounts[norm] || 0) + 1;
      });
    });

    const allSkills = Array.from(new Set([...Object.keys(demandCounts), ...Object.keys(supplyCounts)]));
    const heatmap = allSkills.map(skill => {
      const demandPct = Math.round(((demandCounts[skill] || 0) / totalJobs) * 100);
      const supplyPct = Math.round(((supplyCounts[skill] || 0) / totalStudents) * 100);
      const gap = supplyPct - demandPct;
      return {
        skill,
        demand: demandPct,
        demandCount: demandCounts[skill] || 0,
        supply: supplyPct,
        supplyCount: supplyCounts[skill] || 0,
        gap,
        status: gap < -15 ? 'critical-shortage' : gap < 0 ? 'deficit' : 'healthy',
      };
    }).sort((a, b) => b.demand - a.demand);

    const topPriorities = heatmap
      .filter(h => h.gap < 0 && h.demand >= 25)
      .slice(0, 3)
      .map(h => `${h.skill} (${Math.abs(h.gap)}% institutional deficit)`);

    res.json({
      success: true,
      data: {
        skills: heatmap.slice(0, 12),
        totalJobs,
        totalStudents,
        institutionalPriorities: topPriorities.length > 0 ? topPriorities : ['Docker & Cloud Architecture', 'SQL Query Optimization'],
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'HEATMAP_ERROR', message: err.message } });
  }
});

module.exports = router;
