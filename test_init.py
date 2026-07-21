import logging
import os
logging.basicConfig(level=logging.DEBUG)
os.environ["MLFLOW_TRACKING_URI"] = "http://localhost:5000"
print("Importing InferenceEngine...")
from app.backend.inference import InferenceEngine
print("Initializing InferenceEngine...")
engine = InferenceEngine()
print("Done!")
