import mlflow
import pandas as pd
import os
import logging

logger = logging.getLogger(__name__)

class InferenceEngine:
    """
    Connects to MLflow, pulls the best CatBoost model from the experiment,
    and handles inference for incoming API requests.
    """
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        mlflow_uri = os.getenv("MLFLOW_TRACKING_URI", "http://mlflow:5000")
        if "http://mlflow:" in mlflow_uri:
            import socket
            mlflow_ip = socket.gethostbyname("mlflow")
            mlflow_uri = mlflow_uri.replace("mlflow", mlflow_ip)
            
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
