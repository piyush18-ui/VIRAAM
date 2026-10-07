import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pause,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  GitFork,
  Sun,
  Moon,
  CheckCircle2,
  ChevronDown,
  Lock,
  Phone,
  Monitor,
  EyeOff,
  Scale,
  Sparkles,
  Zap,
  TrendingDown
} from 'lucide-react';
import { useViraamStore } from '../../store/useViraamStore';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { formatCurrencyINR } from '../../lib/utils';

export function LandingPage() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useViraamStore();

  // Mini-demo interactive state
  const [callDuration, setCallDuration] = useState(38);
  const [remoteAccess, setRemoteAccess] = useState(true);
  const [newBeneficiary, setNewBeneficiary] = useState(true);
  const [amount, setAmount] = useState(485000);
  const [demoScore, setDemoScore] = useState(94.2);
  const [demoBand, setDemoBand] = useState('critical');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Dynamic calculation for mini-demo
  useEffect(() => {
    let score = 15;
    if (callDuration > 10) score += Math.min(35, (callDuration - 10) * 1.2);
    if (remoteAccess) score += 28;
    if (newBeneficiary) score += 18;
    if (amount > 100000) score += 12;

    const clamped = Math.min(99.4, Math.max(8.0, score));
    setDemoScore(clamped);

    if (clamped >= 82) setDemoBand('critical');
    else if (clamped >= 65) setDemoBand('high');
    else if (clamped >= 35) setDemoBand('medium');
    else setDemoBand('low');
  }, [callDuration, remoteAccess, newBeneficiary, amount]);

  const faqs = [
    {
      q: 'Does Viraam record or analyze call audio?',
      a: 'Never. Viraam adheres to strict privacy-by-design. We use only call state metadata (active call flag, duration, whether caller is saved in contacts) from OS sensors. Zero voice audio is ever accessed, stored, or processed.',
    },
    {
      q: 'Why not simply block spam calls at the telecom level?',
      a: 'Scammers spoof official police and court numbers, or switch to fresh SIM cards and WhatsApp/Skype VoIP within minutes. Telecom call blocking is bypassed daily. The unsolvable bottleneck for scammers is the actual movement of money.',
    },
    {
      q: 'Does this interfere with legitimate high-value payments (false positives)?',
      a: 'No. Legitimate transfers (e.g. buying a car, property tokens, paying trusted family) lack the coercive signatures: no long call with unsaved numbers, no remote screen-share tools running, and established beneficiary histories. Our synthetic benchmarks show a false-positive rate of just 3.2%.',
    },
    {
      q: 'What is the legal basis for holding money?',
      a: 'Viraam is designed as a policy-ready framework. Holds are consent-based, strictly time-limited (10-30 minutes), and fully audit-logged. It provides the technological foundation for upcoming temporary-freeze mandates under digital public infrastructure regulations.',
    },
    {
      q: 'How does the family co-sign protect elderly citizens?',
      a: 'In a digital arrest scam, victims are placed in extreme psychological isolation ("do not tell anyone or you will be jailed"). A mandatory co-sign step with a rotating safe-phrase forces a calm second opinion from a trusted child or spouse, breaking the scammer’s hypnotic script.',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-amber-pause selection:text-black">
      {/* 1. Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-pause flex items-center justify-center text-black font-bold shadow-sm">
              <Pause className="w-4 h-4 fill-black" />
            </div>
            <span className="font-bold text-lg tracking-tight text-foreground">Viraam</span>
            <span className="text-[10px] text-muted font-mono tracking-widest uppercase ml-1 px-1.5 py-0.5 rounded bg-elevated border border-border">
              Security
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-muted">
            <a href="#problem" className="hover:text-foreground transition-colors">The Gap</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#mini-demo" className="hover:text-foreground transition-colors">Live Demo</a>
            <a href="#money-trail" className="hover:text-foreground transition-colors">Money Trail</a>
            <a href="#principles" className="hover:text-foreground transition-colors">Principles</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-elevated/70 border border-border text-muted hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button
              variant="amber"
              size="sm"
              onClick={() => navigate('/workspace')}
              className="gap-2 text-xs"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-pause text-xs font-medium">
              <Zap className="w-3.5 h-3.5" />
              <span>Digital Arrest Scam Prevention & Mule Tracing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
              Pause the panic.{' '}
              <span className="font-serif italic font-normal text-amber-pause">Protect</span> the payment.
            </h1>

            <p className="text-sm md:text-base text-muted max-w-xl leading-relaxed">
              In digital arrest scams, fraudsters isolate victims and force immediate large UPI transfers.
              Viraam merges call state with payment signals to enforce a timed cooling-off hold, breaking
              the coercion before money leaves the victim's account.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                variant="amber"
                size="lg"
                onClick={() => navigate('/workspace/simulator')}
                className="gap-2 shadow-lg shadow-amber-pause/10"
              >
                <span>Launch Live Demo</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <a href="#how-it-works">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  See How It Works
                </Button>
              </a>
            </div>
          </div>

          {/* Right Hero: Animated Product Preview Card */}
          <div className="lg:col-span-5 flex justify-center">
            <Card className="w-full max-w-md p-6 glass-panel border border-border shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-pause/20 flex items-center justify-center pause-pulse-ring">
                    <Pause className="w-4 h-4 text-amber-pause fill-amber-pause" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Held for Review</span>
                    <span className="text-[10px] text-muted font-mono">Cooling-off Timer Active</span>
                  </div>
                </div>
                <Badge variant="danger" size="sm" className="font-mono">
                  94.8 Risk Score
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-elevated/70 border border-border flex items-center justify-between">
                  <span className="text-xs text-muted">Attempted Transfer</span>
                  <span className="text-base font-bold font-mono text-foreground">₹4,85,000</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                  <p className="font-semibold text-amber-pause flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Cross-Silo Coercion Detected</span>
                  </p>
                  <p className="text-[11px] text-muted">
                    Victim on 38-min unsaved call while AnyDesk screen share is active.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-elevated/70 border border-border flex items-center justify-between">
                  <span className="text-xs text-muted">Family Co-Sign Required</span>
                  <span className="text-xs font-mono font-bold text-amber-pause uppercase tracking-wider">
                    "lotus banyan"
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-[11px] text-muted font-mono">
                <span>Golden Hour Protection</span>
                <span className="text-safe flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Intercepted in 1.4s
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Trust Strip */}
      <div className="border-y border-border bg-surface/40 py-3.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12 text-xs text-muted font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-safe" />
            <span>Synthetic-data prototype</span>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-info" />
            <span>Zero call audio analyzed</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-pause" />
            <span>Explainable attribution (no black box)</span>
          </div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-foreground" />
            <span>Consent-based time-limited holds</span>
          </div>
        </div>
      </div>

      {/* 4. The Gap (Problem) Section */}
      <section id="problem" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-pause font-semibold">
            The Structural Gap
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Why current defenses fail against digital arrests
          </h2>
          <p className="text-xs md:text-sm text-muted">
            The telco sees the call but has no idea money is moving. The bank sees the payment but has
            no clue the customer is on an active 40-minute extortion call.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3 border-border bg-surface/60">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-info mb-2">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">What the Telco Sees</h3>
            <p className="text-xs text-muted leading-relaxed">
              Active incoming call with an unverified or spoofed number lasting 45 minutes. Cannot see
              banking sessions or OTP entries. Cannot legally freeze a payment.
            </p>
            <div className="pt-3 border-t border-border text-[11px] text-muted font-mono">
              Blind to: UPI / Banking fund transfer
            </div>
          </Card>

          <Card className="p-6 space-y-3 border-border bg-surface/60">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-danger mb-2">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">What the Bank Sees</h3>
            <p className="text-xs text-muted leading-relaxed">
              A customer authorizing a transfer with their genuine PIN or biometric. Looks like
              authorized voluntary activity. By the time victim reports days later, funds have dispersed.
            </p>
            <div className="pt-3 border-t border-border text-[11px] text-muted font-mono">
              Blind to: Coercion & ongoing phone call
            </div>
          </Card>

          <Card className="p-6 space-y-3 border-amber-pause/40 bg-amber-500/5 ring-1 ring-amber-pause">
            <div className="w-10 h-10 rounded-xl bg-amber-pause/20 flex items-center justify-center text-amber-pause mb-2">
              <Pause className="w-5 h-5 fill-amber-pause" />
            </div>
            <h3 className="text-base font-bold text-amber-pause">What Viraam Sees</h3>
            <p className="text-xs text-foreground font-medium leading-relaxed">
              The cross-silo confluence: an unsaved 38-minute call + active screen sharing + first-time
              large transfer to a 4-day-old mule account. Instantly initiates cooling-off hold.
            </p>
            <div className="pt-3 border-t border-amber-500/30 text-[11px] text-amber-pause font-mono">
              Action: Instant pause & family co-sign
            </div>
          </Card>
        </div>

        {/* Labeled Illustrative Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-4 rounded-xl bg-elevated/40 border border-border text-center">
            <span className="text-2xl font-bold font-mono text-danger">₹1,750+ Cr</span>
            <p className="text-[11px] text-muted mt-1">
              Estimated annual extortion loss in digital arrest scams{' '}
              <span className="text-[10px] text-amber-pause font-mono">[illustrative]</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-elevated/40 border border-border text-center">
            <span className="text-2xl font-bold font-mono text-amber-pause">&lt; 25 mins</span>
            <p className="text-[11px] text-muted mt-1">
              Average time for stolen funds to fanout across mule tiers{' '}
              <span className="text-[10px] text-amber-pause font-mono">[illustrative]</span>
            </p>
          </div>
          <div className="p-4 rounded-xl bg-elevated/40 border border-border text-center">
            <span className="text-2xl font-bold font-mono text-safe">94.0%</span>
            <p className="text-[11px] text-muted mt-1">
              Simulated recovery rate when holds land in golden hour{' '}
              <span className="text-[10px] text-amber-pause font-mono">[synthetic test split]</span>
            </p>
          </div>
        </div>
      </section>

      {/* 5. How It Works (3 Layers) */}
      <section id="how-it-works" className="py-20 md:py-28 bg-surface/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-pause font-semibold">
              Three-Layer Defense
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Detect. Interrupt. Trace.
            </h2>
            <p className="text-xs md:text-sm text-muted">
              From the moment fraud signals align to golden-hour recovery across banking tiers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-card bg-surface border border-border space-y-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-pause font-mono font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h3 className="text-base font-bold text-foreground">Cross-Silo Signal Scoring</h3>
              <p className="text-xs text-muted leading-relaxed">
                Combines call metadata (unsaved number, duration &gt;15 min), device state (active screen
                share / remote desktop), and transaction indicators (first-time beneficiary, rapid
                inbound velocity).
              </p>
            </div>

            <div className="p-6 rounded-card bg-surface border border-border space-y-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-pause font-mono font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h3 className="text-base font-bold text-foreground">Coercion-Breaking Friction</h3>
              <p className="text-xs text-muted leading-relaxed">
                Applies a timed 15-30 min cooling-off hold. Shows plain-language warnings that pierce the
                scammer's false authority, and triggers a rotating safe-phrase family co-sign challenge.
              </p>
            </div>

            <div className="p-6 rounded-card bg-surface border border-border space-y-4">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-pause font-mono font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h3 className="text-base font-bold text-foreground">Golden-Hour Mule Tracing</h3>
              <p className="text-xs text-muted leading-relaxed">
                Builds the multi-hop NetworkX propagation graph, predicts downstream next-hop exit
                destinations, and delivers an actionable freeze plan ordered by recoverable value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Mini-Demo ("Wow" Moment) */}
      <section id="mini-demo" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-pause font-semibold">
            Interactive Signal Engine
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Test the cross-silo risk score live
          </h2>
          <p className="text-xs md:text-sm text-muted">
            Adjust the sliders below to see how call duration, remote access, and recipient history
            dynamically alter the risk band and explainable factors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders (7 Cols) */}
          <Card className="lg:col-span-7 p-6 space-y-6">
            {/* Slider 1: Call Duration */}
            <div>
              <div className="flex justify-between text-xs font-medium text-foreground mb-2">
                <span>Active Call Duration with Unsaved Number</span>
                <span className="font-mono text-amber-pause font-bold">{callDuration} mins</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                value={callDuration}
                onChange={(e) => setCallDuration(Number(e.target.value))}
                className="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer accent-amber-pause"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
                <span>0m (No Call)</span>
                <span>30m (Scam threshold)</span>
                <span>90m (Heavy coercion)</span>
              </div>
            </div>

            {/* Slider 2: Amount */}
            <div>
              <div className="flex justify-between text-xs font-medium text-foreground mb-2">
                <span>Transfer Amount</span>
                <span className="font-mono text-foreground font-bold">
                  {formatCurrencyINR(amount)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full h-2 bg-elevated rounded-lg appearance-none cursor-pointer accent-amber-pause"
              />
              <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
                <span>₹10,000 (Normal)</span>
                <span>₹5,00,000 (Extortion tier)</span>
                <span>₹10,00,000</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-elevated/70 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    Remote Access / Screen Share
                  </span>
                  <span className="text-[10px] text-muted">AnyDesk / TeamViewer running</span>
                </div>
                <Switch checked={remoteAccess} onCheckedChange={setRemoteAccess} />
              </div>

              <div className="p-3.5 rounded-xl bg-elevated/70 border border-border flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-foreground block">
                    First-Time Beneficiary
                  </span>
                  <span className="text-[10px] text-muted">Account opened &lt; 7 days ago</span>
                </div>
                <Switch checked={newBeneficiary} onCheckedChange={setNewBeneficiary} />
              </div>
            </div>
          </Card>

          {/* Dynamic Score Output (5 Cols) */}
          <Card className="lg:col-span-5 p-6 flex flex-col justify-between h-full space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs uppercase font-mono text-muted">Calculated Risk Score</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold font-mono text-foreground">
                  {demoScore.toFixed(0)}
                </span>
                <span className="text-sm text-muted font-mono">/ 100</span>
              </div>
              <div>
                <Badge
                  variant={
                    demoBand === 'critical'
                      ? 'danger'
                      : demoBand === 'high'
                      ? 'amber'
                      : demoBand === 'medium'
                      ? 'info'
                      : 'safe'
                  }
                  size="md"
                  className="uppercase font-mono tracking-wider font-bold"
                >
                  {demoBand} Risk Band
                </Badge>
              </div>
            </div>

            {/* Explainable Reasons */}
            <div className="space-y-2 text-xs">
              <span className="text-[10px] uppercase font-mono text-muted block font-semibold">
                Explainable Interventions:
              </span>
              {callDuration > 15 && (
                <div className="p-2 rounded bg-elevated border border-border text-[11px] text-foreground">
                  • Active call with unsaved number lasting {callDuration} mins
                </div>
              )}
              {remoteAccess && (
                <div className="p-2 rounded bg-elevated border border-border text-[11px] text-foreground">
                  • Remote desktop / screen sharing active on device
                </div>
              )}
              {newBeneficiary && (
                <div className="p-2 rounded bg-elevated border border-border text-[11px] text-foreground">
                  • Recipient account is freshly created (&lt; 7 days old)
                </div>
              )}
              {demoBand === 'low' && (
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-safe">
                  • Low risk score. Transaction cleared for immediate execution.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted">Recommended Action:</span>
              <span className="font-semibold text-amber-pause capitalize font-mono">
                {demoBand === 'critical'
                  ? 'Cooling-off Hold + Family Co-Sign'
                  : demoBand === 'high'
                  ? '10-Minute Cooling-off Hold'
                  : demoBand === 'medium'
                  ? 'Soft Nudge Warning'
                  : 'Immediate Pass'}
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* 7. Money Trail Looping Preview */}
      <section id="money-trail" className="py-20 md:py-28 bg-surface/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-pause font-semibold">
              Rapid Dispersal Interception
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Chasing the stolen money before cash-out
            </h2>
            <p className="text-xs md:text-sm text-muted">
              Mule accounts fanout stolen funds within minutes. Viraam generates an actionable freeze
              plan prioritized by expected recoverable yield.
            </p>
          </div>

          <div className="p-6 md:p-8 rounded-card bg-surface border border-border shadow-xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center gap-3">
                <Badge variant="amber">NetworkX Directed Graph</Badge>
                <span className="text-xs text-muted font-mono">L1 Intake → L2 Aggregation → L3 Dispersal</span>
              </div>
              <p className="text-xs md:text-sm text-muted leading-relaxed">
                Our algorithm predicts branch destination probabilities using historical flow shares,
                device fingerprint overlaps, and typical forwarding velocity. The freeze plan lands locks
                on the highest-yield accounts before exit terminals (Crypto OTC or ATM rings) are reached.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <span className="text-[10px] uppercase font-mono text-safe font-bold block">
                    With Viraam
                  </span>
                  <span className="text-xl font-bold font-mono text-safe">₹4,55,900</span>
                  <span className="text-[10px] text-muted block mt-0.5">94% Principal Recovered</span>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <span className="text-[10px] uppercase font-mono text-danger font-bold block">
                    Without Viraam
                  </span>
                  <span className="text-xl font-bold font-mono text-danger">₹29,100</span>
                  <span className="text-[10px] text-muted block mt-0.5">Dispersed in 25 mins</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <Button
                variant="amber"
                size="lg"
                onClick={() => navigate('/workspace/graph')}
                className="w-full gap-2 shadow-lg"
              >
                <GitFork className="w-4 h-4 fill-black" />
                <span>Explore Money Trail</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Principles Grid */}
      <section id="principles" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-amber-pause font-semibold">
            Engineering Ethics
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Four Non-Negotiable Guarantees
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-5 space-y-2.5">
            <EyeOff className="w-6 h-6 text-info" />
            <h3 className="text-sm font-bold text-foreground">Zero Audio Surveillance</h3>
            <p className="text-xs text-muted leading-relaxed">
              We never record, listen, or transcribe phone calls. Only coarse boolean flags (in call,
              duration, unsaved contact) are examined.
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <Sparkles className="w-6 h-6 text-amber-pause" />
            <h3 className="text-sm font-bold text-foreground">100% Explainable</h3>
            <p className="text-xs text-muted leading-relaxed">
              Every flagged transfer presents the exact contributing factors to the citizen. No black-box
              arbitrary blocks.
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <Scale className="w-6 h-6 text-safe" />
            <h3 className="text-sm font-bold text-foreground">Consent-Based Pauses</h3>
            <p className="text-xs text-muted leading-relaxed">
              Holds are cooling-off periods rather than confiscations, with clear user overrides and
              family co-sign approval paths.
            </p>
          </Card>

          <Card className="p-5 space-y-2.5">
            <Lock className="w-6 h-6 text-foreground" />
            <h3 className="text-sm font-bold text-foreground">Policy-Ready Design</h3>
            <p className="text-xs text-muted leading-relaxed">
              Fully tamper-evident audit logs designed to integrate seamlessly into future digital banking
              regulatory frameworks.
            </p>
          </Card>
        </div>
      </section>

      {/* 9. FAQ Accordion */}
      <section id="faq" className="py-20 md:py-28 bg-surface/40 border-t border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-muted">Clear answers on architecture, privacy, and policy</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = faqOpen === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-surface overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : index)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-foreground hover:bg-elevated/40 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-amber-pause' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <p className="p-4 pt-0 text-xs text-muted leading-relaxed border-t border-border/50">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 10. Final CTA & Footer */}
      <footer className="py-16 border-t border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-8 rounded-2xl bg-elevated/50 border border-border">
            <div>
              <h3 className="text-lg font-bold text-foreground">Ready to test Viraam live?</h3>
              <p className="text-xs text-muted mt-1">
                Explore the SecOps workspace or simulate digital arrest scenarios.
              </p>
            </div>
            <Button
              variant="amber"
              size="md"
              onClick={() => navigate('/workspace')}
              className="gap-2 shrink-0"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Viraam</span>
              <span>•</span>
              <span>Pause the panic. Protect the payment.</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span>Prototype for Hackathon</span>
              <span>•</span>
              <span className="text-amber-pause">Synthetic Simulation Environment</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
