import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Pause
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell
} from 'recharts';
import { api } from '../../lib/api';
import { useEventStream, StreamEventData } from '../../lib/useEventStream';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrencyINR, formatTimeAgo, getBandBadgeColor } from '../../lib/utils';

interface LiveTxItem {
  id: string;
  case_id?: string;
  from_account: string;
  to_account: string;
  amount: number;
  status: string;
  risk_score: number;
  band: string;
  ts: string;
}

export function CommandCenter() {
  const navigate = useNavigate();
  const [liveFeed, setLiveFeed] = useState<LiveTxItem[]>([
    {
      id: 'tx_init_1',
      case_id: 'case_da_demo',
      from_account: 'ACC_1042 (Ramesh V.)',
      to_account: 'MULE_L1_01',
      amount: 485000,
      status: 'held',
      risk_score: 94.2,
      band: 'critical',
      ts: new Date().toISOString()
    },
    {
      id: 'tx_init_2',
      from_account: 'ACC_1088',
      to_account: 'ACC_1120',
      amount: 250000,
      status: 'completed',
      risk_score: 22.4,
      band: 'low',
      ts: new Date(Date.now() - 45000).toISOString()
    },
    {
      id: 'tx_init_3',
      from_account: 'ACC_1015',
      to_account: 'ACC_1092',
      amount: 14000,
      status: 'completed',
      risk_score: 11.0,
      band: 'low',
      ts: new Date(Date.now() - 120000).toISOString()
    }
  ]);

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['overviewMetrics'],
    queryFn: api.getOverviewMetrics,
    refetchInterval: 10000,
  });

  const { data: cases } = useQuery({
    queryKey: ['casesList'],
    queryFn: api.getCases,
    refetchInterval: 6000,
  });

  // Listen to SSE feed events
  useEventStream((event: StreamEventData) => {
    if (event.type === 'transaction') {
      const d = event.data;
      const newItem: LiveTxItem = {
        id: d.id || `tx_${Math.random().toString(36).substring(7)}`,
        case_id: d.case_id,
        from_account: d.from_account,
        to_account: d.to_account,
        amount: d.amount,
        status: d.status || 'completed',
        risk_score: d.risk_score || 0,
        band: d.band || 'low',
        ts: event.ts
      };
      setLiveFeed((prev) => [newItem, ...prev.slice(0, 19)]);
    }
  });

  const distributionData = [
    { name: 'Low (<35)', count: 12450, color: '#3DD6C3' },
    { name: 'Medium (35-65)', count: 1420, color: '#7C9CFF' },
    { name: 'High (65-82)', count: 285, color: '#F5B84B' },
    { name: 'Critical (>82)', count: 125, color: '#FF5C6C' },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            SecOps Command Center
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time cross-silo screening of telecommunication metadata and UPI fund movements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/workspace/simulator')}
            className="gap-1.5 text-xs"
          >
            <span>Run Test Scenario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted">Transfers Screened</span>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground">
              {metrics?.transfers_screened?.toLocaleString() || '14,280'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-safe mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18.4% today</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted">Holds Placed</span>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-bold font-mono tracking-tight text-amber-pause">
              {metrics?.holds_placed?.toLocaleString() || '342'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-amber-pause mt-1">
              <Pause className="w-3 h-3 fill-amber-pause" />
              <span>Cooling-off active</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted">Loss Prevented</span>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-bold font-mono tracking-tight text-safe">
              {metrics ? formatCurrencyINR(metrics.estimated_loss_prevented) : '₹1.84 Cr'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-muted mt-1">
              <ShieldCheck className="w-3 h-3 text-safe" />
              <span>Golden-hour holds</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted">Median Time-to-Hold</span>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground">
              {metrics?.median_time_to_hold_sec ? `${metrics.median_time_to_hold_sec}s` : '1.4s'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-muted mt-1">
              <Clock className="w-3 h-3 text-info" />
              <span>Pre-settlement pause</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 col-span-2 md:col-span-1 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-muted">False Positive Rate</span>
          <div className="mt-2">
            <span className="text-xl md:text-2xl font-bold font-mono tracking-tight text-foreground">
              {metrics?.false_positive_rate ? `${(metrics.false_positive_rate * 100).toFixed(1)}%` : '3.2%'}
            </span>
            <div className="flex items-center gap-1 text-[10px] text-safe mt-1">
              <CheckCircle className="w-3 h-3" />
              <span>Legit transfer pass</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Grid: Live Feed (Left) & Active Alerts / Stats (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Live Transaction Screening Stream */}
        <Card className="lg:col-span-2 flex flex-col h-[520px]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Live Transaction Screening</CardTitle>
              <CardDescription>Real-time scoring feed from SSE event stream</CardDescription>
            </div>
            <Badge variant="amber" className="gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-pause" />
              LIVE
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-2 pr-2">
            {liveFeed.map((tx) => {
              const badgeColors = getBandBadgeColor(tx.band);
              return (
                <div
                  key={tx.id}
                  onClick={() => tx.case_id && navigate(`/workspace/cases/${tx.case_id}`)}
                  className={`p-3 rounded-lg border border-border bg-elevated/40 hover:bg-elevated/80 transition-all flex items-center justify-between gap-3 ${
                    tx.case_id ? 'cursor-pointer' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${badgeColors.bg} ${badgeColors.text} border ${badgeColors.border}`}
                    >
                      {tx.risk_score.toFixed(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground font-mono">
                          {tx.from_account} → {tx.to_account}
                        </span>
                        {tx.status === 'held' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-pause border border-amber-500/30">
                            HELD
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted mt-0.5">
                        <span>{formatTimeAgo(tx.ts)}</span>
                        <span>•</span>
                        <span className="capitalize">{tx.band} Risk</span>
                        {tx.case_id && (
                          <>
                            <span>•</span>
                            <span className="text-amber-pause flex items-center gap-0.5 font-medium">
                              Inspect Case <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-foreground">
                      {formatCurrencyINR(tx.amount)}
                    </p>
                    <p className="text-[10px] text-muted uppercase font-mono">{tx.status}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Column: Active Coercion Alerts & Band Chart */}
        <div className="space-y-6 flex flex-col">
          {/* Active Coercion Alerts */}
          <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-pause" />
                <span>Active Interventions</span>
              </CardTitle>
              <CardDescription>Cases requiring cooling-off or family co-sign</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-2 overflow-y-auto max-h-56">
              {(cases || []).filter((c) => c.status === 'held').length === 0 ? (
                <div className="text-center py-8 text-muted text-xs">
                  <ShieldCheck className="w-8 h-8 text-safe mx-auto mb-2 opacity-80" />
                  <span>No active holds pending. All transfers clear.</span>
                </div>
              ) : (
                (cases || [])
                  .filter((c) => c.status === 'held')
                  .slice(0, 4)
                  .map((c) => (
                    <div
                      key={c.id}
                      onClick={() => navigate(`/workspace/cases/${c.id}`)}
                      className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-pause font-mono">
                          {c.id}
                        </span>
                        <Badge variant="amber" size="sm">
                          {formatCurrencyINR(c.amount)}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-foreground font-medium mt-1 line-clamp-1">
                        {c.summary || 'Coerced transfer detected under active call'}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted mt-2">
                        <span>Victim: {c.victim_account}</span>
                        <span className="text-amber-pause font-semibold">Take Action →</span>
                      </div>
                    </div>
                  ))
              )}
            </CardContent>
          </Card>

          {/* Risk Band Distribution Chart */}
          <Card className="p-4">
            <h4 className="text-xs font-semibold text-foreground mb-1">
              Risk Band Distribution
            </h4>
            <p className="text-[10px] text-muted mb-3">All screened transfers last 24h</p>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#8B90A0' }}
                    axisLine={false}
                    tickLine={false}
                    width={90}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#161923',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
