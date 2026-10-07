import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Smartphone,
  Play,
  RotateCcw,
  Phone,
  ShieldAlert,
  Clock,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Monitor,
  Pause,
  Zap,
  Check
} from 'lucide-react';
import { api } from '../../lib/api';
import { useViraamStore } from '../../store/useViraamStore';
import { useEventStream, StreamEventData } from '../../lib/useEventStream';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrencyINR } from '../../lib/utils';

export function SimulatorView() {
  const queryClient = useQueryClient();
  const {
    activeScenario,
    setActiveScenario,
    simulationSpeed,
    setSimulationSpeed,
  } = useViraamStore();

  const [selectedScenario, setSelectedScenario] = useState('digital_arrest_classic');
  const [speed, setSpeed] = useState<'1x' | '5x' | '20x'>('5x');
  const [phoneState, setPhoneState] = useState<'idle' | 'calling' | 'held' | 'cosign_pending' | 'resolved' | 'passed'>('idle');
  const [safePhrase, setSafePhrase] = useState('lotus banyan');
  const [coSignResult, setCoSignResult] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to simulate');

  // Listen to SSE simulation broadcasts
  useEventStream((event: StreamEventData) => {
    if (event.type === 'call_alert') {
      setPhoneState('calling');
      setStatusMessage('Victim is on an active call under coercive pressure...');
    } else if (event.type === 'hold_started') {
      setPhoneState('held');
      setStatusMessage('Viraam triggered cooling-off hold! Scammer script interrupted.');
    } else if (event.type === 'cosign_requested') {
      setPhoneState('cosign_pending');
      if (event.data.safe_phrase) setSafePhrase(event.data.safe_phrase);
      setStatusMessage('Family Co-sign challenge dispatched to daughter with safe-phrase.');
    } else if (event.type === 'transaction') {
      if (event.data.status === 'completed' && event.data.band === 'low') {
        setPhoneState('passed');
        setStatusMessage('Legitimate transfer verified! Directly passed with zero hold.');
      }
    } else if (event.type === 'simulation_reset') {
      setPhoneState('idle');
      setCoSignResult(null);
      setStatusMessage('Simulation environment reset.');
    }
  });

  const runMutation = useMutation({
    mutationFn: () => api.triggerScenario(selectedScenario, speed),
    onSuccess: () => {
      setActiveScenario(selectedScenario);
      setSimulationSpeed(speed);
      setCoSignResult(null);
      if (selectedScenario === 'digital_arrest_classic') {
        setPhoneState('calling');
        setStatusMessage('Digital arrest scenario started...');
      } else if (selectedScenario === 'false_positive_legit') {
        setPhoneState('calling');
        setStatusMessage('Legitimate transfer started...');
      } else {
        setPhoneState('calling');
        setStatusMessage('Family impersonation scenario started...');
      }
      queryClient.invalidateQueries({ queryKey: ['casesList'] });
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => api.resetSimulation(),
    onSuccess: () => {
      setActiveScenario(null);
      setPhoneState('idle');
      setCoSignResult(null);
      setStatusMessage('Reset complete');
      queryClient.invalidateQueries({ queryKey: ['casesList'] });
    },
  });

  const handleFamilyCoSign = (decision: 'approve' | 'deny') => {
    if (decision === 'approve') {
      setCoSignResult('Approved via safe-phrase');
      setPhoneState('resolved');
      setStatusMessage('Transfer approved by family member with rotating safe-phrase.');
    } else {
      setCoSignResult('Denied by family');
      setPhoneState('held');
      setStatusMessage('Hold locked by family co-signer! Scammer extortion thwarted.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-amber-pause" />
            <span>Interactive Scam Simulator</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Demonstrate how cross-silo signals trigger cooling-off holds and family safe-phrase co-signing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Status: {statusMessage}
          </Badge>
        </div>
      </div>

      {/* Main Container: Controls (Left) + Phone 1 (Center) + Phone 2 (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Controls Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 space-y-5">
            <div>
              <CardTitle className="text-base">Scenario Selection</CardTitle>
              <CardDescription>Pick an attack vector or baseline to execute</CardDescription>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'digital_arrest_classic',
                  title: '1. Digital Arrest Coercion',
                  desc: 'Spoofed CBI call (38m) + AnyDesk screen share + ₹4.85L lump-sum transfer to fresh mule.',
                  badge: 'Critical Band',
                  color: 'danger',
                },
                {
                  id: 'family_impersonation',
                  title: '2. Family Impersonation',
                  desc: 'Urgent accident/bail extortion call claiming nephew arrested. Tests safe-phrase co-sign.',
                  badge: 'High Band',
                  color: 'amber',
                },
                {
                  id: 'false_positive_legit',
                  title: '3. Legitimate Transfer (Control)',
                  desc: '₹2.5L property token payment while on call with saved broker. Stays low risk with zero hold.',
                  badge: 'Low Band (Pass)',
                  color: 'safe',
                },
              ].map((sc) => (
                <div
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedScenario === sc.id
                      ? 'border-amber-pause bg-amber-pause/10 ring-1 ring-amber-pause'
                      : 'border-border bg-elevated/40 hover:bg-elevated'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs font-bold text-foreground">{sc.title}</h4>
                    <Badge variant={sc.color as any} size="sm">
                      {sc.badge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted leading-relaxed">{sc.desc}</p>
                </div>
              ))}
            </div>

            {/* Speed selection */}
            <div>
              <label className="text-xs font-semibold text-foreground block mb-2">
                Simulation Speed
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1x', '5x', '20x'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                      speed === s
                        ? 'bg-amber-pause text-black font-bold shadow-sm'
                        : 'bg-elevated border border-border text-muted hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Button
                variant="amber"
                size="md"
                onClick={() => runMutation.mutate()}
                disabled={runMutation.isPending}
                className="w-full gap-2 shadow-md"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Run Scenario</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="w-full gap-2 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Phone 1: Citizen Victim Phone (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] rounded-[36px] border-[5px] border-border bg-[#0D0F15] p-3 shadow-2xl relative overflow-hidden flex flex-col min-h-[580px]">
            {/* Phone Speaker notch */}
            <div className="w-24 h-4 bg-border/40 rounded-full mx-auto mb-2" />

            {/* Active Call Banner if active */}
            {(phoneState === 'calling' || phoneState === 'held' || phoneState === 'cosign_pending') && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 flex items-center justify-between text-xs animate-pulse">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-400 fill-red-400 shrink-0" />
                  <div>
                    <p className="font-bold text-[11px]">
                      {selectedScenario === 'false_positive_legit'
                        ? 'Sunil Broker (Saved Contact)'
                        : '+91 98110 09823 (CBI Cyber Cell)'}
                    </p>
                    <p className="text-[9px] text-muted">
                      {selectedScenario === 'false_positive_legit'
                        ? '08:14 • Verified contact'
                        : '38:42 • AnyDesk screen active'}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/30">
                  ON CALL
                </span>
              </div>
            )}

            {/* Simulated BharatPay App Screen */}
            <div className="flex-1 bg-surface rounded-2xl p-4 border border-border flex flex-col justify-between">
              {phoneState === 'idle' ? (
                <div className="text-center py-20 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-elevated mx-auto flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-muted" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">UPI Payment Ready</h4>
                  <p className="text-xs text-muted">
                    Click "Run Scenario" to simulate victim being coerced into initiating transfer.
                  </p>
                </div>
              ) : phoneState === 'passed' ? (
                <div className="text-center py-16 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-safe mx-auto" />
                  <h4 className="text-sm font-bold text-foreground">Payment Successful</h4>
                  <p className="text-xl font-bold font-mono text-foreground">₹2,50,000</p>
                  <p className="text-xs text-safe">
                    Verified benign transfer to saved contact. Zero hold triggered.
                  </p>
                </div>
              ) : phoneState === 'held' || phoneState === 'cosign_pending' ? (
                <div className="space-y-4">
                  {/* Coercion Interruption Header */}
                  <div className="text-center pt-2">
                    <div className="w-12 h-12 rounded-full bg-amber-pause/20 border border-amber-pause mx-auto flex items-center justify-center pause-pulse-ring mb-2">
                      <Pause className="w-6 h-6 fill-amber-pause text-amber-pause" />
                    </div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-amber-pause">
                      Viraam Interruption
                    </span>
                    <h3 className="text-sm font-bold text-foreground mt-0.5">
                      Pause the panic. Hold active.
                    </h3>
                  </div>

                  {/* Plain Language Interruption Script */}
                  <div className="p-3 rounded-xl bg-elevated border border-border text-xs space-y-1.5">
                    <p className="text-foreground font-medium">
                      ⚠️ You are on a 38-minute call and screen share is active.
                    </p>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Real police and government officers <strong>never</strong> demand immediate money
                      transfers to private accounts over video or phone calls.
                    </p>
                  </div>

                  {/* Cooling-off Countdown */}
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
                    <span className="text-[10px] text-muted uppercase font-mono block">
                      Cooling-Off Period
                    </span>
                    <span className="text-2xl font-mono font-bold text-amber-pause">
                      14:58
                    </span>
                    <span className="text-[10px] text-muted block mt-0.5">
                      Funds safely paused in your account
                    </span>
                  </div>

                  {/* Co-sign status on citizen device */}
                  <div className="p-2.5 rounded-lg bg-info/10 border border-info/20 text-center text-xs">
                    <span className="text-info font-medium block">
                      Family Safe-Phrase Co-Sign Pending
                    </span>
                    <span className="text-[10px] text-muted">
                      Sent to Priya (Daughter) for confirmation
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-6">
                  <span className="text-xs text-muted block text-center">Sending Payment</span>
                  <p className="text-2xl font-bold font-mono text-center text-foreground">
                    ₹4,85,000
                  </p>
                  <p className="text-xs text-muted text-center font-mono">To: MULE_L1_01</p>
                  <div className="animate-pulse py-8 text-center text-xs text-amber-pause">
                    Screening transfer through Viraam risk engine...
                  </div>
                </div>
              )}

              {/* Bottom simulated navigation bar */}
              <div className="pt-2 text-center text-[10px] text-muted font-mono border-t border-border">
                BharatPay UPI Protected by Viraam
              </div>
            </div>
          </div>
          <span className="text-xs text-muted mt-2 font-mono">Citizen Phone Mockup</span>
        </div>

        {/* Phone 2: Family Member Device (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col items-center">
          <div className="w-full max-w-[280px] rounded-[32px] border-[4px] border-border bg-[#0D0F15] p-2.5 shadow-2xl relative min-h-[460px] flex flex-col justify-between">
            {/* Speaker */}
            <div className="w-16 h-3 bg-border/40 rounded-full mx-auto mb-2" />

            {/* Notification Card */}
            <div className="flex-1 bg-surface rounded-xl p-3 border border-border flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-pause mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Viraam Co-Sign Alert</span>
                </div>

                {phoneState === 'cosign_pending' || phoneState === 'held' ? (
                  <div className="space-y-3">
                    <div className="p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-xs">
                      <p className="font-semibold text-danger">Ramesh Verma (Father)</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        Attempting ₹4,85,000 transfer while on an unsaved call. Suspected digital arrest.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-elevated border border-border text-center">
                      <span className="text-[10px] text-muted uppercase font-mono block">
                        Rotating Safe-Phrase
                      </span>
                      <span className="text-sm font-bold font-mono text-amber-pause tracking-wider uppercase block mt-1">
                        "{safePhrase}"
                      </span>
                      <span className="text-[9px] text-muted mt-0.5 block">
                        Derived from family shared secret
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleFamilyCoSign('deny')}
                        className="w-full text-xs font-semibold"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        <span>Deny & Maintain Hold</span>
                      </Button>

                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleFamilyCoSign('approve')}
                        className="w-full text-xs bg-safe hover:bg-safe/90 text-black font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        <span>Approve Transfer</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-xs text-muted">
                    <KeyRound className="w-8 h-8 mx-auto mb-2 opacity-60 text-info" />
                    <span>No co-sign requests pending on family device.</span>
                  </div>
                )}
              </div>

              {coSignResult && (
                <div className="p-2 rounded bg-elevated border border-border text-[10px] font-mono text-center text-foreground">
                  Status: {coSignResult}
                </div>
              )}
            </div>

            <div className="mt-2 text-center text-[10px] text-muted font-mono">
              Priya's Device (Daughter)
            </div>
          </div>
          <span className="text-xs text-muted mt-2 font-mono">Family Co-Sign Device</span>
        </div>
      </div>
    </div>
  );
}
