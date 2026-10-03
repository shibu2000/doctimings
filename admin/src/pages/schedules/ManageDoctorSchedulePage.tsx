import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ArrowLeft,
  Calendar,
  Building2,
  Clock,
  Plus,
  Save,
  CalendarClock,
  AlertCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { DayOfWeek, ScheduleSlot } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const ManageDoctorSchedulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { doctors, establishments, scheduleSlots, addScheduleSlot, updateScheduleSlot, deleteScheduleSlot } = useAdmin();
  const navigate = useNavigate();

  const doctor = doctors.find(d => d.id === id) || doctors[0];
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState(
    doctor?.affiliatedEstablishmentIds[0] || establishments[0]?.id || ''
  );

  const selectedEstablishment = establishments.find(e => e.id === selectedEstablishmentId);

  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>('Monday');
  const [startTime, setStartTime] = useState('05:00 PM');
  const [endTime, setEndTime] = useState('08:00 PM');
  const [shiftName, setShiftName] = useState('Evening Chamber');
  const [roomNumber, setRoomNumber] = useState('Room 1');
  const [tokenPolicy, setTokenPolicy] = useState('Tokens distributed at counter');
  const [maxTokens] = useState(25);

  const activeSlots = scheduleSlots.filter(
    s => s.doctorId === doctor?.id && s.establishmentId === selectedEstablishmentId
  );

  const handleEditClick = (slot: ScheduleSlot) => {
    setEditingSlotId(slot.id);
    setDayOfWeek(slot.dayOfWeek);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setShiftName(slot.shiftName);
    setRoomNumber(slot.roomNumber || 'Room 1');
    setTokenPolicy(slot.tokenPolicy || '');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor || !selectedEstablishmentId) return;

    if (editingSlotId) {
      updateScheduleSlot(editingSlotId, {
        dayOfWeek,
        startTime,
        endTime,
        shiftName,
        roomNumber,
        tokenPolicy,
        maxTokens
      });
      setEditingSlotId(null);
    } else {
      addScheduleSlot({
        doctorId: doctor.id,
        establishmentId: selectedEstablishmentId,
        practiceLocationId: selectedEstablishment?.practiceLocations[0]?.id || 'LOC-01',
        dayOfWeek,
        startTime,
        endTime,
        shiftName,
        roomNumber,
        tokenPolicy,
        maxTokens,
        isActive: true
      });
    }
  };

  const handleAddSlotForDay = (day: DayOfWeek) => {
    setEditingSlotId(null);
    setDayOfWeek(day);
    setStartTime('05:00 PM');
    setEndTime('08:00 PM');
    setShiftName('Evening Chamber');
    setRoomNumber('Room 1');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  if (!doctor) {
    return <div className="p-8 text-slate-500">Doctor not found.</div>;
  }

  const establishmentOptions = establishments.map(est => ({
    value: est.id,
    label: `${est.name} (${est.subDistrict})`
  }));

  const dayOptions = DAYS_OF_WEEK.map(d => ({
    value: d,
    label: d
  }));

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
            <span className="font-semibold text-slate-900">Schedule Configuration</span>
          </nav>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Schedule</h1>
            <Badge variant="teal">Multi-Chamber Node</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/doctors/${doctor.id}`)}
          >
            Back to Profile
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<CalendarClock className="w-3.5 h-3.5 text-teal-700" />}
            onClick={() => navigate(`/doctors/${doctor.id}/overrides`)}
          >
            Temporary Overrides
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-slate-900">{doctor.fullName}</span>
                <Badge variant="neutral">{doctor.specialty}</Badge>
                <span className="font-mono text-xs text-slate-400">{doctor.registrationNumber}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Building2 className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-semibold text-slate-800">{selectedEstablishment?.name}</span>
                <span>·</span>
                <span className="truncate">{selectedEstablishment?.address}</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-72">
            <Select
              label="Switch Location"
              value={selectedEstablishmentId}
              onChange={e => setSelectedEstablishmentId(e.target.value)}
              options={establishmentOptions}
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg flex items-center gap-2 text-xs text-slate-700">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p>
            <strong className="font-bold text-amber-800">Scoped Configuration:</strong> Doctor is attached to multiple practice locations. Any timings, room designations, or exceptions updated on this screen apply <strong>exclusively to {selectedEstablishment?.name}</strong>.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>Regular Weekly Schedule</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customary visiting patterns published to patient-facing schedule guide.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => handleAddSlotForDay('Monday')}
          >
            Add Schedule Slot
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-2.5 px-4">Day</th>
                <th className="py-2.5 px-4">Chamber Timings</th>
                <th className="py-2.5 px-4">Shift / Room</th>
                <th className="py-2.5 px-4">Roster Status</th>
                <th className="py-2.5 px-4 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {DAYS_OF_WEEK.map(day => {
                const daySlots = activeSlots.filter(s => s.dayOfWeek === day);

                if (daySlots.length === 0) {
                  return (
                    <tr key={day} className="hover:bg-slate-50/50 transition-colors text-slate-400">
                      <td className="py-3 px-4 font-semibold text-slate-600">{day}</td>
                      <td className="py-3 px-4 italic text-slate-400">— Not scheduled</td>
                      <td className="py-3 px-4 text-slate-400">No Chamber Assigned</td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral">Off-duty</Badge>
                      </td>
                      <td className="py-3 px-4 text-right pr-4">
                        <button
                          type="button"
                          onClick={() => handleAddSlotForDay(day)}
                          className="text-teal-700 hover:underline font-semibold cursor-pointer"
                        >
                          + Add Slot
                        </button>
                      </td>
                    </tr>
                  );
                }

                return daySlots.map((slot, idx) => (
                  <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {idx === 0 ? day : ''}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-slate-800 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.startTime} – {slot.endTime}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{slot.shiftName}</div>
                      <div className="text-[10px] text-slate-400">{slot.roomNumber}</div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="success" hasDot>Scheduled</Badge>
                    </td>
                    <td className="py-3 px-4 text-right pr-4 space-x-3">
                      <button
                        type="button"
                        onClick={() => handleEditClick(slot)}
                        className="text-teal-700 hover:underline font-semibold cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteScheduleSlot(slot.id)}
                        className="text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4" id="slot-form">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Save className="w-4 h-4 text-teal-700" />
            <span>{editingSlotId ? 'Edit Schedule Slot' : 'Add New Schedule Slot'}</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {editingSlotId ? `Editing Slot: ${editingSlotId}` : 'New Slot Draft'}
          </span>
        </div>

        <form onSubmit={handleSaveSlot} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Day of Week"
            value={dayOfWeek}
            onChange={e => setDayOfWeek(e.target.value as DayOfWeek)}
            options={dayOptions}
          />

          <Input
            label="Chamber Start Time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            placeholder="e.g. 05:00 PM"
          />

          <Input
            label="Chamber End Time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            placeholder="e.g. 08:00 PM"
          />

          <Input
            label="Consultation Room / Desk"
            value={roomNumber}
            onChange={e => setRoomNumber(e.target.value)}
            placeholder="e.g. Room 1 (Ground Fl.)"
          />

          <div className="sm:col-span-2">
            <Input
              label="Token Policy / Patient Advisory"
              value={tokenPolicy}
              onChange={e => setTokenPolicy(e.target.value)}
              placeholder="e.g. First-come-first-served, max ~25 tokens distributed at pharmacy counter"
            />
          </div>

          <div className="sm:col-span-3 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            {editingSlotId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingSlotId(null)}
              >
                Cancel Edit
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
            >
              {editingSlotId ? 'Save Changes' : 'Add Slot to Roster'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
