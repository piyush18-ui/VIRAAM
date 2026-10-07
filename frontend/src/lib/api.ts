import type {
  RiskScoreRequest,
  RiskScoreResponse,
  CaseSummary,
  CaseDetailResponse,
  FreezePlanResponse,
  ExecutePlanResponse,
  GraphData,
  OverviewMetrics,
  ModelMetrics,
  AuditEventModel
} from './types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorBody.detail || `API request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  getHealth: () => request<{ status: string; service: string }>('/health'),

  scoreTransfer: (data: RiskScoreRequest) =>
    request<RiskScoreResponse>('/risk/score', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCases: () => request<CaseSummary[]>('/cases'),

  getCase: (id: string) => request<CaseDetailResponse>(`/cases/${id}`),

  placeHold: (id: string, consent = true, duration_minutes = 15) =>
    request<{ status: string; hold: unknown }>(`/cases/${id}/hold`, {
      method: 'POST',
      body: JSON.stringify({ consent, duration_minutes }),
    }),

  releaseHold: (id: string) =>
    request<{ status: string }>(`/cases/${id}/release`, {
      method: 'POST',
    }),

  submitCosign: (id: string, decision: 'approve' | 'deny', phrase_attempt?: string) =>
    request<{ status: string; message: string; cosign: unknown }>(`/cases/${id}/cosign`, {
      method: 'POST',
      body: JSON.stringify({ decision, phrase_attempt }),
    }),

  getGraph: (caseId: string) => request<GraphData>(`/graph/${caseId}`),

  getFreezePlan: (caseId: string) =>
    request<FreezePlanResponse>(`/graph/${caseId}/freeze-plan`, { method: 'POST' }),

  executeFreezePlan: (caseId: string) =>
    request<ExecutePlanResponse>(`/graph/${caseId}/execute-plan`, { method: 'POST' }),

  getOverviewMetrics: () => request<OverviewMetrics>('/metrics/overview'),

  getModelMetrics: () => request<ModelMetrics>('/metrics/model'),

  getAuditEvents: (caseId?: string, action?: string) => {
    const params = new URLSearchParams();
    if (caseId) params.append('case_id', caseId);
    if (action) params.append('action', action);
    return request<AuditEventModel[]>(`/audit?${params.toString()}`);
  },

  triggerScenario: (scenario: string, speed = '1x') =>
    request<{ status: string; message: string; scenario: string }>('/simulate/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario, speed }),
    }),

  resetSimulation: () =>
    request<{ status: string; message: string }>('/simulate/reset', {
      method: 'POST',
    }),
};
