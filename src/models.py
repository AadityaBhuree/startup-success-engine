"""
Models Module.

Defines the production model (CatBoost) with Optuna tuning loops and MLflow logging.
"""
import optuna
import mlflow
import pandas as pd
from catboost import CatBoostClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import train_test_split

from src.config import settings


def train_production_model(df: pd.DataFrame) -> CatBoostClassifier:
    """
    Train the production CatBoost model with Optuna tuning and MLflow tracking.
    """
    # Separate features and target
    X = df.drop(columns=["success", "startup_id", "name"])
    y = df["success"]

    # Identify categorical features
    cat_features = ["industry", "country"]

    # Train/Test Split (ensuring no temporal/data leakage)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    mlflow.set_tracking_uri(settings.mlflow_tracking_uri)
    mlflow.set_experiment(settings.mlflow_experiment_name)

    def objective(trial: optuna.Trial) -> float:
        params = {
            "iterations": trial.suggest_int("iterations", 50, 300),
            "learning_rate": trial.suggest_float("learning_rate", 1e-3, 0.1, log=True),
            "depth": trial.suggest_int("depth", 4, 10),
            "l2_leaf_reg": trial.suggest_float("l2_leaf_reg", 1, 10),
            "random_seed": 42,
            "verbose": False,
        }

        model = CatBoostClassifier(**params)
        model.fit(
            X_train,
            y_train,
            cat_features=cat_features,
            eval_set=(X_test, y_test),
            early_stopping_rounds=20,
        )

        preds = model.predict(X_test)
        return roc_auc_score(y_test, preds)

    print(
        f"Starting Optuna hyperparameter optimization ({settings.optuna_n_trials} trials)..."
    )
    study = optuna.create_study(direction="maximize")
    study.optimize(objective, n_trials=settings.optuna_n_trials)

    best_params = study.best_params
    print(f"Best params found: {best_params}")

    # Train final model on full train set with best params
    with mlflow.start_run(run_name="CatBoost_Production"):
        final_model = CatBoostClassifier(**best_params, random_seed=42, verbose=100)
        final_model.fit(X_train, y_train, cat_features=cat_features)

        # Evaluate on test set
        preds = final_model.predict(X_test)
        proba = final_model.predict_proba(X_test)[:, 1]

        metrics = {
            "accuracy": accuracy_score(y_test, preds),
            "precision": precision_score(y_test, preds),
            "recall": recall_score(y_test, preds),
            "roc_auc": roc_auc_score(y_test, proba),
        }

        print(f"Final Model Metrics: {metrics}")

        # Log to MLflow
        mlflow.log_params(best_params)
        mlflow.log_metrics(metrics)

        # Infer signature and log model
        from mlflow.models.signature import infer_signature

        signature = infer_signature(X_train, preds)
        mlflow.catboost.log_model(
            final_model, artifact_path="model", signature=signature
        )

        print("Model successfully logged to MLflow.")
        return final_model
