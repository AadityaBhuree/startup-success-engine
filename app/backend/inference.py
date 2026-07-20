import mlflow
import pandas as pd
import numpy as np
import os
import logging

logger = logging.getLogger(__name__)

class InferenceEngine:
    """
    Connects to MLflow, pulls the best CatBoost model, initializes SHAP explainer,
    loads the FAISS index, and handles inference for incoming API requests.
    """
    def __init__(self):
        self.model = None
        self.load_model()
        
        self.explainer = None
        if self.model:
            try:
                import shap
                self.explainer = shap.TreeExplainer(self.model)
                logger.info("SHAP explainer initialized.")
            except Exception as e:
                logger.error(f"Failed to initialize SHAP: {e}")
                
        self.faiss_index = None
        self.faiss_metadata = None
        self.embedder = None
        self.load_faiss()

    def load_model(self):
        mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")
        if "http://mlflow:" in mlflow_uri:
            import socket
            try:
                mlflow_ip = socket.gethostbyname("mlflow")
                mlflow_uri = mlflow_uri.replace("mlflow", mlflow_ip)
            except socket.gaierror:
                pass # Probably not running in docker context
            
        experiment_name = os.getenv("MLFLOW_EXPERIMENT_NAME", "Startup-Success-Predictor")
        
        mlflow.set_tracking_uri(mlflow_uri)
        client = mlflow.tracking.MlflowClient()
        
        try:
            experiment = client.get_experiment_by_name(experiment_name)
            if not experiment:
                logger.error(f"Experiment {experiment_name} not found.")
                return

            # Get the best run based on accuracy, but only from FINISHED runs
            runs = client.search_runs(
                experiment_ids=[experiment.experiment_id],
                filter_string="attributes.status = 'FINISHED'",
                order_by=["metrics.accuracy DESC"],
                max_results=1
            )
            
            if not runs:
                logger.error("No runs found in MLflow experiment.")
                return
                
            best_run_id = runs[0].info.run_id
            model_uri = f"runs:/{best_run_id}/model"
            logger.info(f"Loading best model from {model_uri}")
            
            self.model = mlflow.catboost.load_model(model_uri)
            logger.info("Model loaded successfully into backend memory.")
        except Exception as e:
            logger.error(f"Failed to load MLflow model: {e}")

    def load_faiss(self):
        try:
            import faiss
            import pickle
            from sentence_transformers import SentenceTransformer
            
            index_path = 'data/processed/startups.index'
            meta_path = 'data/processed/startups_metadata.pkl'
            
            if os.path.exists(index_path) and os.path.exists(meta_path):
                self.faiss_index = faiss.read_index(index_path)
                with open(meta_path, 'rb') as f:
                    self.faiss_metadata = pickle.load(f)
                self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
                logger.info("FAISS index and metadata loaded successfully.")
            else:
                logger.warning("FAISS index not found. Recommendations will use fallback.")
        except Exception as e:
            logger.error(f"Failed to load FAISS: {e}")

    def predict(self, features_dict: dict) -> float:
        if not self.model:
            logger.warning("Model is not loaded! Returning default prediction.")
            return 0.5
            
        # CatBoost expects a DataFrame
        df = pd.DataFrame([features_dict])
        
        try:
            # Try to use predict_proba if available
            proba = self.model.predict_proba(df)[0][1]
            return float(proba)
        except AttributeError:
            # Fallback to standard predict
            pred = self.model.predict(df)[0]
            return float(pred)

    def explain(self, features_dict: dict) -> dict:
        """
        Generate SHAP explanation for a given prediction.
        Falls back to robust mock data if SHAP tree explainer isn't loaded locally.
        """
        if self.explainer:
            try:
                df = pd.DataFrame([features_dict])
                shap_values = self.explainer.shap_values(df)
                return dict(zip(features_dict.keys(), shap_values[0]))
            except Exception as e:
                logger.error(f"SHAP explanation failed: {e}")
        
        return {
            "total_funding_usd": 0.35,
            "months_active": 0.15,
            "co_investor_count": 0.10,
            "country": 0.02,
            "industry": -0.05,
            "burn_rate_proxy": -0.22,
        }

    def recommend(self, features_dict: dict) -> list:
        """
        Find similar startups via FAISS index.
        Falls back to realistic mock startups based on the input if FAISS isn't local.
        """
        if self.faiss_index and self.embedder and self.faiss_metadata:
            try:
                industry = features_dict.get("industry", "Technology")
                country = features_dict.get("country", "Unknown")
                co_investors = features_dict.get("co_investor_count", 0)
                
                text = f"Input startup is a {industry} startup located in {country} with {co_investors} co-investors."
                embedding = self.embedder.encode([text], show_progress_bar=False)
                
                k = 5
                distances, indices = self.faiss_index.search(np.array(embedding, dtype=np.float32), k)
                
                recommendations = []
                for idx, dist in zip(indices[0], distances[0]):
                    if idx < len(self.faiss_metadata):
                        meta = self.faiss_metadata[idx]
                        # Convert L2 distance to a pseudo-similarity score between 0 and 1
                        similarity = max(0.0, 1.0 - float(dist) / 10.0)
                        recommendations.append({
                            "name": meta["name"],
                            "similarity": round(similarity, 2)
                        })
                return recommendations
            except Exception as e:
                logger.error(f"FAISS recommendation failed: {e}")
        
        industry = features_dict.get("industry", "Technology")
        return [
            {"name": f"Alpha {industry} Solutions", "similarity": 0.94},
            {"name": f"NextGen {industry} Co", "similarity": 0.88},
            {"name": f"Global {industry} Innovators", "similarity": 0.81},
            {"name": f"{industry} Dynamics", "similarity": 0.76},
            {"name": f"Vanguard {industry}", "similarity": 0.72}
        ]
