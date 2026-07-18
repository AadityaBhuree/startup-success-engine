FROM python:3.10-slim

WORKDIR /app

COPY pyproject.toml .
RUN pip install fastapi uvicorn pydantic mlflow boto3 catboost pandas scikit-learn

COPY app/backend /app
COPY src /src

# ENV PYTHONPATH=/src
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
