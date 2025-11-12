# Makefile for SUMATE project

.PHONY: help build up down logs restart clean db-reset backend-logs frontend-logs db-logs test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build all Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d
	@echo "✓ Services started!"
	@echo "  Frontend: http://localhost:3000"
	@echo "  Backend:  http://localhost:8080"
	@echo "  Database: localhost:5432"

down: ## Stop all services
	docker-compose down

logs: ## Show logs from all services
	docker-compose logs -f

restart: ## Restart all services
	docker-compose restart

clean: ## Stop and remove all containers, networks, and volumes
	docker-compose down -v
	@echo "✓ All containers, networks, and volumes removed"

db-reset: ## Reset database (WARNING: deletes all data)
	docker-compose down -v db
	docker volume rm sumate_postgres_data || true
	docker-compose up -d db
	@echo "⚠️  Database reset complete. All data has been deleted."

backend-logs: ## Show backend logs
	docker-compose logs -f backend

frontend-logs: ## Show frontend logs
	docker-compose logs -f frontend

db-logs: ## Show database logs
	docker-compose logs -f db

test: ## Run tests (placeholder)
	@echo "Running tests..."
	@echo "No tests configured yet"

dev-backend: ## Run backend locally (without Docker)
	cd backend && go run main.go

dev-frontend: ## Run frontend locally (without Docker)
	cd frontend && python3 -m http.server 3000

psql: ## Connect to PostgreSQL database
	docker-compose exec db psql -U postgres -d sumate

status: ## Show status of all services
	docker-compose ps

install: ## Install required tools (Docker, Docker Compose)
	@echo "Checking dependencies..."
	@command -v docker >/dev/null 2>&1 || { echo "Docker not found. Install from: https://docs.docker.com/get-docker/"; exit 1; }
	@command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose not found. Install from: https://docs.docker.com/compose/install/"; exit 1; }
	@echo "✓ All dependencies installed"
