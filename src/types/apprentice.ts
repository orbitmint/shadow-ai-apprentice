export interface ScreenEvent {
  id: string;
  timestamp: string; // e.g. "03:12"
  seconds: number;
  action: string;
  targetField?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  screenshotUrl?: string;
  isGuardrailTrigger?: boolean;
  guardrailNote?: string;
  suggestedQuestion?: string;
}

export interface DialogueTurn {
  id: string;
  speaker: 'agent' | 'expert' | 'tutor' | 'trainee' | 'system';
  text: string;
  timestamp: string;
  audioUrl?: string;
  isGuardrail?: boolean;
  questionContext?: string;
}

export interface WorkMapStep {
  id: string;
  stepNumber: number;
  title: string;
  screenMoment: {
    timestamp: string;
    screenshotUrl?: string;
    uiTarget: string;
    details?: string;
  };
  decision: string;
  reason: string;
  guardrails: string[];
  confirmedByExpert: boolean;
}

export interface WorkMap {
  id: string;
  title: string;
  expertName: string;
  expertRole: string;
  taskName: string;
  recordedAt: string;
  steps: WorkMapStep[];
  coreGuardrails: string[];
  teachBackSummary: string;
}

export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  vendor: string;
  vendorCategory: string;
  amount: number;
  date: string;
  description: string;
  currentCostCenter: string;
  recommendedCostCenter?: string;
  status: 'pending' | 'approved' | 'held' | 'escalated';
  assetNumber?: string;
  requiresSecondApproval?: boolean;
  notes?: string;
  flags?: string[];
}
