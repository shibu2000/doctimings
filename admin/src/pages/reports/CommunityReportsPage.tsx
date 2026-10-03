import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flag,
  Download,
  Search,
  FilterX,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  Eye
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { ReportStatus, ReportIssueType } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const CommunityReportsPage: React.FC = () => {
  const { reports } = useAdmin();
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewCount = reports.filter(r => r.status === 'review').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const rejectedCount = reports.filter(r => r.status === 'rejected').length;

  const filteredReports = useMemo(() => {
    return reports.filter(rpt => {
      const matchesStatus = statusFilter === 'all' || rpt.status === statusFilter;
      const matchesType = issueTypeFilter === 'all' || rpt.issueType === issueTypeFilter;
      const matchesSearch =
        rpt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.establishmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.issueTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.userQuote.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rpt.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesType && matchesSearch;
    });
  }, [reports, statusFilter, issueTypeFilter, searchQuery]);

  const exportCsv = () => {
    const headers = ['Report ID', 'Signal Ref', 'Doctor', 'Establishment', 'Issue', 'Quote', 'Timestamp', 'Status'];
    const rows = filteredReports.map(r => [
      r.id,
      r.signalRef,
      `"${r.doctorName}"`,
      `"${r.establishmentName}"`,
      `"${r.issueTitle}"`,
      `"${r.userQuote}"`,
      `"${r.observedTimestamp}"`,
      r.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `community-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setIssueTypeFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-wider mb-1">
            <span>Healthcare Catalog</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-teal-700 font-semibold">Community Reports Queue</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review reported discrepancies and keep healthcare information accurate through telephonic ground audits.
          </p>
        </div>

        <button
          onClick={exportCsv}
          type="button"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs self-start md:self-auto cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
              Action Required
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <p className="text-xs text-slate-500 mt-0.5">Needs initial assessment</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Oldest: 3h 12m</span>
            <span className="text-amber-700 font-semibold">Triage queue</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Under Review</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
              In Progress
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-blue-700">{reviewCount + 8}</span>
            <p className="text-xs text-slate-500 mt-0.5">Desk/field checks underway</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Assigned to 3 agents</span>
            <span className="text-blue-700 font-semibold">Desk audit</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved</span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">{resolvedCount + 140}</span>
            <p className="text-xs text-slate-500 mt-0.5">Verified & updated</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>+19 this week</span>
            <span className="text-emerald-700 font-semibold">Record updated</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rejected</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              Discarded
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-600">{rejectedCount + 28}</span>
            <p className="text-xs text-slate-500 mt-0.5">Unverifiable or duplicates</p>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Audit trace kept</span>
            <span className="text-slate-500 font-semibold">No record change</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Reports ({reports.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'pending' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setStatusFilter('review')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'review' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Under Review ({reviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'resolved' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 'rejected' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rejected ({rejectedCount})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>Zero PII Policy: Canonical operational tags only</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="md:col-span-6">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search reports by doctor name, establishment, or message..."
              icon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="md:col-span-4">
            <Select
              value={issueTypeFilter}
              onChange={e => setIssueTypeFilter(e.target.value)}
              options={[
                { value: 'all', label: 'Issue Type: All Types' },
                { value: 'doc_unavailable', label: 'Doctor unavailable' },
                { value: 'sched_change', label: 'Schedule changed' },
                { value: 'no_longer_practices', label: 'No longer practices here' },
                { value: 'info_incorrect', label: 'Incorrect info' },
                { value: 'est_closed', label: 'Establishment closed' }
              ]}
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end">
            {(statusFilter !== 'all' || issueTypeFilter !== 'all' || searchQuery) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 p-2"
                title="Clear Filters"
              >
                <FilterX className="w-4 h-4" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Reported Issue & User Quote</th>
                <th className="py-3 px-4">Doctor & Establishment</th>
                <th className="py-3 px-4">Observed Time & Territory</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map(rpt => (
                <tr key={rpt.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono">
                    <span className="font-bold text-slate-900 block">{rpt.id}</span>
                    <span className="text-[10px] text-slate-400">{rpt.signalRef}</span>
                  </td>

                  <td className="py-3.5 px-4 max-w-sm">
                    <span className="font-bold text-slate-900 block">{rpt.issueTitle}</span>
                    <p className="text-[11px] text-slate-600 italic line-clamp-2 mt-0.5">
                      "{rpt.userQuote}"
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 block">{rpt.doctorName}</span>
                    <span className="text-[11px] text-slate-500 block truncate max-w-xs">{rpt.establishmentName}</span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="text-[11px] font-mono">{rpt.observedTimestamp}</div>
                    <div className="text-[10px] text-slate-400">{rpt.reporterTerritory}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        rpt.status === 'pending'
                          ? 'warning'
                          : rpt.status === 'review'
                          ? 'info'
                          : rpt.status === 'resolved'
                          ? 'success'
                          : 'neutral'
                      }
                      hasDot
                      pulse={rpt.status === 'pending'}
                      size="xs"
                    >
                      <span className="capitalize">{rpt.status}</span>
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 text-right pr-6">
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={<Eye className="w-3 h-3" />}
                      onClick={() => navigate(`/reports/${rpt.id}`)}
                    >
                      Investigate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
