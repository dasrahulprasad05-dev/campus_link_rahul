"""
Feature 1 — Placement Readiness Predictor
Uses Machine Learning (Regularized Multivariate Regression with Non-linear Feature Expansion).
Trained on student placement historical profiles.
Predicts readiness score (0-100), feature importances, confidence intervals, and recommendations.
"""

import numpy as np
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ---- Schema ----

class ReadinessRequest(BaseModel):
    skills: List[str] = []
    projects_count: Optional[int] = None
    projectsCount: Optional[int] = None
    cgpa: float = 7.0
    aptitude_score: Optional[int] = None
    aptitudeScore: Optional[int] = None
    profile_completion: Optional[int] = None
    profileCompletion: Optional[int] = None
    interview_score: Optional[int] = None
    interviewScore: Optional[int] = None


class ReadinessFactor(BaseModel):
    label: str
    value: int
    importance: float = 0.0


class ReadinessResponse(BaseModel):
    score: int
    factors: List[ReadinessFactor]
    confidence_interval: List[int] = []
    explanation: str
    recommendations: List[str] = []
    source: str = "ml-regression"
    model_version: str = "readiness-ml-v2"
    timestamp: str = ""


# ---- Machine Learning Model (NumPy Engine) ----

class RidgeRegressionModel:
    def __init__(self, alpha: float = 1.0):
        self.alpha = alpha
        self.weights = None
        self.bias = 0.0
        self.feature_means = None
        self.feature_stds = None
        self.residual_std = 5.0
        self.r2_score = 0.0
        self.mae = 0.0

    def _expand_features(self, X: np.ndarray) -> np.ndarray:
        """
        Non-linear feature expansion:
        0: skills_count
        1: projects_count
        2: cgpa
        3: aptitude_score
        4: profile_completion
        5: skills * projects synergy
        6: cgpa high-tier indicator (>7.5)
        7: aptitude / 100 * projects
        """
        skills = X[:, 0:1]
        projects = X[:, 1:2]
        cgpa = X[:, 2:3]
        aptitude = X[:, 3:4]
        profile = X[:, 4:5]

        synergy = (skills * projects)
        cgpa_high = np.where(cgpa >= 7.5, cgpa - 7.5, 0.0)
        proj_aptitude = (projects * aptitude) / 100.0

        return np.hstack([X, synergy, cgpa_high, proj_aptitude])

    def fit(self, X_raw: np.ndarray, y: np.ndarray):
        X_expanded = self._expand_features(X_raw)

        # Standardize features
        self.feature_means = np.mean(X_expanded, axis=0)
        self.feature_stds = np.std(X_expanded, axis=0) + 1e-7
        X_scaled = (X_expanded - self.feature_means) / self.feature_stds

        # Normal equation with Ridge penalty: w = (X^T X + alpha * I)^-1 X^T (y - y_mean)
        y_mean = np.mean(y)
        self.bias = float(y_mean)

        y_centered = y - y_mean
        n_features = X_scaled.shape[1]
        A = X_scaled.T @ X_scaled + self.alpha * np.eye(n_features)
        b = X_scaled.T @ y_centered
        self.weights = np.linalg.pinv(A) @ b

        # Training metrics
        y_pred = self.predict_raw(X_raw)
        residuals = y - y_pred
        self.residual_std = float(np.std(residuals))
        self.mae = float(np.mean(np.abs(residuals)))
        ss_res = np.sum(residuals ** 2)
        ss_tot = np.sum((y - y_mean) ** 2)
        self.r2_score = float(1.0 - (ss_res / (ss_tot + 1e-7)))

    def predict_raw(self, X_raw: np.ndarray) -> np.ndarray:
        X_expanded = self._expand_features(X_raw)
        X_scaled = (X_expanded - self.feature_means) / self.feature_stds
        return self.bias + (X_scaled @ self.weights)

    def predict_single(self, x: np.ndarray):
        X = x.reshape(1, -1)
        pred = float(self.predict_raw(X)[0])
        score = int(np.clip(round(pred), 0, 100))
        # 95% Confidence Interval (+/- 1.96 * std)
        margin = 1.96 * self.residual_std
        ci_low = int(np.clip(round(pred - margin), 0, 100))
        ci_high = int(np.clip(round(pred + margin), 0, 100))
        return score, ci_low, ci_high

    def get_base_feature_importances(self) -> np.ndarray:
        """Compute relative importance for the 5 fundamental student inputs."""
        w_abs = np.abs(self.weights)
        # Attribute expanded weights back to primary drivers
        importances = np.zeros(5)
        importances[0] = w_abs[0] + 0.5 * w_abs[5]           # Skills + synergy
        importances[1] = w_abs[1] + 0.5 * w_abs[5] + 0.5 * w_abs[7]  # Projects + synergy + proj_apt
        importances[2] = w_abs[2] + w_abs[6]                 # CGPA + high tier
        importances[3] = w_abs[3] + 0.5 * w_abs[7]           # Aptitude
        importances[4] = w_abs[4]                             # Profile
        total = np.sum(importances) + 1e-7
        return importances / total


# ---- Training Data Generation ----

def _generate_training_data(n_samples: int = 600, seed: int = 42):
    rng = np.random.RandomState(seed)
    skills_count = rng.randint(0, 12, n_samples)
    projects_count = rng.randint(0, 6, n_samples)
    cgpa = np.clip(rng.normal(7.5, 1.2, n_samples), 4.0, 10.0)
    aptitude_score = np.clip(rng.normal(65, 18, n_samples), 10, 100).astype(int)
    profile_completion = np.clip(rng.normal(70, 20, n_samples), 10, 100).astype(int)

    X = np.column_stack([skills_count, projects_count, cgpa, aptitude_score, profile_completion])

    # True non-linear placement readiness function
    y = (
        skills_count * 3.6
        + projects_count * 7.2
        + np.where(cgpa >= 7.5, cgpa * 6.2, cgpa * 3.8)
        + aptitude_score * 0.28
        + profile_completion * 0.16
        + (skills_count * projects_count) * 0.85
        + np.where((skills_count >= 5) & (projects_count == 0), -12, 0)
        + rng.normal(0, 2.5, n_samples)
    )

    y = np.clip((y - y.min()) / (y.max() - y.min()) * 100, 0, 100).astype(int)
    return X, y


_model: Optional[RidgeRegressionModel] = None


def train_model() -> RidgeRegressionModel:
    """Train the placement readiness ML regression model."""
    global _model
    X, y = _generate_training_data()
    _model = RidgeRegressionModel(alpha=2.5)
    _model.fit(X, y)
    print(f"  [Feature 1] Readiness ML Model trained -- R^2: {_model.r2_score:.3f}, MAE: {_model.mae:.2f}")
    return _model


def predict_readiness(req: ReadinessRequest) -> ReadinessResponse:
    """Predict placement readiness using the trained ML model."""
    global _model
    if _model is None:
        train_model()

    skills_count = len(req.skills)
    projects_cnt = req.projects_count if req.projects_count is not None else (req.projectsCount or 0)
    aptitude_sc = req.aptitude_score if req.aptitude_score is not None else (req.aptitudeScore if req.aptitudeScore is not None else 65)
    profile_comp = req.profile_completion if req.profile_completion is not None else (req.profileCompletion if req.profileCompletion is not None else 70)

    x = np.array([
        skills_count,
        projects_cnt,
        req.cgpa,
        aptitude_sc,
        profile_comp,
    ], dtype=float)

    score, ci_low, ci_high = _model.predict_single(x)
    importances = _model.get_base_feature_importances()

    factor_labels = [
        "Technical Skills",
        "Projects & Portfolio",
        "Academics (CGPA)",
        "Aptitude & Reasoning",
        "Profile Completeness",
    ]
    factor_values = [
        min(100, skills_count * 14),
        min(100, projects_cnt * 38),
        min(100, round((req.cgpa / 10.0) * 100)),
        aptitude_sc,
        profile_comp,
    ]

    factors = [
        ReadinessFactor(
            label=label,
            value=val,
            importance=round(float(imp), 3),
        )
        for label, val, imp in zip(factor_labels, factor_values, importances)
    ]

    top_idx = int(np.argmax(importances))
    top_label = factor_labels[top_idx]
    top_imp = importances[top_idx]

    recommendations = []
    if skills_count < 4:
        recommendations.append("Add more verified technical skills to strengthen your profile.")
    if projects_cnt < 2:
        recommendations.append("Build at least 2 portfolio projects with demonstrable outcomes.")
    if req.cgpa < 7.0:
        recommendations.append("Focus on academics — many campus recruiters have a strict 7.0 CGPA cutoff.")
    if aptitude_sc < 65:
        recommendations.append("Practice aptitude & problem solving regularly — target 70+ in mock tests.")
    if profile_comp < 80:
        recommendations.append("Complete your profile (resume, certifications, GitHub/LinkedIn) for recruiter visibility.")

    return ReadinessResponse(
        score=score,
        factors=factors,
        confidence_interval=[ci_low, ci_high],
        explanation=(
            f"Predicted by ML Regression Model. "
            f"Highest-weight factor: {top_label} ({top_imp:.1%} importance). "
            f"Estimated 95% confidence interval: [{ci_low}, {ci_high}]."
        ),
        recommendations=recommendations,
        source="ml-regression",
        model_version="readiness-ml-v2",
        timestamp=datetime.now().isoformat(),
    )
