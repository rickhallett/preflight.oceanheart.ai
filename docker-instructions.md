# Docker Local Development URLs

## Service URLs

When running the application locally with Docker, the services are available at:

### Backend API
- **URL:** `http://localhost:8000`
- **Service:** FastAPI application (preflight-api)
- **Available Endpoints:**
  - `/health` - Health check endpoint (returns `{"status": "ok"}`)
  - `/docs` - FastAPI automatic documentation (Swagger UI)
  - `/redoc` - Alternative API documentation (ReDoc)

### Frontend Web
- **URL:** `http://localhost:3000`
- **Service:** Next.js application (preflight-web)
- **Status:** Fixed - using Next.js default port 3000 for both dev and production

### Database
- **PostgreSQL:** `localhost:5433`
- **Credentials:**
  - Database: `preflight_dev`
  - User: `preflight`
  - Password: `dev_password`

## Running with Docker

```bash
# Rebuild and start all services (required after Dockerfile changes)
docker-compose up --build

# Start all services (if already built)
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v
```

## Known Issues & Fixes

### Web container fails with "next: command not found"
**Fixed:** Added development stage to Dockerfile with proper dependencies. Run `docker-compose up --build` to rebuild.

### Web container fails with "unknown option '--host'"
**Fixed:** Next.js uses `-H` flag instead of `--host`. Updated package.json dev script to use `-H 0.0.0.0` and changed port to 3000 (Next.js default).

### Turbopack error "leaves the filesystem root"
**Fixed:** Removed hardcoded absolute path from next.config.ts turbopack configuration and disabled Turbopack in package.json scripts. Turbopack doesn't work well in Docker containers with mounted volumes.

## Notes

- The `docker-compose.override.yml` file configures the web service for development with hot-reload on port 3000
- The API is configured to accept CORS requests from `http://localhost:3000`
- PostgreSQL runs on port 5433 (instead of default 5432) to avoid conflicts with local installations
- The web container mounts local files for hot-reload in development mode