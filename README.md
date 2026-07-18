<div align="center">
  <img src="https://em-content.zobj.net/source/apple/354/rocket_1f680.png" width="100" />
  <h1>Startup-Intelligence</h1>
  
  <p><b>A production-grade Machine Learning system designed to predict startup success and surface recommendations.</b></p>
  
  <!-- Badges -->
  <a href="https://github.com/AadityaBhuree/startup-success-engine"><img src="https://img.shields.io/badge/Python-3.10-blue.svg?style=for-the-badge&logo=python&logoColor=white" alt="Python Version"/></a>
  <a href="https://github.com/AadityaBhuree/startup-success-engine"><img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI"/></a>
  <a href="https://github.com/AadityaBhuree/startup-success-engine"><img src="https://img.shields.io/badge/Docker-Supported-2496ED.svg?style=for-the-badge&logo=docker" alt="Docker"/></a>
  <a href="https://github.com/AadityaBhuree/startup-success-engine"><img src="https://img.shields.io/badge/MLflow-Tracking-0194E2.svg?style=for-the-badge&logo=mlflow" alt="MLflow"/></a>
  <a href="https://github.com/AadityaBhuree/startup-success-engine"><img src="https://img.shields.io/badge/Maintained%3F-yes-brightgreen.svg?style=for-the-badge" alt="Maintained"/></a>
</div>

<br />

> **Startup-Intelligence** evaluates startup viability by predicting their success probability, explains its predictions via SHAP values, and curates a list of similar startups/investors via a FAISS vector search engine running on local Sentence-Transformer embeddings.

---

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗 System Architecture](#-system-architecture)
- [⚡ Latency Budget](#-latency-budget)
- [🚀 Getting Started](#-getting-started)
- [📁 Directory Structure](#-directory-structure)

---

## ✨ Features

- **Predictive Engine**: Powered by **CatBoost**, handling categorical features natively for fast inference on metrics like *funding velocity* and *burn-rate proxy*.
- **Explainability**: **SHAP** values are computed on-the-fly to understand exactly *why* a startup received its score.
- **Recommendations**: Lightning-fast nearest-neighbor lookup via **FAISS** over `Sentence-Transformer` embeddings (cached in **Redis**).
- **Data Integrity**: **Pandera** schema validation paired with **Isolation Forest** anomaly detection.
- **Version Control & Tracking**: Full dataset versioning with **DVC** and experiment logging with **MLflow**.
- **Observability**: **Prometheus** metrics scraping and real-time visualization via **Grafana**.

---

## 🏗 System Architecture

The ecosystem supports the full lifecycle from data ingestion to high-performance serving:

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

---

## ⚡ Latency Budget

For our production serving environment, response time is critical. Our target budget for the `/api/v1/predict` endpoint is **< 150ms**:

| Step | Component | Target Latency |
| :--- | :--- | :--- |
| 🗄️ **Feature Retrieval** | Feast (Redis Online Store) | `10 - 20 ms` |
| 🧠 **Inference** | CatBoost Predict | `5 - 15 ms` |
| 📊 **Explainability** | SHAP TreeExplainer | `30 - 50 ms` |
| 🌐 **Network Overhead** | FastAPI + Network Transfer | `10 - 20 ms` |
| **Total Latency** | | **`~55 - 105 ms`** |

The `/api/v1/recommend` endpoint leverages **FAISS** and a **Redis** cache layer, keeping recommendation retrievals consistently under **50ms** for cached queries.

---

## 🚀 Getting Started

### 1. Infrastructure Setup
The entire infrastructure stack is containerized. Spin up the backend, tracking servers, and databases with a single command:
```bash
make up
```
*(Spins up: FastAPI, MLflow, Feast, Postgres, MinIO, Redis, Prometheus, and Grafana).*

### 2. Environment Setup
Install the Python dependencies (via Poetry):
```bash
make install
```

### 3. Generate Mock Data & Track with DVC
```bash
python src/utils/generate_mock_data.py
dvc init
dvc add data/raw/startups.csv
```

### 4. Code Quality
Ensure the codebase remains pristine:
```bash
make lint
make test
```

---

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

<br/>
<div align="center">
  <p>Built with 🩵 for Data Engineering & Machine Learning Operations</p>
</div>
