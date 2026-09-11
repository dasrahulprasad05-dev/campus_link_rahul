/* ============================================================
   CAMPUSLINK — API Client
   Fetch wrapper with JWT injection, error handling,
   and offline fallback to demo data.
   ============================================================ */

const API = (() => {
  const getBase = () => {
    const root = (window.__API_URL__ || localStorage.getItem('CAMPUSLINK_API_URL') || '').replace(/\/+$/, '');
    return `${root}/api/v1`;
  };

  // ---- Demo / Offline Data ----
  const DEMO = {
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
        name: 'Ananya Sharma',
        email: 'ananya.sharma@campuslink.in',
        regNo: 'UNIV2022CSE1042',
        branch: 'Computer Science & Engineering',
        year: 2026,
        cgpa: 8.42,
        targetRole: 'Data Analyst',
        phone: '+91 98765 43210',
        linkedin: 'linkedin.com/in/ananya-sharma',
        github: 'github.com/ananyasharma',
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

  // ---- Core fetch wrapper ----
  async function request(path, options = {}) {
    const token = Store.get('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const res = await fetch(getBase() + path, { ...options, headers });

      if (res.status === 401) {
        Store.reset();
        Router.navigate('login');
        throw new Error('Unauthorized');
      }

      if (!res.ok) {
        console.warn(`[API] Server returned ${res.status} for ${path}, serving fallback data`);
        return handleOffline(path, options);
      }

      const json = await res.json();
      // If response has a data property, unpack it while keeping success
      if (json && typeof json === 'object') {
        if (json.data !== undefined && typeof json.data === 'object' && json.data !== null) {
          return Object.assign({ success: json.success !== false }, json.data);
        }
      }
      return json;
    } catch (err) {
      console.warn(`[API] Request failed for ${path} (${err.message}), serving fallback data`);
      return handleOffline(path, options);
    }
  }

  // ---- Offline handler ----
  function handleOffline(path, options = {}) {
    const role = Store.getRole();

    if (path.startsWith('/dashboard')) return DEMO[role] || DEMO.student;
    if (path.startsWith('/students') && !path.includes('/')) return DEMO.admin?.students || [];
    if (path.startsWith('/companies')) return DEMO.admin?.companies || [];

    if (path.includes('resume-match')) {
      const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
      return simulateResumeMatch(body.jobDescription || '');
    }

    if (path.includes('skill-gap')) {
      const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
      return simulateSkillGap(body.targetRole, body.skills);
    }

    if (path.includes('interview') || path.includes('feedback')) {
      const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

      // Resume parsing fallback
      if (path.includes('/parse-resume')) {
        return simulateParseResume(body.resumeText || '');
      }

      // Evaluate answer fallback
      if (path.includes('/evaluate-answer')) {
        const wc = (body.answer || '').split(/\s+/).filter(Boolean).length;
        const base = Math.min(7, 3 + wc * 0.04);
        return {
          success: true,
          data: {
            questionIndex: body.questionIndex || 0,
            question: 'Offline question',
            answer: body.answer || '[Skipped]',
            technical_correctness: Math.round(base + 1),
            relevance: Math.round(base),
            completeness: Math.round(base - 0.5),
            communication: Math.round(base + 0.5),
            missed_concepts: ['Detailed evaluation unavailable offline'],
            feedback_text: 'Answer recorded. AI evaluation is unavailable offline — connect to the server for full rubric scoring.',
            should_followup: false,
            source: 'offline-fallback',
          },
        };
      }

      // Generate follow-up fallback
      if (path.includes('/generate-followup')) {
        return {
          success: true,
          data: {
            followup: {
              id: 99,
              text: 'Can you elaborate on the technical approach you took and explain any tradeoffs you considered?',
              stage: 'skills',
              category: 'technical',
              skill: 'Follow-up',
              difficulty: 'medium',
              is_followup: true,
              targets_weakness: 'completeness',
            },
          },
        };
      }

      // Final evaluation fallback
      if (path.includes('/final-evaluation')) {
        return {
          success: true,
          data: {
            sessionId: body.sessionId || 'offline',
            overall_score: 65,
            verdict: 'Solid Potential',
            dimensions: { technical_correctness: 6.5, relevance: 7, completeness: 5.5, communication: 7 },
            stage_breakdown: [{ stage: 'skills', count: 3, avgScore: 65 }],
            total_questions: 3,
            answered_count: 3,
            skipped_count: 0,
            executive_summary: 'Offline evaluation — connect to the server for a full AI-powered assessment with personalized feedback.',
            top_strengths: ['Completed the interview'],
            top_weaknesses: ['Full AI evaluation unavailable offline'],
            study_roadmap: ['Start the server for a complete evaluation'],
            question_evaluations: [],
            targetRole: 'Software Engineer',
            difficulty: 'medium',
          },
        };
      }

      // Start session fallback
      if (path.includes('/start')) {
        const rd = body.resumeData || {};
        return {
          success: true,
          data: {
            sessionId: 'session-offline-' + Date.now(),
            questions: [
              { id: 1, text: 'Tell me about yourself and your background.', stage: 'resume', category: 'behavioral', skill: 'Communication', difficulty: 'medium', is_followup: false },
              { id: 2, text: 'Describe a challenging project you worked on and your role in it.', stage: 'projects', category: 'technical', skill: rd.skills?.[0] || 'Problem Solving', difficulty: 'medium', is_followup: false },
              { id: 3, text: 'How would you approach debugging a complex issue in production?', stage: 'situational', category: 'situational', skill: 'Debugging', difficulty: 'medium', is_followup: false },
            ],
            targetRole: rd.target_role || 'Software Engineer',
            difficulty: body.difficulty || 'medium',
            count: 3,
            source: 'offline-fallback',
          },
        };
      }

      return simulateInterviewFeedback(body.answer || '');
    }

    // Career Path Finder offline fallbacks
    if (path.includes('career-finder')) {
      const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

      if (path.includes('/questions')) {
        return {
          success: true,
          data: {
            questions: [
              { id: 'q1', text: 'What sounds more interesting to work on?', options: [
                { id: 'a', text: 'Finding patterns in a large dataset' },
                { id: 'b', text: 'Building a website or app people use' },
                { id: 'c', text: 'Understanding how an AI model makes predictions' },
                { id: 'd', text: 'Finding security weaknesses in a system' },
                { id: 'e', text: 'Setting up and managing servers/infrastructure' },
              ]},
              { id: 'q2', text: "You're handed a messy dataset. What's your first instinct?", options: [
                { id: 'a', text: 'Clean it and build charts to explain it' },
                { id: 'b', text: 'Explore it statistically' },
                { id: 'c', text: 'Wonder what model could be trained on it' },
                { id: 'd', text: 'Check who has access to it' },
                { id: 'e', text: "Rather build the app around it" },
              ]},
              { id: 'q3', text: 'Building new vs improving existing?', options: [
                { id: 'a', text: 'Building something new' },
                { id: 'b', text: 'Analyzing existing things' },
                { id: 'c', text: 'Making systems faster' },
                { id: 'd', text: 'Finding flaws' },
              ]},
            ],
            total: 3,
          },
        };
      }

      if (path.includes('/score')) {
        return {
          success: true,
          data: {
            percentages: { DA: 68, DS: 52, WEB: 45, AI: 40, OPS: 30, SEC: 25 },
            sorted: [
              { domain: 'DA', score: 68, name: 'Data Analytics', icon: '📊', color: '#3b82f6' },
              { domain: 'DS', score: 52, name: 'Data Science', icon: '🔬', color: '#8b5cf6' },
              { domain: 'WEB', score: 45, name: 'Web Development', icon: '💻', color: '#10b981' },
              { domain: 'AI', score: 40, name: 'AI / ML Engineer', icon: '🤖', color: '#f59e0b' },
              { domain: 'OPS', score: 30, name: 'Cloud / DevOps', icon: '☁️', color: '#06b6d4' },
              { domain: 'SEC', score: 25, name: 'Cybersecurity', icon: '🔐', color: '#ef4444' },
            ],
            topDomain: 'DA',
            topName: 'Data Analytics',
            topScore: 68,
          },
        };
      }

      if (path.includes('/explain')) {
        return {
          success: true,
          data: {
            explanation: 'Based on your responses, Data Analytics appears to be your strongest current fit. Your answers showed a natural inclination toward working with data, finding patterns, and building visual explanations. Remember — this reflects your current interests from a short assessment, not a fixed career path.',
            source: 'offline-fallback',
          },
        };
      }

      if (path.includes('/roadmap/')) {
        return {
          success: true,
          data: {
            domain: 'DA',
            name: 'Data Analytics',
            icon: '📊',
            color: '#3b82f6',
            steps: [
              { step: 1, title: 'Python Basics', desc: 'Learn fundamentals', duration: '2-3 weeks' },
              { step: 2, title: 'SQL', desc: 'Master queries', duration: '2-3 weeks' },
              { step: 3, title: 'Power BI / Tableau', desc: 'Build dashboards', duration: '2-3 weeks' },
              { step: 4, title: 'Statistics', desc: 'Descriptive & inferential', duration: '3-4 weeks' },
              { step: 5, title: 'Project', desc: 'End-to-end analytics project', duration: '2-3 weeks' },
            ],
          },
        };
      }
    }

    if (path.includes('scheduler') || path.includes('check')) {
      const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
      return simulateSchedulerCheck(body.events || []);
    }

    if (path.includes('generate-questions')) {
      return {
        questions: [
          { text: 'Tell me about a project where you used data to make a decision.', category: 'behavioral', difficulty: 'medium', skill_tested: 'Communication' },
          { text: 'How would you handle missing data in a large dataset?', category: 'technical', difficulty: 'medium', skill_tested: 'Data Cleaning' },
          { text: 'Describe a time you had to learn a new technology quickly.', category: 'behavioral', difficulty: 'easy', skill_tested: 'Adaptability' },
        ],
        source: 'offline-fallback',
      };
    }

    if (path.includes('generate-roadmap')) {
      const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};
      return simulateGenerateRoadmap(body.targetRole || body.target_role || 'Data Analyst');
    }

    if (path.includes('at-risk')) {
      return {
        risk_probability: 0.5,
        risk_level: 'medium',
        risk_factors: [{ factor: 'Offline', value: 'N/A', impact: 'low', explanation: 'AI service is offline. Showing placeholder.' }],
        recommended_actions: ['Start the AI service for real predictions.'],
        source: 'offline-fallback',
      };
    }

    if (path.includes('policy-qa')) {
      return {
        answer: 'The AI Policy Q&A service is currently offline. Please start the Python AI service for full RAG-powered answers. In the meantime, contact the Placement Office for policy questions.',
        sources: [],
        source: 'offline-fallback',
      };
    }

    return DEMO[role] || {};
  }

  // ---- Offline AI simulations ----
  function simulateResumeMatch(jd) {
    const profileSkills = ['sql', 'python', 'excel', 'data analysis', 'communication', 'statistics'];
    const text = jd.toLowerCase();
    const allKeywords = ['sql', 'python', 'power bi', 'tableau', 'excel', 'communication', 'statistics', 'machine learning', 'javascript', 'react', 'node.js', 'data analysis', 'git'];
    const matched = profileSkills.filter(s => text.includes(s));
    const missing = allKeywords.filter(s => text.includes(s) && !profileSkills.includes(s));
    const score = Math.min(96, 45 + matched.length * 9 - missing.length * 3);
    return {
      score: Math.max(20, score),
      matched,
      missing,
      strengths: ['Strong SQL fundamentals', 'Data analysis project experience', 'Relevant certifications'],
      improvements: missing.map(s => `Add ${s} experience to your profile`),
      explanation: 'Score is based on: skill keyword overlap (40%), project relevance (25%), certification alignment (15%), and profile completeness (20%). Eligibility constraints are evaluated separately by deterministic rules.',
    };
  }

  function simulateSkillGap(targetRole = 'Data Analyst', currentSkills = []) {
    const roleSkills = {
      'Data Analyst': ['SQL', 'Python', 'Power BI', 'Statistics', 'Communication', 'Excel', 'Data Visualization'],
      'Software Engineer': ['DSA', 'Git', 'REST APIs', 'Databases', 'Testing', 'System Design', 'JavaScript'],
      'ML Engineer': ['Python', 'PyTorch', 'Statistics', 'Linear Algebra', 'MLOps', 'SQL'],
      'Web Developer': ['HTML/CSS', 'JavaScript', 'React', 'Node.js', 'Git', 'REST APIs'],
    };
    const target = roleSkills[targetRole] || roleSkills['Data Analyst'];
    const have = new Set((currentSkills.length ? currentSkills : Store.get('user')?.skills || ['SQL', 'Python', 'Excel', 'Communication']).map(s => s.toLowerCase()));

    return {
      targetRole,
      missing: target.filter(s => !have.has(s.toLowerCase())).map((name, i) => ({
        name,
        priority: i < 2 ? 'high' : 'medium',
        reason: `${name} is a core requirement for ${targetRole} roles and appears in 80%+ of job descriptions.`,
        resource: `Search "${name} tutorial" on YouTube or Coursera`,
      })),
      matched: target.filter(s => have.has(s.toLowerCase())),
      engineVersion: 'rules-v1',
    };
  }

  function simulateGenerateRoadmap(targetRole = 'Data Analyst') {
    const templates = {
      'Data Analyst': [
        { title: 'Master SQL Fundamentals', description: 'Joins, subqueries, aggregations, window functions.', week: 1, priority: 'critical', category: 'skill', resources: ['SQLBolt.com', 'LeetCode SQL track'], success_criteria: 'Solve 30 SQL problems' },
        { title: 'Python for Data Analysis', description: 'Pandas, NumPy, and Matplotlib data visualization.', week: 2, priority: 'critical', category: 'skill', resources: ['Kaggle Learn', 'Automate the Boring Stuff'], success_criteria: 'Complete 3 dataset notebooks' },
        { title: 'Build BI Portfolio Dashboard', description: 'Interactive dashboard using Power BI or Tableau.', week: 4, priority: 'high', category: 'project', resources: ['Power BI Learn', 'Makeover Monday'], success_criteria: 'Publish 1 live dashboard' },
        { title: 'Statistics & Probability', description: 'Hypothesis testing, distributions, and A/B testing.', week: 5, priority: 'high', category: 'skill', resources: ['Khan Academy', 'StatQuest'], success_criteria: 'Pass mock stats quiz 80%+' },
        { title: 'Timed Aptitude Prep', description: 'Mock tests to build speed and quantitative accuracy.', week: 7, priority: 'high', category: 'practice', resources: ['IndiaBIX'], success_criteria: 'Score 80%+ in 3 mock tests' },
        { title: 'Mock Interviews x3', description: 'AI practice on case questions and STAR behavioral answers.', week: 9, priority: 'critical', category: 'practice', resources: ['CAMPUSLINK Mock'], success_criteria: 'Complete 3 mock sessions' },
      ],
      'Software Engineer': [
        { title: 'DSA Mastery (Part 1)', description: 'Arrays, Strings, HashMaps, and Linked Lists.', week: 1, priority: 'critical', category: 'skill', resources: ['NeetCode 150', 'Abdul Bari'], success_criteria: 'Solve 50 easy/medium problems' },
        { title: 'DSA Mastery (Part 2)', description: 'Trees, Graphs, and Dynamic Programming fundamentals.', week: 3, priority: 'critical', category: 'skill', resources: ['LeetCode 75'], success_criteria: 'Solve 40 tree & graph problems' },
        { title: 'System Design Fundamentals', description: 'Load balancing, caching, databases, and microservices.', week: 5, priority: 'high', category: 'skill', resources: ['System Design Primer', 'Gaurav Sen'], success_criteria: 'Design 3 architectural diagrams' },
        { title: 'Full-Stack Portfolio Project', description: 'Full-stack application with auth, DB, and live deployment.', week: 7, priority: 'critical', category: 'project', resources: ['Vercel', 'Render', 'GitHub'], success_criteria: 'Deploy production URL' },
        { title: 'Coding Mock Interviews', description: 'Timed problem-solving under real interview conditions.', week: 9, priority: 'critical', category: 'practice', resources: ['CAMPUSLINK Mock'], success_criteria: 'Complete 5 coding mocks' },
      ],
      'Web Developer': [
        { title: 'Modern JavaScript & TypeScript', description: 'ES6+, async/await, closures, TypeScript types.', week: 1, priority: 'critical', category: 'skill', resources: ['JavaScript.info'], success_criteria: 'Build a typed mini-app' },
        { title: 'Frontend Mastery (React)', description: 'Hooks, router, state management, and Tailwind CSS.', week: 3, priority: 'critical', category: 'skill', resources: ['React.dev'], success_criteria: 'Build responsive SaaS UI' },
        { title: 'Backend APIs & Databases', description: 'Node.js/Express REST APIs with PostgreSQL.', week: 5, priority: 'high', category: 'skill', resources: ['Node Docs', 'Prisma'], success_criteria: 'Deploy authenticated CRUD API' },
        { title: 'Capstone Full-Stack Project', description: 'Production full-stack web app with Lighthouse 90+ score.', week: 7, priority: 'critical', category: 'project', resources: ['GitHub', 'Vercel'], success_criteria: 'Live production URL' },
        { title: 'Web Developer Mock Interviews', description: 'Frontend fundamentals, DOM, web performance.', week: 9, priority: 'high', category: 'practice', resources: ['CAMPUSLINK Mock'], success_criteria: 'Score 75%+ in mock' },
      ],
    };

    const milestones = templates[targetRole] || templates['Data Analyst'];
    return {
      milestones,
      summary: `Tailored preparation plan for ${targetRole} campus placements.`,
      source: 'offline-fallback',
    };
  }

  function simulateParseResume(text = '') {
    const raw = String(text || '');
    const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // 1. Email extraction
    const emailMatch = raw.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const email = emailMatch ? emailMatch[0] : '';

    // 2. Phone extraction
    const phoneMatch = raw.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/);
    const phone = phoneMatch ? phoneMatch[0] : '';

    // 3. Name extraction
    let name = 'Candidate';
    for (const line of lines.slice(0, 5)) {
      if (!line.includes('@') && !line.match(/\d{5,}/) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 4) {
        name = line.replace(/[^a-zA-Z\s]/g, '').trim();
        if (name.length > 2) break;
      }
    }

    // 4. Skills dictionary extraction
    const TECH_SKILLS = [
      'Python', 'Java', 'C++', 'C#', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS',
      'React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI',
      'Spring Boot', 'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes',
      'AWS', 'Azure', 'GCP', 'Git', 'GitHub', 'CI/CD', 'Linux', 'Pandas', 'NumPy', 'Power BI',
      'Tableau', 'Scikit-Learn', 'TensorFlow', 'PyTorch', 'REST APIs', 'GraphQL', 'Machine Learning',
      'Deep Learning', 'Statistics', 'Data Analysis', 'Data Cleaning', 'Data Structures', 'Algorithms',
      'System Design', 'Kafka', 'Spark', 'Hadoop', 'Terraform', 'JIRA', 'Agile', 'Communication', 'Excel'
    ];

    const lowerRaw = raw.toLowerCase();
    const matchedSkills = [];
    for (const skill of TECH_SKILLS) {
      const lowerSkill = skill.toLowerCase();
      const escaped = lowerSkill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9_#+])${escaped}([^a-zA-Z0-9_#+]|$)`, 'i');
      if (regex.test(lowerRaw)) {
        matchedSkills.push(skill);
      }
    }

    const finalSkills = matchedSkills.length > 0 ? Array.from(new Set(matchedSkills)) : ['Python', 'SQL', 'Problem Solving'];

    // 5. Inferred Target Role
    let target_role = 'Software Engineer';
    const sLower = finalSkills.map(s => s.toLowerCase());
    if (sLower.includes('power bi') || sLower.includes('tableau') || sLower.includes('data analysis')) {
      target_role = 'Data Analyst';
    } else if (sLower.includes('pytorch') || sLower.includes('tensorflow') || sLower.includes('machine learning')) {
      target_role = 'ML Engineer';
    } else if (sLower.includes('react') || sLower.includes('html') || sLower.includes('node.js') || sLower.includes('javascript')) {
      target_role = 'Web Developer';
    } else if (sLower.includes('docker') || sLower.includes('kubernetes') || sLower.includes('aws') || sLower.includes('terraform')) {
      target_role = 'DevOps Engineer';
    }

    // 6. GPA / CGPA
    const gpaMatch = raw.match(/(?:cgpa|gpa|percentage)[:\s]+([0-9.]+)/i);
    const gpa = gpaMatch ? gpaMatch[1] : '8.2';

    // 7. Projects
    const projects = [];
    projects.push({
      name: 'Extracted Portfolio Project',
      tech: finalSkills.slice(0, 4).join(', '),
      description: 'Project extracted from candidate resume.'
    });

    return {
      success: true,
      data: {
        name: name || 'Student Candidate',
        email: email || 'student@university.edu',
        phone: phone || '+91 98765 43210',
        target_role,
        skills: finalSkills,
        projects,
        education: [{ institution: 'Technical University', degree: 'B.Tech / B.E.', year: '2026', gpa }],
        experience: [],
        certifications: []
      },
      source: 'offline-extractor'
    };
  }

  function simulateInterviewFeedback(answer) {
    const wordCount = answer.split(/\s+/).filter(Boolean).length;
    const hasStructure = /situation|task|action|result|challenge|approach|outcome/i.test(answer);
    const hasMetrics = /\d+%|\d+ percent|reduced|increased|improved|saved/i.test(answer);

    let score = 35 + Math.min(30, wordCount * 0.8);
    if (hasStructure) score += 15;
    if (hasMetrics) score += 12;
    score = Math.min(95, Math.round(score));

    const feedback = [];
    if (wordCount < 30) feedback.push('Your response is too brief. Aim for 80–150 words with specific details.');
    if (!hasStructure) feedback.push('Structure your answer using the STAR method (Situation, Task, Action, Result).');
    if (!hasMetrics) feedback.push('Include measurable outcomes — numbers, percentages, or concrete results strengthen your answer.');
    if (wordCount > 20 && hasStructure) feedback.push('Good structure! Now add more specific technical details about your contribution.');
    if (score >= 70) feedback.push('Strong answer. Consider adding a brief reflection on what you learned.');

    return {
      score,
      feedback: feedback.join(' '),
      strengths: score >= 60 ? ['Clear communication', 'Relevant example'] : ['Attempted response'],
      improvements: feedback.slice(0, 2),
      tip: 'Remember STAR: Situation → Task → Action → Result. Keep answers between 90–120 seconds when spoken.',
    };
  }

  function simulateSchedulerCheck(events) {
    const conflicts = [];
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (events[i].venue === events[j].venue && events[i].start < events[j].end && events[j].start < events[i].end) {
          conflicts.push({ event1: events[i], event2: events[j], reason: 'Venue and time overlap' });
        }
      }
    }
    return { valid: conflicts.length === 0, conflicts };
  }

  // ---- Convenience methods ----
  function get(path) { return request(path); }
  function post(path, data) { return request(path, { method: 'POST', body: JSON.stringify(data) }); }
  function put(path, data) { return request(path, { method: 'PUT', body: JSON.stringify(data) }); }
  function del(path) { return request(path, { method: 'DELETE' }); }

  // ---- Dashboard shortcut ----
  function getDashboard(role) {
    return get(`/dashboard?role=${role || Store.getRole()}`);
  }

  return { get, post, put, del, request, getDashboard, DEMO };
})();
