import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Search, Filter, ArrowUpRight, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrencyINR, formatTimeAgo, getBandBadgeColor } from '../../lib/utils';
import type { CaseSummary } from '../../lib/types';

export function CasesList() {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const { data: cases, isLoading } = useQuery({
    queryKey: ['casesList'],
    queryFn: api.getCases,
    refetchInterval: 5000,
  });

  // Seed default demonstration cases if DB is empty
  const defaultCases: CaseSummary[] = [
    {
      id: 'case_da_classic_01',
      victim_account: 'ACC_1042 (Ramesh Verma)',
      status: 'held',
      risk_score: 94.8,
      created_at: new Date(Date.now() - 480000).toISOString(),
      summary: 'Digital Arrest Coercion: Spoofed CBI caller forced ₹4,85,000 transfer under active AnyDesk screen share',
      amount: 485000,
      channel: 'UPI-Instant',
      to_account: 'MULE_L1_01',
      hold_active: true
    },
    {
      id: 'case_fi_nephew_02',
      victim_account: 'ACC_1055 (Sarla Gupta)',
      status: 'held',
      risk_score: 87.2,
      created_at: new Date(Date.now() - 1800000).toISOString(),
      summary: 'Family Impersonation: Urgent ₹95,000 bail extortion call claiming nephew arrested',
      amount: 95000,
      channel: 'IMPS',
      to_account: 'MULE_L1_03',
      hold_active: true
    },
    {
      id: 'case_res_03',
      victim_account: 'ACC_1079 (Deepak Patel)',
      status: 'resolved',
      risk_score: 84.1,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      summary: 'High-risk transfer released after family member confirmed legitimate business contract',
      amount: 220000,
      channel: 'NEFT',
      to_account: 'ACC_1099',
      hold_active: false
    }
  ];

  const displayedCases = (cases && cases.length > 0 ? cases : defaultCases).filter((c) => {
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    const matchesSearch =
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.victim_account.toLowerCase().includes(search.toLowerCase()) ||
      c.summary.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            Intervention Cases & Holds
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Active and archived cooling-off holds placed on suspected coerced transactions
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by case ID, account, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-elevated/70 border border-border rounded-lg text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-amber-pause"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto bg-elevated/80 p-1 rounded-lg border border-border">
          {['all', 'held', 'resolved', 'frozen'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all select-none ${
                filterStatus === status
                  ? 'bg-surface text-foreground shadow-sm font-semibold'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elevated/60 text-muted border-b border-border text-[11px] uppercase tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Victim Account</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayedCases.map((c) => {
                const band = c.risk_score >= 82 ? 'critical' : c.risk_score >= 65 ? 'high' : 'medium';
                const badgeColors = getBandBadgeColor(band);

                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/workspace/cases/${c.id}`)}
                    className="hover:bg-elevated/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-foreground group-hover:text-amber-pause">
                      {c.id}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{c.victim_account}</p>
                      <p className="text-[10px] text-muted line-clamp-1 max-w-xs">{c.summary}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {formatCurrencyINR(c.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold ${badgeColors.bg} ${badgeColors.text} border ${badgeColors.border}`}
                      >
                        {c.risk_score.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {c.status === 'held' ? (
                        <Badge variant="amber" className="gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>HELD</span>
                        </Badge>
                      ) : c.status === 'frozen' ? (
                        <Badge variant="danger" className="gap-1">
                          <span>FROZEN</span>
                        </Badge>
                      ) : (
                        <Badge variant="safe" className="gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>RESOLVED</span>
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted font-mono">
                      {formatTimeAgo(c.created_at)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-amber-pause hover:bg-amber-pause/10 gap-1 text-[11px]"
                      >
                        <span>View</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
