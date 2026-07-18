"""
Embedding Benchmark Module.

Evaluates multiple sentence-transformer models to determine which produces the best
embeddings for FAISS recommendations.

Evaluation is performed using the Silhouette Score, assuming that startups within the
same industry and country should naturally cluster together in the embedding space.
All results are tracked in MLflow.
"""

import time
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import LabelEncoder
import mlflow

# Define candidate models to benchmark
MODELS_TO_TEST = [
    "all-MiniLM-L6-v2",
    "paraphrase-MiniLM-L3-v2",
    "all-mpnet-base-v2"
]

def load_data(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    # Create a composite text field for embeddings
    df['text'] = df.apply(lambda row: f"{row['name']} is a {row['industry']} startup located in {row['country']} with {row['co_investor_count']} co-investors.", axis=1)
    
    # Create a composite label for clustering evaluation (Industry + Country)
    df['cluster_label'] = df['industry'] + "_" + df['country']
    le = LabelEncoder()
    df['cluster_id'] = le.fit_transform(df['cluster_label'])
    
    return df

def benchmark_models(filepath: str):
    print("Loading data...")
    try:
        df = load_data(filepath)
    except FileNotFoundError:
        print(f"Dataset not found at {filepath}. Please generate it first.")
        return
        
    texts = df['text'].tolist()
    labels = df['cluster_id'].values
    
    mlflow.set_experiment("Embedding_Model_Benchmark")

    best_score = -1
    best_model = None

    for model_name in MODELS_TO_TEST:
        with mlflow.start_run(run_name=model_name):
            print(f"\nEvaluating model: {model_name}")
            
            # Load model
            model = SentenceTransformer(model_name)
            
            # Generate embeddings and measure time
            start_time = time.time()
            embeddings = model.encode(texts, show_progress_bar=False)
            encoding_time = time.time() - start_time
            
            # Evaluate using Silhouette Score
            try:
                score = silhouette_score(embeddings, labels)
            except ValueError:
                score = 0.0 # Fallback if clustering fails
            
            print(f" - Encoding Time: {encoding_time:.2f}s")
            print(f" - Silhouette Score: {score:.4f}")
            
            # Log to MLflow
            mlflow.log_param("model_name", model_name)
            mlflow.log_param("embedding_dimension", embeddings.shape[1])
            mlflow.log_metric("encoding_time_seconds", encoding_time)
            mlflow.log_metric("silhouette_score", score)
            
            if score > best_score:
                best_score = score
                best_model = model_name

    print(f"\nBenchmark Complete! Best model: {best_model} with score {best_score:.4f}")
    print("Run `mlflow ui` to view detailed records.")

if __name__ == "__main__":
    # Ensure data exists before running
    benchmark_models("data/raw/startups.csv")
