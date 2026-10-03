import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AuditLogEntry } from '../../types';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  User, 
  Globe, 
  X,
  FileText,
  Building2,
  Stethoscope,
  CalendarCheck,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { formatTimestamp12h } from '../../utils/time';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('ALL');
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.actorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'ALL' || log.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const getEntityIcon = (type: AuditLogEntry['entityType']) => {
    switch (type) {
      case 'Doctor':
        return <Stethoscope className="w-3.5 h-3.5 text-teal-700" />;
      case 'Establishment':
        return <Building2 className="w-3.5 h-3.5 text-blue-700" />;
      case 'Schedule':
      case 'Override':
        return <CalendarCheck className="w-3.5 h-3.5 text-amber-700" />;
      case 'Report':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-700" />;
      case 'User':
        return <User className="w-3.5 h-3.5 text-purple-700" />;
      case 'Article':
        return <FileText className="w-3.5 h-3.5 text-indigo-700" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-700" />;
    }
  };

  const exportLogsAsJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `wimd_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Security & Compliance</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-teal-800">Immutable Audit Log</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped record of administrative interventions, clinic verifications, and schedule overrides.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportLogsAsJson}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Audit Trail (JSON)</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-96">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by admin name, action, target entity, or details..."
              icon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="w-48">
              <Select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                options={[
                  { value: 'ALL', label: 'All Entity Types' },
                  { value: 'Doctor', label: 'Doctors' },
                  { value: 'Establishment', label: 'Establishments' },
                  { value: 'Schedule', label: 'Schedules' },
                  { value: 'Override', label: 'Overrides' },
                  { value: 'Report', label: 'Community Reports' },
                  { value: 'User', label: 'Users' },
                  { value: 'Article', label: 'Health Guide' }
                ]}
              />
            </div>
            <Badge variant="teal" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5 text-teal-700" />}>
              Tamper Resistant
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Administrator / Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-slate-600 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTimestamp12h(log.timestamp)}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-semibold text-slate-900">{log.actorName}</p>
                      <p className="text-[10px] text-slate-500 font-medium">{log.actorRole}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-slate-50 border border-slate-200 flex items-center justify-center">
                        {getEntityIcon(log.entityType)}
                      </span>
                      <div>
                        <span className="font-bold text-slate-800">{log.entityType}</span>
                        <span className="text-[10px] text-slate-400 ml-1 font-mono">#{log.entityId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    {log.entityName}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedEntry(log)}
                      className="px-2.5 py-1 text-teal-800 hover:bg-teal-50 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No matching audit events</p>
                    <p className="text-[11px] text-slate-400">Refine search query or entity filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-800" />
                <h2 className="text-sm font-bold text-slate-900">Audit Record #{selectedEntry.id}</h2>
              </div>
              <button onClick={() => setSelectedEntry(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Actor</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEntry.actorName}</p>
                  <p className="text-[10px] text-slate-500">{selectedEntry.actorRole}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Timestamp</span>
                  <p className="font-mono text-slate-800 mt-0.5">{formatTimestamp12h(selectedEntry.timestamp)}</p>
                  <p className="text-[10px] text-slate-500">Asia/Kolkata (IST)</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Target Entity</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEntry.entityType} ({selectedEntry.entityId})</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Subject</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedEntry.entityName}</p>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">Action Summary</span>
                <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 font-medium">
                  {selectedEntry.action}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">Payload & Event Details</span>
                <div className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify({
                    eventId: selectedEntry.id,
                    timestamp: selectedEntry.timestamp,
                    actor: {
                      name: selectedEntry.actorName,
                      role: selectedEntry.actorRole
                    },
                    target: {
                      type: selectedEntry.entityType,
                      id: selectedEntry.entityId,
                      name: selectedEntry.entityName
                    },
                    action: selectedEntry.action,
                    details: selectedEntry.details
                  }, null, 2)}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedEntry(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-semibold"
                >
                  Close Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
