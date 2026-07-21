from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import List, Dict, Any
import time
import logging
from prometheus_fastapi_instrumentator import Instrumentator

from app.backend.inference import InferenceEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Startup-Intelligence API")

# Expose /metrics endpoint for Prometheus scraping
Instrumentator().instrument(app).expose(app)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log each request with method, path, and response time."""
    start = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start) * 1000
    logger.info(
        "%s %s -> %s (%.1fms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


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


@app.get("/health")
def health():
    """Health check endpoint for uptime monitoring and Docker health checks."""
    return {
        "status": "ok",
        "model_loaded": inference_engine.model is not None,
        "faiss_loaded": inference_engine.faiss_index is not None,
        "shap_loaded": inference_engine.explainer is not None,
    }


@app.post("/api/v1/predict", response_model=PredictionResponse)
def predict(features: StartupFeatures):
    """
    Predict success probability for a startup based on its features.
    """
    prob = inference_engine.predict(features.model_dump())
    return {"success_probability": prob}


@app.post("/api/v1/explain", response_model=ExplanationResponse)
def explain(features: StartupFeatures):
    """
    Generate SHAP explanation for the prediction.
    """
    shap_vals = inference_engine.explain(features.model_dump())
    return {"shap_values": shap_vals}


@app.post("/api/v1/recommend", response_model=RecommendationResponse)
def recommend(startup_data: Dict[str, Any]):
    """
    Recommend similar startups using FAISS embeddings.
    """
    recs = inference_engine.recommend(startup_data)
    return {"similar_startups": recs}
