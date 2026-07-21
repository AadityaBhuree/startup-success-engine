"""
Unit tests for the data pipeline (load, validate, clean).

These tests use in-memory DataFrames and do not touch the filesystem
or any running service.
"""
import pandas as pd
import pytest
import pandera as pa

from src.data_pipeline import validate_raw_data, clean_data


def _make_valid_df(n: int = 20) -> pd.DataFrame:
    """Build a minimal valid DataFrame matching the Pandera schema."""
    return pd.DataFrame(
        {
            "startup_id": [f"s{i}" for i in range(n)],
            "name": [f"Startup {i}" for i in range(n)],
            "industry": ["SaaS"] * n,
            "country": ["USA"] * n,
            "months_active": [12] * n,
            "total_funding_usd": [1_000_000.0] * n,
            "burn_rate_proxy": [50_000.0] * n,
            "co_investor_count": [2] * n,
            "success": [1 if i % 2 == 0 else 0 for i in range(n)],
        }
    )


class TestValidateRawData:
    def test_valid_dataframe_passes(self):
        df = _make_valid_df()
        result = validate_raw_data(df)
        assert len(result) == len(df)

    def test_missing_required_column_raises(self):
        df = _make_valid_df().drop(columns=["success"])
        with pytest.raises(Exception):  # pandera SchemaError
            validate_raw_data(df)

    def test_invalid_success_value_raises(self):
        df = _make_valid_df()
        df.loc[0, "success"] = 99  # invalid: not in [0, 1]
        with pytest.raises(pa.errors.SchemaError):
            validate_raw_data(df)

    def test_returns_dataframe(self):
        df = _make_valid_df()
        result = validate_raw_data(df)
        assert isinstance(result, pd.DataFrame)


class TestCleanData:
    def test_returns_dataframe(self):
        df = _make_valid_df(30)
        result = clean_data(df)
        assert isinstance(result, pd.DataFrame)

    def test_output_has_no_anomaly_column(self):
        df = _make_valid_df(30)
        result = clean_data(df)
        assert "anomaly" not in result.columns

    def test_output_fewer_or_equal_rows(self):
        df = _make_valid_df(50)
        result = clean_data(df)
        assert len(result) <= len(df)

    def test_output_contains_required_columns(self):
        df = _make_valid_df(30)
        result = clean_data(df)
        for col in ["startup_id", "industry", "success"]:
            assert col in result.columns
