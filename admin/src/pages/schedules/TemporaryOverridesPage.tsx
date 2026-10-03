import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  Plus,
  AlertTriangle,
  Shield,
  CalendarClock,
  Info
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { OverrideType, DayOfWeek } from '../../types';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

const REASON_CHIPS = [
  'Personal Leave',
  'Attending Medical Conference',
  'Public Holiday',
  'Hospital Emergency Duty',
  'Establishment Closed',
  'Weather / Travel Delay'
];

export const TemporaryOverridesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { doctors, overrides, addOverride, removeOverride } = useAdmin();
  const navigate = useNavigate();

  const doctor = doctors.find(d => d.id === id) || doctors[0];
  const doctorOverrides = overrides.filter(o => o.doctorId === doctor?.id);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [targetDate, setTargetDate] = useState('2026-09-28');
  const [overrideType, setOverrideType] = useState<OverrideType>('unavailable');
  const [newStartTime, setNewStartTime] = useState('06:00 PM');
  const [newEndTime, setNewEndTime] = useState('08:00 PM');
  const [publicReason, setPublicReason] = useState('Personal leave / Attending medical conference');
  const [internalNote, setInternalNote] = useState('Informed by pharmacist via telephone at 10:30 AM.');

  if (!doctor) {
    return <div className="p-8 text-slate-500">Doctor not found.</div>;
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dateObj = new Date(targetDate);
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[dateObj.getDay()];

    addOverride({
      doctorId: doctor.id,
      establishmentId: doctor.affiliatedEstablishmentIds[0] || 'EST-BWN-842',
      date: targetDate,
      dayOfWeek,
      overrideType,
      standardShift: '5:00 PM – 8:00 PM (Chamber 1)',
      newStartTime: overrideType !== 'unavailable' ? newStartTime : undefined,
      newEndTime: overrideType !== 'unavailable' ? newEndTime : undefined,
      publicReason: publicReason.trim() || 'Temporary schedule change',
      internalNote: internalNote.trim(),
      reportedBy: 'Operations Admin'
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-2 text-xs text-slate-500">
            <span onClick={() => navigate('/doctors')} className="hover:text-teal-700 cursor-pointer">
              Doctors
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span onClick={() => navigate(`/doctors/${doctor.id}`)} className="hover:text-teal-700 cursor-pointer">
              {doctor.fullName}
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-900">Temporary Changes</span>
          </nav>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Temporary Schedule Changes</h1>
            <Badge variant="neutral">Doc ID: {doctor.id}</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Manage date-specific exceptions and temporary overrides to this doctor's regular recurring schedule.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/doctors/${doctor.id}/schedule`)}
          >
            Regular Schedule
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Temporary Change
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={
                doctor.photoUrl ||
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
              }
              alt={doctor.fullName}
              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900">{doctor.fullName}</span>
                <Badge variant="success">{doctor.registrationNumber}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {doctor.specialty} · Clinical ({doctor.experienceYears} Years Experience)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs">
            <span className="text-slate-500 uppercase text-[10px] font-bold">Standard Weekly Routine:</span>
            <span className="font-semibold text-slate-800">Mon, Wed, Fri (5:00 PM – 8:00 PM)</span>
          </div>
        </div>

        <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-2.5 text-xs text-teal-900">
          <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold">Location-Scoped Exception:</strong> Changes applied here apply exclusively to the selected chamber and do not alter verified schedules at other affiliated chambers.
          </p>
        </div>
      </div>

      <div className="bg-teal-50/60 rounded-xl p-4 border border-teal-200/80 flex items-start gap-3 shadow-2xs">
        <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">Override Precedence Protocol</h3>
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-white text-teal-800 border border-teal-200">
              Rule #SCH-09
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            <strong>Precedence Rule:</strong> Temporary changes are date-specific exceptions taking strict precedence over the recurring weekly schedule on that exact date. At 11:59 PM on the selected date, the override automatically expires and the regular schedule restores seamlessly.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Upcoming Temporary Overrides</h2>
            <Badge variant="teal">{doctorOverrides.length} Active</Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Date & Day</th>
                <th className="py-3 px-4">Standard Shift</th>
                <th className="py-3 px-4">Temporary Override</th>
                <th className="py-3 px-4">Reason / Patient Notice</th>
                <th className="py-3 px-4">Audit & Source</th>
                <th className="py-3 px-4 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {doctorOverrides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                    No active temporary schedule overrides for this practitioner.
                  </td>
                </tr>
              ) : (
                doctorOverrides.map(ovr => (
                  <tr key={ovr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm">{ovr.date}</div>
                      <div className="text-[11px] text-slate-400">{ovr.dayOfWeek}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {ovr.standardShift}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          ovr.overrideType === 'unavailable'
                            ? 'error'
                            : ovr.overrideType === 'changed'
                            ? 'warning'
                            : 'info'
                        }
                        hasDot
                      >
                        {ovr.overrideType === 'unavailable'
                          ? 'Unavailable (Cancelled)'
                          : `${ovr.overrideType}: ${ovr.newStartTime} - ${ovr.newEndTime}`}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800">{ovr.publicReason}</div>
                      <div className="text-[11px] text-slate-400 truncate italic mt-0.5">
                        {ovr.internalNote}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{ovr.reportedBy}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{ovr.createdAt.slice(0, 10)}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right pr-4">
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(ovr.id)}
                        className="text-red-600 hover:underline font-bold cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Date-Specific Temporary Override"
        subtitle="Manage single-day exceptions taking precedence over standard schedule"
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Date"
              type="date"
              required
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Override Type</label>
              <div className="grid grid-cols-3 gap-1">
                {(['unavailable', 'changed', 'additional'] as OverrideType[]).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOverrideType(type)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg capitalize transition-colors cursor-pointer ${
                      overrideType === type
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {overrideType !== 'unavailable' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <Input
                label="New Session Start Time"
                value={newStartTime}
                onChange={e => setNewStartTime(e.target.value)}
                placeholder="e.g. 06:00 PM"
              />
              <Input
                label="New Session End Time"
                value={newEndTime}
                onChange={e => setNewEndTime(e.target.value)}
                placeholder="e.g. 08:00 PM"
              />
            </div>
          ) : (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-200 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                Full session cancellation. Regular shift will be hidden on public patient discovery.
              </span>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Patient-Facing Reason</label>
            <div className="flex flex-wrap gap-1.5">
              {REASON_CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setPublicReason(chip)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    publicReason === chip
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <Input
              required
              value={publicReason}
              onChange={e => setPublicReason(e.target.value)}
              placeholder="e.g. Attending medical conference"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Internal Audit Note</label>
            <textarea
              rows={2}
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
              placeholder="Record channel details (e.g. phone call with chemist)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              Save Temporary Change
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) removeOverride(deleteTargetId);
        }}
        title="Remove Temporary Schedule Change?"
        message="Are you sure you want to remove this temporary override? The doctor's normal weekly recurring schedule will automatically apply again on public search."
        confirmLabel="Remove Override"
      />
    </div>
  );
};
