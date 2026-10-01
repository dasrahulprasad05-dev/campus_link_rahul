"""
CampusLink ML Model Evaluation Script
Runs held-out test-set evaluation for all 3 ML models.
Reports R², accuracy, and basic performance metrics.

Usage:
  cd apps/ai-service
  python eval_models.py
"""

import numpy as np
import sys


def evaluate_readiness():
    """Feature 1: Readiness Predictor — train/test split evaluation."""
    from features.readiness_predictor import RidgeRegressionModel, _generate_training_data

    X, y = _generate_training_data(n_samples=600, seed=42)

    # 80/20 split
    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = RidgeRegressionModel(alpha=0.1)
    model.fit(X_train, y_train)

    y_pred = model.predict_raw(X_test)
    ss_res = np.sum((y_test - y_pred) ** 2)
    ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
    r2 = 1.0 - (ss_res / (ss_tot + 1e-7))
    rmse = float(np.sqrt(np.mean((y_test - y_pred) ** 2)))
    mae = float(np.mean(np.abs(y_test - y_pred)))

    print(f"  Feature 1 (Readiness Predictor)")
    print(f"    Train size: {len(X_train)}, Test size: {len(X_test)}")
    print(f"    Test R²:   {r2:.4f}")
    print(f"    Test RMSE: {rmse:.2f}")
    print(f"    Test MAE:  {mae:.2f}")
    return r2


def evaluate_ranker():
    """Feature 8: Candidate Ranker — train/test split evaluation."""
    from features.candidate_ranker import RankingModel, _generate_training_data

    X, y = _generate_training_data(n_samples=500, seed=11)

    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = RankingModel(alpha=1.0)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    ss_res = np.sum((y_test - y_pred) ** 2)
    ss_tot = np.sum((y_test - np.mean(y_test)) ** 2)
    r2 = 1.0 - (ss_res / (ss_tot + 1e-7))
    rmse = float(np.sqrt(np.mean((y_test - y_pred) ** 2)))

    print(f"\n  Feature 8 (Candidate Ranker)")
    print(f"    Train size: {len(X_train)}, Test size: {len(X_test)}")
    print(f"    Test R²:   {r2:.4f}")
    print(f"    Test RMSE: {rmse:.2f}")
    return r2


def evaluate_at_risk():
    """Feature 9: At-Risk Classifier — train/test split evaluation."""
    from features.at_risk_predictor import AtRiskClassifier, _generate_training_data

    X, y = _generate_training_data(n_samples=3000, seed=7)

    split = int(len(X) * 0.8)
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]

    model = AtRiskClassifier(lr=0.5, epochs=2000, l2=0.01)
    model.fit(X_train, y_train)

    # Predict on test set
    probs = np.array([model.predict_proba(x) for x in X_test])
    preds = (probs >= 0.5).astype(int)
    accuracy = float(np.mean(preds == y_test))

    # Precision / recall for positive class (at-risk = 1)
    tp = np.sum((preds == 1) & (y_test == 1))
    fp = np.sum((preds == 1) & (y_test == 0))
    fn = np.sum((preds == 0) & (y_test == 1))
    precision = float(tp / (tp + fp + 1e-7))
    recall = float(tp / (tp + fn + 1e-7))
    f1 = 2 * precision * recall / (precision + recall + 1e-7)

    print(f"\n  Feature 9 (At-Risk Classifier)")
    print(f"    Train size: {len(X_train)}, Test size: {len(X_test)}")
    print(f"    Test accuracy:  {accuracy:.4f}")
    print(f"    Test precision: {precision:.4f}")
    print(f"    Test recall:    {recall:.4f}")
    print(f"    Test F1:        {f1:.4f}")
    print(f"    Positive rate:  {np.mean(y_test):.3f}")
    return accuracy


if __name__ == "__main__":
    print("=" * 60)
    print("CampusLink ML Model Evaluation (Held-Out Test Set)")
    print("=" * 60)
    print("NOTE: All models are trained on SYNTHETIC data.\n")

    r2_readiness = evaluate_readiness()
    r2_ranker = evaluate_ranker()
    acc_risk = evaluate_at_risk()

    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    all_pass = r2_readiness > 0.5 and r2_ranker > 0.5 and acc_risk > 0.6
    print(f"  Readiness R2:  {r2_readiness:.4f} {'PASS' if r2_readiness > 0.5 else 'FAIL'}")
    print(f"  Ranker R2:     {r2_ranker:.4f} {'PASS' if r2_ranker > 0.5 else 'FAIL'}")
    print(f"  At-Risk Acc:   {acc_risk:.4f} {'PASS' if acc_risk > 0.6 else 'FAIL'}")
    print(f"\n  Overall: {'PASS' if all_pass else 'FAIL'}")

    sys.exit(0 if all_pass else 1)
