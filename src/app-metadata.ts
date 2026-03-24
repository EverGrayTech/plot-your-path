import packageJson from "../package.json";

export type AppMetadataFeature = {
  title: string;
  description: string;
};

export type AppMetadataStatus = {
  label: string;
  description: string;
};

export type AppMetadataOverview = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
  };
  outcomes: {
    kicker: string;
    title: string;
    items: readonly string[];
    primaryCtaLabel: string;
    primaryCtaHref: string;
  };
  loop: {
    kicker: string;
    title: string;
    description: string;
    ariaLabel: string;
    stages: readonly string[];
  };
  features: {
    kicker: string;
    title: string;
    items: readonly AppMetadataFeature[];
  };
  differentiators: {
    kicker: string;
    title: string;
    items: readonly AppMetadataFeature[];
  };
  gettingStarted: {
    kicker: string;
    title: string;
    items: readonly string[];
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
  };
  technicalDifferentiators: {
    kicker: string;
    title: string;
    description: string;
    items: readonly string[];
  };
  currentStatus: {
    kicker: string;
    heading: string;
    content: string;
  };
};

export type AppMetadata = {
  version: string;
  slug: string;
  name: string;
  tagline: string;
  shortDescription: string;
  status: string;
  assets: {
    logo: string;
  };
  urls: {
    app: string;
    repo: string;
    docs: string;
  };
  capabilities: readonly string[];
  overview: AppMetadataOverview;
};

export const appMetadata = {
  version: packageJson.version,
  slug: "plot-your-path",
  name: "Plot Your Path",
  tagline: "Make better career decisions with clarity and confidence.",
  shortDescription:
    "Evaluate opportunities, prepare stronger applications, and build a purposeful career roadmap.",
  status: "MVP",
  assets: {
    logo: "/logo.svg",
  },
  urls: {
    app: "https://plot.evergraytech.com",
    repo: "https://github.com/EverGrayTech/plot-your-path",
    docs: "https://evergraytech.com/apps/plot-your-path",
  },
  capabilities: [
    "Opportunity capture and structuring",
    "Role fit and company desirability evaluation",
    "Application and interview preparation support",
    "Career evidence capture and reuse",
    "Skill-gap and outcome pattern discovery",
  ],
  overview: {
    hero: {
      eyebrow: "Welcome to Plot Your Path",
      title: "Make better career decisions with clarity and confidence.",
      description:
        "Plot Your Path helps you evaluate opportunities, prepare stronger applications, and build a purposeful career roadmap.",
    },
    outcomes: {
      kicker: "What Plot Your Path helps you do",
      title: "Start with the decision, not the busywork.",
      items: [
        "Decide which roles are worth your time before you sink effort into them.",
        "Reuse real experience in applications and interviews instead of rebuilding from memory.",
        "Spot patterns in strengths, gaps, and outcomes that improve your next decision.",
        "Build concrete plans to grow and improve in the areas you want to focus on.",
      ],
      primaryCtaHref: "/roles",
      primaryCtaLabel: "Start evaluating Roles",
    },
    loop: {
      kicker: "The path gets stronger as you use it",
      title: "This is not just a one-time application helper.",
      description:
        "Each part of the workflow feeds the next. The more clearly you capture opportunities, evidence, and outcomes, the easier it becomes to make stronger decisions later.",
      ariaLabel: "Reinforcing career decision loop",
      stages: [
        "Evaluate desirability and fit",
        "Prepare applications and interviews",
        "Capture evidence and outcomes",
        "Improve future decisions",
      ],
    },
    features: {
      kicker: "Key features",
      title: "Core capabilities built around real career workflows.",
      items: [
        {
          description:
            "Turn pasted descriptions and captured opportunities into structured role records you can actually compare.",
          title: "Role capture and structuring",
        },
        {
          description:
            "Review fit, desirability, and key signals so you can focus on the opportunities that matter most.",
          title: "Evaluation support",
        },
        {
          description:
            "Keep relevant context, evidence, and preparation steps connected as you move through applications and interviews.",
          title: "Application and interview workflow",
        },
        {
          description:
            "Preserve reusable accomplishments, stories, and skill evidence so each future search starts stronger.",
          title: "Evidence and skills visibility",
        },
      ],
    },
    differentiators: {
      kicker: "Why it is different",
      title: "Built to support judgment, reuse, and trust.",
      items: [
        {
          description:
            "Plot Your Path helps you judge where to focus, not just record what happened after the fact.",
          title: "Decision support over simple tracking",
        },
        {
          description:
            "It turns messy career activity into structured information that is easier to compare, revisit, and build on.",
          title: "Structured career intelligence",
        },
        {
          description:
            "It preserves evidence you can reuse across roles, interviews, and future growth decisions.",
          title: "Reusable evidence capture",
        },
        {
          description:
            "Your career data stays on your device by default, which supports trust without asking you to accept black-box handling.",
          title: "Local-first trust",
        },
      ],
    },
    gettingStarted: {
      kicker: "Getting started",
      title: "A simple first path into the app.",
      items: [
        "Paste a job description you're interested in into Roles.",
        "Review the desirability of the company and the role.",
        "Add your career experience in order to evaluated how each role matches your existings skills.",
        "Prepare applications and interviews with relevant evidence close at hand.",
        "Review in demand skills against your current strengths, and create plans to fill any gaps.",
      ],
      primaryCtaHref: "/roles",
      primaryCtaLabel: "Start with Roles",
      secondaryCtaHref: "/skills",
      secondaryCtaLabel: "Explore Skills",
    },
    technicalDifferentiators: {
      kicker: "Technical differentiators",
      title: "Readable product architecture, not engineering theater.",
      description:
        "Plot Your Path is designed to be trustworthy in how it handles sensitive career data and useful in how it structures information for later reuse.",
      items: [
        "Browser-based and local-first by default, so your information stays with you unless you choose to export it.",
        "Structured records and traceable context instead of opaque automation or one-shot prompts.",
        "Built to support judgment and authorship rather than replace them with blind workflow automation.",
      ],
    },
    currentStatus: {
      kicker: "Current status",
      heading: "MVP / public preview",
      content:
        "Plot Your Path is already useful for the core workflow, but it is still evolving. Expect steady refinement, clearer supporting materials, and stronger visualization over time.",
    },
  },
} satisfies AppMetadata;
