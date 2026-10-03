import React, { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Download,
  Upload,
  Search,
  Calendar,
  Building2,
  CalendarClock,
  ChevronRight,
  FilterX,
  Eye,
  Copy,
  Camera
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Doctor } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { RowActions } from '../../components/ui/RowActions';

const PRESET_AVATARS = [
  {
    name: 'Senior Physician',
    url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Pediatrician',
    url: 'https://images.unsplash.com/photo-1594824813576-9f4460592b23?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Surgeon',
    url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Physician',
    url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
  }
];

export const DoctorsDirectoryPage: React.FC = () => {
  const { doctors, establishments, updateDoctor } = useAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [quickFilter, setQuickFilter] = useState<'all' | 'today' | 'review' | 'pending'>('all');

  const [selectedDoctorForPhoto, setSelectedDoctorForPhoto] = useState<Doctor | null>(null);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [photoInput, setPhotoInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setPhotoInput(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setPhotoInput(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleSavePhoto = () => {
    if (selectedDoctorForPhoto) {
      updateDoctor(selectedDoctorForPhoto.id, { photoUrl: photoInput.trim() || undefined });
      setIsPhotoModalOpen(false);
      setSelectedDoctorForPhoto(null);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const matchesSearch =
        doc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.primaryPhone.includes(searchQuery) ||
        doc.specialty.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty =
        selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;

      const matchesStatus =
        selectedStatus === 'All' || doc.verificationStatus === selectedStatus;

      const matchesQuick =
        quickFilter === 'all' ||
        (quickFilter === 'today' && doc.isPracticingToday) ||
        (quickFilter === 'review' && doc.verificationStatus === 'Needs Review') ||
        (quickFilter === 'pending' && doc.verificationStatus === 'Pending');

      return matchesSearch && matchesSpecialty && matchesStatus && matchesQuick;
    });
  }, [doctors, searchQuery, selectedSpecialty, selectedStatus, quickFilter]);

  const exportDoctorsCsv = () => {
    const headers = ['ID', 'Name', 'Specialty', 'Registration', 'Phone', 'Verification', 'Practicing Today'];
    const rows = filteredDoctors.map(d => [
      d.id,
      `"${d.fullName}"`,
      `"${d.specialty}"`,
      d.registrationNumber,
      d.primaryPhone,
      d.verificationStatus,
      d.isPracticingToday ? 'Yes' : 'No'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctors-registry-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('All');
    setSelectedStatus('All');
    setQuickFilter('all');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Healthcare Catalog</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-slate-900">Doctors</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportDoctorsCsv}
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
            onClick={() => navigate('/doctors/new')}
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Doctor</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Doctors Registry</h1>
              <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 text-xs font-bold font-mono">
                Master Identity V2
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage canonical doctor identities and track verified affiliations across independent chambers, rural health posts, polyclinics, and pharmacies.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100">
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Catalog</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">{doctors.length}</span>
              <span className="text-[10px] text-slate-500">Canonical IDs</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-emerald-600 block">Verified</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">{doctors.filter(d => d.verificationStatus === 'Verified').length}</span>
              <span className="text-[10px] text-emerald-600">{doctors.length > 0 ? Math.round((doctors.filter(d => d.verificationStatus === 'Verified').length / doctors.length) * 100) : 0}% Audit Pass</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Review Req.</span>
              <span className="text-lg font-bold text-amber-600 mt-0.5 block">{doctors.filter(d => d.verificationStatus === 'Needs Review').length}</span>
              <span className="text-[10px] text-slate-500">Discrepancies</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Pending</span>
              <span className="text-lg font-bold text-slate-900 mt-0.5 block">{doctors.filter(d => d.verificationStatus === 'Pending').length}</span>
              <span className="text-[10px] text-slate-500">WBMC check</span>
            </div>
            <div className="px-3 py-2 rounded-lg bg-teal-50 border border-teal-100">
              <span className="text-[10px] uppercase font-bold text-teal-700 block">Multi-Chamber</span>
              <span className="text-lg font-bold text-teal-800 mt-0.5 block">{doctors.filter(d => (d.affiliatedEstablishmentIds || []).length >= 2).length}</span>
              <span className="text-[10px] text-teal-600">Across ≥2 clinics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-4 space-y-3">
        <Input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search doctors by full name, registration number (e.g. WBMC-49201), specialty, or phone..."
          icon={<Search className="w-4 h-4 text-slate-400" />}
          className="bg-slate-50 focus:bg-white"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200 overflow-x-auto">
            <button
              onClick={() => setQuickFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                quickFilter === 'all' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({doctors.length})
            </button>
            <button
              onClick={() => setQuickFilter('today')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                quickFilter === 'today' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Practicing Today
            </button>
            <button
              onClick={() => setQuickFilter('review')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                quickFilter === 'review' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Needs Review
            </button>
            <button
              onClick={() => setQuickFilter('pending')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                quickFilter === 'pending' ? 'bg-white text-teal-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              Pending
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-44">
              <Select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                options={[
                  { value: 'All', label: 'Specialty: All' },
                  { value: 'General Medicine', label: 'General Medicine' },
                  { value: 'Pediatrics', label: 'Pediatrics' },
                  { value: 'Dermatology', label: 'Dermatology' },
                  { value: 'Orthopedics', label: 'Orthopedics' },
                  { value: 'Gynecology & Obs', label: 'Gynecology & Obs' },
                  { value: 'Cardiology', label: 'Cardiology' },
                  { value: 'ENT', label: 'ENT' },
                  { value: 'Ophthalmology', label: 'Ophthalmology' }
                ]}
              />
            </div>

            <div className="w-40">
              <Select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                options={[
                  { value: 'All', label: 'Verification: Any' },
                  { value: 'Verified', label: 'Verified Only' },
                  { value: 'Needs Review', label: 'Needs Review' },
                  { value: 'Pending', label: 'Pending Only' }
                ]}
              />
            </div>

            {(searchQuery || selectedSpecialty !== 'All' || selectedStatus !== 'All' || quickFilter !== 'all') && (
              <button
                onClick={clearFilters}
                className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                title="Reset filters"
              >
                <FilterX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Doctor Practitioner</th>
                <th className="py-3 px-4">Specialty & Qualifications</th>
                <th className="py-3 px-4">Affiliated Chambers</th>
                <th className="py-3 px-4">Verification</th>
                <th className="py-3 px-4">Today State</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right pr-6">Roster & Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map(doc => {
                const affiliatedEsts = establishments.filter(e =>
                  doc.affiliatedEstablishmentIds.includes(e.id)
                );

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative group shrink-0">
                          <img
                            src={
                              doc.photoUrl ||
                              'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
                            }
                            alt={doc.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDoctorForPhoto(doc);
                              setPhotoInput(doc.photoUrl || '');
                              setIsPhotoModalOpen(true);
                            }}
                            className="absolute inset-0 bg-slate-900/60 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                            title="Update photo"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate(`/doctors/${doc.id}`)}
                            className="font-bold text-slate-900 hover:text-teal-700 transition-colors block text-left"
                          >
                            {doc.fullName}
                          </button>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>{doc.registrationNumber}</span>
                            <span>·</span>
                            <span>{doc.experienceYears}y exp</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-semibold text-slate-800">{doc.specialty}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{doc.qualifications}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 max-w-xs">
                        {affiliatedEsts.map(est => (
                          <div key={est.id} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{est.name}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          doc.verificationStatus === 'Verified'
                            ? 'success'
                            : doc.verificationStatus === 'Needs Review'
                            ? 'warning'
                            : 'neutral'
                        }
                        hasDot
                        size="xs"
                      >
                        {doc.verificationStatus}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      {doc.isPracticingToday ? (
                        <Badge variant="success" hasDot pulse size="xs">
                          Practicing Today
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No shift today</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {doc.primaryPhone}
                    </td>

                    <td className="py-3.5 px-4 text-right pr-6">
                      <RowActions
                        primaryActions={[
                          {
                            label: 'Profile',
                            icon: <Eye className="w-3 h-3" />,
                            onClick: () => navigate(`/doctors/${doc.id}`),
                            variant: 'outline'
                          },
                          {
                            label: 'Schedule',
                            icon: <Calendar className="w-3 h-3" />,
                            onClick: () => {
                              if (affiliatedEsts.length > 0) {
                                navigate(`/schedules/doctor/${doc.id}/establishment/${affiliatedEsts[0].id}`);
                              } else {
                                navigate('/schedules');
                              }
                            },
                            variant: 'secondary'
                          }
                        ]}
                        menuItems={[
                          {
                            label: 'Update Photo',
                            icon: <Camera className="w-3.5 h-3.5 text-slate-500" />,
                            onClick: () => {
                              setSelectedDoctorForPhoto(doc);
                              setPhotoInput(doc.photoUrl || '');
                              setIsPhotoModalOpen(true);
                            }
                          },
                          {
                            label: 'Temporary Overrides',
                            icon: <CalendarClock className="w-3.5 h-3.5 text-slate-500" />,
                            onClick: () => navigate('/schedules/overrides')
                          },
                          {
                            label: 'Inspect Chambers',
                            icon: <Building2 className="w-3.5 h-3.5 text-slate-500" />,
                            onClick: () => {
                              if (affiliatedEsts[0]) {
                                navigate(`/establishments/${affiliatedEsts[0].id}`);
                              }
                            }
                          },
                          {
                            label: 'Copy Doctor ID',
                            icon: <Copy className="w-3.5 h-3.5 text-slate-500" />,
                            onClick: () => navigator.clipboard.writeText(doc.id)
                          }
                        ]}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDoctorForPhoto && (
        <Modal
          isOpen={isPhotoModalOpen}
          onClose={() => {
            setIsPhotoModalOpen(false);
            setSelectedDoctorForPhoto(null);
          }}
          title="Update Practitioner Photograph"
          subtitle={`Change public and directory avatar image for ${selectedDoctorForPhoto.fullName}.`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              {photoInput ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => setPhotoInput('')}
                >
                  Clear Photo
                </Button>
              ) : <div />}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsPhotoModalOpen(false);
                    setSelectedDoctorForPhoto(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleSavePhoto}
                >
                  Save Photo
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                {photoInput ? (
                  <img
                    src={photoInput}
                    alt="Doctor Preview"
                    className="w-24 h-24 rounded-2xl object-cover border-2 border-teal-600 shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-teal-100 text-teal-800 flex flex-col items-center justify-center font-bold text-lg border-2 border-dashed border-teal-300">
                    <Camera className="w-8 h-8 text-teal-700 mb-1" />
                    <span className="text-[10px] uppercase font-mono tracking-tight text-teal-700">No Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={<Upload className="w-3.5 h-3.5" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload New Photo
                  </Button>

                  <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                    <Input
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      placeholder="Paste image URL..."
                      className="h-8 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyUrl}
                      disabled={!urlInput.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500">Preset Avatars:</span>
                  {PRESET_AVATARS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPhotoInput(preset.url)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] transition-all cursor-pointer ${
                        photoInput === preset.url
                          ? 'bg-teal-50 border-teal-600 text-teal-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-4 h-4 rounded-full object-cover shrink-0"
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed bg-teal-50/60 border border-teal-200/70 rounded-lg p-3">
              Photograph changes are immediately syndicated across directory search, appointment slips, and clinic chamber badges.
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
