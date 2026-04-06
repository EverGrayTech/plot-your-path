import type { AIConfigAppDefinition } from "@evergraytech/ai-config";

export const aiConfigAppDefinition: AIConfigAppDefinition = {
  appId: "plot-your-path",
  operationCategories: [
    {
      key: "role_parsing",
      label: "Role parsing",
      description: "Capture and structure opportunity details from raw source content.",
    },
    {
      key: "fit_analysis",
      label: "Fit analysis",
      description: "Evaluate role fit against saved profile and role context.",
    },
    {
      key: "desirability_scoring",
      label: "Desirability scoring",
      description: "Score role and company desirability using your configured AI route.",
    },
    {
      key: "application_generation",
      label: "Application generation",
      description: "Generate draft materials, interview prep, and resume-tuning outputs.",
    },
  ],
  usagePresentation: {
    usageHint: "Provider credentials stay in this browser context unless you clear them.",
    freeTierHint: "Use the app-provided route first if you want a no-setup starting point.",
  },
};
