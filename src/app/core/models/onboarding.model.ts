export interface OnboardingFlow {
  id: string;
  correlationId: string;
  userEmail: string;
  status: string; // pending, in_progress, completed, failed
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
}

export interface OnboardingEvent {
  id: string;
  flowId: string;
  eventType: string;
  payload: any;
  status: string;
  errorMessage: string | null;
  retryCount: number;
  createdAt: string;
  processedAt: string | null;
}
