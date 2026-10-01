# MODEL CARD — CampusLink ML Models

## Overview

CampusLink uses **three custom ML models** implemented in pure NumPy (no external ML framework dependencies). All models are trained at startup on **synthetic data** — they are NOT trained on real student placement records.

> **⚠️ IMPORTANT**: All training data is generated programmatically. Scores produced by these models should be treated as demo estimates, not validated predictions. Before deploying in a real campus placement scenario, models must be retrained on actual historical data.

---

## Model 1: Placement Readiness Predictor (Feature 1)

| Property | Value |
|---|---|
| **File** | `features/readiness_predictor.py` |
| **Type** | Regularized multivariate regression with non-linear feature expansion |
| **Input** | 7 features: CGPA, aptitude, communication, projects, certifications, internship (months), mock interview score |
| **Output** | Readiness score (0–100), confidence interval, feature importances, tier classification |
| **Training Data** | 600 synthetic samples (NumPy random with hand-crafted target function) |
| **Regularization** | L2 (Ridge), α = 0.1 |
| **Feature Expansion** | 2 synergy terms (CGPA×aptitude, projects×certifications), 2 high-tier indicators |
| **Evaluation** | R² on training set (reported at startup) |
| **Known Limitations** | - Synthetic data may not reflect real placement distributions<br>- No cross-validation or held-out test set<br>- Linear model with limited non-linear capacity |

---

## Model 2: Candidate Ranker (Feature 8)

| Property | Value |
|---|---|
| **File** | `features/candidate_ranker.py` |
| **Type** | Ridge regression ranking model |
| **Input** | 4 features: skill match ratio, CGPA (normalized), project count (normalized), readiness score (normalized) |
| **Output** | Match score (0–100), ranked candidate list with per-factor breakdown |
| **Training Data** | 500 synthetic samples with skill×project interaction term |
| **Regularization** | L2 (Ridge), α = 1.0 |
| **Evaluation** | R² on training set (reported at startup) |
| **Known Limitations** | - Fixed 4-factor model cannot capture domain-specific hiring preferences<br>- Skill matching is token-level (no semantic understanding)<br>- Synthetic target function assumes skill match dominates |

---

## Model 3: At-Risk Classifier (Feature 9)

| Property | Value |
|---|---|
| **File** | `features/at_risk_predictor.py` |
| **Type** | Binary logistic regression trained via gradient descent |
| **Input** | 8 risk components: readiness, trend, inactivity, profile completeness, applications count, CGPA, aptitude, interview score |
| **Output** | Risk probability (0.0–1.0), risk level (low/medium/high), risk factor breakdown, recommended actions |
| **Training Data** | 3000 synthetic samples, ~25–30% positive rate (calibrated bias) |
| **Hyperparameters** | LR = 0.5, epochs = 2000, L2 = 0.01 |
| **Evaluation** | Accuracy + cross-entropy loss on training set (reported at startup) |
| **Known Limitations** | - Synthetic labels may not match real student dropout patterns<br>- Explanations are post-hoc (rule-based), not SHAP-based attributions<br>- No temporal modeling (single-snapshot prediction) |

---

## NLP Components (Features 2 & 3)

| Property | Value |
|---|---|
| **Files** | `features/skill_gap_analyzer.py`, `features/resume_matcher.py` |
| **Type** | Hashing-trick sparse vectors (NOT dense/transformer embeddings) |
| **Dimensionality** | 256-dim vectors |
| **Method** | Char 3-grams + whole-word hashing → cosine similarity |
| **Synonym Map** | 60+ entries covering common abbreviations (JS, ML, py, k8s, etc.) |
| **Known Limitations** | - Cannot capture true semantic similarity (only token overlap)<br>- Synonym map is manually curated and incomplete<br>- No contextual understanding of skill relationships |

---

## LLM Features (Features 4, 5, 7, 10)

| Property | Value |
|---|---|
| **Provider** | Groq API |
| **Models** | Auto-discovered (prefers `openai/gpt-oss-20b`, falls back to `llama-3.1-8b-instant`) |
| **Reliability** | Retry with exponential backoff (max 2 retries), cold-start timeout (30s), fallback model switching |
| **Feature 10 (RAG)** | BM25 retrieval over markdown policy documents + LLM synthesis with hallucination guard (min score threshold) |

---

## Ethical Considerations

- **Fairness**: Models have not been audited for bias across demographic groups
- **Transparency**: All scores include explainable breakdowns (factor weights, matched/missing skills)
- **Data Privacy**: No real student data is stored or transmitted; all training is synthetic
- **Intended Use**: Educational campus placement preparation platform — NOT a substitute for human judgment in hiring decisions
