from fastapi.testclient import TestClient
from app.backend.main import app

client = TestClient(app)


def test_predict():
    payload = {
        "industry": "SaaS",
        "country": "USA",
        "months_active": 24,
        "total_funding_usd": 5000000,
        "burn_rate_proxy": 100000,
        "co_investor_count": 3,
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "success_probability" in data
    assert isinstance(data["success_probability"], float)


def test_explain():
    payload = {
        "industry": "SaaS",
        "country": "USA",
        "months_active": 24,
        "total_funding_usd": 5000000,
        "burn_rate_proxy": 100000,
        "co_investor_count": 3,
    }
    response = client.post("/api/v1/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "shap_values" in data
    assert isinstance(data["shap_values"], dict)


def test_recommend():
    payload = {
        "industry": "Fintech",
        "country": "UK",
        "months_active": 12,
        "total_funding_usd": 1000000,
        "burn_rate_proxy": 50000,
        "co_investor_count": 1,
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "similar_startups" in data
    assert isinstance(data["similar_startups"], list)
    if len(data["similar_startups"]) > 0:
        assert "name" in data["similar_startups"][0]
        assert "similarity" in data["similar_startups"][0]
