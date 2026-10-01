"""
CampusLink Behavioral Quality Tests
Goes beyond HTTP 200 / field-exists checks to verify the LOGIC is correct:
- Strong candidate > weak candidate (Feature 8)
- High-risk profile scored higher than low-risk (Feature 9)
- Skill-gap detects known missing skills (Feature 2)
- Resume matcher rewards relevant skills (Feature 3)
- Readiness: more skills/higher CGPA -> higher score (Feature 1)
- Policy QA hallucination guard blocks off-topic questions (Feature 10)
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)
passed = 0
failed = 0


def check(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS  {name}")
    else:
        failed += 1
        print(f"  FAIL  {name} -- {detail}")


def test_readiness_behavioral():
    """Feature 1: Higher CGPA + more skills should yield higher readiness."""
    print("\n[Feature 1] Readiness Predictor — Behavioral")

    strong = client.post("/v1/readiness", json={
        "skills": ["Python", "SQL", "Git", "Docker", "React"],
        "projects_count": 4, "cgpa": 9.0, "aptitude_score": 90,
        "profile_completion": 100
    }).json()

    weak = client.post("/v1/readiness", json={
        "skills": ["Excel"],
        "projects_count": 0, "cgpa": 5.5, "aptitude_score": 30,
        "profile_completion": 20
    }).json()

    check("Strong student scores higher than weak",
          strong["score"] > weak["score"],
          f"strong={strong['score']}, weak={weak['score']}")

    check("Strong student score >= 60",
          strong["score"] >= 60,
          f"got {strong['score']}")

    check("Weak student score <= 50",
          weak["score"] <= 50,
          f"got {weak['score']}")

    check("Confidence interval is ordered [low, high]",
          strong["confidence_interval"][0] <= strong["confidence_interval"][1],
          f"CI={strong['confidence_interval']}")


def test_skill_gap_behavioral():
    """Feature 2: Known missing skills should appear in gaps."""
    print("\n[Feature 2] Skill-Gap Analyzer — Behavioral")

    r = client.post("/v1/skill-gap", json={
        "target_role": "Data Analyst",
        "skills": ["Python"]
    }).json()

    missing_names = [m["skill"].lower() for m in r["missing"]]

    check("SQL appears in missing skills for Data Analyst",
          any("sql" in s for s in missing_names),
          f"missing: {missing_names}")

    check("Python is matched (not missing)",
          "Python" in r["matched"],
          f"matched: {r['matched']}")

    # Synonym test: 'PostgreSQL' should match 'SQL' requirement
    r2 = client.post("/v1/skill-gap", json={
        "target_role": "Data Analyst",
        "skills": ["Python", "PostgreSQL", "Tableau", "Excel", "Statistics"]
    }).json()

    check("PostgreSQL recognized as SQL (synonym match)",
          "SQL" in r2["matched"],
          f"matched: {r2['matched']}")


def test_resume_matcher_behavioral():
    """Feature 3: Relevant skills should score higher than irrelevant."""
    print("\n[Feature 3] Resume Matcher — Behavioral")

    good = client.post("/v1/resume-match", json={
        "job_description": "We need Python, SQL, and Docker skills for a data engineering role.",
        "student_skills": ["Python", "SQL", "Docker", "Git"],
        "resume_text": "Built ETL pipelines with Python and SQL. Deployed services using Docker."
    }).json()

    bad = client.post("/v1/resume-match", json={
        "job_description": "We need Python, SQL, and Docker skills for a data engineering role.",
        "student_skills": ["Painting", "Cooking"],
        "resume_text": "I enjoy painting and cooking as hobbies."
    }).json()

    check("Relevant candidate scores higher than irrelevant",
          good["score"] > bad["score"],
          f"good={good['score']}, bad={bad['score']}")

    check("Good match score >= 40",
          good["score"] >= 40,
          f"got {good['score']}")

    check("Bad match score <= 30",
          bad["score"] <= 30,
          f"got {bad['score']}")


def test_candidate_ranker_behavioral():
    """Feature 8: Strong candidate must rank above weak candidate."""
    print("\n[Feature 8] Candidate Ranker — Behavioral")

    r = client.post("/v1/candidate-match", json={
        "job_skills": ["Python", "SQL", "Machine Learning", "Docker"],
        "candidates": [
            {"name": "Strong", "skills": ["Python", "SQL", "Machine Learning", "Docker"],
             "cgpa": 9.2, "projects_count": 5, "readiness_score": 92},
            {"name": "Medium", "skills": ["Python", "SQL"],
             "cgpa": 7.5, "projects_count": 2, "readiness_score": 65},
            {"name": "Weak", "skills": ["Cooking"],
             "cgpa": 5.0, "projects_count": 0, "readiness_score": 20},
        ]
    }).json()

    candidates = r["candidates"]
    scores = {c["name"]: c["match_score"] for c in candidates}

    check("Strong > Medium > Weak ordering",
          scores["Strong"] > scores["Medium"] > scores["Weak"],
          f"scores: {scores}")

    check("Strong score >= 70",
          scores["Strong"] >= 70,
          f"got {scores['Strong']}")

    check("Weak score <= 40",
          scores["Weak"] <= 40,
          f"got {scores['Weak']}")

    check("First ranked candidate is Strong",
          candidates[0]["name"] == "Strong",
          f"first was {candidates[0]['name']}")

    # Check matched skills are reported
    strong_c = next(c for c in candidates if c["name"] == "Strong")
    check("Strong candidate has matched skills listed",
          len(strong_c["matched_skills"]) >= 3,
          f"matched: {strong_c['matched_skills']}")


def test_at_risk_behavioral():
    """Feature 9: High-risk profile should score higher risk than healthy profile."""
    print("\n[Feature 9] At-Risk Classifier — Behavioral")

    high_risk = client.post("/v1/at-risk", json={
        "readiness_score": 25, "readiness_trend": -8.0,
        "days_inactive": 40, "profile_completion": 30,
        "applications_count": 0, "cgpa": 5.5,
        "aptitude_score": 25, "interview_score": 0
    }).json()

    low_risk = client.post("/v1/at-risk", json={
        "readiness_score": 90, "readiness_trend": 5.0,
        "days_inactive": 0, "profile_completion": 100,
        "applications_count": 8, "cgpa": 9.5,
        "aptitude_score": 95, "interview_score": 90
    }).json()

    check("High-risk probability > low-risk probability",
          high_risk["risk_probability"] > low_risk["risk_probability"],
          f"high={high_risk['risk_probability']}, low={low_risk['risk_probability']}")

    check("High-risk level is 'high'",
          high_risk["risk_level"] == "high",
          f"got '{high_risk['risk_level']}'")

    check("Low-risk level is 'low'",
          low_risk["risk_level"] == "low",
          f"got '{low_risk['risk_level']}'")

    check("High-risk has risk factors",
          len(high_risk["risk_factors"]) >= 3,
          f"got {len(high_risk['risk_factors'])} factors")

    check("High-risk has recommended actions",
          len(high_risk["recommended_actions"]) >= 2,
          f"got {len(high_risk['recommended_actions'])} actions")


def test_policy_qa_hallucination_guard():
    """Feature 10: Off-topic question should be blocked by BM25 threshold."""
    print("\n[Feature 10] Policy QA Hallucination Guard — Behavioral")

    # On-topic question
    on_topic = client.post("/v1/policy-qa", json={
        "question": "What is the minimum CGPA required for placement eligibility?"
    }).json()

    # Off-topic question that should NOT produce a confident answer
    off_topic = client.post("/v1/policy-qa", json={
        "question": "What is the recipe for chocolate cake?"
    }).json()

    check("On-topic question gets an answer",
          len(on_topic["answer"]) > 20,
          f"answer length: {len(on_topic['answer'])}")

    check("On-topic confidence > 0.3",
          on_topic["confidence"] > 0.3,
          f"got {on_topic['confidence']}")

    check("Off-topic question has low confidence (hallucination guard)",
          off_topic["confidence"] <= 0.3,
          f"got {off_topic['confidence']}")

    check("Off-topic answer mentions 'couldn't find' or 'not covered' or 'TPO'",
          any(kw in off_topic["answer"].lower() for kw in ["couldn't find", "not covered", "tpo", "consult"]),
          f"answer: {off_topic['answer'][:100]}")


if __name__ == "__main__":
    print("=" * 60)
    print("CampusLink BEHAVIORAL Quality Tests")
    print("=" * 60)

    test_readiness_behavioral()
    test_skill_gap_behavioral()
    test_resume_matcher_behavioral()
    test_candidate_ranker_behavioral()
    test_at_risk_behavioral()
    test_policy_qa_hallucination_guard()

    print("\n" + "=" * 60)
    total = passed + failed
    print(f"Results: {passed}/{total} passed, {failed} failed")
    print("=" * 60)

    import sys
    sys.exit(0 if failed == 0 else 1)
