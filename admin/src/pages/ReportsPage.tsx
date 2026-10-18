import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MessageSquareWarning, Phone, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAction } from '../lib/directory';
import { REPORT_TYPES } from '../lib/constants';
import { relativeTime } from '../lib/time';
import type { Report } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/Field';
import { Card, EmptyState, LoadError, Loading, PageHeader, Segmented } from '../components/ui/Layout';
import { ClaimsList } from './ClaimsList';
import { useDirectory } from '../lib/directory';

type Tab = 'pending' | 'resolved' | 'rejected' | 'claims' | 'claims-all';

const ReportCard = ({ report }: { report: Report }) => {
  const client = useQueryClient();
  const [note, setNote] = useState('');
  const [resolving, setResolving] = useState(false);
  const refresh = () => client.invalidateQueries({ queryKey: ['reports'] });
  const update = useAction((status: Report['status']) => api.updateReport(report.id, status, note.trim() || undefined), {
    success: (_, status) => (status === 'resolved' ? 'Report marked as fixed' : 'Report dismissed'),
    onDone: refresh
  });

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900">{report.issueTitle}</p>
          <p className="text-sm text-slate-500">
            {REPORT_TYPES[report.issueType] ?? report.issueType} · {relativeTime(report.createdAt)} · {report.source}
          </p>
        </div>
        {report.severity === 'high' && <Badge tone="red">Urgent</Badge>}
        {report.status === 'resolved' && <Badge tone="green">Fixed</Badge>}
        {report.status === 'rejected' && <Badge>Dismissed</Badge>}
      </div>
      <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{report.description}</p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {report.doctorId && report.doctorName && (
          <Link to={`/doctors/${report.doctorId}`} className="font-medium text-teal-700 hover:underline">
            {report.doctorName}
          </Link>
        )}
        {report.establishmentId && report.establishmentName && (
          <Link to={`/establishments/${report.establishmentId}`} className="font-medium text-teal-700 hover:underline">
            {report.establishmentName}
          </Link>
        )}
        {report.reporterPhone && (
          <a href={`tel:${report.reporterPhone}`} className="inline-flex items-center gap-1 text-slate-600 hover:text-teal-700">
            <Phone className="w-3.5 h-3.5" />
            {report.reporterPhone}
          </a>
        )}
      </div>
      {report.resolutionNotes && <p className="mt-2 text-sm text-slate-500">Note: {report.resolutionNotes}</p>}
      {report.status === 'pending' &&
        (resolving ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <TextInput wrapperClassName="flex-1 min-w-56" autoFocus value={note} onChange={e => setNote(e.target.value)} placeholder="What did you change? (optional)" aria-label="Resolution note" />
            <Button className="h-10" loading={update.isPending && update.variables === 'resolved'} onClick={() => update.mutate('resolved')}>
              Mark fixed
            </Button>
            <Button variant="ghost" className="h-10" onClick={() => setResolving(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" icon={<Check className="w-3.5 h-3.5" />} onClick={() => setResolving(true)}>
              Fixed it
            </Button>
            <Button variant="outline" size="sm" icon={<X className="w-3.5 h-3.5" />} loading={update.isPending && update.variables === 'rejected'} onClick={() => update.mutate('rejected')}>
              Not a problem
            </Button>
          </div>
        ))}
    </li>
  );
};

export const ReportsPage = () => {
  const [tab, setTab] = useState<Tab>('pending');
  const isClaims = tab === 'claims' || tab === 'claims-all';
  const query = useQuery({ queryKey: ['reports', tab], queryFn: () => api.reports(tab), enabled: !isClaims });
  const { directory } = useDirectory();

  return (
    <>
      <PageHeader title="Reports & claims" subtitle="Problems patients reported, and doctors asking to manage their own profile." />
      <div className="mb-4">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: 'pending', label: 'Reports to check', count: directory?.pendingReports },
            { value: 'resolved', label: 'Fixed' },
            { value: 'rejected', label: 'Dismissed' },
            { value: 'claims', label: 'Profile claims', count: directory?.pendingClaims },
            { value: 'claims-all', label: 'Past claims' }
          ]}
        />
      </div>
      {isClaims ? (
        <ClaimsList status={tab === 'claims' ? 'pending' : 'all'} />
      ) : query.error ? (
        <LoadError error={query.error} onRetry={() => query.refetch()} />
      ) : !query.data ? (
        <Loading />
      ) : (
        <Card>
          {query.data.data.length === 0 ? (
            <EmptyState icon={<MessageSquareWarning className="w-10 h-10" />} title={tab === 'pending' ? 'Nothing to check' : 'No reports here yet'} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {query.data.data.map(r => (
                <ReportCard key={r.id} report={r} />
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
};
