export const appMetadata = {
  slug: "plot-your-path",
  name: "Plot Your Path",
  tagline:
    "A local-first career intelligence workspace for clearer role search and growth decisions.",
  shortDescription:
    "Plot Your Path helps you evaluate opportunities, prepare grounded applications and interviews, capture reusable career evidence, and spot skill gaps over time.",
  status: "MVP",
  launchStage: "public-preview",
  urls: {
    app: "https://plot.evergraytech.com",
    repo: "https://github.com/EverGrayTech/plot-your-path",
    docs: "https://evergraytech.com/apps/plot-your-path",
  },
  visuals: {
    logo: "@evergraytech/design-system/logo.svg",
    screenshots: [],
  },
  capabilities: [
    "Opportunity capture and structuring",
    "Role fit and company desirability evaluation",
    "Application and interview preparation support",
    "Career evidence capture and reuse",
    "Skill-gap and outcome pattern discovery",
  ],
} as const;
