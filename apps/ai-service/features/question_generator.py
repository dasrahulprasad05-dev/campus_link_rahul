"""
Feature 5 — Adaptive Question Generator (LLM)
Uses Groq API (Llama 3.3 70B) to generate context-aware interview questions
conditioned on the candidate's skill gaps and target role.
Replaces the static 5-question hardcoded array.
"""

import os
import json
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ---- Schema ----

class QuestionGenRequest(BaseModel):
    target_role: str = "Data Analyst"
    skill_gaps: List[str] = []
    current_skills: List[str] = []
    difficulty: str = "medium"  # easy, medium, hard
    count: int = 5


class GeneratedQuestion(BaseModel):
    text: str
    category: str      # "technical", "behavioral", "situational"
    difficulty: str
    skill_tested: str
    evaluation_hints: str = ""


class QuestionGenResponse(BaseModel):
    questions: List[GeneratedQuestion]
    session_context: str = ""
    source: str = "groq-llm"
    modelVersion: str = "qgen-llm-v1"
    timestamp: str = ""


# ---- Groq Client ----

_client = None


def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            print("  [Feature 5] GROQ_API_KEY not set — using curated question bank")
            _client = "fallback"
            return _client
        try:
            from groq import Groq
            _client = Groq(api_key=api_key)
            print("  [Feature 5] Question Generator — Groq client initialized")
        except Exception as e:
            print(f"  [Feature 5] Could not initialize Groq: {e}")
            _client = "fallback"
    return _client


SYSTEM_PROMPT = """You are an expert campus placement interview question designer for Indian engineering students.
Generate interview questions that are specific to the candidate's target role and focus on their skill gaps.

You MUST respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "questions": [
    {
      "text": "<the interview question>",
      "category": "<technical|behavioral|situational>",
      "difficulty": "<easy|medium|hard>",
      "skill_tested": "<which skill this tests>",
      "evaluation_hints": "<what a good answer should include>"
    }
  ]
}

Guidelines:
- Mix technical, behavioral, and situational questions
- Focus questions on the candidate's skill gaps to help them practice weak areas
- Make questions realistic — the kind asked in actual Indian campus placement drives
- Include follow-up depth for the specified difficulty level"""


# ---- Curated Fallback Question Bank ----

QUESTION_BANK = {
    "Data Analyst": [
        {"text": "How would you handle missing data in a large dataset?", "category": "technical", "skill_tested": "Data Cleaning", "difficulty": "medium"},
        {"text": "Explain a project where you used SQL to derive business insights.", "category": "technical", "skill_tested": "SQL", "difficulty": "medium"},
        {"text": "What is the difference between correlation and causation? Give an example.", "category": "technical", "skill_tested": "Statistics", "difficulty": "medium"},
        {"text": "Describe a time when your data analysis changed a business decision.", "category": "behavioral", "skill_tested": "Communication", "difficulty": "medium"},
        {"text": "You discover a data anomaly 2 hours before a board presentation. What do you do?", "category": "situational", "skill_tested": "Problem Solving", "difficulty": "hard"},
        {"text": "What are window functions in SQL? When would you use them?", "category": "technical", "skill_tested": "SQL", "difficulty": "hard"},
        {"text": "How do you decide between a bar chart and a line chart?", "category": "technical", "skill_tested": "Data Visualization", "difficulty": "easy"},
    ],
    "Software Engineer": [
        {"text": "Describe your approach to debugging a complex production issue.", "category": "technical", "skill_tested": "Debugging", "difficulty": "medium"},
        {"text": "What is the difference between a stack and a queue? Where would you use each?", "category": "technical", "skill_tested": "Data Structures", "difficulty": "easy"},
        {"text": "Explain the concept of RESTful APIs. How do you design one?", "category": "technical", "skill_tested": "REST APIs", "difficulty": "medium"},
        {"text": "Tell me about a time you had to refactor legacy code. What was your approach?", "category": "behavioral", "skill_tested": "Code Quality", "difficulty": "medium"},
        {"text": "Your team disagrees on a technical architecture decision. How do you resolve it?", "category": "situational", "skill_tested": "Teamwork", "difficulty": "medium"},
        {"text": "What is the time complexity of quicksort? When might it degrade?", "category": "technical", "skill_tested": "Algorithms", "difficulty": "hard"},
        {"text": "Explain what CI/CD is and why it matters.", "category": "technical", "skill_tested": "DevOps", "difficulty": "easy"},
    ],
    "ML Engineer": [
        {"text": "Explain the bias-variance tradeoff with an example.", "category": "technical", "skill_tested": "Machine Learning", "difficulty": "medium"},
        {"text": "How do you handle class imbalance in a classification problem?", "category": "technical", "skill_tested": "Machine Learning", "difficulty": "medium"},
        {"text": "What is the difference between L1 and L2 regularization?", "category": "technical", "skill_tested": "Statistics", "difficulty": "hard"},
        {"text": "Describe a machine learning project you built end-to-end.", "category": "behavioral", "skill_tested": "MLOps", "difficulty": "medium"},
        {"text": "A model performs well in testing but poorly in production. What could go wrong?", "category": "situational", "skill_tested": "Model Deployment", "difficulty": "hard"},
    ],
    "Web Developer": [
        {"text": "What is the virtual DOM and why does React use it?", "category": "technical", "skill_tested": "React", "difficulty": "medium"},
        {"text": "Explain the difference between CSS Flexbox and Grid. When would you use each?", "category": "technical", "skill_tested": "CSS", "difficulty": "easy"},
        {"text": "How do you optimize a slow-loading web page?", "category": "technical", "skill_tested": "Performance", "difficulty": "medium"},
        {"text": "Describe a challenging UI feature you implemented.", "category": "behavioral", "skill_tested": "Problem Solving", "difficulty": "medium"},
        {"text": "A critical production bug is reported on Friday evening. Walk me through your response.", "category": "situational", "skill_tested": "Debugging", "difficulty": "hard"},
    ],
    "General": [
        {"text": "Tell me about a project where you used data to make a decision.", "category": "behavioral", "skill_tested": "Communication", "difficulty": "easy"},
        {"text": "Describe a time you had to learn something new quickly.", "category": "behavioral", "skill_tested": "Adaptability", "difficulty": "easy"},
        {"text": "What is your greatest technical strength and how have you demonstrated it?", "category": "behavioral", "skill_tested": "Self-awareness", "difficulty": "medium"},
        {"text": "How do you prioritize tasks when working on multiple projects?", "category": "situational", "skill_tested": "Time Management", "difficulty": "medium"},
        {"text": "Tell me about a time you failed. What did you learn?", "category": "behavioral", "skill_tested": "Growth Mindset", "difficulty": "medium"},
    ],
}


from features.llm_client import call_groq_json

def generate_questions(req: QuestionGenRequest) -> QuestionGenResponse:
    """Generate adaptive interview questions using Groq LLM."""
    user_prompt = (
        f"Target Role: {req.target_role}\n"
        f"Candidate's Skill Gaps: {', '.join(req.skill_gaps) if req.skill_gaps else 'None specified'}\n"
        f"Candidate's Current Skills: {', '.join(req.current_skills) if req.current_skills else 'None specified'}\n"
        f"Difficulty Level: {req.difficulty}\n"
        f"Number of Questions: {req.count}\n\n"
        f"Generate {req.count} interview questions. Focus on the skill gaps. "
        f"Respond with ONLY the JSON object."
    )

    data = call_groq_json(SYSTEM_PROMPT, user_prompt, temperature=0.7, max_tokens=1200)
    if not data or not data.get("questions"):
        return _fallback_questions(req)

    questions = [
        GeneratedQuestion(
            text=q.get("text", ""),
            category=q.get("category", "technical"),
            difficulty=q.get("difficulty", req.difficulty),
            skill_tested=q.get("skill_tested", ""),
            evaluation_hints=q.get("evaluation_hints", ""),
        )
        for q in data.get("questions", [])[:req.count]
    ]

    return QuestionGenResponse(
        questions=questions,
        session_context=f"Adaptive session for {req.target_role} — focusing on: {', '.join(req.skill_gaps[:3]) if req.skill_gaps else 'general assessment'}",
        source="groq-llm",
        modelVersion="qgen-llm-v1",
        timestamp=datetime.now().isoformat(),
    )


def _fallback_questions(req: QuestionGenRequest) -> QuestionGenResponse:
    """Fallback: curated question bank."""
    role = req.target_role
    bank = QUESTION_BANK.get(role, QUESTION_BANK["General"])

    # Filter by difficulty if possible
    filtered = [q for q in bank if q["difficulty"] == req.difficulty]
    if len(filtered) < req.count:
        filtered = bank

    selected = filtered[:req.count]

    questions = [
        GeneratedQuestion(
            text=q["text"],
            category=q["category"],
            difficulty=q["difficulty"],
            skill_tested=q["skill_tested"],
        )
        for q in selected
    ]

    return QuestionGenResponse(
        questions=questions,
        session_context=f"Standard {role} interview practice session",
        source="rule-engine",
        modelVersion="qgen-curated-v1",
        timestamp=datetime.now().isoformat(),
    )
