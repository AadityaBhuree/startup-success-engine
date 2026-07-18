FROM python:3.10-slim

WORKDIR /app

COPY pyproject.toml .
# In a real setup we might copy poetry.lock or requirements.txt and install
# RUN pip install .

COPY app/backend /app
COPY src /src

# ENV PYTHONPATH=/src
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
