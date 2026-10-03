import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Stethoscope,
  Building2,
  MapPin,
  CalendarDays,
  BookmarkCheck,
  BookOpen,
  CheckCircle2,
  Flag,
  History,
  Map,
  Users,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { BrandLogo } from '../common/BrandLogo';

export const Sidebar: React.FC = () => {
  const { currentUser, doctors, establishments, reports, logout } = useAdmin();

  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#115E59] text-white z-50 flex flex-col justify-between overflow-y-auto border-r border-[#0D4A46] select-none shadow-xl">
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[#0D4A46]/60 bg-[#0D4A46]/40">
          <BrandLogo size={36} className="shrink-0 shadow-sm rounded-lg" />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white truncate tracking-tight">
                DocTimings
              </span>
              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-white/20 text-white font-bold tracking-wider">
                OPS
              </span>
            </div>
            <span className="text-[10px] text-[#CCFBF1]/80 truncate tracking-wider uppercase font-medium">
              Internal Admin Portal
            </span>
          </div>
        </div>

        <nav className="flex flex-col px-3 py-3 space-y-4 text-xs">
          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-[#CCFBF1]/70 uppercase tracking-wider">
              Overview
            </div>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                    : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </NavLink>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-[#CCFBF1]/70 uppercase tracking-wider">
              Healthcare Catalog
            </div>
            <div className="space-y-0.5">
              <NavLink
                to="/doctors"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 shrink-0" />
                  <span>Doctors</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">
                  {doctors.length}
                </span>
              </NavLink>

              <NavLink
                to="/establishments"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>Establishments</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white font-mono">
                  {establishments.length}
                </span>
              </NavLink>

              <NavLink
                to="/practice-locations"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Practice Locations</span>
              </NavLink>

              <NavLink
                to="/schedules"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <CalendarDays className="w-4 h-4 shrink-0" />
                <span>Schedules</span>
              </NavLink>
            </div>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-[#CCFBF1]/70 uppercase tracking-wider">
              Content & Discovery
            </div>
            <div className="space-y-0.5">
              <NavLink
                to="/health-topics"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <BookmarkCheck className="w-4 h-4 shrink-0" />
                <span>Health Topics</span>
              </NavLink>

              <NavLink
                to="/health-guide"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Health Guide</span>
              </NavLink>
            </div>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-[#CCFBF1]/70 uppercase tracking-wider">
              Verification & Audit
            </div>
            <div className="space-y-0.5">
              <NavLink
                to="/verification-queue"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Verification Queue</span>
                </div>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white font-mono">
                  28
                </span>
              </NavLink>

              <NavLink
                to="/reports"
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <Flag className="w-4 h-4 shrink-0" />
                  <span>Community Reports</span>
                </div>
                {pendingReportsCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white font-mono animate-pulse">
                    {pendingReportsCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to="/audit-log"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <History className="w-4 h-4 shrink-0" />
                <span>Audit Log</span>
              </NavLink>
            </div>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-[#CCFBF1]/70 uppercase tracking-wider">
              Geography & Access
            </div>
            <div className="space-y-0.5">
              <NavLink
                to="/territories"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <Map className="w-4 h-4 shrink-0" />
                <span>Territories & PINs</span>
              </NavLink>

              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                      : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                  }`
                }
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Users & Roles</span>
              </NavLink>
            </div>
          </div>

          <div>
            <div className="px-3 pb-1 text-[10px] font-bold text-[#CCFBF1]/70 uppercase tracking-wider">
              System
            </div>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-sm'
                    : 'text-white/80 hover:bg-[#136C66] hover:text-white'
                }`
              }
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>System Settings</span>
            </NavLink>
          </div>
        </nav>
      </div>

      <div className="p-3 border-t border-[#0D4A46]/60 bg-[#0D4A46]/30 flex flex-col gap-2">
        <div className="p-2.5 rounded-lg border border-dashed border-teal-300/30 bg-[#0F766E]/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-[#CCFBF1] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-teal-300" /> Roadmap
            </span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-teal-800/80 text-[#CCFBF1]">
              Queued
            </span>
          </div>
          <p className="text-[10px] text-white/70 leading-tight">
            Appointments, Doctor Self-Claim, Real-time Availability & Telemedicine.
          </p>
        </div>

        {currentUser && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=120'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-white/20 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-[#CCFBF1]/80 truncate">
                  {currentUser.role}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
