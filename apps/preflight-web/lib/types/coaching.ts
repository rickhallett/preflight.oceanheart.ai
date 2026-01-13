/**
 * Types for the coaching chat system.
 */

export interface CoachingSession {
  id: string;
  run_id: string;
  pipeline_id: string;
  status: "active" | "completed" | "error";
  current_round: number;
  max_rounds: number;
  created_at: string;
  last_activity_at: string | null;
  completed_at: string | null;
  total_tokens_used: number;
}

export interface CoachTurn {
  id: string;
  session_id: string;
  turn_number: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  model_used: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  response_time_ms: number | null;
}

export interface StartCoachingRequest {
  pipeline_name?: string;
}

export interface StartCoachingResponse {
  session: CoachingSession;
  initial_message: CoachTurn;
}

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  user_turn: CoachTurn;
  assistant_turn: CoachTurn;
  session_status: string;
  current_round: number;
  max_rounds: number;
  remaining_rounds: number;
}

export interface ConversationHistoryResponse {
  session: CoachingSession;
  turns: CoachTurn[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface CoachingError {
  type: "rate_limit" | "api_error" | "safety_violation" | "session_ended";
  message: string;
  retry_after?: number;
}
