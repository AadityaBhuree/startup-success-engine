"""
Data Pipeline Module.

Handles loading raw data, applying Pandera schemas,
and performing initial cleaning (e.g. Isolation Forest).
"""
import pandas as pd
import pandera as pa
from sklearn.ensemble import IsolationForest

# Pandera schema for raw data validation
raw_startup_schema = pa.DataFrameSchema(
    {
        "startup_id": pa.Column(str),
        "name": pa.Column(str),
        "industry": pa.Column(str),
        "country": pa.Column(str),
        "months_active": pa.Column(int),
        "total_funding_usd": pa.Column(float),
        "burn_rate_proxy": pa.Column(float),
        "co_investor_count": pa.Column(int),
        "success": pa.Column(int, pa.Check.isin([0, 1])),
    }
)


def load_data(filepath: str) -> pd.DataFrame:
    """
    Load data from the given filepath.
    """
    return pd.read_csv(filepath)


def validate_raw_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Validate raw data using Pandera schemas.
    """
    return raw_startup_schema.validate(df)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean data, using Isolation Forest to flag and remove anomalies.
    """
    # Features used for anomaly detection
    features = ["months_active", "total_funding_usd", "co_investor_count"]

    # Initialize Isolation Forest
    iso_forest = IsolationForest(contamination=0.05, random_state=42)

    # Fit and predict anomalies (-1 is anomaly, 1 is normal)
    df["anomaly"] = iso_forest.fit_predict(df[features])

    # Keep only normal records and drop anomaly flag
    clean_df = df[df["anomaly"] == 1].drop(columns=["anomaly"]).reset_index(drop=True)

    print(f"Removed {len(df) - len(clean_df)} anomalies from the dataset.")
    return clean_df
