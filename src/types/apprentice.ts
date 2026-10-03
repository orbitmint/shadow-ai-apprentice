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
  persona?: 'apprentice' | 'sabine';
  text: string;
  germanText?: string;
  timestamp: string;
  audioUrl?: string;
  isGuardrail?: boolean;
  questionContext?: string;
}

export interface WorkMapStep {
  id: string;
  stepNumber: number;
  title: string;
  germanTitle?: string;
  screenMoment: {
    timestamp: string;
    screenshotUrl?: string;
    uiTarget: string;
    details?: string;
  };
  decision: string;
  germanDecision?: string;
  reason: string;
  germanReason?: string;
  guardrails: string[];
  germanGuardrails?: string[];
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
  germanTeachBackSummary?: string;
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
