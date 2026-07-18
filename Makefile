.PHONY: install up down test lint

install:
	poetry install

up:
	docker-compose -f docker/docker-compose.yml up -d

down:
	docker-compose -f docker/docker-compose.yml down

test:
	poetry run pytest tests/

lint:
	poetry run black src/ app/ tests/
	poetry run flake8 src/ app/ tests/
