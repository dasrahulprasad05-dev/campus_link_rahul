"""
Feature 2 — Skill-Gap Analyzer (NLP)
Uses Semantic Vector Embeddings (Subword N-grams + Domain Synonym Mapping + Cosine Similarity).
Analyzes candidate skills against role requirements from an ontology of 12+ roles.
Detects exact matches, partial/synonym matches (e.g. Data Wrangling ≈ Data Cleaning), and prioritized gaps.
"""

import numpy as np
import re
from pydantic import BaseModel
from typing import List, Optional, Tuple, Dict
from datetime import datetime


# ---- Schema ----

class SkillGapRequest(BaseModel):
    target_role: Optional[str] = None
    targetRole: Optional[str] = None
    skills: List[str] = []
    job_description: Optional[str] = None
    jobDescription: Optional[str] = None


class SkillGapItem(BaseModel):
    skill: str
    priority: str         # "high", "medium", "low"
    reason: str
    resource: str
    semantic_score: float = 0.0


class SkillGapResponse(BaseModel):
    targetRole: str
    missing: List[SkillGapItem]
    matched: List[str]
    partial_matches: List[dict] = []
    source: str = "nlp-semantic"
    modelVersion: str = "skill-gap-nlp-v2"
    timestamp: str = ""


# ---- Role Ontology & Learning Resources ----

ROLE_SKILLS: Dict[str, List[str]] = {
    "Data Analyst": [
        "SQL", "Python", "Power BI", "Tableau", "Statistics",
        "Data Visualization", "Excel", "Communication", "Data Cleaning",
    ],
    "Software Engineer": [
        "Data Structures", "Algorithms", "Git", "REST APIs", "Databases",
        "Testing", "System Design", "JavaScript", "Problem Solving",
    ],
    "ML Engineer": [
        "Python", "PyTorch", "TensorFlow", "Statistics", "Linear Algebra",
        "MLOps", "SQL", "Feature Engineering", "Model Deployment",
    ],
    "Web Developer": [
        "HTML", "CSS", "JavaScript", "React", "Node.js",
        "Git", "REST APIs", "Responsive Design", "TypeScript",
    ],
    "DevOps Engineer": [
        "Linux", "Docker", "Kubernetes", "CI/CD", "AWS",
        "Terraform", "Monitoring", "Shell Scripting", "Networking",
    ],
    "Frontend Developer": [
        "HTML", "CSS", "JavaScript", "React", "TypeScript",
        "State Management", "CSS Frameworks", "Testing", "Performance",
    ],
    "Cloud Engineer": [
        "AWS", "Azure", "GCP", "Docker", "Kubernetes",
        "Terraform", "Networking", "Security", "Cost Optimization",
    ],
    "Business Analyst": [
        "SQL", "Excel", "Communication", "Requirements Gathering",
        "Data Analysis", "Process Modeling", "Stakeholder Management", "Reporting",
    ],
    "Full Stack Developer": [
        "JavaScript", "TypeScript", "React", "Node.js", "SQL",
        "REST APIs", "Git", "Docker", "Database Design",
    ],
}

SKILL_RESOURCES: Dict[str, str] = {
    "sql": "SQLBolt interactive exercises + LeetCode SQL track",
    "python": "Python for Everybody (Coursera) or Automate the Boring Stuff",
    "power bi": "Microsoft Power BI certification on Learn.Microsoft.com",
    "tableau": "Tableau Public free learning path + Makeover Monday challenges",
    "statistics": "Khan Academy Statistics & Probability + StatQuest YouTube",
    "machine learning": "Andrew Ng's Machine Learning Specialization (Coursera)",
    "deep learning": "fast.ai Practical Deep Learning course (free)",
    "javascript": "JavaScript.info or freeCodeCamp JS curriculum",
    "react": "React.dev official tutorial + Kent C. Dodds courses",
    "node.js": "Node.js documentation + The Odin Project backend track",
    "docker": "Docker official Getting Started tutorial",
    "kubernetes": "Kubernetes official tutorials + KodeKloud labs",
    "aws": "AWS Cloud Practitioner free training on AWS Skill Builder",
    "git": "Git branching interactive tutorial (learngitbranching.js.org)",
    "data structures": "NeetCode 150 + Abdul Bari's DSA playlist (YouTube)",
    "system design": "System Design Primer (GitHub) + Gaurav Sen YouTube",
    "data cleaning": "DataCamp Data Cleaning in Python / Pandas Documentation",
    "algorithms": "LeetCode Top Interview 150 + Grokking Algorithms",
}

SYNONYMS: Dict[str, str] = {
    "data wrangling": "data cleaning",
    "data preprocessing": "data cleaning",
    "k8s": "kubernetes",
    "postgres": "postgresql sql",
    "mysql": "sql database",
    "restful": "rest api",
    "reactjs": "react",
    "react.js": "react",
    "nodejs": "node.js",
    "node": "node.js",
    "deep learning": "neural networks ml",
    "dsa": "data structures algorithms",
    "bi": "business intelligence power bi tableau",
}


# ---- Semantic Vector Functions (NumPy) ----

def _embed_skill(text: str, dim: int = 256) -> np.ndarray:
    """Embed skill string into fixed-dimension vector using subwords + synonyms."""
    vec = np.zeros(dim, dtype=float)
    cleaned = text.lower().strip()

    # Expand known synonyms
    for syn, repl in SYNONYMS.items():
        if syn in cleaned:
            cleaned += " " + repl

    # Char 3-grams
    alpha_num = re.sub(r"[^a-z0-9]", "", cleaned)
    for i in range(len(alpha_num) - 2):
        ng = alpha_num[i:i + 3]
        idx = abs(hash(ng)) % dim
        vec[idx] += 1.5

    # Whole words
    for w in cleaned.split():
        idx = abs(hash(w)) % dim
        vec[idx] += 3.0

    norm = np.linalg.norm(vec)
    return vec / (norm + 1e-7)


def _compute_similarity(a_text: str, b_text: str) -> float:
    """Compute semantic cosine similarity between two skill strings."""
    t1, t2 = a_text.lower().strip(), b_text.lower().strip()
    if t1 == t2 or t1 in t2 or t2 in t1:
        return 1.0
    va = _embed_skill(t1)
    vb = _embed_skill(t2)
    return float(np.dot(va, vb))


def analyze_skill_gap(req: SkillGapRequest) -> SkillGapResponse:
    """Analyze student skills against target role or extracted JD requirements."""
    role = req.target_role or req.targetRole or "Data Analyst"
    required_skills = ROLE_SKILLS.get(role, ROLE_SKILLS["Data Analyst"])
    jd = req.job_description or req.jobDescription or ""

    # If job description is provided, extract additional skill keywords
    if jd:
        jd_lower = jd.lower()
        extracted = []
        for r_skills in ROLE_SKILLS.values():
            for s in r_skills:
                if s.lower() in jd_lower and s not in required_skills:
                    extracted.append(s)
        if extracted:
            required_skills = list(dict.fromkeys(required_skills + extracted[:5]))

    user_skills = req.skills or []
    matched = []
    partial_matches = []
    missing_items = []

    for req_skill in required_skills:
        best_sim = 0.0
        best_user_skill = ""

        for u_skill in user_skills:
            sim = _compute_similarity(u_skill, req_skill)
            if sim > best_sim:
                best_sim = sim
                best_user_skill = u_skill

        if best_sim >= 0.80:
            matched.append(req_skill)
        elif best_sim >= 0.50:
            partial_matches.append({
                "required": req_skill,
                "user_skill": best_user_skill,
                "similarity": round(best_sim, 2),
            })
            # Still record as gap with lower priority
            resource = SKILL_RESOURCES.get(req_skill.lower(), f"Search documentation and tutorials for {req_skill}")
            missing_items.append(SkillGapItem(
                skill=req_skill,
                priority="low",
                reason=f"Partially covered by '{best_user_skill}' ({int(best_sim * 100)}% match) — needs direct practice",
                resource=resource,
                semantic_score=round(best_sim, 2),
            ))
        else:
            resource = SKILL_RESOURCES.get(req_skill.lower(), f"Search documentation and tutorials for {req_skill}")
            priority = "high" if req_skill in required_skills[:3] else "medium"
            missing_items.append(SkillGapItem(
                skill=req_skill,
                priority=priority,
                reason=f"Core requirement for {role} placement drives",
                resource=resource,
                semantic_score=round(best_sim, 2),
            ))

    return SkillGapResponse(
        targetRole=role,
        missing=missing_items,
        matched=matched,
        partial_matches=partial_matches,
        source="nlp-semantic",
        modelVersion="skill-gap-nlp-v2",
        timestamp=datetime.now().isoformat(),
    )
