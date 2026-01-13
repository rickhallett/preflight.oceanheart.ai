/**
 * Form API Client
 * Typed client for form system endpoints
 */

import type {
  CompleteRunResponse,
  FormDefinition,
  PageAnswers,
  RunResponse,
  RunSummaryResponse,
  SaveAnswersResponse,
} from "@/lib/types/form-dsl";

// API base URL - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public detail?: unknown,
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = "ApiError";
  }
}

// Helper to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail: unknown;
    try {
      detail = await response.json();
    } catch {
      detail = await response.text();
    }
    throw new ApiError(response.status, response.statusText, detail);
  }
  return response.json();
}

/**
 * Get a form definition by name
 * @param formName - The name of the form to fetch
 * @param version - Optional specific version to fetch
 */
export async function getFormDefinition(
  formName: string,
  version?: string,
): Promise<FormDefinition> {
  const params = new URLSearchParams();
  if (version) {
    params.set("version", version);
  }

  const url = `${API_BASE_URL}/forms/${formName}${params.toString() ? `?${params}` : ""}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<FormDefinition>(response);
}

/**
 * Create a new survey run
 * @param formName - The name of the form to start
 * @param version - Optional specific version to use
 */
export async function createRun(
  formName: string,
  version?: string,
): Promise<RunResponse> {
  const response = await fetch(`${API_BASE_URL}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      form_name: formName,
      version: version || undefined,
    }),
  });

  return handleResponse<RunResponse>(response);
}

/**
 * Get a run with its answers
 * @param runId - The ID of the run to fetch
 */
export async function getRun(runId: string): Promise<RunSummaryResponse> {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<RunSummaryResponse>(response);
}

/**
 * Save answers for a page (autosave)
 * @param runId - The ID of the run
 * @param pageId - The ID of the page
 * @param answers - The answers to save
 */
export async function saveAnswers(
  runId: string,
  pageId: string,
  answers: PageAnswers,
): Promise<SaveAnswersResponse> {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}/answers`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_id: pageId,
      answers,
    }),
  });

  return handleResponse<SaveAnswersResponse>(response);
}

/**
 * Mark a run as complete
 * @param runId - The ID of the run to complete
 */
export async function completeRun(runId: string): Promise<CompleteRunResponse> {
  const response = await fetch(`${API_BASE_URL}/runs/${runId}/complete`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  return handleResponse<CompleteRunResponse>(response);
}

/**
 * Convert API answer summaries to FormAnswers structure
 */
export function answersToFormAnswers(
  answers: RunSummaryResponse["answers"],
): Record<string, PageAnswers> {
  const result: Record<string, PageAnswers> = {};

  for (const answer of answers) {
    if (!result[answer.page_id]) {
      result[answer.page_id] = {};
    }
    result[answer.page_id][answer.field_name] = answer.value;
  }

  return result;
}
