import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Building2,
  Stethoscope,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { DayOfWeek } from '../../types';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { formatTimeRange12h } from '../../utils/time';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const SchedulesPage: React.FC = () => {
  const { scheduleSlots, doctors, establishments, overrides } = useAdmin();
  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState<string>('All');
  const [selectedEstablishment, setSelectedEstablishment] = useState<string>('All');

  const filteredSlots = scheduleSlots.filter(s => {
    const matchesDay = selectedDay === 'All' || s.dayOfWeek === selectedDay;
    const matchesEst = selectedEstablishment === 'All' || s.establishmentId === selectedEstablishment;
    return matchesDay && matchesEst;
  });

  const establishmentOptions = [
    { value: 'All', label: 'Chamber: All Establishments' },
    ...establishments.map(est => ({
      value: est.id,
      label: est.name
    }))
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Master Schedules</h1>
            <Badge variant="teal">Weekly Roster Matrix</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global view of recurring practitioner sittings across all regional chambers and attached pharmacies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/doctors')}
          >
            Select Doctor to Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Weekly Slots</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{scheduleSlots.length}</p>
          <span className="text-[11px] text-teal-700 font-medium">Across all participating clinics</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Overrides</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{overrides.length}</p>
          <span className="text-[11px] text-slate-500">Upcoming holiday / leave exceptions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Multi-Chamber Nodes</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
          <span className="text-[11px] text-slate-500">Practitioners with ≥2 clinic rotations</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setSelectedDay('All')}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
              selectedDay === 'All' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Days
          </button>
          {DAYS.map(d => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                selectedDay === d ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d.slice(0, 3)}
            </button>
          ))}
        </div>

        <div className="w-72">
          <Select
            value={selectedEstablishment}
            onChange={e => setSelectedEstablishment(e.target.value)}
            options={establishmentOptions}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Day & Timing</th>
                <th className="py-3 px-4">Doctor Practitioner</th>
                <th className="py-3 px-4">Establishment Chamber</th>
                <th className="py-3 px-4">Shift & Room</th>
                <th className="py-3 px-4">Token Policy</th>
                <th className="py-3 px-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSlots.map(slot => {
                const doc = doctors.find(d => d.id === slot.doctorId);
                const est = establishments.find(e => e.id === slot.establishmentId);

                return (
                  <tr key={slot.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{slot.dayOfWeek}</div>
                      <div className="flex items-center gap-1 font-mono text-teal-800 text-[11px] font-semibold mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeRange12h(slot.startTime, slot.endTime)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                        <span>{doc?.fullName || 'Practitioner'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{doc?.specialty}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-xs">{est?.name}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{est?.subDistrict}</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{slot.shiftName}</div>
                      <div className="text-[10px] text-slate-400">{slot.roomNumber}</div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs">
                      <div className="truncate">{slot.tokenPolicy}</div>
                      <span className="text-[10px] font-mono text-slate-400">Max Tokens: {slot.maxTokens}</span>
                    </td>

                    <td className="py-3 px-4 text-right pr-6">
                      <button
                        type="button"
                        onClick={() => navigate(`/doctors/${slot.doctorId}/schedule`)}
                        className="text-teal-700 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
