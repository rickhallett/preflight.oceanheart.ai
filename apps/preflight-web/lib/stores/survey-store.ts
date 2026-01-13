import { create } from 'zustand';

export interface FormField {
  name: string;
  value: any;
  required: boolean;
}

export interface FormData {
  [key: string]: any;
}

export interface SurveyForm {
  id: string;
  title: string;
  fields: FormField[];
}

interface SurveyState {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  formData: Record<string, FormData>;
  
  // Actions
  startSurvey: () => void;
  endSurvey: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  updateFormData: (stepId: string, data: FormData) => void;
  getFormData: (stepId: string) => FormData;
  isStepComplete: (stepId: string, requiredFields: string[]) => boolean;
  isAllComplete: () => boolean;
  resetSurvey: () => void;
  getProgress: () => number;
}

const TOTAL_STEPS = 5; // Number of forms in our survey

export const useSurveyStore = create<SurveyState>((set, get) => ({
  isActive: false,
  currentStep: 0,
  totalSteps: TOTAL_STEPS,
  formData: {},

  startSurvey: () => set({ 
    isActive: true, 
    currentStep: 0,
    formData: {} 
  }),

  endSurvey: () => set({ 
    isActive: false, 
    currentStep: 0,
    formData: {} 
  }),

  nextStep: () => set((state) => ({
    currentStep: Math.min(state.currentStep + 1, state.totalSteps - 1)
  })),

  prevStep: () => set((state) => ({
    currentStep: Math.max(state.currentStep - 1, 0)
  })),

  goToStep: (step: number) => set((state) => ({
    currentStep: Math.max(0, Math.min(step, state.totalSteps - 1))
  })),

  updateFormData: (stepId: string, data: FormData) => set((state) => ({
    formData: {
      ...state.formData,
      [stepId]: { ...state.formData[stepId], ...data }
    }
  })),

  getFormData: (stepId: string) => {
    const state = get();
    return state.formData[stepId] || {};
  },

  isStepComplete: (stepId: string, requiredFields: string[]) => {
    const state = get();
    const data = state.formData[stepId] || {};
    
    return requiredFields.every(field => {
      const value = data[field];
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return value > 0;
      if (typeof value === 'boolean') return value === true;
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  },

  isAllComplete: () => {
    const state = get();
    const forms = [
      { id: 'personal-info', required: ['firstName', 'lastName', 'email'] },
      { id: 'preferences', required: ['role', 'experience'] },
      { id: 'technical', required: ['languages', 'frameworks'] },
      { id: 'feedback', required: ['rating', 'improvement'] },
      { id: 'final', required: ['newsletter'] }
    ];

    return forms.every(form => 
      state.isStepComplete(form.id, form.required)
    );
  },

  resetSurvey: () => set({
    isActive: false,
    currentStep: 0,
    formData: {}
  }),

  getProgress: () => {
    const state = get();
    return Math.round(((state.currentStep + 1) / state.totalSteps) * 100);
  }
}));