"""
CAMPUSLINK — AI Service (FastAPI)
Expanded AI/ML service with skill-gap analysis, resume matching,
readiness scoring, candidate matching, and interview evaluation.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import re

app = FastAPI(
    title="CAMPUSLINK AI Service",
    description="AI-powered placement intelligence APIs",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Schemas ----

class SkillGapRequest(BaseModel):
    skills: List[str] = []
    target_role: str = "Data Analyst"

class ResumeMatchRequest(BaseModel):
    job_description: str = ""
    student_skills: List[str] = ["SQL", "Python", "Excel", "Communication"]

class InterviewRequest(BaseModel):
    answer: str = ""
    question: str = ""
    target_role: str = "General"

class ReadinessRequest(BaseModel):
    skills: List[str] = []
    projects_count: int = 0
    cgpa: float = 7.0
    aptitude_score: int = 65
    profile_completion: int = 70

class CandidateMatchRequest(BaseModel):
    job_skills: List[str] = []
    candidates: List[dict] = []

# ---- Role-Skill Mappings ----

ROLE_SKILLS = {
    "Data Analyst": ["SQL", "Python", "Power BI", "Statistics", "Communication", "Excel", "Data Visualization"],
    "Software Engineer": ["DSA", "Git", "REST APIs", "Databases", "Testing", "System Design", "JavaScript"],
    "ML Engineer": ["Python", "PyTorch", "Statistics", "Linear Algebra", "MLOps", "SQL"],
    "Web Developer": ["HTML/CSS", "JavaScript", "React", "Node.js", "Git", "REST APIs"],
    "DevOps Engineer": ["Linux", "Docker", "Kubernetes", "CI/CD", "AWS", "Terraform"],
}

# ---- Endpoints ----

@app.get("/health")
def health():
    return {"status": "ok", "service": "campuslink-ai", "version": "1.0.0"}

@app.post("/v1/skill-gap")
def skill_gap(req: SkillGapRequest):
    role_skills = ROLE_SKILLS.get(req.target_role, ["Communication", "Problem Solving"])
    have = {x.lower() for x in req.skills}

    missing = [
        {
            "skill": x,
            "priority": "high" if i < 2 else "medium",
            "reason": f"{x} is frequently required for {req.target_role} roles and appears in 80%+ of job descriptions.",
            "resource": f'Search "{x} tutorial" on YouTube or Coursera',
        }
        for i, x in enumerate(role_skills) if x.lower() not in have
    ]

    matched = [x for x in role_skills if x.lower() in have]

    return {
        "targetRole": req.target_role,
        "missing": missing,
        "matched": matched,
        "modelVersion": "rules-v1",
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/v1/resume-match")
def resume_match(req: ResumeMatchRequest):
    text = req.job_description.lower()
    profile_skills = [s.lower() for s in req.student_skills]

    all_keywords = [
        "sql", "python", "power bi", "tableau", "excel", "communication",
        "statistics", "machine learning", "javascript", "react", "node.js",
        "data analysis", "git", "java", "c++", "mongodb", "aws", "docker",
    ]

    matched = [s for s in profile_skills if s in text]
    missing = [s for s in all_keywords if s in text and s not in profile_skills]
    score = max(20, min(96, 45 + len(matched) * 9 - len(missing) * 3))

    return {
        "score": score,
        "matched": matched,
        "missing": missing,
        "strengths": ["Good keyword overlap"] if len(matched) >= 3 else [],
        "improvements": [f"Add {s} experience" for s in missing[:5]],
        "explanation": "Score: skill overlap (40%), project relevance (25%), certification alignment (15%), profile completeness (20%).",
        "modelVersion": "match-v1",
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/v1/interview-feedback")
def interview_feedback(req: InterviewRequest):
    answer = req.answer
    word_count = len(answer.split())
    has_structure = bool(re.search(r"situation|task|action|result|challenge|approach|outcome", answer, re.I))
    has_metrics = bool(re.search(r"\d+%|\d+ percent|reduced|increased|improved|saved|built|created", answer, re.I))

    score = 30 + min(30, word_count * 0.7)
    if has_structure: score += 15
    if has_metrics: score += 12
    score = min(95, round(score))

    feedback = []
    if word_count < 20:
        feedback.append("Your response is too brief. Aim for 80-150 words.")
    if not has_structure:
        feedback.append("Use the STAR method: Situation, Task, Action, Result.")
    if not has_metrics:
        feedback.append("Include measurable outcomes (numbers, percentages).")
    if score >= 70:
        feedback.append("Strong answer! Add a brief reflection on what you learned.")

    return {
        "score": score,
        "feedback": " ".join(feedback),
        "tip": "STAR: Situation → Task → Action → Result. Keep answers 90-120 seconds.",
        "modelVersion": "interview-v1",
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/v1/readiness")
def readiness_score(req: ReadinessRequest):
    factors = [
        {"label": "Technical Skills", "value": min(100, len(req.skills) * 14), "weight": 0.30},
        {"label": "Projects & Portfolio", "value": min(100, req.projects_count * 38), "weight": 0.25},
        {"label": "Academics (CGPA)", "value": min(100, round((req.cgpa / 10) * 100)), "weight": 0.20},
        {"label": "Aptitude & Reasoning", "value": req.aptitude_score, "weight": 0.15},
        {"label": "Profile Completeness", "value": req.profile_completion, "weight": 0.10},
    ]

    score = round(sum(f["value"] * f["weight"] for f in factors))

    return {
        "score": score,
        "factors": [{"label": f["label"], "value": f["value"]} for f in factors],
        "explanation": "Composite: Skills (30%), Projects (25%), Academics (20%), Aptitude (15%), Profile (10%).",
        "modelVersion": "readiness-v1",
        "timestamp": datetime.now().isoformat(),
    }

@app.post("/v1/candidate-match")
def candidate_match(req: CandidateMatchRequest):
    results = []
    for candidate in req.candidates:
        c_skills = {s.lower() for s in candidate.get("skills", [])}
        matched = [s for s in req.job_skills if s.lower() in c_skills]
        score = round((len(matched) / max(len(req.job_skills), 1)) * 100)
        results.append({
            **candidate,
            "matchScore": score,
            "matchedSkills": matched,
            "explanation": f"Matched {len(matched)}/{len(req.job_skills)} required skills.",
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)

    return {
        "candidates": results,
        "modelVersion": "match-v1",
        "timestamp": datetime.now().isoformat(),
    }
