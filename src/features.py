"""
Feature Engineering Module.

Defines feature transformations applied on top of raw features before
model training. These computed features provide the model with richer
signals and are applied in the data pipeline.
"""
import pandas as pd


def compute_funding_velocity(df: pd.DataFrame) -> pd.DataFrame:
    """
    Funding velocity = total_funding_usd / months_active.

    Captures how quickly a startup has raised money relative to its age.
    A high value signals aggressive early growth capital; zero months_active
    is guarded against division-by-zero.
    """
    df = df.copy()
    df["funding_velocity"] = df["total_funding_usd"] / df["months_active"].replace(
        0, 1
    )
    return df


def compute_runway_months(df: pd.DataFrame) -> pd.DataFrame:
    """
    Runway (months) = total_funding_usd / burn_rate_proxy.

    Estimates how many months of operation the current funding covers.
    A runway < 12 months is a major risk signal.
    """
    df = df.copy()
    df["runway_months"] = df["total_funding_usd"] / df["burn_rate_proxy"].replace(
        0, 1
    )
    return df


def compute_network_centrality(df: pd.DataFrame) -> pd.DataFrame:
    """
    Network centrality proxy = log1p(co_investor_count).

    Logarithmically scales the number of co-investors to capture diminishing
    marginal value of each additional investor while preserving the signal.
    """
    import numpy as np

    df = df.copy()
    df["network_centrality"] = np.log1p(df["co_investor_count"])
    return df


def engineer_all_features(df: pd.DataFrame) -> pd.DataFrame:
    """Apply all feature engineering steps in sequence."""
    df = compute_funding_velocity(df)
    df = compute_runway_months(df)
    df = compute_network_centrality(df)
    return df
