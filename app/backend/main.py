from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from inference import InferenceEngine

app = FastAPI(title="Startup-Intelligence API")

# Initialize the Inference Engine at startup
inference_engine = InferenceEngine()

class StartupFeatures(BaseModel):
    industry: str
    country: str
    months_active: int
    total_funding_usd: float
    burn_rate_proxy: float
    co_investor_count: int

class PredictionResponse(BaseModel):
    success_probability: float

class ExplanationResponse(BaseModel):
    shap_values: Dict[str, float]

class RecommendationResponse(BaseModel):
    similar_startups: List[Dict[str, Any]]

@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(features: StartupFeatures):
    """
    Predict success probability for a startup based on its features.
    """
    prob = inference_engine.predict(features.dict())
    return {"success_probability": prob}

@app.post("/api/v1/explain", response_model=ExplanationResponse)
def explain(features: StartupFeatures):
    """
    Generate SHAP explanation for the prediction.
    """
    # TODO: Run SHAP explanation
    return {"shap_values": {"funding_velocity": 0.2, "burn_rate_proxy": -0.1}}

@app.post("/api/v1/recommend", response_model=RecommendationResponse)
def recommend(startup_data: Dict[str, Any]):
    """
    Recommend similar startups using FAISS embeddings.
    """
    # TODO: Generate embedding and search FAISS index (cached in Redis)
    return {"similar_startups": [{"name": "MockStartup A", "similarity": 0.9}]}
