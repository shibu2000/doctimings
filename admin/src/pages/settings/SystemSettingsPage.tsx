import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Bell, 
  Languages, 
  AlertTriangle, 
  Save, 
  CheckCircle2, 
  RefreshCw, 
  Database, 
  Trash2,
  ChevronRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { Radio } from '../../components/ui/Radio';

export const SystemSettingsPage: React.FC = () => {
  const { logAuditEvent } = useAdmin();
  const [showToast, setShowToast] = useState(false);
  const [activeNav, setActiveNav] = useState('platform-info');
  
  const [platformName, setPlatformName] = useState('DocTimings');
  const [supportPhone, setSupportPhone] = useState('+91 98320 12345');
  const [supportEmail, setSupportEmail] = useState('ops@doctimings.com');
  const [platformMode, setPlatformMode] = useState('READ_ONLY_CATALOG');

  const defaultState = 'West Bengal';
  const [defaultDistrict, setDefaultDistrict] = useState('Purba Bardhaman');
  const [defaultRadius, setDefaultRadius] = useState(15);
  const [maxRadius, setMaxRadius] = useState(50);

  const [scheduleReminderDays, setScheduleReminderDays] = useState(30);
  const [establishmentReminderDays, setEstablishmentReminderDays] = useState(90);

  const [notifyReports, setNotifyReports] = useState(true);
  const [notifyInvites, setNotifyInvites] = useState(true);
  const [notifyInconsistencies, setNotifyInconsistencies] = useState(true);

  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'bn'>('en');

  const [dangerModal, setDangerModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'RESET_DATA' | 'CLEAR_CACHE' | 'REINDEX';
  }>({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'CLEAR_CACHE'
  });

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowToast(true);
    logAuditEvent(
      'Updated system settings',
      'Article',
      'SYSTEM-CONFIG',
      'Platform Configuration',
      'Saved location radius defaults and freshness thresholds'
    );
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  const handleConfirmDangerAction = () => {
    if (dangerModal.actionType === 'RESET_DATA') {
      localStorage.clear();
      logAuditEvent('Executed demo data reset', 'Article', 'SYSTEM-RESET', 'Platform Reset', 'Restored localStorage to seed data');
      window.location.reload();
    } else if (dangerModal.actionType === 'CLEAR_CACHE') {
      logAuditEvent('Flushed application cache', 'Article', 'CACHE-CLEAR', 'Application Cache', 'Purged in-memory runtime cache');
      setShowToast(true);
    } else if (dangerModal.actionType === 'REINDEX') {
      logAuditEvent('Triggered search index recalculation', 'Article', 'SEARCH-REINDEX', 'Search Index', 'Re-indexed all doctors and establishments');
      setShowToast(true);
    }
    setDangerModal(prev => ({ ...prev, isOpen: false }));
  };

  const modeOptions = [
    { value: 'READ_ONLY_CATALOG', label: 'Operational Search Directory (Zero Patient PII)' },
    { value: 'HYBRID_ASSIST', label: 'Verified Chamber Booking Assistance' }
  ];

  const districtOptions = [
    { value: 'Purba Bardhaman', label: 'Purba Bardhaman' },
    { value: 'Nadia', label: 'Nadia' },
    { value: 'Jhargram', label: 'Jhargram' },
    { value: 'Hooghly', label: 'Hooghly' },
    { value: 'Birbhum', label: 'Birbhum' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <nav className="flex items-center gap-1 text-xs text-slate-500 mb-1">
            <span>System</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-teal-800 font-semibold">System Settings</span>
          </nav>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure essential platform metadata, operational freshness thresholds, and discovery parameters.
          </p>
        </div>

        {showToast && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg shadow-sm text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully</span>
            <button onClick={() => setShowToast(false)} className="ml-1 text-emerald-600 hover:text-emerald-900 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="w-full lg:w-64 shrink-0 space-y-4 lg:sticky lg:top-24">
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs space-y-1">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Navigation</div>
            
            <a
              href="#platform-info"
              onClick={() => setActiveNav('platform-info')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeNav === 'platform-info' ? 'bg-teal-50 text-teal-800 border border-teal-100' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Platform Info
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="#location-defaults"
              onClick={() => setActiveNav('location-defaults')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeNav === 'location-defaults' ? 'bg-teal-50 text-teal-800 border border-teal-100 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location Defaults
              </span>
            </a>

            <a
              href="#information-freshness"
              onClick={() => setActiveNav('information-freshness')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeNav === 'information-freshness' ? 'bg-teal-50 text-teal-800 border border-teal-100 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Information Freshness
              </span>
            </a>

            <a
              href="#admin-notifications"
              onClick={() => setActiveNav('admin-notifications')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeNav === 'admin-notifications' ? 'bg-teal-50 text-teal-800 border border-teal-100 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Admin Notifications
              </span>
            </a>

            <a
              href="#admin-language"
              onClick={() => setActiveNav('admin-language')}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeNav === 'admin-language' ? 'bg-teal-50 text-teal-800 border border-teal-100 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Admin Language
              </span>
            </a>

            <a
              href="#danger-zone"
              onClick={() => setActiveNav('danger-zone')}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </span>
            </a>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Uptime</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 99.8%
              </span>
            </div>

            <div className="h-10 w-full flex items-end gap-1.5 pt-1 border-b border-slate-100 pb-2">
              <div className="flex-1 bg-teal-100 rounded-t h-4" title="Mon"></div>
              <div className="flex-1 bg-teal-200 rounded-t h-6" title="Tue"></div>
              <div className="flex-1 bg-teal-300 rounded-t h-8" title="Wed"></div>
              <div className="flex-1 bg-teal-400 rounded-t h-6" title="Thu"></div>
              <div className="flex-1 bg-teal-500 rounded-t h-9" title="Fri"></div>
              <div className="flex-1 bg-teal-700 rounded-t h-full" title="Sat"></div>
              <div className="flex-1 bg-teal-800 rounded-t h-8" title="Sun"></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Database Version:</span>
              <span className="font-mono font-semibold text-slate-700">v2.4-bengal</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Last Snapshot:</span>
              <span className="font-mono text-slate-700">Today 05:30 IST</span>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full space-y-6">
          <section id="platform-info" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Platform Information</h2>
                  <p className="text-xs text-slate-500">Identity details and public contact channels.</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Public Metadata</span>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Platform Brand Name"
                  value={platformName}
                  onChange={e => setPlatformName(e.target.value)}
                />
                <Select
                  label="Operational Mode"
                  value={platformMode}
                  onChange={e => setPlatformMode(e.target.value)}
                  options={modeOptions}
                />
                <Input
                  label="Support Contact Hotline"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                />
                <Input
                  label="Support Email Desk"
                  type="email"
                  value={supportEmail}
                  onChange={e => setSupportEmail(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </section>

          <section id="location-defaults" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Location & Radial Defaults</h2>
                  <p className="text-xs text-slate-500">Proximity parameters for rural doctor discovery.</p>
                </div>
              </div>
              <Badge variant="teal">Haversine Radial</Badge>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Default State"
                  disabled
                  value={defaultState}
                />
                <Select
                  label="Primary Operational District"
                  value={defaultDistrict}
                  onChange={e => setDefaultDistrict(e.target.value)}
                  options={districtOptions}
                />
                <Input
                  label="Default Search Radius (km)"
                  type="number"
                  min={2}
                  max={100}
                  value={defaultRadius}
                  onChange={e => setDefaultRadius(parseInt(e.target.value) || 15)}
                />
                <Input
                  label="Maximum Allowed Radius (km)"
                  type="number"
                  min={10}
                  max={200}
                  value={maxRadius}
                  onChange={e => setMaxRadius(parseInt(e.target.value) || 50)}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </section>

          <section id="information-freshness" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Information Freshness Thresholds</h2>
                  <p className="text-xs text-slate-500">Automated verification triggers based on record age.</p>
                </div>
              </div>
              <Badge variant="warning">Audit Cadence</Badge>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <Input
                    label="Schedule Review Reminder"
                    type="number"
                    min={7}
                    max={180}
                    value={scheduleReminderDays}
                    onChange={e => setScheduleReminderDays(parseInt(e.target.value) || 30)}
                    suffix={<span className="text-xs font-mono text-slate-400">days</span>}
                    helperText="Flag weekly schedules that have not been re-audited via proprietor call."
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <Input
                    label="Establishment Review Reminder"
                    type="number"
                    min={30}
                    max={365}
                    value={establishmentReminderDays}
                    onChange={e => setEstablishmentReminderDays(parseInt(e.target.value) || 90)}
                    suffix={<span className="text-xs font-mono text-slate-400">days</span>}
                    helperText="Flag medical store & chamber facility details that need re-verification."
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-800 shrink-0" />
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-800">Standard Operating Guideline:</strong> Timely reminders prevent ghost chambers and out-of-date timings across semi-urban clinics.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </section>

          <section id="admin-notifications" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Admin Notifications</h2>
                  <p className="text-xs text-slate-500">In-app notifications and routing toggles.</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <Switch
                  checked={notifyReports}
                  onChange={setNotifyReports}
                  label="New Community Reports"
                  description="Receive immediate in-app badges when patients submit timing discrepancies."
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <Switch
                  checked={notifyInvites}
                  onChange={setNotifyInvites}
                  label="Pending Counter Staff Invitations"
                  description="Notify ops staff about pharmacy portal invitations remaining pending past 7 days."
                />
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                <Switch
                  checked={notifyInconsistencies}
                  onChange={setNotifyInconsistencies}
                  label="Schedule Inconsistency Alerts"
                  description="Highlight when an active doctor has overlapping slots across different establishments."
                />
              </div>
            </div>
          </section>

          <section id="admin-language" className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden scroll-mt-24">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center">
                  <Languages className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">Admin Language</h2>
                  <p className="text-xs text-slate-500">Display language for operational administrative interface.</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setSelectedLanguage('en')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLanguage === 'en' ? 'border-teal-700 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Radio
                    name="adminLanguage"
                    checked={selectedLanguage === 'en'}
                    onChange={() => setSelectedLanguage('en')}
                    label="English (India)"
                    description="Default administrative console language"
                  />
                </div>

                <div
                  onClick={() => setSelectedLanguage('bn')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedLanguage === 'bn' ? 'border-teal-700 bg-teal-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <Radio
                    name="adminLanguage"
                    checked={selectedLanguage === 'bn'}
                    onChange={() => setSelectedLanguage('bn')}
                    label="বাংলা (Bengali)"
                    description="বাংলা অনুবাদিত অ্যাডমিন প্যানেল"
                  />
                </div>
              </div>
            </div>
          </section>

          <section id="danger-zone" className="bg-white rounded-xl border border-rose-200 shadow-xs overflow-hidden scroll-mt-24">
            <div className="px-6 py-4 bg-rose-50/70 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-rose-900 leading-tight">Danger Zone</h2>
                  <p className="text-xs text-rose-700">Irreversible maintenance and dataset manipulation commands.</p>
                </div>
              </div>
              <Badge variant="error">Restricted Action</Badge>
            </div>

            <div className="p-6 divide-y divide-slate-100">
              <div className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Re-index Search Catalog</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recomputes inverted doctor and clinic indexes across all active West Bengal PIN codes.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                  onClick={() => setDangerModal({
                    isOpen: true,
                    title: 'Re-index Search Catalog?',
                    message: 'This will invalidate current memory caches and re-evaluate proximity vectors for all 2,000+ doctors and clinics.',
                    actionType: 'REINDEX'
                  })}
                >
                  Re-index Catalog
                </Button>
              </div>

              <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Flush Application Cache</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Purges in-memory API response cache, forcing next read requests to hit primary storage.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Database className="w-3.5 h-3.5" />}
                  onClick={() => setDangerModal({
                    isOpen: true,
                    title: 'Flush Application Cache?',
                    message: 'Purging caches will cause a temporary latency bump for public directory searches while caches warm up.',
                    actionType: 'CLEAR_CACHE'
                  })}
                >
                  Flush Cache
                </Button>
              </div>

              <div className="py-4 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-rose-900">Reset Local Demonstration Data</h3>
                  <p className="text-xs text-rose-600 mt-0.5">
                    Restores doctor listings, overrides, and verification queues back to initial mock state.
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<Trash2 className="w-3.5 h-3.5" />}
                  onClick={() => setDangerModal({
                    isOpen: true,
                    title: 'Reset Local Demonstration Data?',
                    message: 'All added doctors, resolved community tickets, and custom schedules will be reset to default seed data.',
                    actionType: 'RESET_DATA'
                  })}
                >
                  Reset Demo State
                </Button>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmationModal
        isOpen={dangerModal.isOpen}
        title={dangerModal.title}
        message={dangerModal.message}
        confirmLabel="Proceed"
        cancelLabel="Cancel"
        isDestructive={dangerModal.actionType === 'RESET_DATA'}
        onConfirm={handleConfirmDangerAction}
        onClose={() => setDangerModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
