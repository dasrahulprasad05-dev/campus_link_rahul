"""
Feature 7 — Personalized Career Roadmap Generator (LLM)
Uses Groq API (Llama 3.3 70B) to create individualized milestone plans.
Replaces the static 5-milestone template shown to every student.
"""

import os
import json
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ---- Schema ----

class RoadmapRequest(BaseModel):
    target_role: Optional[str] = None
    targetRole: Optional[str] = None
    current_skills: List[str] = []
    currentSkills: List[str] = []
    skill_gaps: List[str] = []
    skillGaps: List[str] = []
    cgpa: float = 7.0
    projects_count: Optional[int] = None
    projectsCount: Optional[int] = None
    weeks_until_placement: Optional[int] = None
    weeksUntilPlacement: Optional[int] = None


class RoadmapMilestone(BaseModel):
    title: str
    description: str
    week: int              # Which week to target
    priority: str          # "critical", "high", "medium"
    category: str          # "skill", "project", "practice", "networking"
    resources: List[str] = []
    success_criteria: str = ""


class RoadmapResponse(BaseModel):
    milestones: List[RoadmapMilestone]
    summary: str = ""
    source: str = "groq-llm"
    modelVersion: str = "roadmap-llm-v1"
    timestamp: str = ""


# ---- Groq Client ----

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            print("  [Feature 7] GROQ_API_KEY not set -- using template roadmaps")
            _client = "fallback"
            return _client
        try:
            from groq import Groq
            _client = Groq(api_key=api_key)
            print("  [Feature 7] Roadmap Generator -- Groq client initialized")
        except Exception as e:
            print(f"  [Feature 7] Could not initialize Groq: {e}")
            _client = "fallback"
    return _client


SYSTEM_PROMPT = """You are a career coach for Indian engineering college students preparing for campus placement.
Create a personalized, week-by-week learning roadmap based on the student's profile.

You MUST respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "milestones": [
    {
      "title": "<short title>",
      "description": "<what to do and why>",
      "week": <integer: which week>,
      "priority": "<critical|high|medium>",
      "category": "<skill|project|practice|networking>",
      "resources": ["<resource 1>", "<resource 2>"],
      "success_criteria": "<how to know this is done>"
    }
  ],
  "summary": "<1-2 sentence overall plan summary>"
}

Rules:
- Start with the most critical skill gaps
- Include at least 1 project milestone (building something)
- Include at least 1 mock interview/practice milestone
- Keep it realistic for a college student (10-15 hours/week of prep)
- Resources should be real (Coursera, YouTube channels, LeetCode, etc.)
- 6-8 milestones is ideal"""


from features.llm_client import call_groq_json

def generate_roadmap(req: RoadmapRequest) -> RoadmapResponse:
    """Generate a personalized career roadmap using Groq LLM."""
    target_role = req.target_role or req.targetRole or "Data Analyst"
    current_skills = req.current_skills if req.current_skills else req.currentSkills
    skill_gaps = req.skill_gaps if req.skill_gaps else req.skillGaps
    projects_count = req.projects_count if req.projects_count is not None else (req.projectsCount or 0)
    weeks = req.weeks_until_placement if req.weeks_until_placement is not None else (req.weeksUntilPlacement or 12)

    user_prompt = (
        f"Student Profile:\n"
        f"- Target Role: {target_role}\n"
        f"- Current Skills: {', '.join(current_skills) if current_skills else 'None listed'}\n"
        f"- Skill Gaps: {', '.join(skill_gaps) if skill_gaps else 'Not analyzed yet'}\n"
        f"- CGPA: {req.cgpa}\n"
        f"- Projects: {projects_count}\n"
        f"- Weeks Until Placement Season: {weeks}\n\n"
        f"Generate a personalized {weeks}-week roadmap. "
        f"Respond with ONLY the JSON object."
    )

    data = call_groq_json(SYSTEM_PROMPT, user_prompt, temperature=0.5, max_tokens=1500)
    if not data or not data.get("milestones"):
        return RoadmapResponse(
            milestones=[],
            summary="AI could not generate roadmap. AI is not fetching ready-made template of roadmap — dynamic Groq AI generation is required.",
            source="ai-unavailable",
            modelVersion="none",
            timestamp=datetime.now().isoformat(),
        )

    milestones = [
        RoadmapMilestone(
            title=m.get("title", m.get("focus", m.get("milestone", "Milestone"))),
            description=m.get("description", m.get("deliverable", m.get("details", ""))),
            week=m.get("week", idx + 1) if isinstance(m.get("week"), int) else (idx + 1),
            priority=m.get("priority", "high" if idx < 3 else "medium"),
            category=m.get("category", "skill"),
            resources=m.get("resources", []) if isinstance(m.get("resources"), list) else ([m.get("resources")] if m.get("resources") else []),
            success_criteria=m.get("success_criteria", m.get("deliverable", "")),
        )
        for idx, m in enumerate(data.get("milestones", []))
    ]

    return RoadmapResponse(
        milestones=milestones,
        summary=data.get("summary", f"Personalized {weeks}-week roadmap for {target_role}"),
        source="groq-llm",
        modelVersion="roadmap-llm-v1",
        timestamp=datetime.now().isoformat(),
    )

