export interface FounderInput {
  idea: string;
  targetAudience?: string;
  primaryGoal: string;
}

export interface AthenaOutput {
  problemStatement: string;
  targetCustomer: string;
  businessModel: string;
  valueProposition: string;
  vision: string;
}

export interface HermesOutput {
  competitors: Array<{
    name: string;
    description: string;
    strengths: string[];
    weaknesses: string[];
  }>;
  industryTrends: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  marketOpportunities: string[];
  marketRisks: string[];
  positioning: string;
}

export interface ApolloOutput {
  companyName: string;
  tagline: string;
  brandPersonality: string[];
  messagingPillars: string[];
  toneOfVoice: string;
  colorPalette: Array<{ name: string; hex: string }>;
  typography: { heading: string; body: string };
  logoPrompt: string;
}

export interface ThemisOutput {
  pricingStrategy: string;
  revenueModel: string;
  businessModelRecommendation: string;
  businessModelValidation: string;
  monetizationRationale: string;
  unitEconomicsAssumptions: {
    estimatedCAC: string;
    estimatedLTV: string;
    grossMargin: string;
    breakEvenTimeline: string;
  };
}

export interface AresOutput {
  launchStrategy: string;
  customerAcquisitionChannels: string[];
  distributionChannels: string[];
  marketingStrategy: string;
  partnerships: string[];
  growthLoops: string[];
  successMetrics: Array<{ metric: string; target: string }>;
}

export interface HephaestusOutput {
  mvpDefinition: string;
  featurePrioritization: Array<{
    feature: string;
    priority: "must-have" | "should-have" | "could-have" | "wont-have";
    rationale: string;
  }>;
  productRoadmap: Array<{ phase: string; timeline: string; milestones: string[] }>;
  technicalPlanningNotes: string;
}

export interface ZeusOutput {
  executiveSummary: string;
  startupStory: string;
  fundraisingNarrative: string;
  investmentAsk: string;
  pitchDeckOutline: Array<{ slideTitle: string; content: string }>;
}

export type StageName = "athena" | "hermes" | "apollo" | "themis" | "ares" | "hephaestus" | "zeus";

export const ALL_STAGES: StageName[] = ["athena", "hermes", "apollo", "themis", "ares", "hephaestus", "zeus"];

export interface ProjectMemory {
  founderInput: FounderInput;
  athena: AthenaOutput | null;
  hermes: HermesOutput | null;
  apollo: ApolloOutput | null;
  themis: ThemisOutput | null;
  ares: AresOutput | null;
  hephaestus: HephaestusOutput | null;
  zeus: ZeusOutput | null;
  currentStage: StageName | "done";
  status: "in_progress" | "completed" | "failed" | "escalated";
}

export function createInitialMemory(founderInput: FounderInput): ProjectMemory {
  return {
    founderInput,
    athena: null,
    hermes: null,
    apollo: null,
    themis: null,
    ares: null,
    hephaestus: null,
    zeus: null,
    currentStage: "athena",
    status: "in_progress",
  };
}

export type SessionStatus = "submitted" | "working" | "completed" | "failed" | "canceled";

export interface SessionRow {
  id: string;
  status: SessionStatus;
  current_stage: StageName | "done";
  memory_json: string;
  founder_input_json: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export type ArgusDecision = "APPROVE" | "REVISE" | "ESCALATE";

export interface ArgusVerdict {
  score: number;
  decision: ArgusDecision;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface StageRunRow {
  id: number;
  session_id: string;
  stage: StageName;
  attempt_number: number;
  agent_output_json: string;
  argus_score: number | null;
  argus_decision: ArgusDecision | null;
  argus_feedback_json: string | null;
  created_at: string;
}
