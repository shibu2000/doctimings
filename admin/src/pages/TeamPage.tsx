import { useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, UserPlus } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { STAFF_ROLES } from '../lib/constants';
import { useToast } from '../components/ui/Toast';
import { relativeTime } from '../lib/time';
import type { Role, User } from '../lib/types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { SelectInput, TextInput } from '../components/ui/Field';
import { Card, LoadError, Loading, PageHeader, Segmented } from '../components/ui/Layout';

const ROLE_HELP: Record<string, string> = {
  'Super Admin': 'Everything, including team members',
  'Operations Admin': 'Doctors, places, reports, deletes',
  'District Lead': 'Doctors, places, reports, deletes',
  Verifier: 'Doctors, places, reports, deletes',
  Staff: 'Add and update doctors, places and timing'
};

const useTeamAction = <T,>(fn: (input: T) => Promise<unknown>, message: string, onDone?: () => void) => {
  const client = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const run = async (input: T) => {
    setPending(true);
    try {
      await fn(input);
      await client.invalidateQueries({ queryKey: ['users'] });
      toast.success(message);
      onDone?.();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPending(false);
    }
  };
  return { run, pending };
};

const AddPersonDialog = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'Staff' as Role });
  const set = (key: keyof typeof form, value: string) => setForm(f => ({ ...f, [key]: value }));
  const create = useTeamAction(api.createUser, `${form.name || 'Team member'} can now sign in`, onClose);
  const valid = form.name.trim().length > 1 && /\S+@\S+/.test(form.email) && form.phone.trim().length >= 10 && form.password.length >= 8;

  return (
    <Dialog
      open
      onClose={onClose}
      title="Add team member"
      description="Share the email and temporary password with them in person or on a call."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!valid} loading={create.pending} onClick={() => create.run(form)}>
            Add person
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <TextInput label="Name" value={form.name} onChange={e => set('name', e.target.value)} />
        <TextInput label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
        <TextInput label="Phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
        <TextInput label="Temporary password" value={form.password} onChange={e => set('password', e.target.value)} hint="At least 8 characters" />
        <SelectInput label="Access" value={form.role} onChange={e => set('role', e.target.value)} hint={ROLE_HELP[form.role]}>
          {STAFF_ROLES.map(r => (
            <option key={r}>{r}</option>
          ))}
        </SelectInput>
      </div>
    </Dialog>
  );
};

const ResetPasswordDialog = ({ user, onClose }: { user: User; onClose: () => void }) => {
  const [password, setPassword] = useState('');
  const reset = useTeamAction((p: string) => api.updateUser(user.id, { password: p }), 'Password changed', onClose);
  return (
    <Dialog
      open
      onClose={onClose}
      title={`New password for ${user.name}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={password.length < 8} loading={reset.pending} onClick={() => reset.run(password)}>
            Set password
          </Button>
        </>
      }
    >
      <TextInput label="New password" value={password} onChange={e => setPassword(e.target.value)} hint="At least 8 characters" />
    </Dialog>
  );
};

const People = () => {
  const { user: me, isSuperAdmin } = useAuth();
  const query = useQuery({ queryKey: ['users'], queryFn: api.users });
  const [adding, setAdding] = useState(false);
  const [resetting, setResetting] = useState<User | null>(null);
  const update = useTeamAction(({ id, input }: { id: string; input: Parameters<typeof api.updateUser>[1] }) => api.updateUser(id, input), 'Saved');

  if (query.error) return <LoadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <Loading />;
  const team = query.data.filter(u => (STAFF_ROLES as readonly string[]).includes(u.role));

  return (
    <Card>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <p className="text-sm text-slate-500">{team.length} people can sign in to this panel</p>
        {isSuperAdmin && (
          <Button size="sm" icon={<UserPlus className="w-3.5 h-3.5" />} onClick={() => setAdding(true)}>
            Add person
          </Button>
        )}
      </div>
      <ul className="divide-y divide-slate-100 border-t border-slate-100">
        {team.map(u => (
          <li key={u.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <div className="flex-1 min-w-48">
              <p className="text-sm font-medium text-slate-900">
                {u.name} {u.id === me?.id && <span className="text-slate-500 font-normal">(you)</span>}
              </p>
              <p className="text-sm text-slate-500">
                {u.email} · last active {relativeTime(u.lastActive)}
              </p>
            </div>
            {u.status === 'Suspended' && <Badge tone="red">Suspended</Badge>}
            {isSuperAdmin && u.id !== me?.id ? (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={u.role}
                  onChange={e => update.run({ id: u.id, input: { role: e.target.value as Role } })}
                  className="h-8 rounded-lg border border-slate-300 bg-white px-2 text-sm"
                  aria-label={`Access for ${u.name}`}
                >
                  {STAFF_ROLES.map(r => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <Button variant="ghost" size="sm" icon={<KeyRound className="w-3.5 h-3.5" />} onClick={() => setResetting(u)}>
                  Password
                </Button>
                <Button
                  variant={u.status === 'Active' ? 'danger-ghost' : 'secondary'}
                  size="sm"
                  onClick={() => update.run({ id: u.id, input: { status: u.status === 'Active' ? 'Suspended' : 'Active' } })}
                >
                  {u.status === 'Active' ? 'Suspend' : 'Reactivate'}
                </Button>
              </div>
            ) : (
              <Badge tone="teal">{u.role}</Badge>
            )}
          </li>
        ))}
      </ul>
      {adding && <AddPersonDialog onClose={() => setAdding(false)} />}
      {resetting && <ResetPasswordDialog user={resetting} onClose={() => setResetting(null)} />}
    </Card>
  );
};

const Activity = () => {
  const query = useInfiniteQuery({
    queryKey: ['activity'],
    queryFn: ({ pageParam }) => api.activity(pageParam),
    initialPageParam: 1,
    getNextPageParam: last => (last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined)
  });

  if (query.error) return <LoadError error={query.error} onRetry={() => query.refetch()} />;
  if (!query.data) return <Loading />;
  const logs = query.data.pages.flatMap(p => p.data);

  return (
    <Card>
      <ul className="divide-y divide-slate-100">
        {logs.map(l => (
          <li key={l.id} className="flex flex-wrap gap-x-4 gap-y-0.5 px-5 py-3">
            <span className="w-28 shrink-0 text-xs text-slate-500 pt-0.5">{relativeTime(l.timestamp)}</span>
            <span className="flex-1 min-w-56 text-sm text-slate-700">
              <span className="font-medium text-slate-900">{l.actorName}</span> {l.action.toLowerCase()}{' '}
              <span className="font-medium text-slate-900">{l.entityName}</span>
              {l.details && <span className="block text-xs text-slate-500">{l.details}</span>}
            </span>
          </li>
        ))}
      </ul>
      {query.hasNextPage && (
        <div className="p-4 border-t border-slate-100 text-center">
          <Button variant="outline" size="sm" loading={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>
            Show older
          </Button>
        </div>
      )}
    </Card>
  );
};

export const TeamPage = () => {
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<'people' | 'activity'>('people');

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Team & activity" />
        <Card className="max-w-lg p-5 text-sm text-slate-600">Only admins can see the team and activity log.</Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Team & activity" subtitle="Who can use the admin panel, and everything that was changed." />
      <div className="mb-4">
        <Segmented value={tab} onChange={setTab} options={[{ value: 'people', label: 'People' }, { value: 'activity', label: 'Activity' }]} />
      </div>
      {tab === 'people' ? <People /> : <Activity />}
    </>
  );
};
