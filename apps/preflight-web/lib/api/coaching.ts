/**
 * API client for coaching endpoints.
 */

import type {
  StartCoachingRequest,
  StartCoachingResponse,
  SendMessageRequest,
  SendMessageResponse,
  ConversationHistoryResponse,
  CoachingError,
} from "@/lib/types/coaching";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class CoachingAPIError extends Error {
  type: CoachingError["type"];
  retry_after?: number;

  constructor(error: CoachingError) {
    super(error.message);
    this.type = error.type;
    this.retry_after = error.retry_after;
    this.name = "CoachingAPIError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "Unknown error occurred",
    }));

    // Map HTTP status codes to error types
    let errorType: CoachingError["type"] = "api_error";
    if (response.status === 429) {
      errorType = "rate_limit";
    } else if (response.status === 400) {
      const detail = errorData.detail?.toLowerCase() || "";
      if (detail.includes("completed") || detail.includes("maximum rounds")) {
        errorType = "session_ended";
      }
    }

    throw new CoachingAPIError({
      type: errorType,
      message: errorData.detail || `Request failed with status ${response.status}`,
      retry_after: errorData.retry_after,
    });
  }

  return response.json();
}

export const CoachingAPI = {
  /**
   * Start a new coaching session for a run.
   */
  async startCoaching(
    runId: string,
    request: StartCoachingRequest = {}
  ): Promise<StartCoachingResponse> {
    const response = await fetch(`${API_BASE}/runs/${runId}/coach/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    return handleResponse<StartCoachingResponse>(response);
  },

  /**
   * Send a message to the coach and get a response.
   */
  async sendMessage(
    runId: string,
    message: string
  ): Promise<SendMessageResponse> {
    const request: SendMessageRequest = { message };

    const response = await fetch(`${API_BASE}/runs/${runId}/coach/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });

    return handleResponse<SendMessageResponse>(response);
  },

  /**
   * Get the full conversation history for a coaching session.
   */
  async getHistory(runId: string): Promise<ConversationHistoryResponse> {
    const response = await fetch(`${API_BASE}/runs/${runId}/coach/history`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return handleResponse<ConversationHistoryResponse>(response);
  },

  /**
   * End a coaching session early.
   */
  async endCoaching(runId: string): Promise<{ status: string; message: string }> {
    const response = await fetch(`${API_BASE}/runs/${runId}/coach/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    return handleResponse<{ status: string; message: string }>(response);
  },
};

export { CoachingAPIError };
