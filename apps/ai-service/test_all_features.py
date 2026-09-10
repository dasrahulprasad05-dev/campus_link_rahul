"""
Comprehensive Test Suite for all 9 AI Service Features
Tests all endpoints using FastAPI TestClient to ensure:
- HTTP 200 responses
- Valid JSON schema
- Real predictions, rankings, evaluations, generations, and RAG answers
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def run_tests():
    print("==================================================")
    print("CAMPUSLINK AI SERVICE — 9 FEATURE INTEGRATION TEST")
    print("==================================================\n")

    # 0. Health
    print("[0] Testing /health ...", end=" ")
    r = client.get("/health")
    assert r.status_code == 200, f"Health failed: {r.text}"
    print("PASS! status:", r.json()["status"])

    # 1. Feature 1: Readiness Predictor
    print("[1] Testing /v1/readiness (Feature 1: ML Regression) ...", end=" ")
    r = client.post("/v1/readiness", json={
        "skills": ["Python", "SQL", "Git"],
        "projects_count": 2,
        "cgpa": 8.0,
        "aptitude_score": 75,
        "profile_completion": 85
    })
    assert r.status_code == 200, f"Readiness failed: {r.text}"
    data = r.json()
    assert 0 <= data["score"] <= 100
    assert len(data["factors"]) == 5
    assert len(data["confidence_interval"]) == 2
    print(f"PASS! Score: {data['score']}, CI: {data['confidence_interval']}")

    # 2. Feature 2: Skill-Gap Analysis
    print("[2] Testing /v1/skill-gap (Feature 2: NLP Taxonomy & Vector Embeddings) ...", end=" ")
    r = client.post("/v1/skill-gap", json={
        "target_role": "Data Analyst",
        "skills": ["Python", "PostgreSQL", "Excel"]
    })
    assert r.status_code == 200, f"Skill gap failed: {r.text}"
    data = r.json()
    assert "SQL" in data["matched"]
    assert len(data["missing"]) > 0
    print(f"PASS! Matched: {data['matched']}, Missing: {len(data['missing'])}")

    # 3. Feature 3: Resume Matcher
    print("[3] Testing /v1/resume-match (Feature 3: NLP Vector Matcher) ...", end=" ")
    r = client.post("/v1/resume-match", json={
        "job_description": "We need a Software Engineer skilled in Python, Docker, and REST APIs.",
        "student_skills": ["Python", "FastAPI", "Git"],
        "resume_text": "Built web services with Docker containers and REST APIs."
    })
    assert r.status_code == 200, f"Resume match failed: {r.text}"
    data = r.json()
    assert 0 <= data["score"] <= 100
    assert len(data["matched"]) > 0
    print(f"PASS! Score: {data['score']}%, Matched: {data['matched']}")

    # 4. Feature 4: Interview Coach
    print("[4] Testing /v1/interview-feedback (Feature 4: Groq LLM STAR Coach) ...", end=" ")
    r = client.post("/v1/interview-feedback", json={
        "target_role": "Data Analyst",
        "question": "Tell me about a difficult problem you solved.",
        "answer": "Our client dataset had 20 percent missing records. I conducted root cause analysis and built an imputation model using median grouping, which reduced data loss to 2 percent and improved report delivery time."
    })
    assert r.status_code == 200, f"Interview feedback failed: {r.text}"
    data = r.json()
    assert 0 <= data["score"] <= 100
    assert len(data["feedback"]) > 10
    print(f"PASS! Score: {data['score']}, Strengths: {len(data.get('strengths', []))}")

    # 5. Feature 5: Adaptive Question Generator
    print("[5] Testing /v1/generate-questions (Feature 5: Groq LLM Adaptive Generator) ...", end=" ")
    r = client.post("/v1/generate-questions", json={
        "target_role": "Software Engineer",
        "skill_gaps": ["Docker", "System Design"],
        "count": 2,
        "difficulty": "medium"
    })
    assert r.status_code == 200, f"Generate questions failed: {r.text}"
    data = r.json()
    assert len(data["questions"]) >= 1
    print(f"PASS! Generated {len(data['questions'])} questions")

    # 6. Feature 7: Career Roadmap Generator
    print("[6] Testing /v1/generate-roadmap (Feature 7: Groq LLM Personalized Roadmap) ...", end=" ")
    r = client.post("/v1/generate-roadmap", json={
        "target_role": "Full Stack Developer",
        "skill_gaps": ["React", "Docker"],
        "weeks_until_placement": 6
    })
    assert r.status_code == 200, f"Generate roadmap failed: {r.text}"
    data = r.json()
    assert len(data["milestones"]) >= 4
    print(f"PASS! Milestones: {len(data['milestones'])}, Summary length: {len(data['summary'])}")

    # 7. Feature 8: Candidate Ranker
    print("[7] Testing /v1/candidate-match (Feature 8: ML Candidate Ranker) ...", end=" ")
    r = client.post("/v1/candidate-match", json={
        "job_skills": ["Python", "SQL", "React"],
        "candidates": [
            {"name": "Candidate A", "skills": ["Python", "SQL", "React"], "cgpa": 8.5, "projects_count": 3, "readiness_score": 85},
            {"name": "Candidate B", "skills": ["C++"], "cgpa": 6.8, "projects_count": 0, "readiness_score": 40}
        ]
    })
    assert r.status_code == 200, f"Candidate match failed: {r.text}"
    data = r.json()
    assert data["candidates"][0]["name"] == "Candidate A"
    assert data["candidates"][0]["match_score"] > data["candidates"][1]["match_score"]
    print(f"PASS! Top candidate: {data['candidates'][0]['name']} ({data['candidates'][0]['match_score']}%)")

    # 8. Feature 9: At-Risk Predictor
    print("[8] Testing /v1/at-risk (Feature 9: ML Early Warning) ...", end=" ")
    r = client.post("/v1/at-risk", json={
        "readiness_score": 38,
        "readiness_trend": -6.0,
        "days_inactive": 25,
        "profile_completion": 45,
        "applications_count": 0,
        "cgpa": 6.1,
        "aptitude_score": 40,
        "interview_score": 0
    })
    assert r.status_code == 200, f"At-risk failed: {r.text}"
    data = r.json()
    assert data["risk_level"] == "high"
    assert len(data["risk_factors"]) > 0
    print(f"PASS! Risk probability: {data['risk_probability']}, Level: {data['risk_level']}")

    # 9. Feature 10: Policy QA (RAG)
    print("[9] Testing /v1/policy-qa (Feature 10: RAG Policy Assistant) ...", end=" ")
    r = client.post("/v1/policy-qa", json={
        "question": "What is the penalty for withdrawing after accepting an offer?"
    })
    assert r.status_code == 200, f"Policy QA failed: {r.text}"
    data = r.json()
    assert len(data["answer"]) > 20
    assert len(data["sources"]) > 0
    print(f"PASS! Answer length: {len(data['answer'])}, Sources: {len(data['sources'])}")

    print("\n==================================================")
    print("ALL 9 AI SERVICE FEATURES PASSED INTEGRATION TESTS!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
