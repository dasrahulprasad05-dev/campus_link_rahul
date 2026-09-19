"""
Feature 4 — AI Mock Interview Coach (LLM)
Uses Groq API (Llama 3.3 70B) for real qualitative interview feedback.
Replaces regex-based scoring ("has the word 'result' → +15 pts") with
actual LLM evaluation using a structured STAR rubric.
"""

import os
import json
import re
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ---- Schema ----

class InterviewFeedbackRequest(BaseModel):
    answer: str = ""
    question: str = ""
    target_role: Optional[str] = None
    targetRole: Optional[str] = None
    role: Optional[str] = None
    rubric_category: Optional[str] = None
    category: Optional[str] = None


class InterviewFeedbackResponse(BaseModel):
    score: int
    feedback: str
    strengths: List[str]
    improvements: List[str]
    follow_up_question: str = ""
    model_answer: str = ""
    tip: str = ""
    source: str = "groq-llm"
    modelVersion: str = "interview-llm-v1"
    timestamp: str = ""


# ---- Groq Client ----

_client = None


def _get_client():
    """Initialize the Groq client."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            print("  [Feature 4] GROQ_API_KEY not set -- using rule-based fallback")
            _client = "fallback"
            return _client
        try:
            from groq import Groq
            _client = Groq(api_key=api_key)
            print("  [Feature 4] Interview Coach -- Groq client initialized")
        except Exception as e:
            print(f"  [Feature 4] Could not initialize Groq: {e}")
            _client = "fallback"
    return _client


SYSTEM_PROMPT = """You are an expert placement interview coach for Indian engineering college students.
Evaluate the candidate's interview answer using the STAR framework (Situation, Task, Action, Result).

You MUST respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "score": <integer 0-100>,
  "feedback": "<detailed paragraph evaluating the answer quality, specific to what they said>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "follow_up_question": "<a natural follow-up question an interviewer might ask>",
  "model_answer": "<a brief 2-3 sentence model answer for comparison>"
}

Scoring rubric:
- 0-30: No structure, too brief, irrelevant
- 31-50: Partial STAR, lacks specifics or metrics
- 51-70: Good structure, some specifics, could improve metrics/depth
- 71-85: Strong STAR structure, includes metrics and clear contribution
- 86-100: Excellent — specific, structured, quantified, reflective"""


from features.llm_client import call_groq_json

def evaluate_answer(req: InterviewFeedbackRequest) -> InterviewFeedbackResponse:
    """Evaluate an interview answer using Groq LLM."""
    if not req.answer.strip():
        return _rule_based_evaluate(req)

    role = req.target_role or req.targetRole or req.role or "General"
    user_prompt = (
        f"Role: {role}\n"
        f"Question: {req.question}\n"
        f"Candidate's Answer: {req.answer}\n\n"
        f"Evaluate this answer. Respond with ONLY the JSON object."
    )

    data = call_groq_json(SYSTEM_PROMPT, user_prompt, temperature=0.3, max_tokens=800)
    if not data:
        return _rule_based_evaluate(req)

    return InterviewFeedbackResponse(
        score=max(0, min(100, int(data.get("score", 50)))),
        feedback=data.get("feedback", ""),
        strengths=data.get("strengths", []),
        improvements=data.get("improvements", []),
        follow_up_question=data.get("follow_up_question", ""),
        model_answer=data.get("model_answer", ""),
        tip="STAR: Situation → Task → Action → Result. Keep answers 90-120 seconds.",
        source="groq-llm",
        modelVersion="interview-llm-v1",
        timestamp=datetime.now().isoformat(),
    )


def _rule_based_evaluate(req: InterviewFeedbackRequest) -> InterviewFeedbackResponse:
    """Fallback: regex-based STAR heuristic evaluation."""
    answer = req.answer or ""
    word_count = len(answer.split())
    has_structure = bool(re.search(
        r"situation|task|action|result|challenge|approach|outcome", answer, re.I
    ))
    has_metrics = bool(re.search(
        r"\d+%|\d+ percent|reduced|increased|improved|saved|built|created|led", answer, re.I
    ))
    has_specifics = bool(re.search(
        r"project|team|company|tool|technology|database|api|server", answer, re.I
    ))

    score = 30 + min(30, word_count * 0.7)
    if has_structure:
        score += 15
    if has_metrics:
        score += 12
    if has_specifics:
        score += 8
    score = min(95, round(score))

    strengths = []
    improvements = []

    if word_count >= 40:
        strengths.append("Good level of detail.")
    if has_structure:
        strengths.append("Good use of structured response format.")
    if has_metrics:
        strengths.append("Includes quantifiable results.")

    if word_count < 20:
        improvements.append("Too brief. Aim for 80-150 words.")
    if not has_structure:
        improvements.append("Use the STAR method (Situation, Task, Action, Result).")
    if not has_metrics:
        improvements.append("Include measurable outcomes (numbers, percentages).")

    return InterviewFeedbackResponse(
        score=score,
        feedback=" ".join(improvements) if improvements else "Good answer overall.",
        strengths=strengths or ["Attempted response"],
        improvements=improvements,
        tip="STAR: Situation → Task → Action → Result. Keep answers 90-120 seconds.",
        source="rule-engine",
        modelVersion="interview-v1",
        timestamp=datetime.now().isoformat(),
    )
