# PRD: Phase 3 LLM Coaching System - Conversational AI Pipeline

## Document Information
- **Version**: 1.0.0
- **Created**: 2025-09-12
- **Author**: Claude Code
- **Status**: Ready for Implementation
- **Parent PRD**: project-bootstrap.prd.md
- **Dependencies**: Phase 1 (Foundation), Phase 2 (Form System)

---

## 1. Executive Summary

Phase 3 implements the core conversational AI coaching system for Project Preflight. This system provides healthcare professionals with 2-4 rounds of collaborative dialogue with an LLM, using their survey responses to create personalized coaching conversations that explore challenges through thoughtful questions rather than direct advice.

**Primary Goal**: Create a configurable, safe, and engaging LLM coaching pipeline that demonstrates AI as a collaborative partner while maintaining professional boundaries and user privacy.

---

## 2. Problem Statement

Currently, the application can collect survey responses but lacks the core value proposition - the AI coaching experience. Users complete surveys but have no way to engage with AI coaching, which is essential for:

- Demonstrating AI as a collaborative partner vs. static tool
- Providing personalized exploration of user challenges
- Capturing engagement data for research purposes
- Validating the coaching effectiveness hypothesis

Without this system, the application cannot fulfill its research objectives or provide meaningful value to healthcare professionals exploring AI readiness.

---

## 3. Requirements

### 3.1 LLM Service Integration (Priority: High)
**Requirements:**
- Support for OpenAI GPT models (GPT-4, GPT-3.5-turbo)
- Support for Anthropic Claude models (Claude-3-5-Sonnet, Claude-3-Haiku)
- Async API client implementation with timeout handling
- Error handling and retry logic for API failures
- Model selection configuration per prompt pipeline

**Acceptance Criteria:**
- LLM service clients implemented for both OpenAI and Anthropic
- Async request handling with configurable timeouts (45 seconds max)
- Exponential backoff retry logic for transient failures
- Graceful error handling with user-friendly messages
- Model parameters (temperature, max_tokens) configurable per request

### 3.2 Prompt Pipeline System (Priority: High)
**Requirements:**
- JSON-based prompt pipeline definitions stored in database
- Template variable substitution from survey responses
- Multi-round conversation flow management
- Support for system, user, and assistant roles
- Pipeline versioning and A/B testing support

**Acceptance Criteria:**
- Prompt pipelines stored in `prompt_pipelines` table
- Mustache-style template variable interpolation ({{variable}})
- Conversation state maintained across multiple API calls
- Support for conditional branching based on responses
- Pipeline validation against JSON schema

### 3.3 Conversation Management (Priority: High)
**Requirements:**
- Persistent conversation history in database
- Turn-by-turn conversation tracking
- Context window management for long conversations
- Conversation resumption after interruptions
- Metadata tracking (response times, token usage)

**Acceptance Criteria:**
- All conversation turns stored in `coach_turns` table
- Context window truncation when approaching model limits
- Conversation state recovery from database
- Turn numbering and sequencing maintained
- Performance metrics captured per conversation

### 3.4 Safety and Guardrails (Priority: High)
**Requirements:**
- Content filtering for inappropriate responses
- Professional boundary enforcement
- No medical diagnosis or advice generation
- Personal information detection and handling
- Conversation monitoring and logging

**Acceptance Criteria:**
- System prompts enforce professional coaching boundaries
- Content filtering prevents medical diagnosis language
- User input sanitization and validation
- Conversation monitoring for policy violations
- Emergency response protocols for concerning content

### 3.5 Rate Limiting and Abuse Prevention (Priority: High)
**Requirements:**
- Per-session conversation limits (4 rounds maximum)
- API rate limiting to prevent abuse
- Cost monitoring and budget controls
- Session timeout handling
- Concurrent conversation limits

**Acceptance Criteria:**
- Maximum 4 conversation rounds per coaching session
- Rate limiting: 5 requests per minute per session
- Monthly API cost monitoring with alerts
- Session timeout after 30 minutes of inactivity
- Maximum 3 concurrent conversations per user session

### 3.6 Frontend Integration (Priority: Medium)
**Requirements:**
- Real-time chat interface in SvelteKit
- Loading states and typing indicators
- Message history display
- Error handling and retry mechanisms
- Mobile-responsive chat UI

**Acceptance Criteria:**
- Chat interface integrated into survey flow
- Real-time message updates without page refresh
- Visual indicators for AI processing states
- Graceful error recovery with retry options
- Touch-friendly mobile chat interface

---

## 4. Implementation Phases

### Phase 3a: LLM Service Foundation
**Objective**: Set up basic LLM API integration and client libraries

**Tasks:**
1. Install and configure OpenAI Python client
2. Install and configure Anthropic Python client
3. Create unified LLM service abstraction layer
4. Implement async request handling with timeouts
5. Add error handling and retry logic
6. Create configuration management for API keys

**Implementation Notes:**
```python
# app/services/llm.py
class LLMService:
    async def generate_response(
        self, 
        messages: List[Message], 
        model: str,
        temperature: float = 0.7,
        max_tokens: int = 150,
        timeout: int = 45
    ) -> LLMResponse:
        # Implementation with error handling and retries
        pass

class OpenAIClient(LLMService):
    # OpenAI-specific implementation
    pass

class AnthropicClient(LLMService):  
    # Anthropic-specific implementation
    pass
```

**Environment Variables:**
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
LLM_REQUEST_TIMEOUT=45
LLM_MAX_RETRIES=3
```

### Phase 3b: Prompt Pipeline Engine
**Objective**: Build the core pipeline processing system

**Tasks:**
1. Create prompt pipeline data models
2. Implement template variable substitution
3. Build pipeline execution engine
4. Add pipeline validation logic
5. Create pipeline management API endpoints
6. Add basic pipeline templates

**Pipeline Data Model:**
```python
class PromptPipeline(SQLAlchemyBase):
    id: UUID
    name: str
    version: str
    pipeline: dict  # JSONB field
    created_at: datetime
    updated_at: datetime
    is_active: bool

class PipelineExecution:
    def __init__(self, pipeline: PromptPipeline, variables: Dict):
        self.pipeline = pipeline
        self.variables = variables
        
    async def execute_round(self, round_number: int) -> str:
        # Execute specific round of pipeline
        pass
        
    def substitute_variables(self, template: str) -> str:
        # Replace {{variable}} with actual values
        pass
```

**API Endpoints:**
- `GET /api/pipelines` - List available pipelines
- `GET /api/pipelines/{pipeline_id}` - Get pipeline definition
- `POST /api/pipelines` - Create new pipeline (admin only)
- `PUT /api/pipelines/{pipeline_id}` - Update pipeline (admin only)

### Phase 3c: Conversation Management System
**Objective**: Implement conversation tracking and state management

**Tasks:**
1. Extend `coach_turns` table with required fields
2. Create conversation session management
3. Implement turn-by-turn tracking
4. Add conversation history API endpoints
5. Build conversation resumption logic
6. Add conversation metadata tracking

**Database Schema Updates:**
```sql
-- Extend coach_turns table
ALTER TABLE coach_turns ADD COLUMN response_time_ms INTEGER;
ALTER TABLE coach_turns ADD COLUMN token_count INTEGER;
ALTER TABLE coach_turns ADD COLUMN model_used VARCHAR(100);
ALTER TABLE coach_turns ADD COLUMN pipeline_version VARCHAR(50);
```

**Conversation API:**
```python
class ConversationManager:
    async def start_conversation(
        self, 
        run_id: UUID, 
        pipeline_id: UUID
    ) -> ConversationSession:
        # Initialize conversation with survey data
        pass
        
    async def send_message(
        self, 
        session_id: UUID, 
        message: str
    ) -> CoachResponse:
        # Process user message and generate AI response
        pass
        
    async def get_conversation_history(
        self, 
        session_id: UUID
    ) -> List[ConversationTurn]:
        # Retrieve full conversation history
        pass
```

**API Endpoints:**
- `POST /api/runs/{run_id}/coach/start` - Start coaching session
- `POST /api/runs/{run_id}/coach/message` - Send message to coach
- `GET /api/runs/{run_id}/coach/history` - Get conversation history
- `POST /api/runs/{run_id}/coach/end` - End coaching session

### Phase 3d: Safety and Content Filtering
**Objective**: Implement safety measures and professional boundaries

**Tasks:**
1. Create safety-focused system prompts
2. Implement content filtering for responses
3. Add input validation and sanitization
4. Create professional boundary enforcement
5. Add conversation monitoring and logging
6. Implement emergency response protocols

**Safety Prompts:**
```json
{
  "professional_boundaries": {
    "system_prompt": "You are a collaborative AI coach for healthcare professionals. You MUST NOT provide medical diagnosis, treatment advice, or clinical recommendations. Your role is to ask thoughtful questions that help professionals explore their challenges. If asked for medical advice, redirect to professional resources.",
    "constraints": [
      "no_medical_diagnosis",
      "no_treatment_recommendations", 
      "no_personal_data_retention",
      "maintain_professional_boundaries"
    ]
  }
}
```

**Content Filtering:**
```python
class ContentFilter:
    def __init__(self):
        self.medical_terms = [
            "diagnose", "diagnosis", "treatment", "prescribe",
            "medication", "therapy", "clinical", "patient"
        ]
        
    def filter_response(self, response: str) -> FilterResult:
        # Check for policy violations
        pass
        
    def sanitize_input(self, user_input: str) -> str:
        # Remove or mask sensitive information
        pass
```

### Phase 3e: Rate Limiting and Cost Controls
**Objective**: Implement usage controls and cost monitoring

**Tasks:**
1. Add Redis for rate limiting storage
2. Implement per-session conversation limits
3. Create API cost monitoring system
4. Add budget alerts and controls
5. Implement session timeout logic
6. Create usage analytics dashboard

**Rate Limiting Implementation:**
```python
class RateLimiter:
    def __init__(self, redis_client: Redis):
        self.redis = redis_client
        
    async def check_rate_limit(
        self, 
        session_id: str,
        limit: int = 5,
        window: int = 60
    ) -> bool:
        # Check if session exceeds rate limit
        pass
        
    async def check_conversation_limit(
        self, 
        run_id: str,
        max_rounds: int = 4
    ) -> bool:
        # Check conversation round limits
        pass
```

**Cost Monitoring:**
```python
class CostMonitor:
    async def track_api_call(
        self,
        provider: str,
        model: str,
        tokens_used: int,
        response_time: float
    ):
        # Track usage and calculate costs
        pass
        
    async def check_budget_limits(self) -> BudgetStatus:
        # Monitor monthly spending limits
        pass
```

### Phase 3f: Frontend Chat Interface
**Objective**: Build user-facing chat interface in SvelteKit

**Tasks:**
1. Create chat UI components in Svelte
2. Implement real-time message updates
3. Add loading states and typing indicators
4. Create mobile-responsive chat layout
5. Add error handling and retry mechanisms
6. Integrate with survey flow navigation

**Svelte Chat Components:**
```svelte
<!-- ChatInterface.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { CoachingAPI } from '$lib/api/coaching';
  
  export let runId: string;
  
  let messages: ChatMessage[] = [];
  let currentMessage = '';
  let isLoading = false;
  let chatSession: CoachingSession;
  
  async function sendMessage() {
    if (!currentMessage.trim()) return;
    
    // Add user message to UI
    messages = [...messages, {
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    }];
    
    const userInput = currentMessage;
    currentMessage = '';
    isLoading = true;
    
    try {
      const response = await CoachingAPI.sendMessage(runId, userInput);
      
      // Add AI response to UI
      messages = [...messages, {
        role: 'assistant', 
        content: response.content,
        timestamp: new Date()
      }];
    } catch (error) {
      // Handle error with retry option
      handleChatError(error);
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="chat-container">
  <div class="message-history">
    {#each messages as message}
      <ChatMessage {message} />
    {/each}
    
    {#if isLoading}
      <TypingIndicator />
    {/if}
  </div>
  
  <ChatInput 
    bind:value={currentMessage}
    on:send={sendMessage}
    disabled={isLoading}
  />
</div>
```

**API Client:**
```typescript
// src/lib/api/coaching.ts
export class CoachingAPI {
  static async startCoaching(runId: string): Promise<CoachingSession> {
    const response = await fetch(`/api/runs/${runId}/coach/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }
  
  static async sendMessage(
    runId: string, 
    message: string
  ): Promise<CoachResponse> {
    const response = await fetch(`/api/runs/${runId}/coach/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new CoachingError(await response.json());
    }
    
    return response.json();
  }
}
```

---

## 5. Security Considerations

### 5.1 API Security
- API key rotation and secure storage in environment variables
- Request validation and input sanitization for all user inputs
- Rate limiting to prevent API abuse and cost overruns
- Authentication required for pipeline management endpoints

### 5.2 Content Safety
- System prompts enforcing professional boundaries and ethics
- Content filtering to prevent inappropriate or harmful responses
- Conversation monitoring with escalation procedures
- Personal information detection and redaction

### 5.3 Data Privacy
- No retention of personal health information in conversation logs
- Conversation data anonymization for research purposes
- GDPR-compliant data handling with user consent
- Secure deletion of conversation data per retention policies

---

## 6. Success Metrics

### Technical Metrics
- < 30 second average response time for LLM API calls
- > 95% API success rate (excluding user errors)
- Zero security incidents or data breaches
- < 1% rate limit violations per session

### User Experience Metrics
- > 80% conversation completion rate (4 rounds reached)
- > 4.0/5.0 average satisfaction with coaching quality
- < 5% user reports of inappropriate responses
- > 70% users find coaching valuable (post-session survey)

### Research Metrics
- Successful data collection from 100+ coaching sessions
- Conversation turn analysis for engagement patterns
- Effectiveness measurement through before/after confidence scores
- A/B testing capability for different pipeline approaches

---

## 7. Implementation Notes

### LLM Model Selection
```python
# Model configuration based on use case
MODEL_CONFIG = {
    "exploratory": {
        "provider": "openai",
        "model": "gpt-4-turbo",
        "temperature": 0.8,
        "max_tokens": 200
    },
    "focused": {
        "provider": "anthropic", 
        "model": "claude-3-5-sonnet-20241022",
        "temperature": 0.6,
        "max_tokens": 150
    }
}
```

### Error Handling Strategy
```python
class CoachingError(Exception):
    def __init__(self, error_type: str, message: str, retry_after: int = None):
        self.error_type = error_type  # "rate_limit", "api_error", "safety_violation"
        self.message = message
        self.retry_after = retry_after

# Error response format
{
    "error": {
        "type": "rate_limit",
        "message": "You've reached the conversation limit for this session.",
        "retry_after": null,
        "fallback_action": "show_feedback_form"
    }
}
```

### Testing Strategy
```python
# Unit tests for core components
class TestLLMService:
    async def test_openai_integration(self):
        # Test OpenAI client with mock responses
        pass
        
    async def test_anthropic_integration(self):
        # Test Anthropic client with mock responses  
        pass
        
    async def test_error_handling(self):
        # Test API failure scenarios
        pass

# Integration tests
class TestCoachingFlow:
    async def test_complete_conversation(self):
        # Test end-to-end coaching conversation
        pass
        
    async def test_safety_boundaries(self):
        # Test safety guardrails and content filtering
        pass
```

---

## 8. Future Enhancements (Out of Scope)

### Advanced Features
- Multi-language support for international users
- Voice interface for accessibility
- Conversation summarization and insights
- Personalized coaching style adaptation

### Research Features
- Advanced analytics on conversation patterns
- Longitudinal follow-up coaching sessions
- Integration with external assessment tools
- Coaching effectiveness measurement studies

### Technical Improvements
- Real-time streaming responses for better UX
- Advanced context management for longer conversations
- Custom fine-tuned models for healthcare coaching
- Advanced safety and content moderation systems

---

## 9. Definition of Done

Phase 3 is complete when:

- [ ] LLM clients successfully integrate with OpenAI and Anthropic APIs
- [ ] Prompt pipeline system processes templates with variable substitution
- [ ] Conversation management persists full chat history in database
- [ ] Safety guardrails prevent medical advice and inappropriate content
- [ ] Rate limiting enforces 4-round conversation limits per session
- [ ] Frontend chat interface provides smooth conversational experience
- [ ] All API endpoints respond correctly to valid and invalid requests
- [ ] Error handling provides graceful fallbacks for API failures
- [ ] Cost monitoring tracks and alerts on API usage
- [ ] End-to-end testing covers complete coaching flow
- [ ] Mobile chat interface works on various screen sizes
- [ ] Professional boundary enforcement validated through testing

---

*This PRD defines the conversational AI coaching system that transforms Project Preflight from a static survey tool into an interactive AI collaboration platform for healthcare professionals.*