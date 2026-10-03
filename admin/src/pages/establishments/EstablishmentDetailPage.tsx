import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  Clock,
  Stethoscope,
  UserPlus,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

export const EstablishmentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { establishments, doctors, scheduleSlots, updateEstablishment, inviteUser } = useAdmin();
  const navigate = useNavigate();

  const establishment = establishments.find(e => e.id === id) || establishments[0];

  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [staffName, setStaffName] = useState(establishment?.proprietorName || '');
  const [staffEmail, setStaffEmail] = useState('chemist.counter@gmail.com');
  const [staffPhone, setStaffPhone] = useState(establishment?.phone || '');
  const [inviteSent, setInviteSent] = useState(false);

  if (!establishment) {
    return <div className="p-8 text-slate-500">Establishment not found.</div>;
  }

  const affiliatedDoctors = doctors.filter(d =>
    d.affiliatedEstablishmentIds.includes(establishment.id)
  );

  const establishmentSlots = scheduleSlots.filter(s => s.establishmentId === establishment.id);

  const handleSendOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    inviteUser({
      name: staffName,
      email: staffEmail,
      phone: staffPhone,
      role: 'Establishment Admin',
      scopedEstablishmentId: establishment.id,
      scopedEstablishmentName: establishment.name,
      status: 'Pending'
    });
    updateEstablishment(establishment.id, {
      accountStatus: 'Account Active'
    });
    setInviteSent(true);
    setTimeout(() => {
      setIsOnboardModalOpen(false);
      setInviteSent(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <span onClick={() => navigate('/establishments')} className="hover:text-teal-700 cursor-pointer">
              Establishments
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900">{establishment.name}</span>
          </nav>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{establishment.name}</h1>
            <Badge variant="success" hasDot>
              {establishment.verificationStatus}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Building2 className="w-3.5 h-3.5" />}
            onClick={() => navigate('/practice-locations')}
          >
            Practice Locations ({(establishment.practiceLocations || []).length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsOnboardModalOpen(true)}
          >
            Onboard Counter Staff
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Facility Metadata</span>
            <div className="text-xs space-y-1">
              <p className="font-bold text-slate-900 text-sm">{establishment.type}</p>
              <p className="font-mono text-slate-500">License: {establishment.licenseNumber}</p>
              <p className="text-slate-600">Proprietor: {establishment.proprietorName}</p>
              <p className="font-mono text-slate-600 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{establishment.phone}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Physical Address</span>
            <div className="text-xs space-y-1">
              <p className="text-slate-900 font-semibold">{establishment.address}</p>
              <p className="text-slate-600">{establishment.subDistrict}, {establishment.district} · PIN {establishment.pinCode}</p>
              <p className="font-mono text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3 text-slate-400" />
                <span>{establishment.latitude.toFixed(4)}, {establishment.longitude.toFixed(4)}</span>
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Governance & Security</span>
            <div className="text-xs space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Account:</span>
                <Badge variant={establishment.accountStatus === 'Account Active' ? 'success' : 'neutral'}>
                  {establishment.accountStatus}
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400">Rostered Practitioners: {affiliatedDoctors.length}</p>
              <p className="text-[11px] text-slate-400">Total Consultation Slots: {establishmentSlots.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span>Practitioner Sittings Roster</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Doctors conducting regular patient consultations at this facility.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/doctors')}
          >
            Attach Practitioner
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {affiliatedDoctors.map(doc => {
            const slots = establishmentSlots.filter(s => s.doctorId === doc.id);

            return (
              <div
                key={doc.id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{doc.fullName}</h3>
                      <p className="text-xs text-teal-700 font-medium">{doc.specialty}</p>
                    </div>
                    <Badge variant="success">Active Roster</Badge>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Customary Sittings
                    </span>
                    {slots.length > 0 ? (
                      slots.map(s => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <span className="font-bold text-slate-800">{s.dayOfWeek}</span>
                          <span className="font-mono text-teal-800 font-semibold">
                            {s.startTime} – {s.endTime}
                          </span>
                          <span className="text-[10px] text-slate-400">{s.roomNumber}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No schedule slots configured.</p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => navigate(`/doctors/${doc.id}`)}
                    className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    View Doctor Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/doctors/${doc.id}/schedule`)}
                    className="text-teal-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Practice Locations / Consultation Rooms</h3>
            <p className="text-xs text-slate-500">Rooms and consultation desks within this facility.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/practice-locations')}
            className="text-xs text-teal-700 hover:underline font-bold cursor-pointer"
          >
            Manage Practice Locations
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {(establishment.practiceLocations || []).length === 0 ? (
            <div className="sm:col-span-2 p-4 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-center">
              No rooms or consultation cabins configured yet for this establishment.
            </div>
          ) : (
            (establishment.practiceLocations || []).map(loc => (
              <div key={loc.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 block">{loc.name}</span>
                  <span className="text-slate-500 text-[11px]">{loc.roomDesignation} · {loc.floor}</span>
                </div>
                <Badge variant="teal">Active Site</Badge>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isOnboardModalOpen}
        onClose={() => setIsOnboardModalOpen(false)}
        title="Onboard Counter Staff"
        subtitle="Generate digital access for counter compounder or chemist"
        maxWidth="md"
      >
        {inviteSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900">Invitation Dispatched!</h4>
            <p className="text-xs text-emerald-700">
              Activation PIN and SMS invitation sent to <strong>{staffPhone}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendOnboarding} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate digital access for counter compounder or chemist to confirm doctor presence and log temporary schedule overrides.
            </p>

            <Input
              label="Staff Member Name"
              required
              value={staffName}
              onChange={e => setStaffName(e.target.value)}
            />

            <Input
              label="Email Address (Login ID)"
              type="email"
              required
              value={staffEmail}
              onChange={e => setStaffEmail(e.target.value)}
            />

            <Input
              label="Mobile Phone (for OTP / PIN)"
              type="tel"
              required
              value={staffPhone}
              onChange={e => setStaffPhone(e.target.value)}
            />

            <Input
              label="Assigned Role"
              disabled
              value="Establishment Admin (Restricted to this chamber)"
            />

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOnboardModalOpen(false)}
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
        )}
      </Modal>
    </div>
  );
};
