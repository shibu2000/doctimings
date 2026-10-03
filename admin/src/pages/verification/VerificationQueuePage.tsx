import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Stethoscope,
  Search
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const VerificationQueuePage: React.FC = () => {
  const { doctors, establishments, updateDoctor, updateEstablishment, logAuditEvent } = useAdmin();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'all' | 'establishments' | 'doctors'>('all');
  const [search, setSearch] = useState('');

  const pendingEstablishments = establishments.filter(e => e.verificationStatus !== 'Verified');
  const pendingDoctors = doctors.filter(d => d.verificationStatus !== 'Verified');

  const handleVerifyEst = (id: string, name: string) => {
    updateEstablishment(id, { verificationStatus: 'Verified' });
    logAuditEvent('Verified Establishment', 'Establishment', id, name, 'Issued verified status on ground check');
  };

  const handleVerifyDoc = (id: string, name: string) => {
    updateDoctor(id, { verificationStatus: 'Verified' });
    logAuditEvent('Verified Doctor Profile', 'Doctor', id, name, 'Confirmed WBMC registration');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical & Operational Verification Queue</h1>
            <Badge variant="warning">
              Queue: {pendingEstablishments.length + pendingDoctors.length}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ground-truth reconciliation audit for physical chamber existence, WBMC credential verification, and coordinate accuracy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Pending Audits</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{pendingEstablishments.length + pendingDoctors.length}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting action</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Chamber Audits Due</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingEstablishments.length}</p>
          <span className="text-[11px] text-slate-500">Physical address validation</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">WBMC Checks Due</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{pendingDoctors.length}</p>
          <span className="text-[11px] text-slate-500">Council registry match</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400">Verified Units</span>
          <p className="text-2xl font-bold text-teal-700 mt-1">{establishments.filter(e => e.verificationStatus === 'Verified').length}</p>
          <span className="text-[11px] text-slate-500">Fully validated in registry</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Audits
          </button>
          <button
            onClick={() => setActiveTab('establishments')}
            className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
              activeTab === 'establishments' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Establishments ({pendingEstablishments.length})
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer ${
              activeTab === 'doctors' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Doctor Profiles ({pendingDoctors.length})
          </button>
        </div>

        <div className="w-64">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search queue..."
            icon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </div>

      <div className="space-y-4">
        {(activeTab === 'all' || activeTab === 'establishments') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-700" />
                <span>Establishment Ground Audits</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Annual Check & Physical Re-verification</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {pendingEstablishments.map(est => (
                <div key={est.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block">{est.name}</span>
                    <span className="text-slate-500 text-[11px]">{est.address} · {est.subDistrict}, {est.district}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                      <span>Lic: {est.licenseNumber}</span>
                      <span>·</span>
                      <span>Phone: {est.phone}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/establishments/${est.id}`)}
                    >
                      Inspect Profile
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerifyEst(est.id, est.name)}
                    >
                      Issue Verified Badge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'doctors') && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-700" />
                <span>Practitioner WBMC Credential Audits</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">State Council Registry Cross-Check</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {pendingDoctors.map(doc => (
                <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <span className="font-bold text-slate-900 block">{doc.fullName}</span>
                    <span className="text-slate-500 text-[11px]">{doc.specialty} · {doc.qualifications}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1">
                      <span>Reg: {doc.registrationNumber}</span>
                      <span>·</span>
                      <span>{doc.council}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/doctors/${doc.id}`)}
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleVerifyDoc(doc.id, doc.fullName)}
                    >
                      Confirm WBMC
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
