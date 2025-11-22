.PHONY: help up down build clean logs test restart check-env

help:
	@echo "WaterBallSA Development Commands"
	@echo "================================="
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up          - Start all services in background"
	@echo "  make up-logs     - Start all services with logs"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make build       - Build all containers"
	@echo "  make clean       - Remove all containers and volumes"
	@echo "  make logs        - View logs from all services"
	@echo ""
	@echo "Testing Commands:"
	@echo "  make test        - Run all tests"
	@echo "  make backend     - Run backend tests"
	@echo "  make frontend    - Run frontend tests"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make check-env   - Verify .env files are configured"
	@echo ""
	@echo "Note: Ensure backend/.env and frontend/.env are configured before running 'make up'"

check-env:
	@echo "Checking environment files..."
	@if [ ! -f backend/.env ]; then \
		echo "❌ backend/.env not found!"; \
		echo "   Run: cp backend/.env.example backend/.env"; \
		exit 1; \
	fi
	@if [ ! -f frontend/.env ]; then \
		echo "❌ frontend/.env not found!"; \
		echo "   Run: cp frontend/.env.example frontend/.env"; \
		exit 1; \
	fi
	@echo "✅ backend/.env found"
	@echo "✅ frontend/.env found"
	@echo ""
	@echo "Checking Google OAuth configuration..."
	@grep -q "GOOGLE_OAUTH_CLIENT_ID=557556497694" backend/.env && echo "✅ Backend Google OAuth Client ID configured" || echo "⚠️  Backend Google OAuth Client ID may not be set"
	@grep -q "NEXT_PUBLIC_GOOGLE_CLIENT_ID=557556497694" frontend/.env && echo "✅ Frontend Google OAuth Client ID configured" || echo "⚠️  Frontend Google OAuth Client ID may not be set"

up: check-env
	@echo "Starting all services..."
	docker-compose up -d

up-logs: check-env
	@echo "Starting all services with logs..."
	docker-compose up

down:
	@echo "Stopping all services..."
	docker-compose down

restart:
	@echo "Restarting all services..."
	docker-compose restart

build:
	docker-compose build

clean:
	docker-compose down -v
	rm -rf backend/target
	rm -rf frontend/.next
	rm -rf frontend/node_modules

logs:
	docker-compose logs -f

test: backend frontend

backend:
	cd backend && ./mvnw test

frontend:
	cd frontend && yarn test
