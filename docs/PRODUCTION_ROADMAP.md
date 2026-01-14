# Preflight Production Roadmap

## Current State Assessment

**Production Readiness: ~25-30%**

| Component | Status | Blocker Level |
|-----------|--------|---------------|
| UI/UX Flows | Working | None |
| Authentication | Stub only | **Critical** |
| Backend API | Functional | Medium |
| Database | Schema ready | Medium |
| Security | Major gaps | **Critical** |
| Deployment | Docker ready | High |
| Observability | Missing | High |
| CI/CD | Minimal | Medium |

---

## Phase 1: Critical Security & Auth (Week 1)

**Goal:** Make the app safe to deploy with real user authentication.

### 1.1 Implement Real JWT Validation

**Files to modify:**
- `apps/preflight-api/app/middleware/auth.py`
- `apps/preflight-api/app/dependencies.py`

**Tasks:**
- [ ] Implement `validate_jwt()` function (currently raises `NotImplementedError`)
- [ ] Add JWT secret configuration via environment variable
- [ ] Validate token signature, expiration, and claims
- [ ] Add user extraction from validated token
- [ ] Create `get_current_user` dependency for protected routes

**Verification:**
```bash
# Test with invalid token - should return 401
curl -H "Authorization: Bearer invalid" http://localhost:8000/runs

# Test with valid token - should return data
curl -H "Authorization: Bearer $VALID_TOKEN" http://localhost:8000/runs
```

### 1.2 Secure Authentication Cookies

**Files to modify:**
- `apps/preflight-web/lib/auth/passport.ts`
- `apps/preflight-web/lib/auth/utils.ts`

**Tasks:**
- [ ] Add `HttpOnly: true` to session cookie
- [ ] Add `Secure: true` for production
- [ ] Change `SameSite` from `Lax` to `Strict`
- [ ] Implement secure cookie domain logic for production

**Code change:**
```typescript
// passport.ts - setTokenInCookie()
document.cookie = `oh_session=${token}; path=/; domain=${domain}; SameSite=Strict; ${isProduction ? 'Secure; HttpOnly;' : ''} max-age=${7 * 24 * 60 * 60}`;
```

### 1.3 HTTPS Enforcement

**Files to create/modify:**
- `apps/preflight-web/middleware.ts`
- `apps/preflight-api/app/main.py`

**Tasks:**
- [ ] Add HTTPS redirect middleware in Next.js
- [ ] Configure FastAPI to check `X-Forwarded-Proto` header
- [ ] Update CORS to only allow HTTPS origins in production

**Next.js middleware addition:**
```typescript
// Redirect HTTP to HTTPS in production
if (process.env.NODE_ENV === 'production' &&
    request.headers.get('x-forwarded-proto') !== 'https') {
  return NextResponse.redirect(`https://${request.headers.get('host')}${pathname}`);
}
```

### 1.4 Secrets Management

**Files to modify:**
- `docker-compose.yml`
- `apps/preflight-api/.env.example`
- Create `docker-compose.prod.yml`

**Tasks:**
- [ ] Remove hardcoded passwords from docker-compose
- [ ] Create production compose file with secrets references
- [ ] Document secrets required for deployment
- [ ] Add validation for required secrets on startup

**Required secrets:**
```
DATABASE_URL          # PostgreSQL connection string
JWT_SECRET            # Min 32 characters
OPENAI_API_KEY        # For coaching
ANTHROPIC_API_KEY     # For coaching (optional)
PASSPORT_URL          # OAuth provider URL
```

### 1.5 Health Checks with Dependencies

**Files to modify:**
- `apps/preflight-api/app/routes/health.py`

**Tasks:**
- [ ] Add database connectivity check
- [ ] Add Redis connectivity check (when implemented)
- [ ] Return detailed health status
- [ ] Add `/health/live` and `/health/ready` endpoints

**Implementation:**
```python
@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    checks = {
        "database": await check_database(db),
        "timestamp": datetime.utcnow().isoformat()
    }
    status = "ok" if all(checks.values()) else "degraded"
    return {"status": status, "checks": checks}
```

---

## Phase 2: Infrastructure Scaling (Week 2)

**Goal:** Enable horizontal scaling and production-grade infrastructure.

### 2.1 Redis Integration

**Files to create:**
- `apps/preflight-api/app/services/cache.py`
- `apps/preflight-api/app/middleware/rate_limit_redis.py`

**Tasks:**
- [ ] Add Redis to docker-compose
- [ ] Implement Redis connection pool
- [ ] Migrate rate limiter from in-memory to Redis
- [ ] Add Redis health check
- [ ] Configure Redis URL via environment

**Rate limiter migration:**
```python
class RedisRateLimiter:
    def __init__(self, redis_url: str):
        self.redis = aioredis.from_url(redis_url)

    async def check_rate_limit(self, key: str, limit: int, window: int) -> bool:
        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, window)
        return current <= limit
```

### 2.2 Database Optimization

**Files to modify:**
- `apps/preflight-api/alembic/versions/` (new migration)
- `apps/preflight-api/app/database.py`

**Tasks:**
- [ ] Add missing indexes:
  - `runs.status`
  - `runs.form_definition_id`
  - `answers.run_id`
  - `coaching_sessions.run_id`
- [ ] Configure connection pool size for production
- [ ] Add query timeout settings
- [ ] Implement read replica support (optional)

**Migration for indexes:**
```python
def upgrade():
    op.create_index('ix_runs_status', 'runs', ['status'])
    op.create_index('ix_runs_form_def', 'runs', ['form_definition_id'])
    op.create_index('ix_answers_run_id', 'answers', ['run_id'])
```

### 2.3 Error Tracking (Sentry)

**Files to modify:**
- `apps/preflight-web/app/layout.tsx`
- `apps/preflight-api/app/main.py`
- Create `apps/preflight-web/lib/sentry.ts`

**Tasks:**
- [ ] Add Sentry SDK to both apps
- [ ] Configure DSN via environment
- [ ] Add error boundary components
- [ ] Enable performance monitoring
- [ ] Set up release tracking

**Frontend setup:**
```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### 2.4 Request Logging

**Files to create:**
- `apps/preflight-api/app/middleware/logging.py`

**Tasks:**
- [ ] Add request ID generation middleware
- [ ] Log request/response with timing
- [ ] Include user ID in logs when authenticated
- [ ] Configure log format for production (JSON)
- [ ] Add correlation ID propagation

**Logging middleware:**
```python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    request_id = str(uuid4())
    request.state.request_id = request_id

    start = time.perf_counter()
    response = await call_next(request)
    duration = time.perf_counter() - start

    logger.info(
        "request_completed",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "status": response.status_code,
            "duration_ms": round(duration * 1000, 2)
        }
    )
    response.headers["X-Request-ID"] = request_id
    return response
```

---

## Phase 3: Application Hardening (Week 3)

**Goal:** Robust error handling and frontend resilience.

### 3.1 Global Error Boundaries

**Files to create:**
- `apps/preflight-web/components/ErrorBoundary.tsx`
- `apps/preflight-web/app/error.tsx`
- `apps/preflight-web/app/global-error.tsx`

**Tasks:**
- [ ] Create reusable ErrorBoundary component
- [ ] Add app-level error.tsx for route errors
- [ ] Add global-error.tsx for root errors
- [ ] Report errors to Sentry
- [ ] Show user-friendly error UI

### 3.2 API Request Interceptors

**Files to modify:**
- `apps/preflight-web/lib/api/client.ts` (create)
- `apps/preflight-web/lib/api/forms.ts`
- `apps/preflight-web/lib/api/coaching.ts`

**Tasks:**
- [ ] Create centralized API client with interceptors
- [ ] Add automatic token refresh on 401
- [ ] Add request retry with exponential backoff
- [ ] Add request/response logging
- [ ] Handle network errors gracefully

**API client structure:**
```typescript
class ApiClient {
  private async request<T>(path: string, options: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${getToken()}`,
        'X-Request-ID': generateRequestId(),
      },
    });

    if (response.status === 401) {
      await refreshToken();
      return this.request(path, options); // Retry once
    }

    if (!response.ok) {
      throw new ApiError(response);
    }

    return response.json();
  }
}
```

### 3.3 Input Validation Hardening

**Files to modify:**
- `apps/preflight-api/app/schemas/forms.py`
- `apps/preflight-api/app/schemas/coaching.py`

**Tasks:**
- [ ] Add max_length to all string fields
- [ ] Add regex validation for emails
- [ ] Limit nested JSON depth in answers
- [ ] Add request size limits in FastAPI
- [ ] Sanitize user input for XSS

**Schema updates:**
```python
class AnswersSave(BaseModel):
    page_id: str = Field(max_length=255, pattern=r'^[a-zA-Z0-9_-]+$')
    answers: dict[str, Any] = Field(max_length=50)  # Max 50 fields

    @field_validator('answers')
    def validate_answers_depth(cls, v):
        # Prevent deeply nested objects
        if json.dumps(v).__len__() > 10000:
            raise ValueError('Answer payload too large')
        return v
```

### 3.4 Security Headers

**Files to modify:**
- `apps/preflight-web/next.config.ts`
- `apps/preflight-api/app/main.py`

**Tasks:**
- [ ] Add Content-Security-Policy header
- [ ] Add X-Frame-Options: DENY
- [ ] Add X-Content-Type-Options: nosniff
- [ ] Add Referrer-Policy
- [ ] Add Permissions-Policy

**Next.js config:**
```typescript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline';" },
];

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};
```

---

## Phase 4: CI/CD & Testing (Week 4)

**Goal:** Automated testing and deployment pipeline.

### 4.1 Backend Tests in CI

**Files to modify:**
- `.github/workflows/ci.yml`
- `apps/preflight-api/pytest.ini`

**Tasks:**
- [ ] Add pytest to CI workflow
- [ ] Configure test database for CI
- [ ] Add coverage reporting
- [ ] Fail CI on coverage drop
- [ ] Add type checking with mypy

**CI additions:**
```yaml
- name: Run backend tests
  run: |
    cd apps/preflight-api
    pytest --cov=app --cov-report=xml

- name: Type check
  run: |
    cd apps/preflight-api
    mypy app/
```

### 4.2 Frontend Tests in CI

**Files to modify:**
- `.github/workflows/ci.yml`

**Tasks:**
- [ ] Install Playwright browsers in CI
- [ ] Run integration tests
- [ ] Add test artifacts upload
- [ ] Configure test parallelization

**CI additions:**
```yaml
- name: Install Playwright
  run: bunx playwright install chromium --with-deps

- name: Run E2E tests
  run: bun run test:integration
  env:
    CI: true
```

### 4.3 Security Scanning

**Files to create:**
- `.github/workflows/security.yml`

**Tasks:**
- [ ] Add dependency vulnerability scanning
- [ ] Add SAST with CodeQL
- [ ] Add secrets detection
- [ ] Configure Dependabot

### 4.4 Deployment Pipeline

**Files to create:**
- `.github/workflows/deploy.yml`

**Tasks:**
- [ ] Build and push Docker images
- [ ] Deploy to staging on PR merge
- [ ] Deploy to production on release tag
- [ ] Add smoke tests post-deployment
- [ ] Implement rollback capability

---

## Phase 5: Monitoring & Observability (Week 5)

**Goal:** Full visibility into production systems.

### 5.1 Metrics Collection

**Tasks:**
- [ ] Add Prometheus metrics endpoint
- [ ] Track API response times
- [ ] Track database query performance
- [ ] Track LLM API costs and latency
- [ ] Track error rates by endpoint

### 5.2 Dashboard Setup

**Tasks:**
- [ ] Create Grafana dashboards
- [ ] Add alerting rules
- [ ] Configure PagerDuty/Slack integration
- [ ] Set up SLO tracking

### 5.3 Log Aggregation

**Tasks:**
- [ ] Configure structured JSON logging
- [ ] Set up log shipping to CloudWatch/ELK
- [ ] Create log-based alerts
- [ ] Implement log retention policy

---

## Phase 6: Production Launch Checklist

### Pre-Launch

- [ ] All Phase 1-4 items completed
- [ ] Security audit passed
- [ ] Load testing completed
- [ ] Backup/restore tested
- [ ] Runbook documented
- [ ] On-call rotation set up

### Launch Day

- [ ] DNS configured
- [ ] SSL certificates valid
- [ ] Monitoring dashboards active
- [ ] Error tracking configured
- [ ] Rollback plan ready

### Post-Launch

- [ ] Monitor error rates (< 1%)
- [ ] Monitor response times (p99 < 2s)
- [ ] Monitor LLM costs
- [ ] Gather user feedback
- [ ] Plan iteration cycle

---

## Timeline Summary

| Phase | Focus | Duration | Dependencies |
|-------|-------|----------|--------------|
| 1 | Security & Auth | 1 week | None |
| 2 | Infrastructure | 1 week | Phase 1 |
| 3 | Hardening | 1 week | Phase 1 |
| 4 | CI/CD | 1 week | Phase 2, 3 |
| 5 | Observability | 1 week | Phase 4 |
| 6 | Launch | 1 week | All phases |

**Total: 6 weeks to production**

---

## Resource Requirements

### Team
- 2 Full-stack engineers (Phases 1-4)
- 1 DevOps/SRE engineer (Phases 2, 4, 5)
- 1 QA engineer (Phase 4)

### Infrastructure
- PostgreSQL (managed: RDS, Cloud SQL)
- Redis (managed: ElastiCache, Memorystore)
- Container orchestration (ECS, GKE, or k8s)
- CDN (CloudFront, Cloudflare)
- SSL certificates (ACM, Let's Encrypt)

### Services
- Sentry (~$26/mo for Team plan)
- Monitoring (Grafana Cloud free tier or DataDog)
- CI/CD (GitHub Actions - included)

---

## Ralph Wiggum Plugin Assessment

### What Ralph Wiggum Provides

1. **Iterative testing loops** - Run tests repeatedly until pass
2. **Completion promises** - Define success criteria
3. **State tracking** - Track iteration progress
4. **Auto-retry on failure** - Fix and rerun automatically

### Current Testing Without Ralph Wiggum

```bash
# Manual approach - works fine
bun run test:simulate:all  # Run tests
# If fail: fix issue manually
# Repeat until pass
```

### When Ralph Wiggum Adds Value

| Scenario | Ralph Value | Manual Equivalent |
|----------|-------------|-------------------|
| Simple bug fix | Low | Run test once, done |
| Multi-step refactor | Medium | Run tests after each step |
| Large migration | High | Many iterations needed |
| CI/CD integration | Low | CI handles retries |

### Recommendation: Skip Ralph Wiggum

**Reasons:**

1. **Existing tests are reliable** - Our simulation tests pass consistently
2. **Manual iteration is fast** - Test runs in ~6 seconds
3. **CI will handle retries** - Failed tests trigger re-runs
4. **Cost savings** - One less tool to manage/pay for
5. **Complexity reduction** - Simpler developer workflow

**When to reconsider:**
- If test flakiness increases significantly
- If doing large-scale migrations frequently
- If team size grows and coordination becomes harder

### Alternative Approach

Instead of Ralph Wiggum, use:

```bash
# Simple retry script
#!/bin/bash
MAX_RETRIES=3
for i in $(seq 1 $MAX_RETRIES); do
  bun run test:simulate:all && exit 0
  echo "Attempt $i failed, retrying..."
done
exit 1
```

This provides 80% of Ralph Wiggum's value at 0% cost.

---

## Cost Estimate

### Monthly Infrastructure (Estimated)

| Service | Cost | Notes |
|---------|------|-------|
| Compute (2x small instances) | $50-100 | ECS/GKE |
| Database (PostgreSQL) | $30-50 | Managed, small |
| Redis | $15-30 | Managed, small |
| CDN/SSL | $0-20 | CloudFlare free tier |
| Sentry | $26 | Team plan |
| LLM APIs | $50-200 | Based on usage |
| **Total** | **$170-425/mo** | |

### One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Domain | $12/yr | If not owned |
| Security audit | $0-5000 | Optional external audit |
| Load testing tools | $0-100 | k6 is free |

---

## Success Metrics

### Technical
- API response time p99 < 500ms
- Error rate < 0.1%
- Uptime > 99.9%
- Test coverage > 80%

### Business
- User signup completion rate > 70%
- Survey completion rate > 60%
- Coaching session completion rate > 50%
- Customer support tickets < 5/week

---

## Risk Mitigation

| Risk | Mitigation | Owner |
|------|------------|-------|
| Auth integration issues | Test with real Passport in staging | Backend |
| LLM API costs spike | Set budget alerts, implement caching | Backend |
| Database performance | Load test before launch | DevOps |
| Security vulnerability | Security audit, bug bounty | All |
| Deployment failure | Blue-green deployment, instant rollback | DevOps |
