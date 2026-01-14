/**
 * MSW handlers for Survey/Forms API mocking
 */
import { http, HttpResponse } from 'msw';
import {
  MOCK_FORMS,
  createMockRun,
  getMockRun,
  saveMockAnswers,
  completeMockRun,
} from '../fixtures/survey-fixtures';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const surveyHandlers = [
  /**
   * GET /forms/{name} - Get form definition
   */
  http.get(`${API_BASE}/forms/:name`, ({ params }) => {
    const formName = params.name as string;
    const form = MOCK_FORMS[formName];

    if (!form) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: `Form "${formName}" not found`,
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(form);
  }),

  /**
   * POST /runs - Create new run
   */
  http.post(`${API_BASE}/runs`, async ({ request }) => {
    const body = await request.json() as { form_name: string; version?: string };

    if (!body.form_name) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'form_name is required',
        },
        { status: 400 }
      );
    }

    try {
      const run = createMockRun(body.form_name);
      return HttpResponse.json(run, { status: 201 });
    } catch (error) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: (error as Error).message,
        },
        { status: 404 }
      );
    }
  }),

  /**
   * GET /runs/{id} - Get run with answers
   */
  http.get(`${API_BASE}/runs/:id`, ({ params }) => {
    const runId = params.id as string;
    const run = getMockRun(runId);

    if (!run) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: `Run "${runId}" not found`,
        },
        { status: 404 }
      );
    }

    return HttpResponse.json(run);
  }),

  /**
   * PATCH /runs/{id}/answers - Save answers
   */
  http.patch(`${API_BASE}/runs/:id/answers`, async ({ params, request }) => {
    const runId = params.id as string;
    const body = await request.json() as { page_id: string; answers: Record<string, unknown> };

    if (!body.page_id || !body.answers) {
      return HttpResponse.json(
        {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'page_id and answers are required',
        },
        { status: 400 }
      );
    }

    try {
      const result = saveMockAnswers(runId, body.page_id, body.answers);
      return HttpResponse.json(result);
    } catch (error) {
      const message = (error as Error).message;

      if (message.includes('not found')) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Not Found', status: 404, detail: message },
          { status: 404 }
        );
      }

      if (message.includes('completed')) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Unprocessable Entity', status: 422, detail: message },
          { status: 422 }
        );
      }

      return HttpResponse.json(
        { type: 'about:blank', title: 'Internal Server Error', status: 500, detail: message },
        { status: 500 }
      );
    }
  }),

  /**
   * POST /runs/{id}/complete - Complete run
   */
  http.post(`${API_BASE}/runs/:id/complete`, ({ params }) => {
    const runId = params.id as string;

    try {
      const result = completeMockRun(runId);
      return HttpResponse.json(result);
    } catch (error) {
      const message = (error as Error).message;

      if (message.includes('not found')) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Not Found', status: 404, detail: message },
          { status: 404 }
        );
      }

      if (message.includes('already completed')) {
        return HttpResponse.json(
          { type: 'about:blank', title: 'Unprocessable Entity', status: 422, detail: message },
          { status: 422 }
        );
      }

      return HttpResponse.json(
        { type: 'about:blank', title: 'Internal Server Error', status: 500, detail: message },
        { status: 500 }
      );
    }
  }),
];

/**
 * Error scenario handlers
 */
export const surveyErrorHandlers = {
  /**
   * Form loading fails
   */
  formLoadError: http.get(`${API_BASE}/forms/:name`, () => {
    return HttpResponse.json(
      { type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Database connection failed' },
      { status: 500 }
    );
  }),

  /**
   * Run creation fails
   */
  runCreateError: http.post(`${API_BASE}/runs`, () => {
    return HttpResponse.json(
      { type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Failed to create run' },
      { status: 500 }
    );
  }),

  /**
   * Save answers fails (simulate network error)
   */
  saveAnswersError: http.patch(`${API_BASE}/runs/:id/answers`, () => {
    return HttpResponse.json(
      { type: 'about:blank', title: 'Internal Server Error', status: 500, detail: 'Save failed' },
      { status: 500 }
    );
  }),

  /**
   * Save answers rate limited
   */
  saveAnswersRateLimited: http.patch(`${API_BASE}/runs/:id/answers`, () => {
    return HttpResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }),
};

/**
 * Handlers for coaching endpoints (basic mocks)
 */
export const coachingHandlers = [
  /**
   * GET /pipelines - List active pipelines
   */
  http.get(`${API_BASE}/pipelines`, () => {
    return HttpResponse.json([
      {
        id: 'mock-pipeline-1',
        name: 'default',
        version: '1.0.0',
        description: 'Default coaching pipeline',
        is_active: true,
      },
    ]);
  }),

  /**
   * POST /runs/{id}/coach/start - Start coaching session
   */
  http.post(`${API_BASE}/runs/:id/coach/start`, ({ params }) => {
    const runId = params.id as string;

    return HttpResponse.json({
      session: {
        id: `mock-session-${Date.now()}`,
        run_id: runId,
        pipeline_id: 'mock-pipeline-1',
        status: 'active',
        current_round: 0,
        max_rounds: 4,
        created_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        total_tokens_used: 0,
      },
      initial_message: {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Hello! Based on your survey responses, I can see you\'re interested in AI adoption. What specific challenges are you facing with integrating AI into your workflow?',
        created_at: new Date().toISOString(),
      },
    });
  }),

  /**
   * POST /runs/{id}/coach/message - Send message
   */
  http.post(`${API_BASE}/runs/:id/coach/message`, async ({ request }) => {
    const body = await request.json() as { message: string };

    // Simulated responses based on round
    const responses = [
      'That\'s a great observation. Can you tell me more about how this challenge affects your daily work?',
      'I understand. Let\'s explore some practical strategies you could implement to address this.',
      'Those are excellent points. Here are some action items we can work on together.',
      'Thank you for this conversation. Here\'s a summary of what we discussed and your next steps.',
    ];

    const responseIndex = Math.min(Math.floor(Math.random() * 3), responses.length - 1);

    return HttpResponse.json({
      user_turn: {
        id: `turn-user-${Date.now()}`,
        role: 'user',
        content: body.message,
        created_at: new Date().toISOString(),
      },
      assistant_turn: {
        id: `turn-assistant-${Date.now()}`,
        role: 'assistant',
        content: responses[responseIndex],
        created_at: new Date().toISOString(),
        model_used: 'mock-gpt-4',
        prompt_tokens: 100,
        completion_tokens: 50,
        response_time_ms: 1500,
      },
      session_status: 'active',
      current_round: 1,
      remaining_rounds: 3,
    });
  }),

  /**
   * GET /runs/{id}/coach/history - Get conversation history
   */
  http.get(`${API_BASE}/runs/:id/coach/history`, () => {
    return HttpResponse.json({
      session: {
        id: 'mock-session',
        status: 'active',
        current_round: 0,
        max_rounds: 4,
      },
      turns: [],
    });
  }),

  /**
   * POST /runs/{id}/coach/end - End session
   */
  http.post(`${API_BASE}/runs/:id/coach/end`, () => {
    return HttpResponse.json({
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  }),
];
