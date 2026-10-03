import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Plus,
  CheckCircle2,
  Calendar,
  Phone,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  Stethoscope,
  ExternalLink,
  ChevronRight,
  Compass,
  ArrowRight,
  Accessibility,
  DoorOpen,
  Info,
  Network
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { PracticeLocation } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { formatTimeRange12h } from '../../utils/time';

export const PracticeLocationsPage: React.FC = () => {
  const { establishments, doctors, scheduleSlots, updateEstablishment, logAuditEvent } = useAdmin();
  const navigate = useNavigate();

  const [selectedEstId, setSelectedEstId] = useState(establishments[0]?.id || '');
  const currentEst = establishments.find(e => e.id === selectedEstId) || establishments[0];

  const [isAdding, setIsAdding] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [newRoomDesignation, setNewRoomDesignation] = useState('Chamber 1');
  const [newFloor, setNewFloor] = useState('Ground Floor');
  const [newPhone, setNewPhone] = useState(currentEst?.phone || '+91 94340 11223');
  const [newLandmark, setNewLandmark] = useState('');
  const [isRampAccessible, setIsRampAccessible] = useState(true);

  if (!currentEst) {
    return <div className="p-8 text-slate-500 text-xs">No establishment found.</div>;
  }

  const locations = currentEst.practiceLocations || [];

  const affiliatedDoctors = doctors.filter(doc =>
    (doc.affiliatedEstablishmentIds || []).includes(currentEst.id)
  );

  const establishmentSlots = scheduleSlots.filter(s => s.establishmentId === currentEst.id);

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;

    const newLoc: PracticeLocation = {
      id: `LOC-${Date.now().toString().slice(-4)}`,
      establishmentId: currentEst.id,
      name: newLocationName.trim(),
      roomDesignation: newRoomDesignation.trim() || 'Chamber 1',
      floor: newFloor,
      isActive: true
    };

    updateEstablishment(currentEst.id, {
      practiceLocations: [...locations, newLoc]
    });

    logAuditEvent(
      'Added practice location',
      'Establishment',
      currentEst.id,
      currentEst.name,
      `Created room ${newLoc.name} (${newLoc.roomDesignation}, ${newLoc.floor})`
    );

    setNewLocationName('');
    setNewLandmark('');
    setIsAdding(false);
  };

  const handleRemoveLocation = (locId: string, locName: string) => {
    updateEstablishment(currentEst.id, {
      practiceLocations: locations.filter(l => l.id !== locId)
    });

    logAuditEvent(
      'Removed practice location',
      'Establishment',
      currentEst.id,
      currentEst.name,
      `Deactivated room ${locName}`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span onClick={() => navigate('/establishments')} className="hover:text-teal-800 cursor-pointer">
              Establishments
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-teal-800">Practice Locations</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Practice Locations Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure rooms, consulting cabins, entrance landmarks, and doctor roster mappings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Facility:</span>
            <div className="w-64">
              <Select
                value={selectedEstId}
                onChange={e => setSelectedEstId(e.target.value)}
                options={establishments.map(est => ({
                  value: est.id,
                  label: `${est.name} (${est.subDistrict})`
                }))}
              />
            </div>
          </div>

          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAdding(!isAdding)}
          >
            {isAdding ? 'Cancel' : 'Add Practice Location'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900">{currentEst.name}</h2>
                <Badge variant="teal" size="xs">
                  {currentEst.type}
                </Badge>
                <span className="font-mono text-xs text-slate-500 font-semibold">
                  License: {currentEst.licenseNumber}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-teal-700" />
                  <span>{currentEst.phone} ({currentEst.proprietorName})</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-700" />
                  <span>{currentEst.address}, PIN {currentEst.pinCode}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 xl:pt-0 border-t xl:border-t-0 xl:border-l xl:pl-5 border-slate-100">
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Rooms</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {locations.length} Registered Rooms
              </p>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200/80">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rostered Doctors</p>
              <p className="text-sm font-bold text-teal-900 mt-0.5">
                {affiliatedDoctors.length} Practitioners
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/establishments/${currentEst.id}`)}
            >
              Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          {isAdding && (
            <section className="bg-white rounded-xl border border-teal-200 shadow-md p-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Add New Practice Location Room</h3>
                    <p className="text-xs text-slate-500">Configure cabin name, entrance notes, and accessibility features.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddLocation} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Location Name / Sub-chamber Label *"
                    required
                    placeholder="e.g. Main Attached Chamber / Diagnostic Wing"
                    value={newLocationName}
                    onChange={e => setNewLocationName(e.target.value)}
                    helperText="Human-recognizable name recognizable to local patients."
                  />

                  <Input
                    label="Operational Contact Phone"
                    type="tel"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    placeholder="+91 94340 11223"
                    helperText="Direct desk number if different from facility main line."
                  />

                  <Select
                    label="Floor Placement *"
                    value={newFloor}
                    onChange={e => setNewFloor(e.target.value)}
                    options={[
                      { value: 'Ground Floor', label: 'Ground Floor' },
                      { value: '1st Floor', label: '1st Floor' },
                      { value: '2nd Floor', label: '2nd Floor' },
                      { value: 'Basement', label: 'Basement Annex' }
                    ]}
                  />

                  <Input
                    label="Room / Bay Designation *"
                    value={newRoomDesignation}
                    onChange={e => setNewRoomDesignation(e.target.value)}
                    placeholder="Chamber 1 / OPD Desk 2"
                    helperText="Consulting cabin or examination table number."
                  />

                  <div className="md:col-span-2">
                    <Input
                      label="Street Address / Entrance Landmark"
                      value={newLandmark}
                      onChange={e => setNewLandmark(e.target.value)}
                      placeholder="e.g. Station Road, 50m East of Bus Stand, Behind Pharmacy Dispenser"
                      helperText="Clear physical instructions for arriving patients."
                    />
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Accessibility className="w-5 h-5 text-teal-700" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">Wheelchair Ramp Accessible</p>
                      <p className="text-[11px] text-slate-500">Facility has step-free entrance for elderly and disabled visitors.</p>
                    </div>
                  </div>
                  <Switch
                    checked={isRampAccessible}
                    onChange={setIsRampAccessible}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAdding(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                  >
                    Save Practice Location
                  </Button>
                </div>
              </form>
            </section>
          )}

          {locations.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
              <DoorOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No practice locations configured</p>
              <p className="mt-1 text-slate-400">Add physical consultation rooms or cabins for this facility.</p>
            </div>
          ) : (
            locations.map((loc, index) => {
            return (
              <section
                key={loc.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-all duration-150"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                      <DoorOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900">{loc.name}</h3>
                        <Badge variant="success" hasDot pulse size="xs">
                          Active Site
                        </Badge>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-semibold">
                          ID: {loc.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {loc.floor} · {loc.roomDesignation} · {currentEst.address}, PIN {currentEst.pinCode}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveLocation(loc.id, loc.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Deactivate Location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-50/70 px-5 py-2.5 gap-3 text-xs text-slate-600 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span><strong>Phone:</strong> {currentEst.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                    <span><strong>Hours:</strong> Mon - Sat: 8:00 AM – 9:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Audited:</strong> 22 Sep 2026 by Field Admin</span>
                  </div>
                </div>

                <div className="p-5 border-b border-slate-100">
                  <div className="flex flex-col lg:flex-row gap-4 items-center">
                    <div className="relative w-full lg:w-3/5 h-44 rounded-xl bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent"></div>
                      <div className="relative z-10 flex flex-col items-center text-center p-4">
                        <div className="px-3 py-1 bg-white/95 text-slate-900 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Primary Physical Entrance Verified</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg ring-4 ring-teal-500/30">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] text-teal-200 mt-2 font-medium">
                          {currentEst.name} Entrance · {loc.roomDesignation}
                        </p>
                      </div>
                      <div className="absolute bottom-2 right-3 font-mono text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                        Geo: 22.2045° N, 86.8992° E
                      </div>
                    </div>

                    <div className="w-full lg:w-2/5 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                      <p className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Ground Landmark Note</p>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Near Central Bus Stand, {currentEst.subDistrict}. Chamber located directly attached to pharmacy counter with separate queue line.
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
                          <DoorOpen className="w-3 h-3 text-teal-700" />
                          <span>{loc.roomDesignation}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
                          <Accessibility className="w-3 h-3 text-emerald-600" />
                          <span>Ramp Accessible</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Doctors Rostered for this Chamber</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {affiliatedDoctors.length} practitioners holding active consulting sessions here
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="xs"
                      icon={<Plus className="w-3 h-3" />}
                      onClick={() => navigate('/doctors')}
                    >
                      Roster Doctor
                    </Button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Practitioner</th>
                          <th className="py-2.5 px-3">Specialty & Reg</th>
                          <th className="py-2.5 px-3">Shift Timing</th>
                          <th className="py-2.5 px-3">Room / Bay</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Roster</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {affiliatedDoctors.map(doc => {
                          const docSlot = establishmentSlots.find(s => s.doctorId === doc.id);

                          return (
                            <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={
                                      doc.photoUrl ||
                                      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
                                    }
                                    alt={doc.fullName}
                                    className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                                  />
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() => navigate(`/doctors/${doc.id}`)}
                                      className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-left"
                                    >
                                      {doc.fullName}
                                    </button>
                                    <p className="text-[10px] text-slate-400">{doc.qualifications}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="font-semibold text-slate-800">{doc.specialty}</span>
                                <p className="font-mono text-[10px] text-slate-400">{doc.registrationNumber}</p>
                              </td>
                              <td className="py-2.5 px-3">
                                {docSlot ? (
                                  <div>
                                    <span className="font-semibold text-slate-800">{docSlot.dayOfWeek}</span>
                                    <p className="font-mono text-[10px] text-slate-500">
                                      {formatTimeRange12h(docSlot.startTime, docSlot.endTime)}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">No slot mapped</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 font-medium text-slate-700">
                                {loc.roomDesignation}
                              </td>
                              <td className="py-2.5 px-3">
                                <Badge variant="success" hasDot size="xs">
                                  Rostered
                                </Badge>
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/schedules/doctor/${doc.id}/establishment/${currentEst.id}`)}
                                  className="text-teal-700 hover:underline font-bold text-xs cursor-pointer inline-flex items-center gap-1"
                                >
                                  <span>Manage Roster</span>
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
              </section>
            );
          }))}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                <Network className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Entity Architecture</h3>
                <p className="text-[11px] text-slate-500">Data integrity & hierarchy rules</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] space-y-1.5 select-none overflow-x-auto">
              <div className="flex items-center gap-1.5 font-bold text-teal-300">
                <Building2 className="w-3.5 h-3.5" />
                <span className="truncate">Facility: {currentEst.name}</span>
              </div>
              {locations.length === 0 ? (
                <div className="pl-3 text-slate-400 text-[10px]">No rooms configured</div>
              ) : (
                locations.map((loc, lIdx) => (
                  <div key={loc.id} className="space-y-1">
                    <div className="pl-3 text-slate-300 flex items-center gap-1.5">
                      <span>{lIdx === locations.length - 1 ? '└──' : '├──'}</span>
                      <DoorOpen className="w-3 h-3 text-teal-400" />
                      <span className="font-semibold text-white">{loc.name}</span>
                    </div>
                    {affiliatedDoctors.slice(0, 3).map((doc, dIdx) => (
                      <div key={doc.id} className="pl-8 text-slate-400 text-[10px]">
                        <span>{dIdx === 2 ? '└─' : '├─'}</span> {doc.fullName} ({doc.specialty})
                      </div>
                    ))}
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-amber-900 flex items-start gap-2.5 text-xs">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong className="font-semibold">Cardinality Protocol:</strong> A clinician is never owned exclusively by a clinic. Associating a doctor to a practice room creates an independent roster relationship valid specifically for this chamber address.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Ground Audit Protocol</h3>
                <p className="text-[11px] text-slate-500">Physical verification guidelines</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">GPS Coordinates verified on-ground via Field Ops mobile portal.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">Separate patient waiting area and prescription counter inspected.</span>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-slate-700">Proprietor trade license WB-JHR renewed for current fiscal cycle.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Audited by: Rajesh S. (Ops)</span>
              <span className="font-mono font-semibold text-slate-800">22 Sep 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
