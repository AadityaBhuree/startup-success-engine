# Startup-Intelligence 🚀

A production-grade ML system that predicts startup success, explains its predictions using SHAP, and recommends similar startups and investors using FAISS and Sentence-Transformer embeddings. 

This project is built with a streamlined, scalable architecture focusing on observability, reproducibility, and high-performance serving.

---

## 🏗 System Architecture

The architecture is designed to support the full ML lifecycle from data ingestion to production serving and monitoring.

```mermaid
graph TD
    subgraph "Data & Feature Layer"
        A[Raw Data / DVC] --> B(Data Pipeline / Pandera)
        B --> C{Isolation Forest Cleaning}
        C --> D[Feature Engineering]
        D --> E[(Feast Feature Store)]
    end

    subgraph "Modeling Layer"
        E --> F[Training Pipeline]
        F --> G[CatBoost Model]
        F --> H[Optuna Tuning]
        F --> I[(MLflow Tracking)]
    end

    subgraph "Serving Layer (FastAPI)"
        G --> J[/api/v1/predict]
        E --> J
        J --> K[SHAP Explainer /api/v1/explain]
        L[Sentence Transformers] --> M[(FAISS Index)]
        M --> N[/api/v1/recommend]
        N -.-> O[(Redis Cache)]
    end

    subgraph "Observability Layer"
        J --> P[Prometheus]
        P --> Q[Grafana Dashboard]
        B -.-> R[Evidently AI Drift Detection]
    end
    
    subgraph "Frontend"
        S[Next.js + Tailwind UI] --> J
        S --> K
        S --> N
    end
```

### Components

1. **Data Foundation (`data/raw/`)**:
   - Versioned with **DVC**.
   - Raw data schemas validated via **Pandera**.
   - Anomaly detection and cleaning using **Isolation Forest** prior to feature extraction.

2. **Feature Store (**Feast**)**:
   - Single source of truth for training and serving.
   - **Feature Families**: Funding velocity, burn-rate proxy, and network centrality (co-investor count).

3. **Modeling (`src/models.py`)**:
   - Baseline: Logistic/Ridge Regression.
   - Production: **CatBoost** (handles categorical features natively, avoiding one-hot bloat).
   - Hyperparameter tuning via **Optuna**.
   - Experiment tracking and artifact logging via **MLflow**.

4. **Serving (`app/backend/`)**:
   - **FastAPI** backend exposing endpoints for prediction, explanation, and recommendation.
   - Predictions pull online features from Feast, run inference via CatBoost, and log latency to Prometheus.
   - **SHAP** values generated on-the-fly for prediction explainability.
   - **FAISS** index over Sentence-Transformer embeddings for lightning-fast similarity search (cached in **Redis**).

5. **Observability (`docker/prometheus.yml`)**:
   - Metrics scraped by **Prometheus** and visualized in **Grafana** (latency, prediction distributions, error rates).
   - Drift detection simulated and monitored via **Evidently AI**.

6. **Frontend (`app/frontend/`)**:
   - A **Next.js + Tailwind CSS** dashboard tailored with specific design tokens (SquadEasy-inspired).
   - Displays prediction results, SHAP charts, and similar-startup cards with investor overlap.

---

## ⚡ Latency Budget Breakdown

For a production serving environment, latency is critical. Our target budget for the `/api/v1/predict` endpoint is **< 150ms**:

| Step | Component | Target Latency |
| :--- | :--- | :--- |
| **1. Feature Retrieval** | Feast (Redis Online Store) | `10 - 20 ms` |
| **2. Inference** | CatBoost Predict | `5 - 15 ms` |
| **3. Explainability** | SHAP TreeExplainer | `30 - 50 ms` |
| **4. Network/Overhead** | FastAPI + Network Transfer | `10 - 20 ms` |
| **Total Target Latency** | | **`~55 - 105 ms`** |

The `/api/v1/recommend` endpoint leverages the **FAISS** vector database and a **Redis** cache layer, keeping recommendation retrievals consistently under **50ms** for cached queries.

---

## 🚀 Getting Started

### 1. Infrastructure Setup
The entire infrastructure stack is orchestrated via Docker Compose:
```bash
make up
```
This spins up: `FastAPI`, `MLflow`, `Feast`, `Postgres`, `MinIO`, `Redis`, `Prometheus`, and `Grafana`.

### 2. Environment Setup
Install the Python dependencies via Poetry:
```bash
make install
```

### 3. Running Tests and Linting
```bash
make lint
make test
```

## 📁 Directory Structure
```text
Startup-Intelligence/
├── .github/workflows/      # CI/CD pipelines
├── app/
│   ├── backend/            # FastAPI routers, schemas, dependencies
│   └── frontend/           # Next.js/Tailwind dashboard
├── docker/                 # Dockerfiles and docker-compose.yml
├── feature_store/          # Feast repository
├── src/
│   ├── data_pipeline.py    # Pandera validation + cleaning
│   ├── features.py         # Feast feature definitions
│   ├── models.py           # CatBoost + Optuna
│   └── engine.py           # Inference, FAISS, SHAP
├── tests/                  # Pytest test suite
├── Makefile                # Task runner
└── pyproject.toml          # Poetry dependencies
```
