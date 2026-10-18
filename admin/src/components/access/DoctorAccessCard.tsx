import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, UserCheck, XCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { api } from '../../lib/api';
import { useAction } from '../../lib/directory';
import { relativeTime } from '../../lib/time';
import type { CreatedInvite, Doctor } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/Dialog';
import { Card, CardHeader } from '../ui/Layout';
import { CodeDialog } from './CodeDialog';

export const DoctorAccessCard = ({ doctor }: { doctor: Doctor }) => {
  const client = useQueryClient();
  const key = ['doctor-access', doctor.id];
  const query = useQuery({ queryKey: key, queryFn: () => api.doctorAccess(doctor.id) });
  const refresh = () => client.invalidateQueries({ queryKey: key });
  const [created, setCreated] = useState<CreatedInvite | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [resetting, setResetting] = useState(false);
  const { isSuperAdmin } = useAuth();

  const invite = useAction(() => api.inviteDoctor(doctor.id, {}), {
    onDone: result => {
      setCreated(result);
      refresh();
    }
  });
  const revoke = useAction((id: string) => api.revokeInvitation(id), { success: 'Code cancelled', onDone: refresh });
  const remove = useAction(() => api.removeDoctorAccount(doctor.id), {
    success: 'Account removed from this profile',
    onDone: () => {
      setConfirmRemove(false);
      refresh();
    }
  });

  const account = query.data?.account;
  const lastClaim = query.data?.claims[0];

  return (
    <Card>
      <CardHeader title="Doctor’s own account" />
      <div className="px-5 pb-4 space-y-3 text-sm">
        {query.isLoading && <p className="text-slate-500">Loading…</p>}
        {account ? (
          <>
            <p className="flex items-center gap-1.5 text-slate-800">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Claimed by {account.name}
            </p>
            <p className="text-xs text-slate-500">
              {account.email} · {account.phone} · since {relativeTime(account.createdAt)}
            </p>
            <p className="text-xs text-slate-500">The doctor can update their own leave and timing. Establishments can no longer edit this profile.</p>
            <div className="flex flex-wrap gap-2">
              {isSuperAdmin && (
                <Button variant="outline" size="sm" onClick={() => setResetting(true)}>
                  Set password
                </Button>
              )}
              <Button variant="danger-ghost" size="sm" onClick={() => setConfirmRemove(true)}>
                Remove account
              </Button>
            </div>
          </>
        ) : (
          query.data && (
            <>
              <p className="text-slate-600">Not claimed. The doctor can request it from the Partner app, or you can create a code for them.</p>
              {lastClaim && lastClaim.status !== 'completed' && (
                <p className="text-xs text-slate-500">
                  Last request: {lastClaim.claimantName} · <Badge tone={lastClaim.status === 'pending' ? 'amber' : 'slate'}>{lastClaim.status}</Badge>
                </p>
              )}
              {query.data.invitations.map(i => (
                <div key={i.id} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                  <span className="flex-1 text-xs text-amber-900">
                    Code for {i.name} not used yet · expires {new Date(i.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <Button variant="ghost" size="icon" aria-label="Cancel code" onClick={() => revoke.mutate(i.id)}>
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" icon={<KeyRound className="w-3.5 h-3.5" />} loading={invite.isPending} onClick={() => invite.mutate(undefined)}>
                {query.data.invitations.length ? 'Create a new code (cancels the old one)' : 'Create code for the doctor'}
              </Button>
              <p className="text-xs text-slate-500">Only share it after calling {doctor.primaryPhone || 'the doctor'} to confirm it’s really them.</p>
            </>
          )
        )}
      </div>
      {resetting && account && <ResetPasswordDialog user={account} onClose={() => setResetting(false)} />}
      {created && <CodeDialog invite={created} audience="to claim their profile" onClose={() => setCreated(null)} />}
      <ConfirmDialog
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
        onConfirm={() => remove.mutate(undefined)}
        loading={remove.isPending}
        title="Remove the doctor’s account?"
        description="They will be signed out and can no longer change this profile. Use this if the wrong person claimed it."
        confirmLabel="Remove account"
      />
    </Card>
  );
};
