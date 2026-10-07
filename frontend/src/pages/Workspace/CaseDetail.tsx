import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  ShieldAlert,
  Clock,
  Phone,
  Monitor,
  Share2,
  CheckCircle2,
  XCircle,
  GitFork,
  Pause,
  KeyRound,
  FileCheck,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Switch } from '../../components/ui/Switch';
import { formatCurrencyINR, formatTimeAgo, getBandBadgeColor } from '../../lib/utils';

export function CaseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [consentGranted, setConsentGranted] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['caseDetail', id],
    queryFn: () => (id ? api.getCase(id) : null),
    enabled: !!id,
    refetchInterval: 5000,
  });

  const releaseMutation = useMutation({
    mutationFn: () => (id ? api.releaseHold(id) : Promise.reject('No ID')),
    onSuccess: () => {
      setActionMessage('Hold successfully released by authorized user.');
      queryClient.invalidateQueries({ queryKey: ['caseDetail', id] });
    },
  });

  const cosignMutation = useMutation({
    mutationFn: (decision: 'approve' | 'deny') =>
      id ? api.submitCosign(id, decision) : Promise.reject('No ID'),
    onSuccess: (res) => {
      setActionMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ['caseDetail', id] });
    },
  });

  // Mock fallback for direct demonstration if case is not yet created in SQLite
  const caseObj = data?.case || {
    id: id || 'case_da_classic_01',
    victim_account: 'ACC_1042 (Ramesh Verma, 68)',
    status: 'held',
    risk_score: 94.8,
    created_at: new Date(Date.now() - 480000).toISOString(),
    summary: 'Digital Arrest Coercion: Spoofed CBI caller forced ₹4,85,000 transfer under active AnyDesk screen share',
  };

  const tx = data?.transaction || {
    id: 'tx_da_1042',
    ts: new Date(Date.now() - 480000).toISOString(),
    from_account: 'ACC_1042',
    to_account: 'MULE_L1_01',
    amount: 485000,
    channel: 'UPI-Instant',
    beneficiary_is_new: true,
    status: 'held',
  };

  const call = data?.call_context || {
    in_call: true,
    duration_sec: 2280,
    caller_saved_contact: false,
    caller_type: 'spoofed_official',
    remote_access_active: true,
    screen_share_active: true,
  };

  const cosign = data?.cosign || {
    id: 'csg_demo_01',
    family_contact_alias: 'Priya Verma (Daughter)',
    challenge_phrase_plain: 'lotus banyan',
    result: 'pending',
  };

  const reasons = [
    {
      feature: 'remote_access_active',
      contribution: 3.84,
      human_text: 'Remote access tool (AnyDesk/TeamViewer) is running on user device',
    },
    {
      feature: 'call_duration_min',
      contribution: 3.12,
      human_text: "You've been on an active call with an unsaved number for 38 minutes",
    },
    {
      feature: 'beneficiary_account_age_days',
      contribution: 2.85,
      human_text: 'Recipient account was created only 4 days ago (mule pattern)',
    },
    {
      feature: 'amount_vs_typical_ratio',
      contribution: 2.45,
      human_text: 'Transfer amount (₹4.85L) is 18.5x higher than monthly baseline',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/workspace/cases')}
            className="gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Cases</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold font-mono text-foreground">
                {caseObj.id}
              </h1>
              <Badge variant={caseObj.status === 'held' ? 'amber' : 'safe'}>
                {caseObj.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted mt-0.5">{caseObj.summary}</p>
          </div>
        </div>

        <Button
          variant="amber"
          size="sm"
          onClick={() => navigate(`/workspace/graph?case_id=${caseObj.id}`)}
          className="gap-2"
        >
          <GitFork className="w-3.5 h-3.5 text-black" />
          <span>View Money Trail Graph</span>
        </Button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-pause text-xs flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs underline ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Details + Explanations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Risk Score Gauge + Ranked Human-Readable Reasons */}
        <Card className="lg:col-span-2 space-y-5 p-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold text-foreground">Cross-Silo Risk Assessment</h2>
              <p className="text-xs text-muted">
                Synthesized metadata: Telco call state + Device sensors + Banking ledger
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold font-mono text-danger">
                {caseObj.risk_score.toFixed(1)}
              </span>
              <span className="text-xs text-muted block font-mono">/ 100 Risk Score</span>
            </div>
          </div>

          {/* Explainable Reasons List */}
          <div>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider font-mono mb-3">
              Top Contributing Factors (Explainable Attribution)
            </h3>
            <div className="space-y-2.5">
              {reasons.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-elevated/60 border border-border flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-danger/15 text-danger font-mono font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{r.human_text}</p>
                      <p className="text-[10px] text-muted font-mono mt-0.5">
                        Feature: {r.feature}
                      </p>
                    </div>
                  </div>
                  <Badge variant="danger" size="sm" className="font-mono shrink-0">
                    +{r.contribution.toFixed(2)} w·z
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Call Context Metadata Card (No Audio) */}
          <div className="pt-2 border-t border-border">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider font-mono mb-3">
              Simulated Telco & Device Context (Zero Call Audio)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-elevated/40 border border-border">
                <span className="text-[10px] text-muted block">Call Status</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-danger" />
                  Active ({Math.floor(call.duration_sec / 60)} min)
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-elevated/40 border border-border">
                <span className="text-[10px] text-muted block">Caller Verified</span>
                <span className="font-semibold text-danger flex items-center gap-1.5 mt-0.5">
                  <XCircle className="w-3.5 h-3.5 text-danger" />
                  Unsaved / Spoofed
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-elevated/40 border border-border">
                <span className="text-[10px] text-muted block">Remote Access Tool</span>
                <span className="font-semibold text-danger flex items-center gap-1.5 mt-0.5">
                  <Monitor className="w-3.5 h-3.5 text-danger" />
                  AnyDesk Detected
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-elevated/40 border border-border">
                <span className="text-[10px] text-muted block">Screen Sharing</span>
                <span className="font-semibold text-danger flex items-center gap-1.5 mt-0.5">
                  <Share2 className="w-3.5 h-3.5 text-danger" />
                  Active Stream
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Right Column: Cooling-Off Hold & Family Co-Sign Widgets */}
        <div className="space-y-6">
          {/* Cooling-Off Hold Control */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Pause className="w-4 h-4 text-amber-pause fill-amber-pause" />
                <span>Cooling-off Hold</span>
              </h3>
              <Badge variant="amber">30m Timer</Badge>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Transfer is in a safe time-limited pause. Prevents immediate irreversible UPI clearing
              while panic subsides.
            </p>

            <div className="p-3 rounded-lg bg-elevated/80 border border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-medium text-foreground block">Victim Consent Given</span>
                <span className="text-[10px] text-muted">Mandatory policy-ready requirement</span>
              </div>
              <Switch checked={consentGranted} onCheckedChange={setConsentGranted} />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => releaseMutation.mutate()}
              disabled={releaseMutation.isPending || caseObj.status !== 'held'}
              className="w-full text-xs"
            >
              Release Hold Early (Override)
            </Button>
          </Card>

          {/* Family Co-Sign Challenge */}
          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-info" />
                <span>Family Safe-Phrase Co-Sign</span>
              </h3>
              <Badge variant="info">TOTP 2-Word</Badge>
            </div>

            <div className="p-3 rounded-lg bg-info/10 border border-info/30">
              <span className="text-[10px] text-info font-medium block">
                Challenge Sent To: {cosign.family_contact_alias}
              </span>
              <p className="text-xs text-foreground font-semibold mt-1">
                Rotating phrase:{' '}
                <span className="font-mono text-amber-pause tracking-wider uppercase">
                  {cosign.challenge_phrase_plain || 'lotus banyan'}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => cosignMutation.mutate('approve')}
                disabled={cosignMutation.isPending || caseObj.status !== 'held'}
                className="gap-1.5 text-xs bg-safe hover:bg-safe/90 text-black font-semibold"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Approve Co-Sign</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => cosignMutation.mutate('deny')}
                disabled={cosignMutation.isPending || caseObj.status !== 'held'}
                className="gap-1.5 text-xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Deny / Block</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
