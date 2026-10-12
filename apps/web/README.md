# CampusGrid 2.0 — Next.js Enterprise Frontend

Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 frontend for CampusGrid 2.0 Placement Intelligence platform.

## Architecture Highlights
- **Framework:** Next.js 16 (App Router), React 19, TypeScript 5.
- **Styling:** Tailwind CSS v4, glassmorphic dark palette (`#080c14`), Lucide icons.
- **State & Caching:** Zustand, TanStack React Query.
- **Real-Time Stream:** Server-Sent Events (SSE) integration for live student notifications.
- **Multi-Stakeholder Portals:**
  - 🎓 **Student Portal:** Readiness score, career path finder, text-only resume ATS matcher, STAR mock interviews, real-time notice board, multi-round stage tracking.
  - 🏛️ **TPO Admin:** Command center, drive creation with automatic student broadcasting, student directory, at-risk interventions, offer tracker, analytics.
  - 💼 **Recruiter Funnel:** Job postings, candidate compatibility matching, multi-round stage manager (Aptitude -> Tech R1 -> Tech R2 -> HR -> Offer).
  - 👨‍🏫 **Faculty Mentor:** Mentee tracking, milestone review, proactive interventions.
  - 🛡️ **Super Admin:** Staff verification queue (approve/reject TPO/Recruiter accounts) and system metrics.

## Zero Cloud Storage & Free-Tier Optimization
- **100% Text-Based Resume Matching:** No PDF/DOCX file uploads or expensive AWS S3/Cloudinary storage costs. Free-tier compatible.
- **Zero Rate Limiting:** High-concurrency campus lab Wi-Fi compatibility.

## Getting Started

```bash
cd apps/web
npm install
npm run dev
```

Build production bundle:
```bash
npm run build
```
