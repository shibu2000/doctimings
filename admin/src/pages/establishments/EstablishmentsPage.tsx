import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  FilterX,
  MapPin,
  Phone,
  BadgeCheck,
  UserPlus,
  Eye,
  Calendar,
  Copy
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { EstablishmentType, VerificationStatus, AccountStatus } from '../../types';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { RowActions } from '../../components/ui/RowActions';

export const EstablishmentsPage: React.FC = () => {
  const { establishments } = useAdmin();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedVerification, setSelectedVerification] = useState<string>('All');
  const [selectedAccount, setSelectedAccount] = useState<string>('All');
  const [quickView, setQuickView] = useState<'all' | 'review' | 'pending'>('all');

  const filteredEstablishments = useMemo(() => {
    return establishments.filter(est => {
      const matchesSearch =
        est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.phone.includes(searchQuery) ||
        est.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        est.subDistrict.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'All' || est.type === selectedType;
      const matchesLocation = selectedLocation === 'All' || est.district === selectedLocation;
      const matchesVerification = selectedVerification === 'All' || est.verificationStatus === selectedVerification;
      const matchesAccount = selectedAccount === 'All' || est.accountStatus === selectedAccount;

      const matchesQuick =
        quickView === 'all' ||
        (quickView === 'review' && est.verificationStatus === 'Needs Review') ||
        (quickView === 'pending' && est.accountStatus === 'Invitation Pending');

      return matchesSearch && matchesType && matchesLocation && matchesVerification && matchesAccount && matchesQuick;
    });
  }, [establishments, searchQuery, selectedType, selectedLocation, selectedVerification, selectedAccount, quickView]);

  const exportEstablishmentsCsv = () => {
    const headers = ['ID', 'Name', 'Type', 'District', 'SubDistrict', 'Phone', 'Verification', 'Account State'];
    const rows = filteredEstablishments.map(e => [
      e.id,
      `"${e.name}"`,
      e.type,
      e.district,
      e.subDistrict,
      e.phone,
      e.verificationStatus,
      e.accountStatus
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `establishments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedLocation('All');
    setSelectedVerification('All');
    setSelectedAccount('All');
    setQuickView('all');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Establishments</h1>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-bold font-mono">
              DIRECTORY v2.8
            </span>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl">
            Manage primary healthcare facilities, affiliated doctor chamber rotations, and operational contact credentials across district clusters.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total:</span>
              <span className="font-bold text-slate-800">{establishments.length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Platform Managed:</span>
              <span className="font-bold text-slate-800">{establishments.filter(e => e.accountStatus === 'Platform Managed').length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Account Active:</span>
              <span className="font-bold text-emerald-700">{establishments.filter(e => e.accountStatus === 'Account Active').length}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Invitation Pending:</span>
              <span className="font-bold text-amber-700">{establishments.filter(e => e.accountStatus === 'Invitation Pending').length}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={exportEstablishmentsCsv}
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => navigate('/establishments/new')}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Establishment</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex-1">
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search establishments by name, phone, or location (e.g. Gopiballavpur, Burdwan, Nadia)..."
              icon={<Search className="w-4 h-4 text-slate-400" />}
              className="bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setQuickView('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                quickView === 'all' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({establishments.length})
            </button>
            <button
              onClick={() => setQuickView('review')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                quickView === 'review' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Review (14)
            </button>
            <button
              onClick={() => setQuickView('pending')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                quickView === 'pending' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Invites (3)
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="w-36">
            <Select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              options={[
                { value: 'All', label: 'All Types' },
                { value: 'Pharmacy', label: 'Pharmacy' },
                { value: 'Clinic', label: 'Clinic' },
                { value: 'Doctor Chamber', label: 'Doctor Chamber' },
                { value: 'Polyclinic', label: 'Polyclinic' },
                { value: 'Diagnostic Center', label: 'Diagnostic Center' }
              ]}
            />
          </div>

          <div className="w-44">
            <Select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              options={[
                { value: 'All', label: 'All Districts' },
                { value: 'Jhargram', label: 'Jhargram' },
                { value: 'Purba Bardhaman', label: 'Purba Bardhaman' },
                { value: 'Nadia', label: 'Nadia' },
                { value: 'Hooghly', label: 'Hooghly' },
                { value: 'Birbhum', label: 'Birbhum' },
                { value: 'Paschim Medinipur', label: 'Paschim Medinipur' }
              ]}
            />
          </div>

          <div className="w-40">
            <Select
              value={selectedVerification}
              onChange={e => setSelectedVerification(e.target.value)}
              options={[
                { value: 'All', label: 'All Verification' },
                { value: 'Verified', label: 'Verified' },
                { value: 'Needs Review', label: 'Needs Review' },
                { value: 'Pending', label: 'Pending Audit' }
              ]}
            />
          </div>

          <div className="w-44">
            <Select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              options={[
                { value: 'All', label: 'All Account States' },
                { value: 'Platform Managed', label: 'Platform Managed' },
                { value: 'Invitation Pending', label: 'Invitation Pending' },
                { value: 'Account Active', label: 'Account Active' }
              ]}
            />
          </div>

          {(searchQuery || selectedType !== 'All' || selectedLocation !== 'All' || selectedVerification !== 'All' || selectedAccount !== 'All' || quickView !== 'all') && (
            <button
              onClick={clearFilters}
              className="ml-auto p-1.5 text-slate-400 hover:text-red-600 transition-colors"
              title="Clear Filters"
            >
              <FilterX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Establishment</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Doctors</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Account State</th>
                <th className="py-3 px-4">Proprietor Phone</th>
                <th className="py-3 px-4 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEstablishments.map(est => (
                <tr key={est.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                        {est.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => navigate(`/establishments/${est.id}`)}
                          className="font-bold text-slate-900 hover:text-teal-700 transition-colors text-left block truncate max-w-xs"
                        >
                          {est.name}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400">{est.licenseNumber}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {est.type}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <div className="font-semibold text-slate-800">{est.subDistrict}</div>
                    <div className="text-[10px] text-slate-400">{est.district} · PIN {est.pinCode}</div>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 font-bold font-mono">
                      {est.doctorCount}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={est.verificationStatus === 'Verified' ? 'success' : 'warning'}
                      hasDot
                      size="xs"
                    >
                      {est.verificationStatus}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        est.accountStatus === 'Account Active'
                          ? 'success'
                          : est.accountStatus === 'Invitation Pending'
                          ? 'warning'
                          : 'neutral'
                      }
                      hasDot
                      pulse={est.accountStatus === 'Account Active'}
                      size="xs"
                    >
                      {est.accountStatus}
                    </Badge>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    <div>{est.phone}</div>
                    <div className="text-[10px] text-slate-400">{est.proprietorName}</div>
                  </td>

                  <td className="py-3.5 px-4 text-right pr-6">
                    <RowActions
                      primaryActions={[
                        {
                          label: 'Inspect',
                          icon: <Eye className="w-3 h-3" />,
                          onClick: () => navigate(`/establishments/${est.id}`),
                          variant: 'outline'
                        },
                        {
                          label: 'Locations',
                          icon: <MapPin className="w-3 h-3" />,
                          onClick: () => navigate('/practice-locations'),
                          variant: 'secondary'
                        }
                      ]}
                      menuItems={[
                        {
                          label: 'View Doctor Roster',
                          icon: <Calendar className="w-3.5 h-3.5 text-slate-500" />,
                          onClick: () => navigate('/schedules')
                        },
                        {
                          label: 'Call Facility Desk',
                          icon: <Phone className="w-3.5 h-3.5 text-slate-500" />,
                          onClick: () => window.open(`tel:${est.phone}`)
                        },
                        {
                          label: 'Copy License No',
                          icon: <Copy className="w-3.5 h-3.5 text-slate-500" />,
                          onClick: () => navigator.clipboard.writeText(est.licenseNumber)
                        }
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
