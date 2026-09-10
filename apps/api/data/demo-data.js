/* ============================================================
   CAMPUSLINK — Demo / Seed Data
   Comprehensive realistic data for all roles.
   ============================================================ */

module.exports = {
  student: {
    kpis: [
      { label: 'Readiness Score', value: '78/100', delta: '↑ 6 pts this month', icon: '📊', color: 'blue' },
      { label: 'Applications', value: '12', delta: '4 active processes', icon: '📝', color: 'green' },
      { label: 'Interview Practice', value: '7', delta: '2 this week', icon: '🎤', color: 'orange' },
      { label: 'Roadmap Progress', value: '64%', delta: '3 milestones due', icon: '🗺️', color: 'red' },
    ],
    readiness: {
      score: 78,
      factors: [
        { label: 'Technical Skills', value: 82 },
        { label: 'Projects & Portfolio', value: 76 },
        { label: 'Academics (CGPA)', value: 74 },
        { label: 'Aptitude & Reasoning', value: 69 },
        { label: 'Profile Completeness', value: 91 },
      ],
    },
    skills: [
      { name: 'Advanced SQL', action: 'Complete window-functions module on LeetCode', priority: 'high' },
      { name: 'Power BI / Tableau', action: 'Publish one interactive dashboard project', priority: 'high' },
      { name: 'Business Communication', action: 'Practice 2 case-study response presentations', priority: 'medium' },
      { name: 'Statistical Modelling', action: 'Complete hypothesis testing course', priority: 'medium' },
    ],
    trend: [54, 59, 63, 66, 72, 78],
    trendLabels: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    jobs: [
      { id: 'job-1', title: 'Graduate Data Analyst', company: 'TechNova Solutions', location: 'Bhubaneswar', type: 'Full-time', deadline: 'Sep 18, 2026', match: 88, skills: ['SQL', 'Python', 'Power BI'] },
      { id: 'job-2', title: 'Business Intelligence Intern', company: 'AxisGrid Analytics', location: 'Hybrid', type: 'Internship', deadline: 'Sep 22, 2026', match: 81, skills: ['SQL', 'Excel', 'Tableau'] },
      { id: 'job-3', title: 'Junior Software Engineer', company: 'CloudCraft Tech', location: 'Bengaluru', type: 'Full-time', deadline: 'Sep 25, 2026', match: 73, skills: ['JavaScript', 'React', 'Node.js'] },
      { id: 'job-4', title: 'ML Research Intern', company: 'DeepSpark AI', location: 'Remote', type: 'Internship', deadline: 'Sep 30, 2026', match: 68, skills: ['Python', 'PyTorch', 'Statistics'] },
    ],
    applications: [
      { id: 'app-1', job: 'Graduate Data Analyst', company: 'TechNova Solutions', status: 'interview', appliedDate: 'Sep 2, 2026', round: 'Technical Round 2' },
      { id: 'app-2', job: 'BI Intern', company: 'AxisGrid Analytics', status: 'shortlisted', appliedDate: 'Sep 5, 2026', round: 'Aptitude Test' },
      { id: 'app-3', job: 'Data Engineer', company: 'Infosys', status: 'applied', appliedDate: 'Sep 8, 2026', round: 'Pending Review' },
      { id: 'app-4', job: 'SDE Intern', company: 'Wipro', status: 'offered', appliedDate: 'Aug 20, 2026', round: 'Offer Letter Sent' },
      { id: 'app-5', job: 'Analyst Trainee', company: 'TCS', status: 'rejected', appliedDate: 'Aug 15, 2026', round: 'Final Round' },
    ],
    roadmap: [
      { id: 1, title: 'Master SQL Fundamentals', desc: 'Complete joins, subqueries, and aggregation exercises', status: 'completed', due: 'Aug 15' },
      { id: 2, title: 'Build Portfolio Dashboard', desc: 'Create an interactive Power BI dashboard using real data', status: 'completed', due: 'Aug 30' },
      { id: 3, title: 'Practice Aptitude Tests', desc: 'Score 80%+ in 5 mock aptitude assessments', status: 'in-progress', due: 'Sep 15' },
      { id: 4, title: 'Mock Interview x3', desc: 'Complete 3 AI mock interviews with 70+ score', status: 'pending', due: 'Sep 25' },
      { id: 5, title: 'Advanced SQL & Window Functions', desc: 'Master CTEs, ranking functions, and optimization', status: 'pending', due: 'Oct 5' },
    ],
    profile: {
      name: 'Ananya Sharma', email: 'ananya.sharma@campuslink.in', regNo: 'UNIV2022CSE1042',
      branch: 'Computer Science & Engineering', year: 2026, cgpa: 8.42, targetRole: 'Data Analyst',
      phone: '+91 98765 43210', linkedin: 'linkedin.com/in/ananya-sharma', github: 'github.com/ananyasharma',
      skills: ['Python', 'SQL', 'Excel', 'Data Analysis', 'Communication', 'Statistics'],
      projects: [
        { name: 'Sales Forecasting Dashboard', tech: 'Python, Power BI, SQL', desc: 'Built predictive dashboard reducing forecast error by 15%' },
        { name: 'Student Attendance Tracker', tech: 'React, Node.js, PostgreSQL', desc: 'Full-stack web app used by 200+ students' },
      ],
      certifications: ['Google Data Analytics Certificate', 'AWS Cloud Practitioner'],
    },
  },

  admin: {
    kpis: [
      { label: 'Eligible Students', value: '842', delta: '78% profile complete', icon: '👥', color: 'blue' },
      { label: 'Active Drives', value: '14', delta: '5 this month', icon: '🏢', color: 'green' },
      { label: 'Total Offers', value: '126', delta: '↑ 18% vs last cycle', icon: '🎉', color: 'orange' },
      { label: 'Placement Rate', value: '62%', delta: 'Target: 74%', icon: '📈', color: 'red' },
    ],
    risk: [
      { name: 'Rohan Patel', branch: 'CSE · 2026', reason: 'Readiness declined 9 points in 30 days', severity: 'high', score: 52 },
      { name: 'Meera Sahoo', branch: 'IT · 2026', reason: 'Profile and aptitude sections incomplete', severity: 'medium', score: 61 },
      { name: 'Aman Kumar', branch: 'ETC · 2026', reason: 'No platform activity for 21 days', severity: 'medium', score: 58 },
      { name: 'Priya Das', branch: 'CSE · 2026', reason: 'Failed 3 consecutive aptitude tests', severity: 'high', score: 45 },
    ],
    drives: [
      { company: 'TechNova Solutions', role: 'Graduate Data Analyst', date: 'Sep 18, 2026', eligible: 284, applied: 198, status: 'scheduled', venue: 'Seminar Hall A' },
      { company: 'CloudCraft Tech', role: 'Associate Engineer', date: 'Sep 21, 2026', eligible: 416, applied: 312, status: 'confirmed', venue: 'Main Auditorium' },
      { company: 'AxisGrid Analytics', role: 'BI Intern', date: 'Sep 24, 2026', eligible: 198, applied: 0, status: 'draft', venue: 'TBD' },
      { company: 'Infosys', role: 'Systems Engineer', date: 'Oct 1, 2026', eligible: 520, applied: 0, status: 'draft', venue: 'TBD' },
    ],
    funnel: [
      { stage: 'Eligible', value: 842, pct: 100 },
      { stage: 'Applied', value: 654, pct: 78 },
      { stage: 'Aptitude', value: 486, pct: 58 },
      { stage: 'Interview', value: 328, pct: 39 },
      { stage: 'Offered', value: 219, pct: 26 },
      { stage: 'Placed', value: 152, pct: 18 },
    ],
    students: [
      { name: 'Ananya Sharma', branch: 'CSE', cgpa: 8.42, readiness: 78, status: 'active', applications: 12 },
      { name: 'Vikram Rao', branch: 'IT', cgpa: 7.89, readiness: 82, status: 'active', applications: 8 },
      { name: 'Soham Das', branch: 'ETC', cgpa: 7.65, readiness: 71, status: 'active', applications: 5 },
      { name: 'Rohan Patel', branch: 'CSE', cgpa: 7.12, readiness: 52, status: 'at-risk', applications: 2 },
      { name: 'Meera Sahoo', branch: 'IT', cgpa: 8.01, readiness: 61, status: 'needs-support', applications: 3 },
      { name: 'Priya Das', branch: 'CSE', cgpa: 6.78, readiness: 45, status: 'at-risk', applications: 1 },
    ],
    companies: [
      { name: 'TechNova Solutions', industry: 'IT Services', jobs: 3, hires: 12, status: 'active' },
      { name: 'CloudCraft Tech', industry: 'Cloud & DevOps', jobs: 2, hires: 8, status: 'active' },
      { name: 'AxisGrid Analytics', industry: 'Data Analytics', jobs: 1, hires: 0, status: 'new' },
      { name: 'Infosys', industry: 'IT Services', jobs: 4, hires: 24, status: 'active' },
      { name: 'Wipro', industry: 'IT Services', jobs: 2, hires: 18, status: 'active' },
    ],
  },

  recruiter: {
    kpis: [
      { label: 'Active Jobs', value: '4', delta: '2 close this week', icon: '💼', color: 'blue' },
      { label: 'Matched Candidates', value: '186', delta: 'Eligibility applied', icon: '🎯', color: 'green' },
      { label: 'Shortlisted', value: '42', delta: '23% conversion', icon: '⭐', color: 'orange' },
      { label: 'Interviews', value: '18', delta: 'Next: Sep 14', icon: '📅', color: 'red' },
    ],
    candidates: [
      { name: 'Ananya Sharma', branch: 'CSE · 2026', match: 91, evidence: 'SQL, Python, dashboard project, Google Analytics cert', skills: ['SQL', 'Python', 'Power BI', 'Communication'], cgpa: 8.42 },
      { name: 'Vikram Rao', branch: 'IT · 2026', match: 87, evidence: 'Python, analytics internship at DataPulse, stats coursework', skills: ['Python', 'R', 'Statistics', 'Excel'], cgpa: 7.89 },
      { name: 'Soham Das', branch: 'ETC · 2026', match: 82, evidence: 'SQL, statistics foundation, Power BI dashboard project', skills: ['SQL', 'Statistics', 'Power BI'], cgpa: 7.65 },
      { name: 'Priti Mohanty', branch: 'CSE · 2026', match: 79, evidence: 'Python, basic SQL, machine learning project', skills: ['Python', 'SQL', 'ML'], cgpa: 8.15 },
    ],
    jobs: [
      { id: 'rj-1', title: 'Graduate Data Analyst', applications: 198, shortlisted: 24, interviewed: 8, status: 'active' },
      { id: 'rj-2', title: 'BI Intern', applications: 89, shortlisted: 12, interviewed: 4, status: 'active' },
      { id: 'rj-3', title: 'Junior ML Engineer', applications: 45, shortlisted: 6, interviewed: 0, status: 'screening' },
    ],
  },

  mentor: {
    kpis: [
      { label: 'Assigned Students', value: '24', delta: '21 active this week', icon: '👨‍🏫', color: 'blue' },
      { label: 'Reviews Due', value: '3', delta: 'Before Sep 14', icon: '📋', color: 'orange' },
      { label: 'Avg. Readiness', value: '71', delta: '↑ 4 points', icon: '📊', color: 'green' },
      { label: 'Upcoming Interviews', value: '6', delta: 'Next 14 days', icon: '🎙️', color: 'red' },
    ],
    students: [
      { name: 'Ananya Sharma', score: 78, trend: 'up', next: 'Review Data Analyst roadmap milestones', lastActive: '2 hours ago' },
      { name: 'Rohan Patel', score: 52, trend: 'down', next: 'Schedule intervention check-in meeting', lastActive: '3 days ago' },
      { name: 'Meera Sahoo', score: 61, trend: 'stable', next: 'Approve revised project milestone', lastActive: '1 day ago' },
      { name: 'Vikram Rao', score: 82, trend: 'up', next: 'Provide mock interview feedback', lastActive: '5 hours ago' },
      { name: 'Soham Das', score: 71, trend: 'up', next: 'Review SQL assessment results', lastActive: '1 day ago' },
    ],
    roadmapReviews: [
      { student: 'Rohan Patel', role: 'Software Engineer', milestones: 8, completed: 2, urgency: 'high' },
      { student: 'Meera Sahoo', role: 'Data Analyst', milestones: 6, completed: 3, urgency: 'medium' },
      { student: 'Priya Das', role: 'Web Developer', milestones: 5, completed: 1, urgency: 'high' },
    ],
  },
};
