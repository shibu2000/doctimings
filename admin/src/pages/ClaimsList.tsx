import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Phone, ShieldQuestion, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { useAction } from '../lib/directory';
import { relativeTime } from '../lib/time';
import type { CreatedInvite, DoctorClaim } from '../lib/types';
import { CodeDialog } from '../components/access/CodeDialog';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TextInput } from '../components/ui/Field';
import { Card, EmptyState, LoadError, Loading } from '../components/ui/Layout';

const Check = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-medium ${ok ? 'text-emerald-700' : 'text-rose-700'}`}>
    {ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
    {label}
  </span>
);

const ClaimRow = ({ claim, onCode }: { claim: DoctorClaim; onCode: (invite: CreatedInvite) => void }) => {
  const client = useQueryClient();
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const review = useAction((decision: 'approve' | 'reject') => api.reviewClaim(claim.id, decision, note.trim() || undefined), {
    success: (_, decision) => (decision === 'approve' ? 'Claim approved' : 'Claim rejected'),
    onDone: result => {
      client.invalidateQueries({ queryKey: ['claims'] });
      if (result.invite) onCode(result.invite);
    }
  });
  const doctor = claim.doctor;

  return (
    <li className="px-5 py-4 space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {claim.claimantName} wants to manage{' '}
            {doctor ? (
              <Link to={`/doctors/${doctor.id}`} className="text-teal-700 hover:underline">
                {doctor.fullName}
              </Link>
            ) : (
              'a deleted profile'
            )}
          </p>
          <p className="text-sm text-slate-500">
            {relativeTime(claim.createdAt)} · {claim.phone}
            {claim.email && ` · ${claim.email}`}
          </p>
        </div>
        {claim.status !== 'pending' && <Badge tone={claim.status === 'rejected' ? 'red' : 'green'}>{claim.status}</Badge>}
      </div>
      {claim.message && <p className="text-sm text-slate-700">“{claim.message}”</p>}
      {doctor && claim.checks && (
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm space-y-1">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Check ok={claim.checks.registrationMatches} label={`Registration ${claim.registrationNumber} ${claim.checks.registrationMatches ? 'matches' : `≠ ${doctor.registrationNumber || 'not on record'}`}`} />
            <Check ok={claim.checks.phoneMatches} label={claim.checks.phoneMatches ? 'Phone matches the record' : 'Phone is different from the record'} />
          </div>
          {claim.status === 'pending' && (
            <p className="flex items-center gap-1.5 text-slate-600">
              <Phone className="w-3.5 h-3.5" />
              Before approving, call the number on record ({doctor.primaryPhone || 'none on record'}), not the number in the request.
            </p>
          )}
        </div>
      )}
      {claim.reviewNote && <p className="text-xs text-slate-500">Note: {claim.reviewNote}</p>}
      {claim.status === 'pending' && (
        <div className="flex flex-wrap gap-2 pt-1">
          {rejecting ? (
            <>
              <TextInput wrapperClassName="flex-1 min-w-56" autoFocus value={note} onChange={e => setNote(e.target.value)} placeholder="Reason (kept internal)" aria-label="Reason" />
              <Button variant="danger" className="h-10" loading={review.isPending} onClick={() => review.mutate('reject')}>
                Reject
              </Button>
              <Button variant="ghost" className="h-10" onClick={() => setRejecting(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" loading={review.isPending && review.variables === 'approve'} onClick={() => review.mutate('approve')}>
                I confirmed by phone, approve
              </Button>
              <Button variant="outline" size="sm" onClick={() => setRejecting(true)}>
                Reject
              </Button>
            </>
          )}
        </div>
      )}
    </li>
  );
};

export const ClaimsList = ({ status }: { status: 'pending' | 'all' }) => {
  const query = useQuery({ queryKey: ['claims', status], queryFn: () => api.claims(status) });
  const [code, setCode] = useState<CreatedInvite | null>(null);

  if (query.error) return <LoadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <Loading />;

  return (
    <Card>
      {query.data.length === 0 ? (
        <EmptyState icon={<ShieldQuestion className="w-10 h-10" />} title={status === 'pending' ? 'No profile claims waiting' : 'No profile claims yet'} />
      ) : (
        <ul className="divide-y divide-slate-100">
          {query.data.map(c => (
            <ClaimRow key={c.id} claim={c} onCode={setCode} />
          ))}
        </ul>
      )}
      {code && <CodeDialog invite={code} audience="to activate their doctor account" onClose={() => setCode(null)} />}
    </Card>
  );
};
