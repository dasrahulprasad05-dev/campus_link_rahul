"""
CAMPUSLINK — AI Service (FastAPI)
Production AI/ML service with 9 real AI features:

  ML:  scikit-learn     → Features 1 (Readiness), 8 (Ranking), 9 (At-Risk)
  NLP: sentence-transformers → Features 2 (Skill-Gap), 3 (Resume Match)
  LLM: Groq (Llama 3.3) → Features 4 (Interview), 5 (Questions), 7 (Roadmap)
  RAG: LangChain + FAISS → Feature 10 (Policy Q&A)
"""

import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# ---- Feature Imports ----
from features.readiness_predictor import predict_readiness, train_model as train_readiness
from features.readiness_predictor import ReadinessRequest

from features.skill_gap_analyzer import analyze_skill_gap
from features.skill_gap_analyzer import SkillGapRequest

from features.resume_matcher import match_resume_to_jd
from features.resume_matcher import ResumeMatchRequest

from features.interview_coach import evaluate_answer
from features.interview_coach import InterviewFeedbackRequest

from features.question_generator import generate_questions
from features.question_generator import QuestionGenRequest

from features.roadmap_generator import generate_roadmap
from features.roadmap_generator import RoadmapRequest

from features.candidate_ranker import rank_candidates, train_model as train_ranker
from features.candidate_ranker import CandidateMatchRequest

from features.at_risk_predictor import predict_at_risk, train_model as train_at_risk
from features.at_risk_predictor import AtRiskRequest

from features.policy_qa import answer_policy_question, initialize_rag
from features.policy_qa import PolicyQARequest

from datetime import datetime


# ---- Startup: Train ML Models & Initialize RAG ----

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Train ML models and initialize RAG on startup."""
    print("\n  ╔══════════════════════════════════════════╗")
    print("  ║  CAMPUSLINK AI Service — Loading Models  ║")
    print("  ╚══════════════════════════════════════════╝\n")

    # Phase 1: Train scikit-learn models (fast, no network)
    print("  [Phase 1] Training ML models...")
    train_readiness()     # Feature 1
    train_ranker()        # Feature 8
    train_at_risk()       # Feature 9

    # Phase 2: Initialize RAG pipeline (loads embeddings + documents)
    print("\n  [Phase 2] Initializing RAG pipeline...")
    rag_ok = initialize_rag()  # Feature 10

    # Phase 3: NLP models are lazy-loaded on first request (Features 2, 3)
    print("\n  [Phase 3] NLP models will lazy-load on first request")

    # Phase 4: LLM (Groq) is initialized on first request (Features 4, 5, 7)
    groq_key = os.getenv("GROQ_API_KEY", "")
    if groq_key:
        print(f"  [Phase 4] Groq API key detected — LLM features enabled")
    else:
        print(f"  [Phase 4] No GROQ_API_KEY — LLM features will use fallbacks")

    print("\n  ✅ AI Service ready!\n")

    yield


# ---- App ----

app = FastAPI(
    title="CAMPUSLINK AI Service",
    description="AI-powered placement intelligence: ML + NLP + LLM + RAG",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
elif os.getenv("ENVIRONMENT") == "production":
    origins = ["https://campuslink-rahul.vercel.app"]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Health ----

@app.get("/health")
def health():
    groq_ok = bool(os.getenv("GROQ_API_KEY"))
    return {
        "status": "ok",
        "service": "campuslink-ai",
        "version": "2.0.0",
        "models": {
            "ml_readiness": "scikit-learn GBR (trained)",
            "ml_ranker": "scikit-learn GBR (trained)",
            "ml_at_risk": "scikit-learn GBC (trained)",
            "nlp_embeddings": "all-MiniLM-L6-v2 (lazy-load)",
            "llm": f"groq/llama-3.3-70b ({'active' if groq_ok else 'no API key — fallback mode'})",
            "rag": "langchain + FAISS",
        },
        "timestamp": datetime.now().isoformat(),
    }


# ---- Feature 1: Placement Readiness (ML) ----

@app.post("/v1/readiness")
def readiness_endpoint(req: ReadinessRequest):
    result = predict_readiness(req)
    return result.model_dump()


# ---- Feature 2: Skill-Gap Analysis (NLP) ----

@app.post("/v1/skill-gap")
def skill_gap_endpoint(req: SkillGapRequest):
    result = analyze_skill_gap(req)
    return result.model_dump()


# ---- Feature 3: Resume ↔ JD Matcher (NLP) ----

@app.post("/v1/resume-match")
def resume_match_endpoint(req: ResumeMatchRequest):
    result = match_resume_to_jd(req)
    return result.model_dump()


# ---- Feature 4: AI Mock Interview Coach (LLM) ----

@app.post("/v1/interview-feedback")
def interview_feedback_endpoint(req: InterviewFeedbackRequest):
    result = evaluate_answer(req)
    return result.model_dump()


# ---- Feature 5: Adaptive Question Generator (LLM) ----

@app.post("/v1/generate-questions")
def generate_questions_endpoint(req: QuestionGenRequest):
    result = generate_questions(req)
    return result.model_dump()


# ---- Feature 7: Personalized Career Roadmap (LLM) ----

@app.post("/v1/generate-roadmap")
def generate_roadmap_endpoint(req: RoadmapRequest):
    result = generate_roadmap(req)
    return result.model_dump()


# ---- Feature 8: Recruiter Candidate Ranking (ML) ----

@app.post("/v1/candidate-match")
def candidate_match_endpoint(req: CandidateMatchRequest):
    result = rank_candidates(req)
    return result.model_dump()


# ---- Feature 9: Early Warning At-Risk (ML) ----

@app.post("/v1/at-risk")
def at_risk_endpoint(req: AtRiskRequest):
    result = predict_at_risk(req)
    return result.model_dump()


# ---- Feature 10: Placement Policy Q&A (RAG) ----

@app.post("/v1/policy-qa")
def policy_qa_endpoint(req: PolicyQARequest):
    result = answer_policy_question(req)
    return result.model_dump()
