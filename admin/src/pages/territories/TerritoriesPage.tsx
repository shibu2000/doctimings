import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Territory } from '../../types';
import { 
  MapPin, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  Stethoscope, 
  Percent, 
  Compass, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';

export const TerritoriesPage: React.FC = () => {
  const { territories, logAuditEvent } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [localTerritories, setLocalTerritories] = useState<Territory[]>(territories);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);

  const [newSubDistrict, setNewSubDistrict] = useState('');
  const [newDistrict, setNewDistrict] = useState('Purba Bardhaman');
  const [newPinCodes, setNewPinCodes] = useState('');
  const [newDoctorCount, setNewDoctorCount] = useState(15);
  const [newEstCount, setNewEstCount] = useState(8);
  const [newCoveragePercent, setNewCoveragePercent] = useState(80);

  const districts = Array.from(new Set(localTerritories.map(t => t.district)));

  const filteredTerritories = localTerritories.filter(t => {
    const matchesSearch = 
      t.subDistrict.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.pinCodes.some(pin => pin.includes(searchQuery));
    const matchesDistrict = districtFilter === 'ALL' || t.district === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const totalDoctors = localTerritories.reduce((acc, t) => acc + t.doctorCount, 0);
  const totalEstablishments = localTerritories.reduce((acc, t) => acc + t.establishmentCount, 0);
  const totalPinCodes = localTerritories.reduce((acc, t) => acc + t.pinCodes.length, 0);
  const avgVerificationRate = Math.round(
    localTerritories.reduce((acc, t) => acc + t.verificationCoveragePercent, 0) / (localTerritories.length || 1)
  );

  const handleAddTerritory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubDistrict.trim() || !newPinCodes.trim()) return;

    const pinArray = newPinCodes
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length === 6);

    const territory: Territory = {
      id: `TER-${Date.now().toString().slice(-4)}`,
      district: newDistrict,
      subDistrict: newSubDistrict.trim(),
      pinCodes: pinArray.length > 0 ? pinArray : ['713101'],
      doctorCount: Number(newDoctorCount) || 0,
      establishmentCount: Number(newEstCount) || 0,
      verificationCoveragePercent: Number(newCoveragePercent) || 75
    };

    setLocalTerritories(prev => [territory, ...prev]);
    logAuditEvent(
      'Added new coverage territory',
      'Doctor',
      territory.id,
      territory.subDistrict,
      `Territory in ${territory.district} with PINs: ${territory.pinCodes.join(', ')}`
    );
    setShowAddModal(false);
    setNewSubDistrict('');
    setNewPinCodes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <span>Geography</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-teal-800">Territories & PIN Codes</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Territory Coverage</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Geographic directory mapping coverage and verification health across West Bengal sub-districts and PIN codes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Territory / PIN</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Tracked PIN Codes</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalPinCodes}</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Across {localTerritories.length} sub-districts
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Doctors</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalDoctors}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Mapped to active rosters
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Stethoscope className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Establishments</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{totalEstablishments}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Clinics & pharmacies
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Avg Verification Rate</p>
            <p className="text-2xl font-bold text-teal-900 mt-1">{avgVerificationRate}%</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Clinical ground audits
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="w-full md:w-96">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by sub-district, district, or PIN code..."
              icon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="w-full md:w-48">
            <Select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Districts' },
                ...districts.map(d => ({ value: d, label: d }))
              ]}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Sub-District / Territory</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Covered PIN Codes</th>
                <th className="py-3 px-4 text-center">Doctors</th>
                <th className="py-3 px-4 text-center">Chambers</th>
                <th className="py-3 px-4">Verification Health</th>
                <th className="py-3 px-4">Coverage Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTerritories.map((t) => {
                const isFullyCovered = t.verificationCoveragePercent >= 80;
                const isModerate = t.verificationCoveragePercent >= 70 && !isFullyCovered;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{t.subDistrict}</p>
                          <p className="text-[11px] text-slate-400 font-mono">ID: {t.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {t.district}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {t.pinCodes.map(pin => (
                          <span key={pin} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono text-[11px] text-teal-900 font-semibold">
                            {pin}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {t.doctorCount}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                      {t.establishmentCount}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1 max-w-[140px]">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className="text-slate-600">{t.verificationCoveragePercent}% audited</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isFullyCovered ? 'bg-emerald-600' : isModerate ? 'bg-teal-600' : 'bg-amber-500'
                            }`}
                            style={{ width: `${t.verificationCoveragePercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isFullyCovered 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isModerate
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isFullyCovered && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {!isFullyCovered && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                        {isFullyCovered ? 'Fully Covered' : isModerate ? 'Moderate' : 'Needs Expansion'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTerritory(t)}
                        className="px-2.5 py-1 text-slate-600 hover:text-teal-800 hover:bg-slate-100 rounded text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredTerritories.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Compass className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No territory records found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search criteria or district filter</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Add New Coverage Territory</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddTerritory} className="p-5 space-y-4 text-xs">
              <Input
                label="Sub-District / Police Station"
                required
                value={newSubDistrict}
                onChange={e => setNewSubDistrict(e.target.value)}
                placeholder="e.g. Ranaghat I Block"
              />

              <Select
                label="District"
                value={newDistrict}
                onChange={e => setNewDistrict(e.target.value)}
                options={[
                  { value: 'Purba Bardhaman', label: 'Purba Bardhaman' },
                  { value: 'Nadia', label: 'Nadia' },
                  { value: 'Jhargram', label: 'Jhargram' },
                  { value: 'Hooghly', label: 'Hooghly' },
                  { value: 'Birbhum', label: 'Birbhum' }
                ]}
              />

              <Input
                label="PIN Codes (comma-separated)"
                required
                value={newPinCodes}
                onChange={e => setNewPinCodes(e.target.value)}
                placeholder="741201, 741202"
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Doctors Count"
                  type="number"
                  min="0"
                  value={newDoctorCount}
                  onChange={e => setNewDoctorCount(parseInt(e.target.value) || 0)}
                />
                <Input
                  label="Chambers Count"
                  type="number"
                  min="0"
                  value={newEstCount}
                  onChange={e => setNewEstCount(parseInt(e.target.value) || 0)}
                />
              </div>

              <Input
                label="Verification Coverage (%)"
                type="number"
                min="0"
                max="100"
                value={newCoveragePercent}
                onChange={e => setNewCoveragePercent(parseInt(e.target.value) || 0)}
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                >
                  Create Territory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTerritory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-800" />
                <h2 className="text-sm font-bold text-slate-900">Territory Inspection: {selectedTerritory.subDistrict}</h2>
              </div>
              <button onClick={() => setSelectedTerritory(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">District</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedTerritory.district}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Sub-District</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedTerritory.subDistrict}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Doctors Mapped</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedTerritory.doctorCount}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium">Establishments</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedTerritory.establishmentCount}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 font-medium mb-1">Covered PIN Codes</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTerritory.pinCodes.map(pin => (
                    <span key={pin} className="px-2 py-1 bg-teal-50 border border-teal-200 rounded font-mono text-xs text-teal-900 font-bold">
                      {pin}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-semibold">Ground Verification Completion:</span>
                  <span className="font-mono font-bold text-teal-900">{selectedTerritory.verificationCoveragePercent}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-teal-700 rounded-full"
                    style={{ width: `${selectedTerritory.verificationCoveragePercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Physical clinic and prescription audit rate for doctors practicing inside {selectedTerritory.subDistrict}.
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTerritory(null)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-semibold"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
