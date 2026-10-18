import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, KeySquare, UserMinus, XCircle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { api } from '../../lib/api';
import { useAction } from '../../lib/directory';
import { relativeTime } from '../../lib/time';
import type { CreatedInvite, Establishment, Member } from '../../lib/types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog, Dialog } from '../ui/Dialog';
import { SelectInput, TextInput } from '../ui/Field';
import { Card, CardHeader } from '../ui/Layout';
import { CodeDialog } from './CodeDialog';

export const EstablishmentAccessCard = ({ establishment }: { establishment: Establishment }) => {
  const client = useQueryClient();
  const key = ['establishment-access', establishment.id];
  const query = useQuery({ queryKey: key, queryFn: () => api.establishmentAccess(establishment.id) });
  const refresh = () => client.invalidateQueries({ queryKey: key });

  const [inviting, setInviting] = useState(false);
  const [form, setForm] = useState({ role: 'Owner' as 'Owner' | 'Staff', name: establishment.proprietorName, phone: establishment.phone });
  const [created, setCreated] = useState<CreatedInvite | null>(null);
  const [removing, setRemoving] = useState<Member | null>(null);
  const [resetting, setResetting] = useState<Member | null>(null);
  const { isSuperAdmin } = useAuth();

  const invite = useAction(() => api.inviteToEstablishment(establishment.id, form), {
    onDone: result => {
      setInviting(false);
      setCreated(result);
      refresh();
    }
  });
  const revoke = useAction((id: string) => api.revokeInvitation(id), { success: 'Code cancelled', onDone: refresh });
  const remove = useAction((member: Member) => api.removeMember(establishment.id, member.id), {
    success: (_, m) => `${m.name} can no longer manage ${establishment.name}`,
    onDone: () => {
      setRemoving(null);
      refresh();
    }
  });

  const hasOwner = query.data?.members.some(m => m.role === 'Owner');

  return (
    <Card>
      <CardHeader
        title="Partner access"
        description={hasOwner ? 'People who can update this place from the Partner app.' : 'Hand this place over so the owner can keep doctors and timing up to date.'}
      />
      <div className="px-5 pb-4 space-y-3">
        {query.isLoading && <p className="text-sm text-slate-500">Loading…</p>}
        {query.error && <p className="text-sm text-rose-700">{query.error.message}</p>}
        {query.data?.members.map(m => (
          <div key={m.id} className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {m.name} <Badge tone={m.role === 'Owner' ? 'teal' : 'slate'}>{m.role}</Badge>
              </p>
              <p className="text-xs text-slate-500 truncate">
                {m.phone} · active {relativeTime(m.lastActive)}
              </p>
            </div>
            {isSuperAdmin && (
              <Button variant="ghost" size="icon" aria-label={`Set password for ${m.name}`} onClick={() => setResetting(m)}>
                <KeySquare className="w-4 h-4" />
              </Button>
            )}
            <Button variant="danger-ghost" size="icon" aria-label={`Remove ${m.name}`} onClick={() => setRemoving(m)}>
              <UserMinus className="w-4 h-4" />
            </Button>
          </div>
        ))}
        {query.data?.invitations.map(i => (
          <div key={i.id} className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">{i.name}</p>
              <p className="text-xs text-amber-800">{i.role === 'Owner' ? 'Owner' : 'Counter staff'} code not used yet</p>
              <p className="text-xs text-amber-800">Expires {new Date(i.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Cancel code" loading={revoke.isPending && revoke.variables === i.id} onClick={() => revoke.mutate(i.id)}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button
          variant={hasOwner ? 'outline' : 'primary'}
          size="sm"
          icon={<KeyRound className="w-3.5 h-3.5" />}
          onClick={() => {
            setForm(f => ({ ...f, role: hasOwner ? 'Staff' : 'Owner' }));
            setInviting(true);
          }}
        >
          {hasOwner ? 'Add another person' : query.data?.invitations.some(i => i.role === 'Owner') ? 'Create another code' : 'Give access to the owner'}
        </Button>
      </div>

      <Dialog
        open={inviting}
        onClose={() => setInviting(false)}
        title={`Give access to ${establishment.name}`}
        description="Creates a one-time code. Only share it after confirming you are talking to the right person."
        footer={
          <>
            <Button variant="outline" onClick={() => setInviting(false)}>
              Cancel
            </Button>
            <Button loading={invite.isPending} disabled={form.name.trim().length < 2 || form.phone.trim().length < 10} onClick={() => invite.mutate(undefined)}>
              Create code
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <SelectInput label="Access" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'Owner' | 'Staff' })} hint={form.role === 'Owner' ? 'Can update everything here and add their own counter staff.' : 'Can update doctors and timing, but not manage people.'}>
            <option value="Owner">Owner</option>
            <option value="Staff">Counter staff</option>
          </SelectInput>
          <TextInput label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <TextInput label="Phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
        </div>
      </Dialog>
      {resetting && <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />}
      {created && <CodeDialog invite={created} audience={`to manage ${establishment.name}`} onClose={() => setCreated(null)} />}
      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && remove.mutate(removing)}
        loading={remove.isPending}
        title={`Remove ${removing?.name}?`}
        description="They will be signed out of this establishment straight away. Doctors and timing they entered stay as they are."
        confirmLabel="Remove access"
      />
    </Card>
  );
};
