import os
import pandas as pd
import numpy as np
import faiss
import pickle
from sentence_transformers import SentenceTransformer

from src.config import settings
from src.data_pipeline import load_data, validate_raw_data, clean_data
from src.models import train_production_model

def build_faiss_index(df: pd.DataFrame):
    print("Building FAISS index for recommendations...")
    # Prepare text for embeddings
    texts = df.apply(lambda row: f"{row['name']} is a {row['industry']} startup located in {row['country']} with {row['co_investor_count']} co-investors.", axis=1).tolist()
    
    # Load model and encode
    print("Loading SentenceTransformer model...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    print("Encoding texts to embeddings...")
    embeddings = model.encode(texts, show_progress_bar=False)
    
    # Build FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings, dtype=np.float32))
    
    # Save index
    os.makedirs('data/processed', exist_ok=True)
    faiss.write_index(index, 'data/processed/startups.index')
    
    # Save metadata for mapping index back to startup info
    metadata = df[['name', 'industry', 'country', 'startup_id']].to_dict('records')
    with open('data/processed/startups_metadata.pkl', 'wb') as f:
        pickle.dump(metadata, f)
    print("FAISS index and metadata saved to data/processed/")

def main():
    print(f"Starting training pipeline for {settings.app_name}...")
    
    # Ensure raw data exists
    if not os.path.exists(settings.raw_data_path):
        print("Raw data not found. Generating mock data...")
        from src.utils.generate_mock_data import generate_startups
        generate_startups(1000)
        
    # 1. Load Data
    print(f"Loading raw data from {settings.raw_data_path}...")
    df = load_data(settings.raw_data_path)
    
    # 2. Validate
    print("Validating data schema...")
    df = validate_raw_data(df)
    
    # 3. Clean (Isolation Forest)
    print("Cleaning data...")
    df_clean = clean_data(df)
    
    # 4. Train
    print("Training production model...")
    model = train_production_model(df_clean)
    
    # 5. Build FAISS
    build_faiss_index(df)
    
    print("Pipeline finished successfully.")

if __name__ == "__main__":
    main()
