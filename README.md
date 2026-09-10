# CAMPUSLINK

> AI-Powered Campus-to-Corporate Placement Management Platform  
> BPUT Hackathon 2026 — Problem Statement 10

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm run setup

# 2. Start the server (serves frontend + API)
npm run dev

# 3. Open in browser
http://localhost:3000
```

### Demo Credentials

| Role       | Email                     | Password |
|-----------|---------------------------|----------|
| Student    | student@campuslink.in     | demo123  |
| Admin/TPO  | admin@campuslink.in       | demo123  |
| Recruiter  | recruiter@campuslink.in   | demo123  |
| Mentor     | mentor@campuslink.in      | demo123  |

Or click the quick-login buttons on the login page.

---

## 🏗️ Architecture

```
CAMPUS_LINK/
├── apps/
│   ├── web/              # Vanilla SPA (HTML/CSS/JS)
│   │   ├── css/          # Design system, layout, components
│   │   ├── js/           # Router, store, API client, pages
│   │   └── index.html    # App shell
│   ├── api/              # Node.js Express API
│   │   ├── routes/       # Modular REST routes
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Auth, validation
│   │   └── server.js     # Entry point
│   └── ai-service/       # Python FastAPI (ML/AI)
│       ├── main.py       # All endpoints
│       └── requirements.txt
├── infra/
│   └── db/               # PostgreSQL schema & seed
├── package.json          # Root monorepo scripts
└── .env.example          # Environment config template
```

## 🔟 Locked Features

1. **Readiness Score** — Explainable composite placement-readiness score
2. **Skill-Gap Analyzer** — Compare skills against target role
3. **Resume ↔ JD Matcher** — AI-powered resume analysis
4. **AI Candidate Matching** — Transparent ranking for recruiters
5. **Mock Interviews** — STAR-based practice with scoring
6. **Smart Scheduler** — Conflict-free drive scheduling
7. **At-Risk Detection** — Advisory signals for student support
8. **Career Roadmaps** — Milestone-based learning plans
9. **Admin Command Center** — Funnel, analytics, interventions
10. **Multi-Role Platform** — Student, Admin, Recruiter, Mentor portals

## 🧪 Running Tests

```bash
npm test
```

## 🤖 AI Service (Optional)

```bash
cd apps/ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## 📝 License

MIT © CAMPUSLINK Team
