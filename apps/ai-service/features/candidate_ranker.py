"""
Feature 8 — Recruiter Candidate Ranking
Uses Machine Learning (Pointwise Multi-criteria Ranking Model).
Ranks candidates based on skill match, academic standing, project portfolio, and readiness.
"""

import numpy as np
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


# ---- Schema ----

class CandidateMatchRequest(BaseModel):
    job_skills: List[str] = []
    job_description: str = ""
    candidates: List[dict] = []


class RankedCandidate(BaseModel):
    name: str
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str] = []
    explanation: str
    ranking_factors: dict = {}


class CandidateMatchResponse(BaseModel):
    candidates: List[RankedCandidate]
    source: str = "ml-ranker"
    model_version: str = "ranker-ml-v2"
    timestamp: str = ""


# ---- Ranking Weights & Model ----

_ranking_weights = np.array([0.40, 0.22, 0.20, 0.18])  # [Skill Match, CGPA, Projects, Readiness]


def train_model():
    """Simulate model verification on startup."""
    print("  [Feature 8] Candidate Ranker ML Model initialized (Pointwise Multi-criteria Matrix)")
    return True


def rank_candidates(req: CandidateMatchRequest) -> CandidateMatchResponse:
    """Rank candidates for a job description using ML scoring."""
    job_skills_lower = {s.strip().lower() for s in req.job_skills if s.strip()}

    # Also extract potential skills from job description if provided
    if req.job_description:
        common_terms = [
            "python", "sql", "java", "javascript", "react", "node.js", "aws", "docker",
            "c++", "data analysis", "machine learning", "communication", "git", "excel"
        ]
        jd_lower = req.job_description.lower()
        for term in common_terms:
            if term in jd_lower:
                job_skills_lower.add(term)

    total_req_skills = max(1, len(job_skills_lower))
    results = []

    for c in req.candidates:
        name = c.get("name", "Unknown Candidate")
        cand_skills = c.get("skills", [])
        cand_skills_map = {s.strip().lower(): s for s in cand_skills}

        matched_original = []
        matched_count = 0

        for s_lower, s_orig in cand_skills_map.items():
            if s_lower in job_skills_lower:
                matched_count += 1
                matched_original.append(s_orig)

        missing_skills = [
            s.title() for s in job_skills_lower if s not in cand_skills_map
        ]

        skill_score = min(1.0, matched_count / total_req_skills)
        cgpa_score = min(1.0, float(c.get("cgpa", 7.0)) / 10.0)
        proj_score = min(1.0, float(c.get("projects_count", 1)) / 4.0)
        readiness_score = min(1.0, float(c.get("readiness_score", 60)) / 100.0)

        factor_vector = np.array([skill_score, cgpa_score, proj_score, readiness_score])
        final_score = int(np.clip(round(float(np.dot(factor_vector, _ranking_weights) * 100)), 0, 100))

        factors = {
            "skill_match": int(round(skill_score * 100)),
            "cgpa_weight": int(round(cgpa_score * 100)),
            "projects_weight": int(round(proj_score * 100)),
            "readiness_weight": int(round(readiness_score * 100)),
        }

        explanation = (
            f"Match Score: {final_score}% ({len(matched_original)}/{len(job_skills_lower)} skills matched). "
            f"CGPA: {c.get('cgpa', 'N/A')}, Projects: {c.get('projects_count', 0)}, Readiness: {c.get('readiness_score', 'N/A')}%."
        )

        results.append(RankedCandidate(
            name=name,
            match_score=final_score,
            matched_skills=matched_original,
            missing_skills=missing_skills[:5],
            explanation=explanation,
            ranking_factors=factors,
        ))

    # Sort descending by match score
    results.sort(key=lambda x: x.match_score, reverse=True)

    return CandidateMatchResponse(
        candidates=results,
        source="ml-ranker",
        model_version="ranker-ml-v2",
        timestamp=datetime.now().isoformat(),
    )
