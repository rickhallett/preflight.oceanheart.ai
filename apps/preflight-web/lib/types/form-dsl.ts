/**
 * Form DSL Type Definitions
 * Matches the JSON Form DSL specification from Phase 2 PRD
 */

// Block types supported by the form DSL
export type BlockType =
  | "markdown"
  | "text"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox";

// Base block interface
export interface BaseBlock {
  type: BlockType;
  name?: string;
  label?: string;
  required?: boolean;
}

// Markdown block - displays formatted text
export interface MarkdownBlock extends BaseBlock {
  type: "markdown";
  content: string;
}

// Text input block
export interface TextBlock extends BaseBlock {
  type: "text";
  name: string;
  label: string;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

// Textarea block - multi-line text input
export interface TextareaBlock extends BaseBlock {
  type: "textarea";
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  minLength?: number;
  maxLength?: number;
}

// Select block - dropdown selection
export interface SelectBlock extends BaseBlock {
  type: "select";
  name: string;
  label: string;
  options: (string | number)[];
  placeholder?: string;
}

// Radio block - single choice from options
export interface RadioBlock extends BaseBlock {
  type: "radio";
  name: string;
  label: string;
  options: (string | number)[];
}

// Checkbox block - multiple choice or single boolean
export interface CheckboxBlock extends BaseBlock {
  type: "checkbox";
  name: string;
  label: string;
  options?: (string | number)[]; // If provided, multi-select; otherwise, single boolean
}

// Union type for all block types
export type FormBlock =
  | MarkdownBlock
  | TextBlock
  | TextareaBlock
  | SelectBlock
  | RadioBlock
  | CheckboxBlock;

// Form page containing blocks
export interface FormPage {
  id: string;
  title: string;
  blocks: FormBlock[];
}

// Navigation configuration
export interface FormNavigation {
  style: "pager" | "scroll";
  autosave: boolean;
}

// Form metadata
export interface FormMeta {
  version: string;
}

// Complete form definition
export interface FormDefinition {
  id: string;
  title: string;
  pages: FormPage[];
  navigation: FormNavigation;
  meta: FormMeta;
}

// Form field value types
export type FieldValue = string | number | boolean | (string | number)[] | null;

// Page answers mapping field names to values
export type PageAnswers = Record<string, FieldValue>;

// All form answers mapping page IDs to page answers
export type FormAnswers = Record<string, PageAnswers>;

// Run status
export type RunStatus = "in_progress" | "completed";

// Answer summary from API
export interface AnswerSummary {
  page_id: string;
  field_name: string;
  value: FieldValue;
  saved_at: string;
}

// Run response from API
export interface RunResponse {
  run_id: string;
  form_version: string;
  started_at: string;
}

// Run summary response from API
export interface RunSummaryResponse {
  run_id: string;
  status: RunStatus;
  last_page: string | null;
  started_at: string;
  completed_at: string | null;
  answers: AnswerSummary[];
}

// Save answers response from API
export interface SaveAnswersResponse {
  saved_at: string;
}

// Complete run response from API
export interface CompleteRunResponse {
  status: "completed";
  completed_at: string;
}

// Type guard functions
export function isMarkdownBlock(block: FormBlock): block is MarkdownBlock {
  return block.type === "markdown";
}

export function isTextBlock(block: FormBlock): block is TextBlock {
  return block.type === "text";
}

export function isTextareaBlock(block: FormBlock): block is TextareaBlock {
  return block.type === "textarea";
}

export function isSelectBlock(block: FormBlock): block is SelectBlock {
  return block.type === "select";
}

export function isRadioBlock(block: FormBlock): block is RadioBlock {
  return block.type === "radio";
}

export function isCheckboxBlock(block: FormBlock): block is CheckboxBlock {
  return block.type === "checkbox";
}

// Check if a block is an input block (has a name field)
export function isInputBlock(
  block: FormBlock,
): block is
  | TextBlock
  | TextareaBlock
  | SelectBlock
  | RadioBlock
  | CheckboxBlock {
  return block.type !== "markdown" && "name" in block;
}
