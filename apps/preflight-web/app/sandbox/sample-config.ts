import type { SurveyConfig } from "./types";

export const sampleSurveyConfig: SurveyConfig = {
  surveyId: "ai-readiness-assessment",
  steps: [
    {
      stepId: "step-1",
      title: "Organization Information",
      layout: {
        type: "flex",
        direction: "column",
        gap: 16,
        padding: "20px",
      },
      containers: [
        {
          id: "container-1",
          layout: {
            type: "flex",
            direction: "column",
            gap: 12,
          },
          elements: [
            {
              type: "label",
              id: "intro-label",
              label: "Tell us about your organization",
              props: {
                className: "text-lg font-semibold mb-2",
              },
            },
            {
              type: "input",
              id: "org-name",
              name: "orgName",
              label: "Organization Name",
              placeholder: "Enter your organization name",
              required: true,
            },
            {
              type: "select",
              id: "org-size",
              name: "orgSize",
              label: "Organization Size",
              required: true,
              options: [
                { label: "1-10 employees", value: "small" },
                { label: "11-50 employees", value: "medium" },
                { label: "51-200 employees", value: "large" },
                { label: "200+ employees", value: "enterprise" },
              ],
            },
          ],
        },
        {
          id: "container-2",
          layout: {
            type: "flex",
            direction: "column",
            gap: 12,
          },
          elements: [
            {
              type: "textarea",
              id: "org-description",
              name: "orgDescription",
              label: "Describe your organization",
              placeholder:
                "Brief description of what your organization does...",
            },
          ],
        },
      ],
    },
    {
      stepId: "step-2",
      title: "AI Readiness Assessment",
      layout: {
        type: "flex",
        direction: "column",
        gap: 16,
        padding: "20px",
      },
      containers: [
        {
          id: "ai-container-1",
          layout: {
            type: "flex",
            direction: "column",
            gap: 12,
          },
          elements: [
            {
              type: "label",
              id: "ai-intro",
              label: "Current AI Implementation Status",
              props: {
                className: "text-lg font-semibold mb-2",
              },
            },
            {
              type: "radio",
              id: "ai-status",
              name: "aiStatus",
              label: "What is your current AI implementation status?",
              required: true,
              options: [
                { label: "Not started", value: "not-started" },
                { label: "Planning phase", value: "planning" },
                { label: "Pilot projects", value: "pilot" },
                { label: "Production use", value: "production" },
              ],
            },
          ],
        },
        {
          id: "ai-container-2",
          layout: {
            type: "flex",
            direction: "column",
            gap: 12,
          },
          elements: [
            {
              type: "checkbox",
              id: "data-ready",
              name: "dataReady",
              label: "We have clean, organized data ready for AI",
            },
            {
              type: "checkbox",
              id: "team-ready",
              name: "teamReady",
              label: "Our team has AI/ML expertise",
            },
            {
              type: "checkbox",
              id: "budget-allocated",
              name: "budgetAllocated",
              label: "We have budget allocated for AI initiatives",
            },
          ],
        },
      ],
    },
    {
      stepId: "step-3",
      title: "Contact Information",
      layout: {
        type: "flex",
        direction: "column",
        gap: 16,
        padding: "20px",
      },
      containers: [
        {
          id: "contact-container",
          layout: {
            type: "flex",
            direction: "column",
            gap: 12,
          },
          elements: [
            {
              type: "input",
              id: "contact-name",
              name: "contactName",
              label: "Your Name",
              placeholder: "John Doe",
              required: true,
            },
            {
              type: "input",
              id: "contact-email",
              name: "contactEmail",
              label: "Email Address",
              placeholder: "john@example.com",
              required: true,
              props: {
                type: "email",
              },
            },
            {
              type: "input",
              id: "contact-phone",
              name: "contactPhone",
              label: "Phone Number (Optional)",
              placeholder: "+1 (555) 123-4567",
            },
            {
              type: "button",
              id: "submit-button",
              label: "Submit Assessment",
              props: {
                className:
                  "mt-4 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium",
                onClick: () => console.log("Form submitted!"),
              },
            },
          ],
        },
      ],
    },
  ],
};
