/**
 * Survey test fixtures and helpers
 */
import type { Page } from '@playwright/test';

export interface FormBlock {
  type: 'markdown' | 'text' | 'textarea' | 'select' | 'radio' | 'checkbox';
  name?: string;
  label?: string;
  content?: string;
  options?: string[];
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  rows?: number;
}

export interface FormPage {
  id: string;
  title: string;
  blocks: FormBlock[];
}

export interface FormDefinition {
  id: string;
  title: string;
  pages: FormPage[];
  navigation: {
    style: 'pager' | 'scroll';
    autosave: boolean;
  };
  meta: {
    version: string;
  };
}

export interface RunResponse {
  run_id: string;
  form_definition_id: string;
  form_version: string;
  status: 'in_progress' | 'completed';
  started_at: string;
}

export interface RunSummaryResponse extends RunResponse {
  last_page: string | null;
  completed_at: string | null;
  answers: Array<{
    page_id: string;
    field_name: string;
    value: unknown;
    saved_at: string;
  }>;
}

/**
 * Mock onboarding form for testing
 */
export const MOCK_ONBOARDING_FORM: FormDefinition = {
  id: 'onboarding',
  title: 'AI Readiness Assessment',
  pages: [
    {
      id: 'intro',
      title: 'Welcome',
      blocks: [
        {
          type: 'markdown',
          content: '# Welcome to the AI Readiness Assessment\n\nThis survey will help us understand your experience with AI tools.',
        },
      ],
    },
    {
      id: 'personal',
      title: 'Personal Information',
      blocks: [
        {
          type: 'text',
          name: 'full_name',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name',
        },
        {
          type: 'text',
          name: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'you@example.com',
        },
        {
          type: 'select',
          name: 'role',
          label: 'Your Role',
          required: true,
          options: ['Developer', 'Designer', 'Product Manager', 'Executive', 'Other'],
        },
      ],
    },
    {
      id: 'experience',
      title: 'AI Experience',
      blocks: [
        {
          type: 'radio',
          name: 'ai_experience',
          label: 'How would you rate your AI experience?',
          required: true,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        },
        {
          type: 'checkbox',
          name: 'ai_tools',
          label: 'Which AI tools have you used?',
          options: ['ChatGPT', 'Claude', 'GitHub Copilot', 'Midjourney', 'Other'],
        },
        {
          type: 'textarea',
          name: 'challenges',
          label: 'What are your biggest challenges with AI adoption?',
          placeholder: 'Describe your challenges...',
          rows: 4,
          maxLength: 1000,
        },
      ],
    },
    {
      id: 'goals',
      title: 'Goals',
      blocks: [
        {
          type: 'textarea',
          name: 'goals',
          label: 'What do you hope to achieve with AI?',
          required: true,
          rows: 4,
        },
      ],
    },
  ],
  navigation: {
    style: 'pager',
    autosave: true,
  },
  meta: {
    version: '1.0.0',
  },
};

/**
 * Simple 2-page form for quick tests
 */
export const MOCK_SIMPLE_FORM: FormDefinition = {
  id: 'simple-form',
  title: 'Quick Survey',
  pages: [
    {
      id: 'page1',
      title: 'Page 1',
      blocks: [
        {
          type: 'text',
          name: 'name',
          label: 'Your Name',
          required: true,
        },
      ],
    },
    {
      id: 'page2',
      title: 'Page 2',
      blocks: [
        {
          type: 'textarea',
          name: 'feedback',
          label: 'Any feedback?',
        },
      ],
    },
  ],
  navigation: {
    style: 'pager',
    autosave: true,
  },
  meta: {
    version: '1.0.0',
  },
};

/**
 * All mock forms indexed by ID
 */
export const MOCK_FORMS: Record<string, FormDefinition> = {
  onboarding: MOCK_ONBOARDING_FORM,
  'simple-form': MOCK_SIMPLE_FORM,
  'preflight-survey': MOCK_ONBOARDING_FORM, // Alias for existing test
};

/**
 * Mock run data store (simulates database)
 */
let mockRuns: Record<string, RunSummaryResponse> = {};
let runCounter = 0;

export function resetMockRuns(): void {
  mockRuns = {};
  runCounter = 0;
}

export function createMockRun(formName: string): RunResponse {
  const runId = `mock-run-${++runCounter}-${Date.now()}`;
  const form = MOCK_FORMS[formName];

  if (!form) {
    throw new Error(`Form not found: ${formName}`);
  }

  const run: RunSummaryResponse = {
    run_id: runId,
    form_definition_id: form.id,
    form_version: form.meta.version,
    status: 'in_progress',
    started_at: new Date().toISOString(),
    last_page: null,
    completed_at: null,
    answers: [],
  };

  mockRuns[runId] = run;

  return {
    run_id: run.run_id,
    form_definition_id: run.form_definition_id,
    form_version: run.form_version,
    status: run.status,
    started_at: run.started_at,
  };
}

export function getMockRun(runId: string): RunSummaryResponse | null {
  return mockRuns[runId] || null;
}

export function saveMockAnswers(
  runId: string,
  pageId: string,
  answers: Record<string, unknown>
): { saved_at: string } {
  const run = mockRuns[runId];
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  if (run.status === 'completed') {
    throw new Error('Cannot save answers to completed run');
  }

  const savedAt = new Date().toISOString();

  // Update or add answers
  for (const [fieldName, value] of Object.entries(answers)) {
    const existingIndex = run.answers.findIndex(
      (a) => a.page_id === pageId && a.field_name === fieldName
    );

    const answer = {
      page_id: pageId,
      field_name: fieldName,
      value,
      saved_at: savedAt,
    };

    if (existingIndex >= 0) {
      run.answers[existingIndex] = answer;
    } else {
      run.answers.push(answer);
    }
  }

  run.last_page = pageId;

  return { saved_at: savedAt };
}

export function completeMockRun(runId: string): { status: string; completed_at: string } {
  const run = mockRuns[runId];
  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  if (run.status === 'completed') {
    throw new Error('Run already completed');
  }

  run.status = 'completed';
  run.completed_at = new Date().toISOString();

  return {
    status: run.status,
    completed_at: run.completed_at,
  };
}

/**
 * Helper class for survey test interactions
 */
export class SurveyTestHelper {
  constructor(private page: Page) {}

  /**
   * Fill personal info page
   */
  async fillPersonalInfo(data: { name: string; email: string; role: string }): Promise<void> {
    await this.page.fill('input[name="full_name"]', data.name);
    await this.page.fill('input[name="email"]', data.email);
    await this.page.selectOption('select[name="role"]', data.role);
  }

  /**
   * Fill experience page
   */
  async fillExperience(data: { level: string; tools?: string[]; challenges?: string }): Promise<void> {
    await this.page.click(`input[value="${data.level}"]`);

    if (data.tools) {
      for (const tool of data.tools) {
        await this.page.check(`input[type="checkbox"][value="${tool}"]`);
      }
    }

    if (data.challenges) {
      await this.page.fill('textarea[name="challenges"]', data.challenges);
    }
  }

  /**
   * Navigate to next page
   */
  async nextPage(): Promise<void> {
    await this.page.click('button:has-text("Next")');
  }

  /**
   * Navigate to previous page
   */
  async previousPage(): Promise<void> {
    await this.page.click('button:has-text("Previous")');
  }

  /**
   * Complete the survey
   */
  async complete(): Promise<void> {
    await this.page.click('button:has-text("Complete")');
  }

  /**
   * Get current progress
   */
  async getProgress(): Promise<{ current: number; total: number }> {
    const progressText = await this.page.locator('[data-testid="progress"]').textContent();
    const match = progressText?.match(/(\d+)\s*of\s*(\d+)/i);
    if (!match) return { current: 0, total: 0 };
    return { current: parseInt(match[1]), total: parseInt(match[2]) };
  }

  /**
   * Get save status
   */
  async getSaveStatus(): Promise<string> {
    const indicator = this.page.locator('[data-testid="save-indicator"]');
    if (await indicator.isVisible()) {
      return await indicator.textContent() || 'unknown';
    }
    return 'not visible';
  }

  /**
   * Wait for autosave to complete
   */
  async waitForAutosave(timeout = 35000): Promise<void> {
    await this.page.waitForSelector('[data-testid="save-indicator"]:has-text("saved")', {
      timeout,
    });
  }

  /**
   * Set localStorage run ID (for resume testing)
   */
  async setStoredRunId(formId: string, runId: string): Promise<void> {
    await this.page.evaluate(
      ({ formId, runId }) => {
        localStorage.setItem(`preflight-run-${formId}`, runId);
      },
      { formId, runId }
    );
  }

  /**
   * Get localStorage run ID
   */
  async getStoredRunId(formId: string): Promise<string | null> {
    return this.page.evaluate((formId) => {
      return localStorage.getItem(`preflight-run-${formId}`);
    }, formId);
  }

  /**
   * Clear localStorage for survey
   */
  async clearSurveyStorage(formId: string): Promise<void> {
    await this.page.evaluate((formId) => {
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith('preflight-run-') || k.startsWith('preflight-answers-')
      );
      keys.forEach((k) => localStorage.removeItem(k));
    }, formId);
  }
}
