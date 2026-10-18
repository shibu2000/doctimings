import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarCheck, Stethoscope, Building2, MessageSquareWarning, Users, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useDirectory } from '../../lib/directory';
import { cn } from '../../lib/cn';
import { BrandLogo } from './BrandLogo';
import { QuickFind } from './QuickFind';

const NAV = [
  { to: '/', label: 'Today', icon: CalendarCheck, end: true },
  { to: '/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/establishments', label: 'Establishments', icon: Building2 },
  { to: '/reports', label: 'Reports', icon: MessageSquareWarning, badge: 'reports' as const },
  { to: '/team', label: 'Team & activity', icon: Users }
];

const Sidebar = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, signOut } = useAuth();
  const { directory } = useDirectory();
  const pending = (directory?.pendingReports ?? 0) + (directory?.pendingClaims ?? 0);

  return (
    <div className="flex flex-col h-full bg-[#115E59] text-teal-50">
      <div className="flex items-center gap-2.5 px-5 h-16">
        <BrandLogo size={32} />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">DocTimings</p>
          <p className="text-[11px] text-teal-200">Admin</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 h-10 text-sm font-medium transition-colors',
                isActive ? 'bg-white/15 text-white' : 'text-teal-100 hover:bg-white/10 hover:text-white'
              )
            }
          >
            <item.icon className="w-[18px] h-[18px]" />
            <span className="flex-1">{item.label}</span>
            {item.badge && pending > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-amber-950 text-xs font-bold grid place-items-center">{pending}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-white truncate">{user?.name}</p>
          <p className="text-xs text-teal-200 truncate">{user?.role}</p>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 rounded-lg px-3 h-9 text-sm text-teal-100 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export const AppShell = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-60">
        <Sidebar />
      </aside>
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <button onClick={() => setMenuOpen(false)} className="absolute right-3 top-4 text-teal-100 p-1" aria-label="Close menu">
              <X className="w-5 h-5" />
            </button>
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8 max-w-6xl">
            <button onClick={() => setMenuOpen(true)} className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <QuickFind />
          </div>
        </header>
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
