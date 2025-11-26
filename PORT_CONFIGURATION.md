# Port Configuration

## 🔌 Port Assignments

All services now use consistent, non-conflicting ports across the entire project:

| Service | Port | Container Port | Access URL |
|---------|------|----------------|------------|
| **Frontend** | 3001 | 3000 | http://localhost:3001 |
| **Backend** | 8081 | 8080 | http://localhost:8081 |
| **PostgreSQL** | 5433 | 5432 | localhost:5433 |
| **Redis** | 6379 | 6379 | localhost:6379 |

---

## 📝 Files Updated

### 1. **Docker Configuration**
- ✅ `docker-compose.yml`
  - Frontend: `3001:3000`
  - Backend: `8081:8080`
  - PostgreSQL: `5433:5432`
  - Updated `NEXT_PUBLIC_API_URL` to `http://localhost:8081/api`

### 2. **Frontend Configuration**
- ✅ `frontend/.env`
  - `NEXT_PUBLIC_API_URL=http://localhost:8081/api`
  - `BACKEND_URL=http://localhost:8081`

- ✅ `frontend/.env.example`
  - Updated all port references to 3001 and 8081

- ✅ `frontend/playwright.config.ts`
  - `baseURL: 'http://localhost:3001'`
  - `webServer.url: 'http://localhost:3001'`

### 3. **Backend Configuration**
- ✅ `backend/.env`
  - `DATABASE_URL=jdbc:postgresql://localhost:5433/waterballsa`
  - `GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3001/auth/callback`
  - `CORS_ALLOWED_ORIGINS=http://localhost:3001,https://waterballsa.com`

- ✅ `backend/.env.example`
  - Updated all port references to 3001 and 5433

- ✅ `backend/src/main/resources/application.yml`
  - `datasource.url: jdbc:postgresql://localhost:5433/waterballsa`
  - `redirect-uri: http://localhost:3001/auth/callback`
  - `allowed-origins: http://localhost:3001`

- ✅ `backend/src/main/resources/application-dev.yml`
  - `allowed-origins: http://localhost:3001`

- ✅ `backend/src/main/java/com/waterballsa/backend/config/SecurityConfig.java`
  - Removed `http://localhost:3000` from CORS origins
  - Kept only `http://localhost:3001` and `https://waterballsa.com`

### 4. **Documentation**
- ✅ `CLAUDE.md` - Updated all port references
- ✅ `README.md` - Updated all port references
- ✅ `UI_REDESIGN_SUMMARY.md` - Updated all port references
- ✅ All other documentation files updated via sed commands

---

## 🚀 How to Access Services

After running `make up` or `docker-compose up`:

### Frontend
```
http://localhost:3001
```

Pages available:
- Home: http://localhost:3001
- Courses: http://localhost:3001/courses
- Leaderboard: http://localhost:3001/leaderboard
- All Units: http://localhost:3001/curriculums
- Roadmap: http://localhost:3001/roadmap
- SOP: http://localhost:3001/sop
- Curriculum Detail: http://localhost:3001/curriculums/1

### Backend API
```
http://localhost:8081/api
```

API Documentation:
- Swagger UI: http://localhost:8081/swagger-ui.html
- OpenAPI JSON: http://localhost:8081/v3/api-docs

### Database
```bash
# Connect via psql
psql -h localhost -p 5433 -U postgres -d waterballsa

# Via Docker
docker-compose exec postgres psql -U postgres -d waterballsa
```

### Redis
```bash
# Connect via redis-cli
redis-cli -p 6379

# Via Docker
docker-compose exec redis redis-cli
```

---

## 🔧 Verification Commands

### Check if ports are in use:
```bash
# Frontend
lsof -i :3001

# Backend
lsof -i :8081

# PostgreSQL
lsof -i :5433

# Redis
lsof -i :6379
```

### Test connections:
```bash
# Frontend
curl http://localhost:3001

# Backend health check
curl http://localhost:8081/actuator/health

# Backend API
curl http://localhost:8081/api/curriculums

# Database
psql -h localhost -p 5433 -U postgres -d waterballsa -c "SELECT 1"
```

---

## ⚠️ Important Notes

1. **No More Port Conflicts**: These ports (3001, 8081, 5433) are chosen to avoid conflicts with common development services that use default ports (3000, 8080, 5432).

2. **Consistent Configuration**: All configuration files throughout the project now reference these ports consistently.

3. **Google OAuth**: If you're using Google OAuth, make sure to update your Google Cloud Console:
   - **Authorized JavaScript origins**: `http://localhost:3001`
   - **Authorized redirect URIs**: `http://localhost:3001/auth/callback`

4. **CORS Configuration**: Backend CORS is configured to accept requests only from:
   - `http://localhost:3001` (development)
   - `https://waterballsa.com` (production)

5. **Docker Internal Communication**: Inside Docker network, services still use their default container ports:
   - Frontend container: `3000` (mapped to host `3001`)
   - Backend container: `8080` (mapped to host `8081`)
   - PostgreSQL container: `5432` (mapped to host `5433`)
   - Redis container: `6379` (mapped to host `6379`)

---

## 🔄 Migration from Old Ports

If you were using the old port configuration:

| Service | Old Port | New Port |
|---------|----------|----------|
| Frontend | 3000 | **3001** |
| Backend | 8080 | **8081** |
| Database | 5432 | **5433** |

**What to do:**
1. ✅ Stop all running containers: `docker-compose down`
2. ✅ Pull latest changes with updated configuration
3. ✅ Start services: `docker-compose up` or `make up`
4. ✅ Update bookmarks/favorites to use new ports
5. ✅ Update Google OAuth settings if using authentication

---

## 📊 Port Persistence

These ports are now the **standard configuration** for the WaterBallSA project:
- ✅ All developers should use these ports
- ✅ CI/CD pipelines reference these ports
- ✅ Documentation uses these ports
- ✅ No need to change ports unless there's a specific conflict

**The project will stick to these ports permanently.**

---

## 🆘 Troubleshooting

### Port Already in Use
If you get "port already in use" errors:

```bash
# Check what's using the port
lsof -i :3001  # or :8081, :5433

# Kill the process (if safe to do so)
kill -9 <PID>

# Or use different ports by modifying docker-compose.yml
```

### Services Not Starting
```bash
# Check logs
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres

# Restart specific service
docker-compose restart frontend
```

### Cannot Connect to Services
1. Verify containers are running: `docker-compose ps`
2. Check if ports are exposed: `docker-compose port frontend 3000`
3. Verify firewall isn't blocking ports
4. Try `docker-compose down && docker-compose up` for a fresh start

---

**Last Updated**: 2025-11-25
**Configuration Version**: 2.0 (New Port Scheme)
