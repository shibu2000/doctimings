import React, { useState } from 'react';
import {
  UserPlus,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  Phone,
  Clock
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminRole, AdminUser } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const UsersAccessPage: React.FC = () => {
  const { users, establishments, inviteUser, suspendUser, reactivateUser } = useAdmin();

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(users[0] || null);
  const [isInviteDrawerOpen, setIsInviteDrawerOpen] = useState(false);
  const [suspendTargetId, setSuspendTargetId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<AdminRole>('Operations Admin');
  const [scopedEstablishmentId, setScopedEstablishmentId] = useState('');

  const platformAdminsCount = users.filter(u => u.role === 'Platform Admin' || u.role === 'Operations Admin').length;
  const establishmentAdminsCount = users.filter(u => u.role === 'Establishment Admin').length;
  const pendingCount = users.filter(u => u.status === 'Pending').length;
  const suspendedCount = users.filter(u => u.status === 'Suspended').length;

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const scopedEst = establishments.find(e => e.id === scopedEstablishmentId);

    const newUser = await inviteUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+91 90000 00000',
      role,
      scopedEstablishmentId: role === 'Establishment Admin' ? scopedEstablishmentId : undefined,
      scopedEstablishmentName: role === 'Establishment Admin' ? scopedEst?.name : undefined,
      status: 'Pending'
    });

    setSelectedUser(newUser);
    setName('');
    setEmail('');
    setPhone('');
    setIsInviteDrawerOpen(false);
  };

  const roleOptions = [
    { value: 'Operations Admin', label: 'Operations Admin' },
    { value: 'Verification Admin', label: 'Verification Admin' },
    { value: 'Platform Admin', label: 'Platform Admin (Super)' },
    { value: 'Establishment Admin', label: 'Establishment Admin (Chamber Scoped)' }
  ];

  const establishmentOptions = [
    { value: '', label: 'Select chamber to isolate access...' },
    ...establishments.map(est => ({
      value: est.id,
      label: `${est.name} (${est.subDistrict})`
    }))
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Access Control</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage platform staff credentials, verification agents, and clinic counter management accounts.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsInviteDrawerOpen(true)}
        >
          Invite User
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Platform Admins</span>
            <ShieldCheck className="w-4 h-4 text-teal-700" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{platformAdminsCount}</span>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Full catalog and verification access</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Establishment Admins</span>
            <Building2 className="w-4 h-4 text-teal-700" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{establishmentAdminsCount}</span>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Chamber & chemist counter desks</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Pending Invites</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-xs font-bold text-amber-700">Awaiting PIN</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Awaiting phone activation</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Suspended</span>
            <Lock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold text-slate-900">{suspendedCount}</span>
            <span className="text-xs font-semibold text-slate-500">Disabled</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Access revoked via audit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Registered Accounts ({users.length})
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {users.map(u => (
              <div
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`p-4 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                  selectedUser?.id === u.id ? 'bg-teal-50/70 border-l-4 border-l-teal-700' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      u.avatarUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
                    }
                    alt={u.name}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      u.role === 'Platform Admin'
                        ? 'teal'
                        : u.role === 'Establishment Admin'
                        ? 'neutral'
                        : 'info'
                    }
                  >
                    {u.role}
                  </Badge>

                  <Badge
                    variant={
                      u.status === 'Active'
                        ? 'success'
                        : u.status === 'Pending'
                        ? 'warning'
                        : 'error'
                    }
                    hasDot
                  >
                    {u.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Inspected Account
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-1">{selectedUser?.name}</h3>
            <span className="text-xs text-teal-700 font-semibold">{selectedUser?.role}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{selectedUser?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono">{selectedUser?.phone}</span>
            </div>

            {selectedUser?.scopedEstablishmentName && (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Restricted Boundary</span>
                <span className="font-bold text-slate-900 block">{selectedUser.scopedEstablishmentName}</span>
                <span className="text-[10px] text-slate-500">Access strictly isolated to this chamber desk</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            {selectedUser?.status === 'Active' ? (
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => setSuspendTargetId(selectedUser.id)}
              >
                Suspend Account Access
              </Button>
            ) : selectedUser?.status === 'Suspended' ? (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => reactivateUser(selectedUser.id)}
              >
                Reactivate Account Access
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isInviteDrawerOpen}
        onClose={() => setIsInviteDrawerOpen(false)}
        title="Invite Administrative User"
        subtitle="Provision platform or chamber-scoped administrator access"
        maxWidth="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Priyanshu Chatterjee"
          />

          <Input
            label="Email Address (Directory ID)"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="name@doctimings.com"
          />

          <Input
            label="Mobile Phone"
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+91 94340 00000"
          />

          <Select
            label="Role Designation"
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
            options={roleOptions}
          />

          {role === 'Establishment Admin' && (
            <Select
              label="Scoped Establishment"
              required
              value={scopedEstablishmentId}
              onChange={e => setScopedEstablishmentId(e.target.value)}
              options={establishmentOptions}
            />
          )}

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Send Staff Invitation
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={Boolean(suspendTargetId)}
        onClose={() => setSuspendTargetId(null)}
        onConfirm={() => {
          if (suspendTargetId) suspendUser(suspendTargetId);
        }}
        title="Suspend User Access?"
        message="Are you sure you want to suspend this staff member? Their active session will terminate and they will be barred from signing in until an administrator reactivates the account."
        confirmLabel="Suspend User"
      />
    </div>
  );
};
