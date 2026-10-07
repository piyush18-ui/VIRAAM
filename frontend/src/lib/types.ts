export type RiskBand = 'low' | 'medium' | 'high' | 'critical';
export type RecommendedAction = 'pass' | 'soft_nudge' | 'cooling_off_hold' | 'hold_and_cosign';
export type CaseStatus = 'open' | 'held' | 'resolved' | 'frozen';
export type HoldState = 'active' | 'released' | 'expired';
export type CosignResult = 'pending' | 'approved' | 'denied';

export interface Reason {
  feature: string;
  contribution: number;
  human_text: string;
}

export interface RiskScoreRequest {
  account_id: string;
  beneficiary_account_id: string;
  amount: number;
  channel?: string;
  in_call: boolean;
  call_duration_min: number;
  caller_saved: boolean;
  caller_type: 'unknown' | 'spoofed_official' | 'known';
  remote_access_active: boolean;
  screen_share_active: boolean;
  beneficiary_is_new: boolean;
  beneficiary_account_age_days?: number;
  hour_of_day?: number;
}

export interface RiskScoreResponse {
  risk_score: number;
  band: RiskBand;
  action_recommended: RecommendedAction;
  reasons: Reason[];
  hold_duration_minutes: number;
  cosign_required: boolean;
}

export interface CaseSummary {
  id: string;
  victim_account: string;
  status: CaseStatus;
  risk_score: number;
  created_at: string;
  summary: string;
  amount: number;
  channel: string;
  to_account: string;
  hold_active: boolean;
}

export interface TransactionModel {
  id: string;
  ts: string;
  from_account: string;
  to_account: string;
  amount: number;
  channel: string;
  beneficiary_is_new: boolean;
  case_id?: string;
  status: 'completed' | 'held' | 'released' | 'blocked';
}

export interface HoldModel {
  id: string;
  case_id: string;
  tx_id: string;
  started_at: string;
  expires_at: string;
  consent_given: boolean;
  state: HoldState;
}

export interface CosignModel {
  id: string;
  case_id: string;
  family_contact_alias: string;
  challenge_phrase_hash: string;
  challenge_phrase_plain?: string;
  result: CosignResult;
  updated_at: string;
}

export interface CallContextModel {
  id: string;
  ts: string;
  account_id: string;
  in_call: boolean;
  duration_sec: number;
  caller_saved_contact: boolean;
  caller_type: 'unknown' | 'spoofed_official' | 'known';
  remote_access_active: boolean;
  screen_share_active: boolean;
}

export interface AuditEventModel {
  id: string;
  ts: string;
  actor: string;
  action: string;
  case_id?: string;
  detail: Record<string, unknown>;
}

export interface CaseDetailResponse {
  case: {
    id: string;
    victim_account: string;
    status: CaseStatus;
    risk_score: number;
    created_at: string;
    summary: string;
    initial_tx_id?: string;
  };
  transaction?: TransactionModel;
  holds: HoldModel[];
  cosign?: CosignModel;
  call_context?: CallContextModel;
  audit_timeline: {
    id: string;
    ts: string;
    actor: string;
    action: string;
    case_id?: string;
    detail_json: string;
  }[];
}

export interface FreezePlanItem {
  account_id: string;
  holder_alias: string;
  bank_alias: string;
  layer: number;
  expected_recoverable_amount: number;
  probability_funds_present: number;
  urgency: number;
  score: number;
  reason: string;
  recommended_action: string;
  estimated_window_sec: number;
}

export interface FreezePlanResponse {
  case_id: string;
  total_at_risk: number;
  total_recoverable: number;
  nodes_count: number;
  items: FreezePlanItem[];
  generated_at: string;
}

export interface ExecutePlanResponse {
  case_id: string;
  frozen_accounts: string[];
  frozen_amount: number;
  status: string;
  with_viraam_recovered: number;
  without_viraam_recovered: number;
}

export interface GraphData {
  case_id: string;
  nodes: {
    id: string;
    data: {
      label: string;
      kind: 'victim' | 'mule' | 'cashout';
      layer: number;
      bank: string;
      age_days: number;
      velocity: number;
      frozen: boolean;
      balance: number;
    };
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    data: {
      amount: number;
      lag_sec: number;
      status: string;
    };
  }[];
  summary: {
    total_flow: number;
    layers_detected: number;
    mules_identified: number;
    cashout_points: number;
  };
}

export interface OverviewMetrics {
  transfers_screened: number;
  holds_placed: number;
  estimated_loss_prevented: number;
  median_time_to_hold_sec: number;
  false_positive_rate: number;
  sparklines: {
    screened: number[];
    holds: number[];
    loss_prevented: number[];
  };
}

export interface ModelMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  confusion_matrix: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  feature_importances: {
    feature: string;
    weight: number;
  }[];
  dataset_disclaimer: string;
}
