# Docker Setup Guide

## Overview

The Docker Compose setup now properly loads environment variables from `.env` files, ensuring consistent configuration between local development and Docker environments.

## How It Works

### Environment Variable Loading

Docker Compose uses `env_file` to load variables from `.env` files:

```yaml
backend:
  env_file:
    - ./backend/.env  # Loads all variables from backend/.env
  environment:
    # Override specific variables for Docker network
    DATABASE_URL: jdbc:postgresql://postgres:5432/waterballsa
    REDIS_HOST: redis
```

**Order of precedence:**
1. Variables in `environment:` section (highest priority)
2. Variables from `env_file:`
3. Variables in shell environment

This means:
- Database URLs are overridden to use Docker service names (`postgres`, `redis`)
- Google OAuth credentials come from your `.env` files
- JWT secrets come from your `.env` files

## Quick Start with Docker

### 1. Ensure .env Files Are Configured

**Backend (.env):**
```bash
cd backend
cat .env | grep GOOGLE_OAUTH_CLIENT_ID
# Should show: GOOGLE_OAUTH_CLIENT_ID=557556497694-...
```

**Frontend (.env):**
```bash
cd frontend
cat .env | grep NEXT_PUBLIC_GOOGLE_CLIENT_ID
# Should show: NEXT_PUBLIC_GOOGLE_CLIENT_ID=557556497694-...
```

### 2. Start All Services

```bash
# From project root
docker-compose up
```

Or run in background:
```bash
docker-compose up -d
```

### 3. Watch Logs

```bash
# All services
docker-compose logs -f

# Just backend
docker-compose logs -f backend

# Just frontend
docker-compose logs -f frontend
```

### 4. Stop Services

```bash
docker-compose down
```

Or with volume cleanup:
```bash
docker-compose down -v
```

## What Gets Started

When you run `docker-compose up`, you get:

1. **PostgreSQL** (localhost:5432)
   - Database: `waterballsa`
   - User: `postgres`
   - Password: `postgres`

2. **Redis** (localhost:6379)
   - Used for session management and caching

3. **Backend** (localhost:8080)
   - Spring Boot application
   - Connects to PostgreSQL and Redis via Docker network
   - Uses Google OAuth credentials from `.env`

4. **Frontend** (localhost:3000)
   - Next.js application
   - Connects to backend at `http://backend:8080` (internal)
   - Exposes API at `http://localhost:8080` (external)

## Environment Variables in Docker

### Backend Service

**From .env file:**
- `GOOGLE_OAUTH_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_OAUTH_CLIENT_SECRET` - Your Google OAuth Client Secret
- `JWT_SECRET` - Your JWT signing key
- `JWT_ACCESS_TOKEN_EXPIRATION` - Access token expiry (15 min)
- `JWT_REFRESH_TOKEN_EXPIRATION` - Refresh token expiry (7 days)
- `CORS_ALLOWED_ORIGINS` - Allowed CORS origins

**Overridden for Docker:**
- `DATABASE_URL` → `jdbc:postgresql://postgres:5432/waterballsa`
- `REDIS_HOST` → `redis`

### Frontend Service

**From .env file:**
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Google OAuth Client ID (exposed to browser)

**Overridden for Docker:**
- `NEXT_PUBLIC_API_URL` → `http://localhost:8080/api` (browser uses this)
- `API_URL` → `http://backend:8080/api` (server-side uses this)
- `BACKEND_URL` → `http://backend:8080` (internal backend URL)

## Development Workflow

### Option 1: Local Development (Recommended for Development)

```bash
# Terminal 1 - Backend
cd backend
./start.sh

# Terminal 2 - Frontend
cd frontend
yarn dev

# Terminal 3 - Database (if needed)
docker-compose up postgres redis
```

**Pros:**
- Faster hot reload
- Easier debugging
- Direct access to logs
- No Docker rebuild needed

### Option 2: Full Docker (Recommended for Testing)

```bash
# From project root
docker-compose up
```

**Pros:**
- Closer to production environment
- Isolated containers
- Tests full stack integration
- Easy to reset (just rebuild containers)

## Makefile Commands

Use the provided Makefile for common operations:

```bash
# Start all services
make up

# Start in background
make up-detached

# Stop all services
make down

# View logs
make logs

# Rebuild containers
make build

# Clean everything (including volumes)
make clean

# Restart services
make restart
```

## Troubleshooting

### "GOOGLE_OAUTH_CLIENT_ID is not set" in backend logs

**Cause:** Backend .env file is missing or not readable

**Fix:**
```bash
# Verify .env exists
ls -la backend/.env

# Check it has Google OAuth credentials
cat backend/.env | grep GOOGLE_OAUTH

# If missing, copy from .env.example
cp backend/.env.example backend/.env
# Then edit with your actual credentials
```

### "Port 5432 already in use"

**Cause:** PostgreSQL is already running locally

**Fix:**
```bash
# Stop local PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql  # Linux

# Or change the port in docker-compose.yml
ports:
  - "5433:5432"  # Use 5433 on host instead
```

### "Backend health check failing"

**Check logs:**
```bash
docker-compose logs backend
```

**Common causes:**
- Database not ready (wait for PostgreSQL health check)
- Missing environment variables
- Flyway migration errors

### "Frontend can't connect to backend"

**From browser console:**
```
Failed to fetch from http://localhost:8080/api/...
```

**Check:**
1. Is backend healthy? `docker-compose ps`
2. Can you access directly? `curl http://localhost:8080/actuator/health`
3. Check CORS settings in backend `.env`

**From frontend container:**
```bash
docker-compose exec frontend sh
curl http://backend:8080/actuator/health
```

Should return `{"status":"UP"}`

## Rebuilding After Changes

### Changed .env files

Just restart:
```bash
docker-compose restart backend frontend
```

### Changed code

Rebuild:
```bash
docker-compose build backend
docker-compose up -d backend
```

Or rebuild everything:
```bash
docker-compose down
docker-compose build
docker-compose up
```

### Changed dependencies (pom.xml or package.json)

Full rebuild required:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up
```

## Production Considerations

**DO NOT:**
- ❌ Commit `.env` files to git
- ❌ Use development secrets in production
- ❌ Expose PostgreSQL port publicly
- ❌ Run as root user in containers

**DO:**
- ✅ Use environment variable injection from your deployment platform
- ✅ Use strong, randomly generated secrets
- ✅ Use managed database services (AWS RDS, etc.)
- ✅ Use HTTPS/TLS everywhere
- ✅ Implement proper logging and monitoring
- ✅ Use multi-stage Docker builds for smaller images

## Debugging

### Access container shell

```bash
# Backend
docker-compose exec backend bash

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres psql -U postgres -d waterballsa
```

### Check environment variables inside container

```bash
docker-compose exec backend env | grep GOOGLE
docker-compose exec frontend env | grep NEXT_PUBLIC
```

### View real-time logs

```bash
# All services
docker-compose logs -f

# Filter by service
docker-compose logs -f backend | grep ERROR

# Last 100 lines
docker-compose logs --tail=100 backend
```

## Summary

✅ Docker Compose now loads `.env` files automatically
✅ No need to manually set environment variables
✅ Consistent configuration between local and Docker environments
✅ Database and Redis URLs are overridden for Docker networking
✅ Google OAuth credentials come from your `.env` files

**Choose your workflow:**
- **Developing?** Use `./start.sh` for backend and `yarn dev` for frontend
- **Testing full stack?** Use `docker-compose up`
- **Deploying?** Use proper environment variable injection on your platform
