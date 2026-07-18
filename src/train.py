from src.config import settings
from src.data_pipeline import load_data, validate_raw_data, clean_data
from src.models import train_production_model

def main():
    print(f"Starting training pipeline for {settings.app_name}...")
    
    # 1. Load Data
    print(f"Loading raw data from {settings.raw_data_path}...")
    df = load_data(settings.raw_data_path)
    
    # 2. Validate
    print("Validating data schema...")
    df = validate_raw_data(df)
    
    # 3. Clean (Isolation Forest)
    print("Cleaning data...")
    df = clean_data(df)
    
    # 4. Train
    print("Training production model...")
    model = train_production_model(df)
    
    print("Pipeline finished successfully.")

if __name__ == "__main__":
    main()
