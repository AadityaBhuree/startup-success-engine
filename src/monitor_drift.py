"""
Data Drift Monitor using Evidently AI.

Compares the most recent batch of predictions against the original training
distribution to detect covariate drift. Designed to be run on a schedule
(e.g. monthly via a GitHub Actions cron job).

Usage:
    python src/monitor_drift.py

Outputs:
    data/drift_report.html  — Full interactive drift report
    data/drift_summary.json — Machine-readable drift metrics
"""
import os
import json
import pandas as pd
from pathlib import Path


def load_reference_data(path: str = "data/raw/startups.csv") -> pd.DataFrame:
    """Load the training dataset as the reference distribution."""
    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Reference dataset not found at {path}. "
            "Run 'python src/utils/generate_mock_data.py' first."
        )
    df = pd.read_csv(path)
    feature_cols = [
        "industry",
        "country",
        "months_active",
        "total_funding_usd",
        "burn_rate_proxy",
        "co_investor_count",
    ]
    return df[feature_cols]


def load_current_data(path: str = "data/processed/recent_predictions.csv"):
    """
    Load recent production traffic for drift comparison.

    In production, this would be populated by logging incoming API requests.
    Falls back to a synthetic sample of the reference data for demo purposes.
    """
    if os.path.exists(path):
        return pd.read_csv(path)

    print(
        f"[WARN] No recent predictions found at {path}. "
        "Using a synthetic sample for demonstration."
    )
    reference = load_reference_data()
    return reference.sample(frac=0.2, random_state=42).reset_index(drop=True)


def run_drift_report():
    """
    Generate an Evidently column drift report.
    Saves HTML report and JSON summary to data/.
    """
    try:
        from evidently.report import Report
        from evidently.metric_preset import DataDriftPreset
    except ImportError:
        print(
            "[ERROR] Evidently is not installed. "
            "Add it with: poetry add evidently"
        )
        return

    print("Loading reference dataset...")
    reference_df = load_reference_data()

    print("Loading current (production) dataset...")
    current_df = load_current_data()

    print("Generating drift report...")
    report = Report(metrics=[DataDriftPreset()])
    report.run(reference_data=reference_df, current_data=current_df)

    Path("data").mkdir(exist_ok=True)
    html_path = "data/drift_report.html"
    json_path = "data/drift_summary.json"

    report.save_html(html_path)
    print(f"HTML report saved to {html_path}")

    result_dict = report.as_dict()
    with open(json_path, "w") as f:
        json.dump(result_dict, f, indent=2, default=str)
    print(f"JSON summary saved to {json_path}")

    # Print a quick drift summary
    try:
        share_drifted = result_dict["metrics"][0]["result"]["share_of_drifted_columns"]
        print(f"\nDrift Summary: {share_drifted:.1%} of columns show drift.")
        if share_drifted > 0.5:
            print("[ALERT] >50% of columns drifted. Consider retraining the model.")
        else:
            print("[OK] Drift within acceptable bounds.")
    except (KeyError, IndexError):
        pass


if __name__ == "__main__":
    run_drift_report()
