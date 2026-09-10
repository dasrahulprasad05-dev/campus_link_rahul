# CAMPUSLINK

> Enterprise AI Placement Intelligence Platform  
> Scalable campus-to-corporate talent intelligence, readiness scoring, and placement automation.

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

## 🔟 The 10 Locked Platform Features

1. **Placement Readiness Scoring (ML)** — Multi-dimensional student readiness tracking with explainable factors.
2. **Explainable Skill-Gap Analysis (NLP)** — Skill ontology & entity extraction comparing student skills against target roles.
3. **Resume ↔ Job Description Semantic Matcher (NLP)** — Dense vector embeddings and cosine similarity scoring.
4. **AI Mock Interview Coach (LLM)** — Real-time STAR-method evaluation with structured feedback rubrics.
5. **Adaptive Question Generator (LLM)** — Dynamic role- and skill-gap-conditioned technical & behavioral questions.
6. **Drive Conflict Scheduler (Deterministic)** — Mathematical constraint satisfaction preventing venue and drive overlaps.
7. **Personalized Career Roadmap (Hybrid)** — Milestone-based progression with syllabus curriculum rules and tailored guidance.
8. **Recruiter Candidate Ranking Engine (ML)** — Multi-factor candidate ranking and shortlisting.
9. **Early Warning At-Risk Student System (ML)** — Automated classification flagging students in need of intervention.
10. **Placement Policy & Eligibility Q&A (RAG)** — Retrieval-augmented generation indexing university placement bylaws.

## 🧪 Running Tests

```bash
# Run all automated test suites (Auth, Database, RBAC, AI baselines)
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
