# PRD: Phase 1 Foundation - Core Infrastructure Setup

## Document Information
- **Version**: 1.0.0
- **Created**: 2025-09-12
- **Author**: Claude Code
- **Status**: Ready for Implementation
- **Parent PRD**: project-bootstrap.prd.md

---

## 1. Executive Summary

Phase 1 establishes the foundational infrastructure for the Project Preflight AI readiness assessment platform. This phase focuses on setting up the core development environment, basic project structure, database foundation, and skeletal application frameworks without implementing business logic.

**Primary Goal**: Create a working development environment with properly configured SvelteKit frontend, FastAPI backend, PostgreSQL database, and deployment pipeline.

---

## 2. Problem Statement

Currently, the project exists only as documentation with basic package.json setup. To begin feature development, we need:

- Proper project directory structure for both frontend and backend
- Database schema and migration system
- Basic API and frontend application skeletons
- Development environment configuration
- Containerization and deployment setup
- CI/CD pipeline for automated testing and deployment

Without these foundations, feature development cannot proceed efficiently or maintainably.

---

## 3. Requirements

### 3.1 Project Structure (Priority: High)
**Requirements:**
- Monorepo structure with separate apps for frontend and backend
- Consistent directory conventions following best practices
- Environment configuration management
- Package management setup for each application

**Acceptance Criteria:**
- `apps/preflight-web/` - SvelteKit application structure
- `apps/preflight-api/` - FastAPI application structure  
- `infra/` - Infrastructure and deployment configurations
- Environment files properly configured for development
- Package.json and dependencies correctly set up

### 3.2 Database Foundation (Priority: High)
**Requirements:**
- PostgreSQL database setup with connection pooling
- Migration system using Alembic
- Core tables for form definitions, runs, and answers
- JSONB support for flexible schema storage
- Development and production database configurations

**Acceptance Criteria:**
- Local PostgreSQL development database
- Alembic migration system configured
- Core schema tables created (see data models below)
- Database connection tested from FastAPI
- Environment-specific database configurations

### 3.3 FastAPI Backend Skeleton (Priority: High)
**Requirements:**
- FastAPI application with proper project structure
- Basic routing and middleware setup
- Database connection and ORM configuration
- Health check endpoints
- CORS configuration for frontend integration
- Basic error handling

**Acceptance Criteria:**
- FastAPI app runs on localhost:8002
- `/health` endpoint returns 200 OK
- Database connectivity verified
- CORS configured for SvelteKit frontend
- Basic middleware for logging and error handling
- API documentation available at `/docs`

### 3.4 SvelteKit Frontend Skeleton (Priority: High)
**Requirements:**
- SvelteKit application with TypeScript configuration
- Basic routing structure matching planned user flow
- Tailwind CSS setup for styling
- API client configuration for FastAPI backend
- Basic layout and navigation components

**Acceptance Criteria:**
- SvelteKit dev server runs on localhost:5173
- TypeScript compilation working
- Tailwind CSS installed and configured
- Basic pages: `/`, `/survey`, `/coach`, `/feedback`
- API client can communicate with FastAPI backend
- Basic responsive layout component

### 3.5 Development Environment (Priority: High)
**Requirements:**
- Docker Compose for local development
- Environment variable management
- Hot reload for both frontend and backend
- Development database setup
- Package management with Bun for frontend

**Acceptance Criteria:**
- `docker-compose.yml` runs all services locally
- Frontend hot reload working
- Backend auto-restart on code changes
- Environment variables loaded from `.env` files
- Bun package manager configured and working

### 3.6 Basic CI/CD Pipeline (Priority: Medium)
**Requirements:**
- GitHub Actions workflow for automated testing
- Basic linting and type checking
- Database migration verification
- Build verification for both frontend and backend

**Acceptance Criteria:**
- GitHub Actions workflow file created
- Linting passes for TypeScript and Python code
- Database migrations run successfully in CI
- Build processes complete without errors
- Basic test framework setup (even with placeholder tests)

---

## 4. Implementation Phases

### Phase 1a: Project Structure & Dependencies
**Objective**: Set up directory structure and install core dependencies

**Tasks:**
1. Create monorepo directory structure
2. Initialize SvelteKit application in `apps/preflight-web/`
3. Initialize FastAPI application in `apps/preflight-api/` 
4. Set up package.json files with required dependencies
5. Configure TypeScript for frontend
6. Configure Python virtual environment and requirements.txt

**Implementation Notes:**
```bash
# Directory structure
mkdir -p apps/preflight-web apps/preflight-api infra/docker

# SvelteKit setup
cd apps/preflight-web
bun create svelte@latest . --template=skeleton --types=typescript
bun install
bun add -D tailwindcss postcss autoprefixer @tailwindcss/typography

# FastAPI setup  
cd ../preflight-api
uv venv
source .venv/bin/activate
uv add fastapi uvicorn sqlalchemy alembic psycopg2-binary python-multipart
```

### Phase 1b: Database Setup
**Objective**: Configure PostgreSQL and create core schema

**Tasks:**
1. Set up local PostgreSQL database
2. Configure Alembic for database migrations
3. Create initial migration with core tables
4. Configure database connection in FastAPI
5. Test database connectivity

**Core Tables:**
```sql
-- form_definitions
CREATE TABLE form_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    version VARCHAR(50) NOT NULL,
    definition JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- runs  
CREATE TABLE runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_definition_id UUID REFERENCES form_definitions(id),
    session_token VARCHAR(255),
    status VARCHAR(50) DEFAULT 'in_progress',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    metadata JSONB
);

-- answers
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID REFERENCES runs(id),
    page_id VARCHAR(255) NOT NULL,
    field_name VARCHAR(255) NOT NULL,
    value JSONB NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Phase 1c: FastAPI Application
**Objective**: Create functional FastAPI backend with basic endpoints

**Tasks:**
1. Set up FastAPI application structure
2. Configure database connection and SQLAlchemy
3. Create basic route modules
4. Add health check endpoint
5. Configure CORS for frontend integration
6. Add basic error handling middleware

**File Structure:**
```
apps/preflight-api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── database.py
│   ├── models/
│   │   ├── __init__.py
│   │   └── base.py
│   └── routes/
│       ├── __init__.py
│       └── health.py
├── alembic/
├── alembic.ini
├── requirements.txt
└── .env
```

**Basic Endpoints:**
- `GET /health` - Health check
- `GET /api/status` - Application status
- `GET /docs` - API documentation

### Phase 1d: SvelteKit Application  
**Objective**: Create functional SvelteKit frontend with basic routing

**Tasks:**
1. Configure SvelteKit with TypeScript
2. Set up Tailwind CSS
3. Create basic routing structure
4. Add layout component
5. Configure API client for backend communication
6. Create placeholder pages

**Route Structure:**
```
src/routes/
├── +layout.svelte
├── +page.svelte (home)
├── survey/
│   └── +page.svelte
├── coach/
│   └── +page.svelte
└── feedback/
    └── +page.svelte
```

**API Client Setup:**
```typescript
// src/lib/api/client.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8002';

export class ApiClient {
  async get(endpoint: string) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    return response.json();
  }
  
  async healthCheck() {
    return this.get('/health');
  }
}
```

### Phase 1e: Development Environment
**Objective**: Configure Docker and development tooling

**Tasks:**
1. Create Docker Compose configuration
2. Set up PostgreSQL container
3. Configure environment variables
4. Set up development scripts
5. Test full stack integration

**Docker Compose Structure:**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: preflight_dev
      POSTGRES_USER: preflight
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./apps/preflight-api
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://preflight:dev_password@postgres:5432/preflight_dev

  web:
    build: ./apps/preflight-web  
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE: http://localhost:8002
```

### Phase 1f: CI/CD Pipeline
**Objective**: Set up basic automated testing and deployment

**Tasks:**
1. Create GitHub Actions workflow
2. Configure linting for TypeScript and Python
3. Set up basic test runners
4. Add database migration testing
5. Configure build verification

**GitHub Actions Workflow:**
```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
    
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install frontend dependencies
        run: cd apps/preflight-web && bun install
      
      - name: Install backend dependencies  
        run: cd apps/preflight-api && pip install -r requirements.txt
      
      - name: Lint frontend
        run: cd apps/preflight-web && bun run lint
      
      - name: Lint backend
        run: cd apps/preflight-api && ruff check .
      
      - name: Test database migrations
        run: cd apps/preflight-api && alembic upgrade head
```

---

## 5. Security Considerations

### 5.1 Database Security
- Use environment variables for database credentials
- Configure PostgreSQL with limited user permissions
- Enable SSL for production database connections

### 5.2 API Security
- CORS configuration restricted to known frontend domains
- Basic rate limiting middleware setup
- Input validation on all endpoints

### 5.3 Development Security
- `.env` files excluded from version control
- No hardcoded secrets in codebase
- Secure default configurations

---

## 6. Success Metrics

### Technical Metrics
- All services start successfully with `docker-compose up`
- Frontend can successfully call backend health endpoint
- Database migrations run without errors
- CI/CD pipeline passes all checks
- Both applications build successfully

### Development Experience Metrics  
- Hot reload works for both frontend and backend
- New developers can set up environment in < 30 minutes
- All placeholder pages load without errors
- API documentation is accessible and accurate

---

## 7. Future Enhancements (Out of Scope)

### Phase 2 Preparation
- Database schema is designed to support form definitions and user responses
- API structure allows for easy addition of form and coaching endpoints
- Frontend routing supports the planned user flow
- Authentication system can be integrated without major refactoring

### Observability
- Logging framework setup for future monitoring
- Health check endpoints for production monitoring
- Database performance monitoring setup

---

## 8. Implementation Notes

### Environment Variables
```bash
# Backend (.env)
DATABASE_URL=postgresql://preflight:dev_password@localhost:5432/preflight_dev
CORS_ORIGINS=http://localhost:5173
DEBUG=true

# Frontend (.env)  
VITE_API_BASE=http://localhost:8002
```

### Package Management
- Use Bun for frontend package management (per CLAUDE.md)
- Use uv for Python dependency management
- Lock files committed to ensure consistent builds

### Code Quality
- ESLint and Prettier for TypeScript code
- Ruff for Python linting and formatting
- Pre-commit hooks for code quality enforcement

### Testing Framework Setup
- Vitest for SvelteKit component testing
- Pytest for FastAPI endpoint testing
- Basic test files created with placeholder tests

---

## 9. Definition of Done

Phase 1 is complete when:

- [ ] Local development environment starts with single command
- [ ] Frontend loads on localhost:5173 with basic navigation
+ [ ] Backend responds to health checks on localhost:8002
- [ ] Database migrations create all required tables
+ [ ] API documentation is accessible at localhost:8002/docs
- [ ] CI/CD pipeline passes on GitHub
- [ ] README.md updated with setup instructions
- [ ] All placeholder pages render without errors
- [ ] Frontend can successfully communicate with backend
- [ ] Docker Compose configuration works on fresh system

---

*This PRD defines the foundational infrastructure required before implementing any business logic or user-facing features. All subsequent development phases depend on successful completion of these core infrastructure components.*
