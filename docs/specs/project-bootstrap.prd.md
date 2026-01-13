# PRD: Project Bootstrap - AI Readiness Assessment Platform

## Document Information
- **Version**: 1.0.0
- **Created**: 2025-09-12
- **Author**: Claude Code
- **Status**: Draft

---

## 1. Executive Summary

**Project Preflight** is an experimental web application that measures AI readiness in clinical and well-being professionals through a multi-page survey and collaborative LLM coaching dialogue. This PRD outlines the complete bootstrap implementation from zero to a fully functional MVP.

**Key Goals:**
- Rapidly assess AI familiarity and confidence in healthcare professionals
- Demonstrate AI as a collaborative partner through conversational coaching
- Capture anonymized insights for research and product development
- Provide a privacy-first, resilient user experience

---

## 2. Technical Architecture

### Stack Overview
- **Frontend**: SvelteKit (TypeScript) with Server-Side Rendering
- **Backend**: FastAPI (Python) for LLM integration and async performance
- **Database**: PostgreSQL (Neon) with JSONB for flexible schema storage
- **Auth**: Rails 8 with JWT integration (Oceanheart Passport)
- **Deployment**: Vercel (frontend), Fly.io/Railway (backend), Neon (database)

### Directory Structure
```
apps/
  preflight-web/        # SvelteKit frontend
  preflight-api/        # FastAPI backend
infra/
  docker/
  alembic/             # database migrations
```

---

## 3. Core Features & Requirements

### 3.1 Dynamic Form System (Priority: High)
**Requirements:**
- JSON-based form definition language (DSL)
- Multi-page survey support with 10-15 questions
- Runtime form rendering with validation
- Autosave functionality per page
- Progress tracking and navigation

**Acceptance Criteria:**
- Forms defined in versioned JSON format stored in database
- Support for field types: text, textarea, select, radio, checkbox, markdown
- Client-side validation with server-side backup
- Automatic save every 30 seconds or on page navigation
- Resume capability from last saved state

### 3.2 LLM Coaching Pipeline (Priority: High)
**Requirements:**
- Configurable prompt pipeline system
- 2-4 conversational round trips with LLM
- Template-based prompt generation with variable substitution
- Conversation history persistence
- Guardrails and safety measures

**Acceptance Criteria:**
- JSON-based prompt pipeline definitions
- Support for OpenAI and Anthropic APIs
- Variable interpolation from survey responses
- Conversation state management
- Rate limiting and abuse prevention
- Content filtering and safety checks

### 3.3 Data Persistence & Analytics (Priority: High)
**Requirements:**
- Anonymous participation by default
- Fine-grained event logging
- Survey response storage with versioning
- Session management and recovery
- Research data export capabilities

**Acceptance Criteria:**
- PostgreSQL schema with JSONB flexibility
- Event tracking for UX analysis
- Data anonymization and privacy compliance
- Export functionality for research data
- Session recovery after network interruption

### 3.4 User Interface (Priority: Medium)
**Requirements:**
- Responsive design for mobile and desktop
- Accessible form controls (WCAG 2.1 AA)
- Clean, professional healthcare-appropriate design
- Loading states and error handling
- Progress indicators and navigation aids

**Acceptance Criteria:**
- Mobile-first responsive design
- Keyboard navigation support
- Screen reader compatibility
- Graceful error handling with user feedback
- Visual progress indicators throughout flow

### 3.5 Authentication & Security (Priority: Medium)
**Requirements:**
- Optional authenticated user accounts
- JWT-based API authentication
- Rate limiting on sensitive endpoints
- Data encryption and privacy controls
- EU data residency compliance

**Acceptance Criteria:**
- Integration with Oceanheart Passport (Rails 8)
- JWT token validation in FastAPI
- API rate limiting (especially /coach endpoint)
- HTTPS enforcement
- GDPR-compliant data handling

---

## 4. Implementation Phases

### Phase 1: Foundation & Core Infrastructure
**Objective**: Establish basic project structure and core services

**Tasks:**
1. Project scaffolding with directory structure
2. Database setup with initial schema
3. FastAPI backend with basic routing
4. SvelteKit frontend with routing structure
5. Docker containerization
6. Basic CI/CD pipeline

**Deliverables:**
- Working development environment
- Database migrations system
- API and frontend skeletons
- Deployment configuration

### Phase 2: Form System Implementation
**Objective**: Build dynamic form rendering and persistence

**Tasks:**
1. JSON form DSL definition and validation
2. Form renderer component in SvelteKit
3. API endpoints for form definitions and responses
4. Autosave functionality
5. Form validation (client and server)
6. Progress tracking and navigation

**Deliverables:**
- Complete form system with example forms
- Autosave and resume functionality
- Form validation and error handling

### Phase 3: LLM Coaching System
**Objective**: Implement conversational AI coaching pipeline

**Tasks:**
1. LLM service integration (OpenAI/Anthropic)
2. Prompt pipeline processing system
3. Conversation state management
4. Template variable substitution
5. Safety guardrails and content filtering
6. Rate limiting and abuse prevention

**Deliverables:**
- Working LLM coaching system
- Conversation persistence
- Safety and rate limiting measures

### Phase 4: User Experience & Polish
**Objective**: Complete user interface and experience optimization

**Tasks:**
1. Responsive design implementation
2. Accessibility improvements
3. Loading states and error handling
4. User feedback collection
5. Analytics and event tracking
6. Performance optimization

**Deliverables:**
- Polished, accessible user interface
- Complete user flow from survey to coaching
- Analytics dashboard (basic)

### Phase 5: Authentication & Deployment
**Objective**: Add authentication and deploy to production

**Tasks:**
1. Authentication system integration
2. JWT token handling
3. User account management
4. Production deployment setup
5. Domain configuration
6. Monitoring and logging

**Deliverables:**
- Production-ready application
- User authentication system
- Deployed application at preflight.oceanheart.ai

---

## 5. Data Models

### Core Tables

#### form_definitions
```sql
id: UUID (primary key)
name: VARCHAR(255) (unique)
version: VARCHAR(50)
definition: JSONB
created_at: TIMESTAMP
updated_at: TIMESTAMP
is_active: BOOLEAN
```

#### prompt_pipelines
```sql
id: UUID (primary key)
name: VARCHAR(255)
version: VARCHAR(50)
pipeline: JSONB
created_at: TIMESTAMP
updated_at: TIMESTAMP
is_active: BOOLEAN
```

#### runs
```sql
id: UUID (primary key)
user_id: UUID (nullable, FK to users)
form_definition_id: UUID (FK to form_definitions)
prompt_pipeline_id: UUID (FK to prompt_pipelines)
session_token: VARCHAR(255) (for anonymous users)
status: ENUM('in_progress', 'completed', 'abandoned')
started_at: TIMESTAMP
completed_at: TIMESTAMP (nullable)
metadata: JSONB
```

#### answers
```sql
id: UUID (primary key)
run_id: UUID (FK to runs)
page_id: VARCHAR(255)
field_name: VARCHAR(255)
value: JSONB
saved_at: TIMESTAMP
```

#### coach_turns
```sql
id: UUID (primary key)
run_id: UUID (FK to runs)
turn_number: INTEGER
role: ENUM('user', 'assistant', 'system')
content: TEXT
metadata: JSONB
created_at: TIMESTAMP
```

#### feedback
```sql
id: UUID (primary key)
run_id: UUID (FK to runs)
rating: INTEGER (1-5)
comments: TEXT (nullable)
created_at: TIMESTAMP
```

---

## 6. API Specifications

### Authentication
- JWT tokens for authenticated users
- Session tokens for anonymous users
- Rate limiting on all endpoints

### Core Endpoints

#### Forms
- `GET /api/forms` - List available forms
- `GET /api/forms/{form_id}` - Get form definition
- `POST /api/forms/{form_id}/runs` - Start new run
- `GET /api/runs/{run_id}` - Get run status
- `PUT /api/runs/{run_id}/answers` - Save answers
- `GET /api/runs/{run_id}/answers` - Get saved answers

#### Coaching
- `POST /api/runs/{run_id}/coach/start` - Start coaching session
- `POST /api/runs/{run_id}/coach/message` - Send message to coach
- `GET /api/runs/{run_id}/coach/history` - Get conversation history

#### Feedback
- `POST /api/runs/{run_id}/feedback` - Submit feedback
- `GET /api/analytics/summary` - Basic analytics (authenticated admin only)

---

## 7. Security & Privacy Requirements

### Privacy
- Anonymous participation by default
- No PHI (Personal Health Information) storage
- IP address logging limited to 30 days for abuse prevention
- EU data residency compliance (Neon EU region)
- GDPR-compliant data handling

### Security
- HTTPS enforcement across all endpoints
- JWT token validation and refresh
- Rate limiting on coaching endpoints (5 requests/minute per session)
- Input sanitization and validation
- SQL injection prevention through parameterized queries
- Content Security Policy (CSP) headers
- Basic WAF protection on sensitive endpoints

### Data Retention
- Anonymous session data: 2 years for research purposes
- Chat logs: 1 year for model improvement
- Analytics data: Aggregated, indefinite retention
- Error logs: 90 days maximum

---

## 8. Performance Requirements

### Response Times
- Form rendering: < 2 seconds
- Autosave operations: < 1 second
- LLM responses: < 30 seconds (with timeout at 45 seconds)
- Page navigation: < 1 second

### Scalability
- Support 1000 concurrent users initially
- Database connection pooling
- API response caching where appropriate
- CDN for static assets

### Reliability
- 99.5% uptime target
- Graceful degradation for LLM service outages
- Automatic retry mechanisms for transient failures
- Health check endpoints for monitoring

---

## 9. Testing Requirements

### Unit Tests
- Form validation logic (client and server)
- LLM prompt processing
- Data persistence functions
- Authentication and authorization

### Integration Tests
- Complete user flow from survey to coaching
- API endpoint testing
- Database migration testing
- Authentication flow testing

### End-to-End Tests
- Critical user paths using Playwright
- Mobile responsiveness testing
- Accessibility testing (automated and manual)
- Cross-browser compatibility

---

## 10. Monitoring & Analytics

### Application Monitoring
- API response times and error rates
- Database query performance
- LLM service availability and latency
- User session metrics

### Research Analytics
- Survey completion rates by form version
- Coaching session engagement metrics
- User feedback sentiment analysis
- A/B testing capabilities for form variations

### Error Tracking
- Application error logging and alerting
- User error reporting and feedback
- LLM service error handling and fallbacks

---

## 11. Deployment & Infrastructure

### Development Environment
- Docker Compose for local development
- Hot reload for both frontend and backend
- Local PostgreSQL database
- Mock LLM service for testing

### Production Environment
- **Frontend**: Vercel deployment with automatic deployments from main branch
- **Backend**: Fly.io or Railway with health checks and scaling
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Domains**: 
  - `preflight.oceanheart.ai` → Frontend
  - `api.preflight.oceanheart.ai` → Backend

### CI/CD Pipeline
- Automated testing on pull requests
- Security scanning and dependency checks
- Database migration verification
- Deployment to staging environment
- Manual approval for production deployments

---

## 12. Success Metrics

### Technical Metrics
- < 2% error rate on critical user flows
- > 95% form completion rate (once started)
- < 5 second average LLM response time
- Zero data breaches or privacy incidents

### User Experience Metrics
- > 4.0/5.0 average user satisfaction rating
- < 10% abandonment rate during coaching sessions
- > 80% of users complete feedback form
- Accessibility audit score > 90%

### Research Metrics
- Data collection from 100+ participants for initial research
- Statistically significant insights on AI readiness factors
- Successful demonstration of AI coaching effectiveness

---

## 13. Risks & Mitigation

### Technical Risks
**Risk**: LLM service outages affecting user experience
**Mitigation**: Implement fallback messaging and graceful degradation

**Risk**: Database performance issues with JSONB queries
**Mitigation**: Proper indexing strategy and query optimization

**Risk**: Security vulnerabilities in user-generated content
**Mitigation**: Comprehensive input validation and sanitization

### Business Risks
**Risk**: Low user engagement with coaching feature
**Mitigation**: A/B testing of different coaching approaches and prompts

**Risk**: Privacy concerns deterring participation
**Mitigation**: Clear privacy policy and anonymous-first design

**Risk**: Inadequate research data quality
**Mitigation**: Careful form design and validation rules

---

## 14. Future Enhancements (Out of Scope for MVP)

### Advanced Features
- Multi-language support for international expansion
- Offline capability with sync-when-online
- Advanced analytics dashboard for administrators
- Integration with external assessment tools

### Research Features
- Longitudinal studies with follow-up surveys
- Personalized resource recommendations
- AI coaching effectiveness measurement
- Comparative analysis across professional groups

### Technical Improvements
- GraphQL API for more efficient data fetching
- Real-time collaboration features
- Advanced caching strategies
- Machine learning insights on user patterns

---

## 15. Appendix

### Environment Variables
```bash
# Backend (FastAPI)
DATABASE_URL=postgresql://user:pass@host:5432/preflight
LLM_API_KEY=sk-...
CLERK_SECRET_KEY=sk_...
JWT_SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=https://preflight.oceanheart.ai

# Frontend (SvelteKit)
PUBLIC_API_BASE=https://api.preflight.oceanheart.ai
PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
```

### Example Form DSL
```json
{
  "id": "ai-readiness-v1",
  "title": "AI Readiness Assessment",
  "description": "A brief assessment of your familiarity and comfort with AI tools",
  "pages": [
    {
      "id": "background",
      "title": "Background Information",
      "blocks": [
        {
          "type": "markdown",
          "content": "## Tell us about yourself\n\nThis information helps us provide better coaching."
        },
        {
          "type": "select",
          "name": "professional_role",
          "label": "What best describes your professional role?",
          "options": [
            {"value": "psychologist", "label": "Psychologist"},
            {"value": "gp", "label": "General Practitioner"},
            {"value": "coach", "label": "Coach/Counselor"},
            {"value": "complementary", "label": "Complementary/Alternative Practitioner"},
            {"value": "other", "label": "Other"}
          ],
          "required": true
        },
        {
          "type": "radio",
          "name": "ai_confidence",
          "label": "How confident are you with AI tools? (0 = not at all, 5 = very confident)",
          "options": [
            {"value": 0, "label": "0 - Not at all confident"},
            {"value": 1, "label": "1 - Slightly confident"},
            {"value": 2, "label": "2 - Somewhat confident"},
            {"value": 3, "label": "3 - Moderately confident"},
            {"value": 4, "label": "4 - Very confident"},
            {"value": 5, "label": "5 - Extremely confident"}
          ],
          "required": true
        }
      ]
    }
  ],
  "navigation": {
    "style": "pager",
    "autosave": true,
    "showProgress": true
  },
  "meta": {
    "version": "1.0.0",
    "created": "2025-09-12",
    "estimatedTime": "10-15 minutes"
  }
}
```

### Example Prompt Pipeline
```json
{
  "id": "collaborative-coach-v1",
  "name": "Collaborative Coaching Pipeline",
  "description": "A supportive coaching conversation to explore challenges",
  "rounds": [
    {
      "role": "system",
      "template": "You are a collaborative AI coach for healthcare professionals. Your goal is to help them explore challenges through thoughtful questions, not to provide direct advice. Ask one focused question at a time and build on their responses. Be supportive and professional."
    },
    {
      "role": "user",
      "template": "I'm a {{professional_role}} with confidence level {{ai_confidence}} in AI tools. I'm dealing with this challenge: {{recent_problem}}\n\nWhat's one key question I should be asking myself about this situation?"
    },
    {
      "role": "assistant",
      "maxTokens": 150,
      "temperature": 0.7
    },
    {
      "role": "user",
      "template": "{{user_response}}"
    }
  ],
  "limits": {
    "maxRounds": 4,
    "timeoutSeconds": 45,
    "guardrails": [
      "no_medical_diagnosis",
      "no_personal_data_retention",
      "professional_boundaries"
    ]
  },
  "fallbacks": {
    "serviceUnavailable": "I apologize, but our coaching service is temporarily unavailable. Please try again later or contact support if the issue persists.",
    "rateLimit": "You've reached the conversation limit for this session. Please complete your feedback to help us improve the experience."
  }
}
```

---

*This PRD serves as the complete specification for implementing Project Preflight from zero to production-ready MVP.*