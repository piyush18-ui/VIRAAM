import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Search,
  Download,
  Filter,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Pause,
  Clock,
  KeyRound
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatTimeAgo } from '../../lib/utils';
import type { AuditEventModel } from '../../lib/types';

export function AuditLedger() {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const { data: auditEvents } = useQuery({
    queryKey: ['auditEvents', filterAction],
    queryFn: () => api.getAuditEvents(undefined, filterAction === 'all' ? undefined : filterAction),
    refetchInterval: 5000,
  });

  const defaultEvents: AuditEventModel[] = [
    {
      id: 'aud_da_01',
      ts: new Date(Date.now() - 300000).toISOString(),
      actor: 'Viraam Engine',
      action: 'HOLD_CREATED',
      case_id: 'case_da_classic_01',
      detail: { hold_duration: 30, consent_given: true, tx_id: 'tx_da_1042', amount: 485000 },
    },
    {
      id: 'aud_da_02',
      ts: new Date(Date.now() - 280000).toISOString(),
      actor: 'system',
      action: 'COSIGN_CHALLENGE_CREATED',
      case_id: 'case_da_classic_01',
      detail: { family_contact: 'Priya Verma', safe_phrase_hash: '3e9a...f812' },
    },
    {
      id: 'aud_da_03',
      ts: new Date(Date.now() - 150000).toISOString(),
      actor: 'Lead Investigator',
      action: 'FREEZE_PLAN_EXECUTED',
      case_id: 'case_da_classic_01',
      detail: { target_accounts: ['MULE_L1_01', 'MULE_L2_01'], recovered_amount: 455900 },
    },
    {
      id: 'aud_da_04',
      ts: new Date(Date.now() - 3600000).toISOString(),
      actor: 'Viraam Engine',
      action: 'TX_PASSED_LEGIT',
      case_id: undefined,
      detail: { tx_id: 'tx_legit_250k', risk_score: 22.4, band: 'low' },
    },
    {
      id: 'aud_da_05',
      ts: new Date(Date.now() - 7200000).toISOString(),
      actor: 'User Authorization',
      action: 'HOLD_RELEASED',
      case_id: 'case_res_03',
      detail: { hold_id: 'hld_392', reason: 'User confirmed legitimate property token advance' },
    },
  ];

  const events = auditEvents && auditEvents.length > 0 ? auditEvents : defaultEvents;

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.action.toLowerCase().includes(search.toLowerCase()) ||
      (e.case_id && e.case_id.toLowerCase().includes(search.toLowerCase())) ||
      e.actor.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterAction === 'all' || e.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Action', 'Case ID', 'Details'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.ts,
      e.actor,
      e.action,
      e.case_id || 'N/A',
      JSON.stringify(e.detail).replace(/"/g, '""'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => `"${r.join('","')}"`)].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `viraam_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Policy-ready Design Banner */}
      <div className="p-4 rounded-card border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-pause flex items-center justify-center text-black shrink-0 font-bold">
            <ShieldCheck className="w-5 h-5 fill-black" />
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-bold text-foreground">
              Policy-Ready Architecture: Consent-Based, Time-Limited, Fully Audited
            </h3>
            <p className="text-[11px] text-muted mt-0.5">
              Every hold, co-sign check, and freeze operation is immutably logged with actor
              attribution, ready for statutory bank compliance.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          className="gap-2 shrink-0 text-xs bg-surface"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, case..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-elevated/70 border border-border rounded-lg text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-amber-pause"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-elevated/80 p-1 rounded-lg border border-border overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'All' },
            { id: 'HOLD_CREATED', label: 'Holds' },
            { id: 'COSIGN_CHALLENGE_CREATED', label: 'Co-Signs' },
            { id: 'FREEZE_PLAN_EXECUTED', label: 'Freezes' },
            { id: 'HOLD_RELEASED', label: 'Releases' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all select-none ${
                filterAction === f.id
                  ? 'bg-surface text-foreground shadow-sm font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Events Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elevated/60 text-muted border-b border-border text-[11px] uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Case Linked</th>
                <th className="py-3 px-4">Detail Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEvents.map((e) => (
                <tr key={e.id} className="hover:bg-elevated/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-muted text-[11px]">{e.id}</td>
                  <td className="py-3 px-4 font-mono text-muted text-[11px]">
                    {new Date(e.ts).toLocaleTimeString()} ({formatTimeAgo(e.ts)})
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">{e.actor}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        e.action.includes('HOLD')
                          ? 'bg-amber-500/15 text-amber-pause border border-amber-500/30'
                          : e.action.includes('FREEZE')
                          ? 'bg-red-500/15 text-danger border border-red-500/30'
                          : e.action.includes('COSIGN')
                          ? 'bg-blue-500/15 text-info border border-blue-500/30'
                          : 'bg-emerald-500/15 text-safe border border-emerald-500/30'
                      }`}
                    >
                      {e.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-foreground font-semibold">
                    {e.case_id || '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-muted max-w-xs truncate">
                    {JSON.stringify(e.detail)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
