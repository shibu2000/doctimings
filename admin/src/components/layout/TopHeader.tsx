import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  User,
  LogOut,
  Settings as SettingsIcon,
  ShieldCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Input } from '../ui/Input';
import { formatTimestamp12h } from '../../utils/time';

export const TopHeader: React.FC = () => {
  const { currentUser, searchQuery, setSearchQuery, logout, reports, isBackendConnected, syncWithBackend } = useAdmin();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();

  const pendingReports = reports.filter(r => r.status === 'pending');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40 px-6 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl">
        <Input
          type="search"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search doctors, establishments, PIN codes, report IDs..."
          icon={<Search className="w-4 h-4 text-slate-400" />}
          className="bg-slate-50 focus:bg-white text-xs"
          suffix={
            <div className="hidden sm:flex items-center gap-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-2xs">
              <span>⌘</span>
              <span>K</span>
            </div>
          }
        />
      </form>

      <div className="flex items-center gap-4">
        <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          isBackendConnected
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
          <span>{isBackendConnected ? 'Backend Live' : 'Backend Offline'}</span>
        </div>

        <button
          onClick={() => navigate('/reports')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold hover:bg-amber-100 transition-colors"
        >
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Queue: {pendingReports.length}</span>
        </button>

        <button
          onClick={() => syncWithBackend()}
          title="Fetch fresh data from backend API"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-teal-700" />
        </button>

        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {pendingReports.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600"></span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Operational Alerts
                </span>
                <span className="text-[10px] font-semibold text-teal-700">
                  {pendingReports.length} Pending
                </span>
              </div>
              <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                {pendingReports.map(rpt => (
                  <div
                    key={rpt.id}
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate(`/reports/${rpt.id}`);
                    }}
                    className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer border border-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-800">
                      <span>{rpt.issueTitle}</span>
                      <span className="text-amber-600 font-mono text-[10px]">Pending</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {rpt.doctorName} at {rpt.establishmentName}
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1">
                      {formatTimestamp12h(rpt.observedTimestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200"></div>

        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <img
                src={
                  currentUser.avatarUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'
                }
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 leading-tight">
                  {currentUser.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold">
                    <ShieldCheck className="w-3 h-3" />
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/users');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Account & Access</span>
                </button>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Preferences</span>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
