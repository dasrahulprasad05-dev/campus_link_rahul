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
    target_role: str = "Data Analyst"
    current_skills: List[str] = []
    skill_gaps: List[str] = []
    cgpa: float = 7.0
    projects_count: int = 0
    weeks_until_placement: int = 12


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
            print("  [Feature 7] GROQ_API_KEY not set — using template roadmaps")
            _client = "fallback"
            return _client
        try:
            from groq import Groq
            _client = Groq(api_key=api_key)
            print("  [Feature 7] Roadmap Generator — Groq client initialized")
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
    user_prompt = (
        f"Student Profile:\n"
        f"- Target Role: {req.target_role}\n"
        f"- Current Skills: {', '.join(req.current_skills) if req.current_skills else 'None listed'}\n"
        f"- Skill Gaps: {', '.join(req.skill_gaps) if req.skill_gaps else 'Not analyzed yet'}\n"
        f"- CGPA: {req.cgpa}\n"
        f"- Projects: {req.projects_count}\n"
        f"- Weeks Until Placement Season: {req.weeks_until_placement}\n\n"
        f"Generate a personalized {req.weeks_until_placement}-week roadmap. "
        f"Respond with ONLY the JSON object."
    )

    data = call_groq_json(SYSTEM_PROMPT, user_prompt, temperature=0.5, max_tokens=1500)
    if not data or not data.get("milestones"):
        return _template_roadmap(req)

    milestones = [
        RoadmapMilestone(
            title=m.get("title", ""),
            description=m.get("description", ""),
            week=m.get("week", 1),
            priority=m.get("priority", "medium"),
            category=m.get("category", "skill"),
            resources=m.get("resources", []),
            success_criteria=m.get("success_criteria", ""),
        )
        for m in data.get("milestones", [])
    ]

    return RoadmapResponse(
        milestones=milestones,
        summary=data.get("summary", f"Personalized {req.weeks_until_placement}-week roadmap for {req.target_role}"),
        source="groq-llm",
        modelVersion="roadmap-llm-v1",
        timestamp=datetime.now().isoformat(),
    )


def _template_roadmap(req: RoadmapRequest) -> RoadmapResponse:
    """Fallback: role-based template milestones."""
    templates = {
        "Data Analyst": [
            RoadmapMilestone(title="Master SQL Fundamentals", description="Complete joins, subqueries, window functions, and aggregation exercises.", week=1, priority="critical", category="skill", resources=["SQLBolt.com", "LeetCode SQL track"], success_criteria="Solve 30 SQL problems on LeetCode"),
            RoadmapMilestone(title="Python for Data Analysis", description="Learn pandas, numpy, and matplotlib for data manipulation and visualization.", week=2, priority="critical", category="skill", resources=["Kaggle Learn Python", "Automate the Boring Stuff"], success_criteria="Complete 3 Kaggle datasets analysis"),
            RoadmapMilestone(title="Build Dashboard Project", description="Create an interactive Power BI or Tableau dashboard using real-world data.", week=4, priority="high", category="project", resources=["Microsoft Power BI free tier", "Makeover Monday datasets"], success_criteria="Publish 1 dashboard on Tableau Public or Power BI"),
            RoadmapMilestone(title="Statistics Refresher", description="Review hypothesis testing, distributions, and regression concepts.", week=5, priority="high", category="skill", resources=["Khan Academy Statistics", "StatQuest YouTube"], success_criteria="Score 80%+ on a statistics mock test"),
            RoadmapMilestone(title="Practice Aptitude Tests", description="Complete timed mock aptitude assessments to build speed and accuracy.", week=7, priority="high", category="practice", resources=["IndiaBIX.com", "Placement preparation apps"], success_criteria="Score 80%+ in 3 consecutive mock tests"),
            RoadmapMilestone(title="Mock Interviews x3", description="Complete 3 AI mock interviews focusing on STAR method and data case studies.", week=9, priority="critical", category="practice", resources=["CAMPUSLINK Mock Interview", "Pramp.com"], success_criteria="Average score 70+ across 3 sessions"),
        ],
        "Software Engineer": [
            RoadmapMilestone(title="DSA Foundation", description="Master arrays, strings, linked lists, stacks, queues, trees, and graphs.", week=1, priority="critical", category="skill", resources=["NeetCode 150", "Abdul Bari DSA playlist"], success_criteria="Solve 50 LeetCode problems (easy + medium)"),
            RoadmapMilestone(title="System Design Basics", description="Learn load balancing, caching, databases, and API design patterns.", week=3, priority="high", category="skill", resources=["System Design Primer (GitHub)", "Gaurav Sen YouTube"], success_criteria="Design 3 systems (URL shortener, chat app, feed)"),
            RoadmapMilestone(title="Full-Stack Project", description="Build a complete web application with authentication, CRUD, and deployment.", week=5, priority="critical", category="project", resources=["The Odin Project", "FreeCodeCamp"], success_criteria="Deploy 1 project on Vercel/Railway with GitHub repo"),
            RoadmapMilestone(title="Git & CI/CD", description="Master branching, PRs, merge conflicts, and basic CI pipeline.", week=6, priority="medium", category="skill", resources=["learngitbranching.js.org", "GitHub Actions docs"], success_criteria="Set up CI pipeline for your project"),
            RoadmapMilestone(title="Mock Interviews", description="Practice coding interviews and behavioral questions.", week=8, priority="critical", category="practice", resources=["CAMPUSLINK Mock Interview", "LeetCode contest mode"], success_criteria="Complete 5 timed coding challenges + 3 behavioral mocks"),
        ],
    }

    milestones = templates.get(req.target_role, templates.get("Data Analyst", []))

    return RoadmapResponse(
        milestones=milestones,
        summary=f"Template-based {req.target_role} preparation roadmap. Personalization requires LLM integration.",
        source="rule-engine",
        modelVersion="roadmap-template-v1",
        timestamp=datetime.now().isoformat(),
    )
