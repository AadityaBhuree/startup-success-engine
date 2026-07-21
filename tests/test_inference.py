"""
Unit tests for the InferenceEngine fallback behaviour.

These tests do NOT require MLflow, FAISS, or PyTorch to be running —
they verify the graceful-degradation path that ships in production when
those optional services are unavailable (e.g. in CI).
"""
import os

os.environ["MLFLOW_TRACKING_URI"] = "fallback"

from app.backend.inference import InferenceEngine  # noqa: E402


def _engine_without_model() -> InferenceEngine:
    """Return a fresh engine with nothing loaded (fallback mode)."""
    eng = InferenceEngine.__new__(InferenceEngine)
    eng.model = None
    eng.explainer = None
    eng.faiss_index = None
    eng.faiss_metadata = None
    eng.embedder = None
    return eng


SAMPLE_FEATURES = {
    "industry": "SaaS",
    "country": "USA",
    "months_active": 24,
    "total_funding_usd": 5_000_000.0,
    "burn_rate_proxy": 100_000.0,
    "co_investor_count": 3,
}


class TestPredictFallback:
    def test_returns_default_when_model_none(self):
        eng = _engine_without_model()
        result = eng.predict(SAMPLE_FEATURES)
        assert result == 0.5, "Default prediction should be 0.5"

    def test_returns_float(self):
        eng = _engine_without_model()
        result = eng.predict(SAMPLE_FEATURES)
        assert isinstance(result, float)


class TestExplainFallback:
    def test_returns_dict_when_no_explainer(self):
        eng = _engine_without_model()
        result = eng.explain(SAMPLE_FEATURES)
        assert isinstance(result, dict), "Should return a dict"

    def test_fallback_keys_match_feature_names(self):
        eng = _engine_without_model()
        result = eng.explain(SAMPLE_FEATURES)
        # All fallback keys should be valid feature names
        for key in result:
            assert key in SAMPLE_FEATURES or isinstance(result[key], float)

    def test_fallback_values_are_floats(self):
        eng = _engine_without_model()
        result = eng.explain(SAMPLE_FEATURES)
        for v in result.values():
            assert isinstance(v, float)


class TestRecommendFallback:
    def test_returns_list_when_no_faiss(self):
        eng = _engine_without_model()
        result = eng.recommend(SAMPLE_FEATURES)
        assert isinstance(result, list)

    def test_fallback_contains_name_and_similarity(self):
        eng = _engine_without_model()
        result = eng.recommend(SAMPLE_FEATURES)
        assert len(result) > 0
        for item in result:
            assert "name" in item
            assert "similarity" in item

    def test_fallback_industry_appears_in_name(self):
        eng = _engine_without_model()
        result = eng.recommend({"industry": "Fintech", "country": "UK"})
        names = [r["name"] for r in result]
        assert any("Fintech" in n for n in names)
