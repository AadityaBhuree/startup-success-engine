from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App Settings
    app_name: str = "Startup-Intelligence"
    environment: str = "local"

    # MLflow Settings
    mlflow_tracking_uri: str = "http://localhost:5000"
    mlflow_experiment_name: str = "Startup-Success-Predictor"

    # Data Settings
    raw_data_path: str = "data/raw/startups.csv"

    # Model Hyperparameters (defaults for Optuna search space)
    optuna_n_trials: int = 10

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()
