export type FlexDirection = "column" | "row";
export type ElementType =
  | "input"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "label"
  | "button";

export type FormPrimitive = string | number | boolean | null;
export type FormValue = FormPrimitive | FormPrimitive[];
export type FormDataMap = Record<string, FormValue>;
export type FormElementProps = Record<string, unknown>;

export interface LayoutConfig {
  type: "flex";
  direction?: FlexDirection;
  gap?: number;
  padding?: string;
  flex?: string;
}

export interface FormElement {
  type: ElementType;
  id: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  value?: FormValue;
  options?: { label: string; value: string }[];
  props?: FormElementProps;
}

export interface Container {
  id: string;
  layout: LayoutConfig;
  elements: FormElement[];
}

export interface FormStep {
  stepId: string;
  title: string;
  layout: LayoutConfig;
  containers: Container[];
}

export interface SurveyConfig {
  surveyId: string;
  steps: FormStep[];
}
