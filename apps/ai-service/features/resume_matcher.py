"""
Feature 3 — Resume ↔ JD Matcher (NLP)
Uses Semantic Vector Embeddings + Cosine Similarity.
Replaces simple keyword substring search with vector space document-to-skill matching.
Extracts keywords from JD, matches against candidate profile/resume, and provides explainable rubric scoring.
"""

import numpy as np
import re
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


# ---- Schema ----

class ResumeMatchRequest(BaseModel):
    job_description: str = ""
    student_skills: List[str] = ["SQL", "Python", "Excel", "Communication"]
    resume_text: str = ""


class ResumeMatchResponse(BaseModel):
    score: int
    matched: List[str]
    missing: List[str]
    strengths: List[str]
    improvements: List[str]
    semantic_highlights: List[dict] = []
    explanation: str
    source: str = "nlp-vector-matcher"
    modelVersion: str = "resume-nlp-v2"
    timestamp: str = ""


# ---- Semantic Embedding Engine (NumPy) ----

KNOWN_SKILLS = [
    "sql", "python", "java", "javascript", "react", "node.js", "typescript",
    "power bi", "tableau", "excel", "data analysis", "machine learning",
    "deep learning", "statistics", "communication", "git", "docker",
    "kubernetes", "aws", "azure", "gcp", "mongodb", "postgresql",
    "data visualization", "rest api", "api", "html", "css", "c++", "c#",
    "r", "scala", "spark", "hadoop", "tensorflow", "pytorch", "nlp",
    "agile", "scrum", "jira", "testing", "ci/cd", "linux", "system design",
    "data cleaning", "etl", "database design", "problem solving"
]

SYNONYMS = {
    "data wrangling": "data cleaning",
    "postgres": "postgresql",
    "k8s": "kubernetes",
    "restful": "rest api",
    "reactjs": "react",
    "react.js": "react",
    "nodejs": "node.js",
    "ml": "machine learning",
}


def _embed_text(text: str, dim: int = 256) -> np.ndarray:
    """Embed string into fixed-dimension vector using subwords + words."""
    vec = np.zeros(dim, dtype=float)
    cleaned = text.lower().strip()

    for syn, repl in SYNONYMS.items():
        if syn in cleaned:
            cleaned += " " + repl

    # Char 3-grams
    alpha_num = re.sub(r"[^a-z0-9]", "", cleaned)
    for i in range(len(alpha_num) - 2):
        ng = alpha_num[i:i + 3]
        idx = abs(hash(ng)) % dim
        vec[idx] += 1.5

    # Word tokens
    for w in cleaned.split():
        idx = abs(hash(w)) % dim
        vec[idx] += 3.0

    norm = np.linalg.norm(vec)
    return vec / (norm + 1e-7)


def _cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b))


def _extract_jd_skills(jd_text: str) -> List[str]:
    """Extract required skills mentioned in the job description."""
    jd_lower = jd_text.lower()
    found = []
    for skill in KNOWN_SKILLS:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, jd_lower):
            found.append(skill.title())
    return found if found else ["Communication", "Problem Solving"]


def match_resume_to_jd(req: ResumeMatchRequest) -> ResumeMatchResponse:
    """Match resume and student skills to job description using vector embeddings."""
    jd = req.job_description or ""
    student_skills = req.student_skills or []
    resume = req.resume_text or ""

    # Combine resume text and student skills
    combined_cand_text = " ".join(student_skills) + " " + resume

    # Extract required skills from JD
    jd_skills = _extract_jd_skills(jd)
    total_jd = max(1, len(jd_skills))

    matched = []
    missing = []
    highlights = []

    cand_lower = combined_cand_text.lower()

    for req_skill in jd_skills:
        # Check direct or semantic match
        skill_vec = _embed_text(req_skill)
        best_sim = 0.0
        best_match_phrase = ""

        # Test against individual candidate skills
        for cs in student_skills:
            if cs.lower() == req_skill.lower() or cs.lower() in req_skill.lower():
                best_sim = 1.0
                best_match_phrase = cs
                break
            sim = _cosine_sim(_embed_text(cs), skill_vec)
            if sim > best_sim:
                best_sim = sim
                best_match_phrase = cs

        # If not matched via skill list, check in resume body text
        if best_sim < 0.70 and re.search(r"\b" + re.escape(req_skill.lower()) + r"\b", cand_lower):
            best_sim = 0.90
            best_match_phrase = req_skill

        if best_sim >= 0.70:
            matched.append(req_skill)
            highlights.append({
                "skill": req_skill,
                "status": "strong_match",
                "matched_with": best_match_phrase,
                "confidence": round(best_sim, 2),
            })
        elif best_sim >= 0.45:
            matched.append(req_skill)
            highlights.append({
                "skill": req_skill,
                "status": "partial_match",
                "matched_with": best_match_phrase,
                "confidence": round(best_sim, 2),
            })
        else:
            missing.append(req_skill)

    # Calculate overall score: Vector document overlap + skill ratio
    skill_coverage = len(matched) / total_jd

    jd_vec = _embed_text(jd) if jd else _embed_text(" ".join(jd_skills))
    cand_vec = _embed_text(combined_cand_text)
    doc_similarity = _cosine_sim(jd_vec, cand_vec)

    raw_score = (skill_coverage * 0.70 + doc_similarity * 0.30) * 100
    final_score = int(np.clip(round(raw_score), 0, 100))

    strengths = [f"Strong alignment with required '{m}'" for m in matched[:3]]
    if not strengths:
        strengths = ["Foundational background documented in candidate profile"]

    improvements = [f"Highlight or acquire experience with '{m}'" for m in missing[:3]]
    if not improvements:
        improvements = ["Maintain profile freshness and include quantifiable project metrics"]

    explanation = (
        f"Semantic Vector Match Score: {final_score}%. "
        f"Matched {len(matched)} of {len(jd_skills)} extracted job requirements. "
        f"Document-level semantic alignment: {int(doc_similarity * 100)}%."
    )

    return ResumeMatchResponse(
        score=final_score,
        matched=matched,
        missing=missing,
        strengths=strengths,
        improvements=improvements,
        semantic_highlights=highlights,
        explanation=explanation,
        source="nlp-vector-matcher",
        modelVersion="resume-nlp-v2",
        timestamp=datetime.now().isoformat(),
    )
