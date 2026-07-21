"""
Feast Feature Store Definitions.

Defines entities, data sources, and feature views for the
Startup Intelligence feature pipeline. The offline store uses
local CSV files; the online store uses Redis for low-latency serving.
"""
from datetime import timedelta

import pandas as pd
from feast import Entity, FeatureView, Field, FileSource
from feast.types import Float32, Int32, String

# ---------------------------------------------------------------------------
# Entity — the primary key for our feature lookups
# ---------------------------------------------------------------------------
startup = Entity(
    name="startup",
    description="A unique startup identified by its startup_id.",
    join_keys=["startup_id"],
)

# ---------------------------------------------------------------------------
# Data source — local CSV for the offline store
# ---------------------------------------------------------------------------
startup_source = FileSource(
    path="../data/raw/startups.csv",
    event_timestamp_column="created_timestamp",
    created_timestamp_column="created_timestamp",
)

# ---------------------------------------------------------------------------
# Feature view — all model input features for a startup
# ---------------------------------------------------------------------------
startup_features_view = FeatureView(
    name="startup_features",
    entities=[startup],
    ttl=timedelta(days=90),
    schema=[
        Field(name="industry", dtype=String),
        Field(name="country", dtype=String),
        Field(name="months_active", dtype=Int32),
        Field(name="total_funding_usd", dtype=Float32),
        Field(name="burn_rate_proxy", dtype=Float32),
        Field(name="co_investor_count", dtype=Int32),
    ],
    online=True,
    source=startup_source,
    tags={"team": "ml", "stage": "production"},
)
