import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  Node,
  Edge,
  Position,
  Handle
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ShieldAlert,
  GitFork,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  DollarSign
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrencyINR } from '../../lib/utils';
import type { FreezePlanItem, ExecutePlanResponse } from '../../lib/types';

// Custom Node for React Flow
function GraphCustomNode({ data }: { data: any }) {
  const isVictim = data.kind === 'victim';
  const isMule = data.kind === 'mule';
  const isCashout = data.kind === 'cashout';
  const isFrozen = data.frozen;

  const bgBorder = isVictim
    ? 'border-emerald-500/40 bg-emerald-500/5'
    : isMule
    ? isFrozen
      ? 'border-amber-pause bg-amber-pause/20 ring-2 ring-amber-pause'
      : 'border-amber-500/40 bg-amber-500/5'
    : 'border-red-500/40 bg-red-500/5';

  return (
    <div className={`p-3 rounded-xl border ${bgBorder} shadow-lg min-w-[170px] backdrop-blur-md`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-border" />
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-muted">
          {isVictim ? 'VICTIM' : isMule ? `MULE L${data.layer}` : 'CASHOUT'}
        </span>
        {isFrozen ? (
          <Badge variant="amber" size="sm" className="gap-1">
            <Lock className="w-2.5 h-2.5" />
            <span>FROZEN</span>
          </Badge>
        ) : (
          <span className="text-[10px] font-mono text-muted">{data.bank}</span>
        )}
      </div>
      <p className="text-xs font-bold text-foreground truncate">{data.label}</p>
      <div className="mt-2 pt-1.5 border-t border-border flex items-center justify-between text-[10px] font-mono">
        <span className="text-muted">Balance</span>
        <span className="font-semibold text-foreground">{formatCurrencyINR(data.balance)}</span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-border" />
    </div>
  );
}

const nodeTypes = {
  customNode: GraphCustomNode,
};

export function MoneyTrail() {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('case_id') || 'case_da_classic_01';
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutePlanResponse | null>(null);
  const [frozenNodes, setFrozenNodes] = useState<string[]>([]);

  // Fetch Graph
  const { data: graphData } = useQuery({
    queryKey: ['graph', caseId],
    queryFn: () => api.getGraph(caseId),
  });

  // Fetch Freeze Plan
  const { data: freezePlan, refetch: refetchPlan } = useQuery({
    queryKey: ['freezePlan', caseId],
    queryFn: () => api.getFreezePlan(caseId),
  });

  const executeMutation = useMutation({
    mutationFn: () => api.executeFreezePlan(caseId),
    onSuccess: (data) => {
      setExecutionResult(data);
      setFrozenNodes(data.frozen_accounts);
    },
  });

  // Build React Flow nodes
  const initialNodes: Node[] = [
    {
      id: 'ACC_1042',
      type: 'customNode',
      position: { x: 50, y: 150 },
      data: {
        label: 'Ramesh Verma (Victim)',
        kind: 'victim',
        layer: 0,
        bank: 'SBI',
        balance: 485000,
        frozen: false,
        age_days: 1420,
        velocity: 0.2,
      },
    },
    {
      id: 'MULE_L1_01',
      type: 'customNode',
      position: { x: 300, y: 150 },
      data: {
        label: 'Rohan Gupta (M1)',
        kind: 'mule',
        layer: 1,
        bank: 'HDFC Bank',
        balance: 485000,
        frozen: frozenNodes.includes('MULE_L1_01'),
        age_days: 4,
        velocity: 14.0,
      },
    },
    {
      id: 'MULE_L2_01',
      type: 'customNode',
      position: { x: 550, y: 60 },
      data: {
        label: 'Vikram Joshi (M2-A)',
        kind: 'mule',
        layer: 2,
        bank: 'ICICI Bank',
        balance: 240000,
        frozen: frozenNodes.includes('MULE_L2_01'),
        age_days: 18,
        velocity: 9.0,
      },
    },
    {
      id: 'MULE_L2_02',
      type: 'customNode',
      position: { x: 550, y: 240 },
      data: {
        label: 'Vikram Rao (M2-B)',
        kind: 'mule',
        layer: 2,
        bank: 'Axis Bank',
        balance: 245000,
        frozen: frozenNodes.includes('MULE_L2_02'),
        age_days: 22,
        velocity: 11.0,
      },
    },
    {
      id: 'MULE_L3_01',
      type: 'customNode',
      position: { x: 800, y: 60 },
      data: {
        label: 'Kunal Bhat (M3-A)',
        kind: 'mule',
        layer: 3,
        bank: 'Kotak Bank',
        balance: 195000,
        frozen: frozenNodes.includes('MULE_L3_01'),
        age_days: 35,
        velocity: 16.0,
      },
    },
    {
      id: 'CRYPTO_P2P_DESK_DELHI',
      type: 'customNode',
      position: { x: 1050, y: 60 },
      data: {
        label: 'Crypto P2P OTC Desk',
        kind: 'cashout',
        layer: 4,
        bank: 'Binance OTC',
        balance: 195000,
        frozen: false,
        age_days: 240,
        velocity: 45.0,
      },
    },
    {
      id: 'ATM_DISPERSAL_GRID_KOLKATA',
      type: 'customNode',
      position: { x: 1050, y: 240 },
      data: {
        label: 'ATM Cashout Grid',
        kind: 'cashout',
        layer: 4,
        bank: 'ATM Ring',
        balance: 200000,
        frozen: false,
        age_days: 310,
        velocity: 38.0,
      },
    },
  ];

  const initialEdges: Edge[] = [
    {
      id: 'e1',
      source: 'ACC_1042',
      target: 'MULE_L1_01',
      animated: true,
      style: { stroke: '#F5B84B', strokeWidth: 2 },
      label: '₹4,85,000',
      labelStyle: { fill: '#F5B84B', fontSize: 10, fontFamily: 'monospace' },
    },
    {
      id: 'e2',
      source: 'MULE_L1_01',
      target: 'MULE_L2_01',
      animated: true,
      style: { stroke: '#8B90A0', strokeWidth: 1.5 },
      label: '₹2,40,000',
      labelStyle: { fill: '#8B90A0', fontSize: 9, fontFamily: 'monospace' },
    },
    {
      id: 'e3',
      source: 'MULE_L1_01',
      target: 'MULE_L2_02',
      animated: true,
      style: { stroke: '#8B90A0', strokeWidth: 1.5 },
      label: '₹2,45,000',
      labelStyle: { fill: '#8B90A0', fontSize: 9, fontFamily: 'monospace' },
    },
    {
      id: 'e4',
      source: 'MULE_L2_01',
      target: 'MULE_L3_01',
      animated: true,
      style: { stroke: '#8B90A0', strokeWidth: 1.5 },
      label: '₹1,95,000',
      labelStyle: { fill: '#8B90A0', fontSize: 9, fontFamily: 'monospace' },
    },
    {
      id: 'e5',
      source: 'MULE_L3_01',
      target: 'CRYPTO_P2P_DESK_DELHI',
      animated: true,
      style: { stroke: '#FF5C6C', strokeWidth: 1.5 },
      label: '₹1,95,000 (Exit)',
      labelStyle: { fill: '#FF5C6C', fontSize: 9, fontFamily: 'monospace' },
    },
    {
      id: 'e6',
      source: 'MULE_L2_02',
      target: 'ATM_DISPERSAL_GRID_KOLKATA',
      animated: true,
      style: { stroke: '#FF5C6C', strokeWidth: 1.5 },
      label: '₹2,00,000 (Exit)',
      labelStyle: { fill: '#FF5C6C', fontSize: 9, fontFamily: 'monospace' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GitFork className="w-5 h-5 text-amber-pause" />
            <span>Golden-Hour Mule Tracing Graph</span>
          </h1>
          <p className="text-xs text-muted mt-0.5">
            NetworkX multi-hop propagation graph: Victim → Layer 1 Mule → Aggregators → Dispersal
          </p>
        </div>

        <Button
          variant="amber"
          size="sm"
          onClick={() => executeMutation.mutate()}
          disabled={executeMutation.isPending || frozenNodes.length > 0}
          className="gap-2 shadow-md"
        >
          <Zap className="w-3.5 h-3.5 fill-black" />
          <span>{frozenNodes.length > 0 ? 'Freeze Plan Executed' : 'Execute Freeze Plan'}</span>
        </Button>
      </div>

      {/* Interactive Graph Canvas */}
      <Card className="h-[440px] relative overflow-hidden">
        <ReactFlow
          nodes={initialNodes}
          edges={initialEdges}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node.data)}
          fitView
          className="bg-background"
        >
          <Background color="#8B90A0" gap={20} size={1} />
          <Controls className="!bg-elevated !border-border !text-foreground" />
        </ReactFlow>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute top-4 right-4 z-20 w-80 rounded-card border border-border bg-surface/95 backdrop-blur-md p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="amber" size="sm">
                Layer {selectedNode.layer} Account
              </Badge>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-xs text-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-bold text-foreground">{selectedNode.label}</h4>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted">Bank Institution</span>
                <span className="font-semibold text-foreground">{selectedNode.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Account Age</span>
                <span className="font-mono text-foreground">{selectedNode.age_days} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Inbound Velocity</span>
                <span className="font-mono text-danger font-semibold">
                  {selectedNode.velocity} txns/hr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Current Balance</span>
                <span className="font-mono font-bold text-foreground">
                  {formatCurrencyINR(selectedNode.balance)}
                </span>
              </div>
            </div>
            {selectedNode.kind === 'mule' && (
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-[10px] text-muted block mb-1 font-mono uppercase">
                  Predicted Next-Hop Probability
                </span>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span>Forward to Crypto OTC</span>
                    <span className="font-mono font-semibold text-amber-pause">84.2%</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>ATM Grid Withdrawal</span>
                    <span className="font-mono font-semibold text-muted">15.8%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Bottom Grid: Ranked Freeze Plan + With vs Without Viraam Recovery Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ranked Freeze Plan */}
        <Card className="lg:col-span-2 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <CardTitle className="text-base">Ranked Golden-Hour Freeze Plan</CardTitle>
              <CardDescription>
                Prioritized by E[Recoverable Amount] × P(Funds Present) × Urgency
              </CardDescription>
            </div>
            <Badge variant="amber">5 Candidates Identified</Badge>
          </div>

          <div className="space-y-2.5">
            {(freezePlan?.items || []).slice(0, 3).map((item, idx) => (
              <div
                key={item.account_id}
                className="p-3 rounded-lg border border-border bg-elevated/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-pause/20 text-amber-pause font-mono font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-foreground font-mono">
                      {item.holder_alias}
                    </span>
                    <span className="text-[10px] text-muted">({item.bank_alias})</span>
                  </div>
                  <p className="text-[11px] text-muted pl-7">{item.reason}</p>
                </div>
                <div className="text-right sm:shrink-0 pl-7 sm:pl-0">
                  <p className="text-xs font-bold font-mono text-safe">
                    {formatCurrencyINR(item.expected_recoverable_amount)}
                  </p>
                  <p className="text-[10px] text-muted font-mono">
                    P: {(item.probability_funds_present * 100).toFixed(0)}% · Window: {item.estimated_window_sec}s
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Dynamic With vs Without Viraam Recovery Comparison */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <CardTitle className="text-base">Simulated Recovery Outcome</CardTitle>
            <CardDescription className="mb-4">
              Golden-hour freeze vs delayed traditional complaint
            </CardDescription>

            <div className="space-y-3">
              {/* With Viraam */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] uppercase font-mono text-safe font-bold block">
                  With Viraam (Cooling-off + Freeze Plan)
                </span>
                <p className="text-xl font-bold font-mono text-safe mt-1">
                  {executionResult
                    ? formatCurrencyINR(executionResult.with_viraam_recovered)
                    : '₹4,55,900 (94.0%)'}
                </p>
                <p className="text-[10px] text-muted mt-1">
                  Mule Layer 1 & L2 aggregator holds placed in 1.4s
                </p>
              </div>

              {/* Without Viraam */}
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <span className="text-[10px] uppercase font-mono text-danger font-bold block">
                  Without Viraam (Traditional Post-Facto)
                </span>
                <p className="text-xl font-bold font-mono text-danger mt-1">
                  {executionResult
                    ? formatCurrencyINR(executionResult.without_viraam_recovered)
                    : '₹29,100 (6.0%)'}
                </p>
                <p className="text-[10px] text-muted mt-1">
                  Funds dispersed via ATM and Crypto OTC in 25 mins
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border text-[11px] text-muted font-mono flex items-center justify-between">
            <span>Differential Saved:</span>
            <span className="font-bold text-safe">
              {executionResult
                ? formatCurrencyINR(
                    executionResult.with_viraam_recovered - executionResult.without_viraam_recovered
                  )
                : '₹4,26,800'}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
