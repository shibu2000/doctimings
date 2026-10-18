import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './lib/auth';
import { AppShell } from './components/layout/AppShell';
import { Loading } from './components/ui/Layout';
import { LoginPage } from './pages/LoginPage';
import { TodayPage } from './pages/TodayPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorNewPage } from './pages/DoctorNewPage';
import { DoctorPage } from './pages/DoctorPage';
import { EstablishmentsPage } from './pages/EstablishmentsPage';
import { EstablishmentNewPage } from './pages/EstablishmentNewPage';
import { EstablishmentPage } from './pages/EstablishmentPage';
import { ReportsPage } from './pages/ReportsPage';
import { TeamPage } from './pages/TeamPage';

const TITLES: [RegExp, string][] = [
  [/^\/login/, 'Sign in'],
  [/^\/doctors\/new/, 'Add doctor'],
  [/^\/doctors\/.+/, 'Doctor'],
  [/^\/doctors/, 'Doctors'],
  [/^\/establishments\/new/, 'Add establishment'],
  [/^\/establishments\/.+/, 'Establishment'],
  [/^\/establishments/, 'Establishments'],
  [/^\/reports/, 'Reports'],
  [/^\/team/, 'Team & activity'],
  [/^\/$/, 'Today']
];

const RequireAuth = () => {
  const { user, checking } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  if (checking) return <Loading label="Checking your session…" />;
  return <AppShell />;
};

export const App = () => {
  const location = useLocation();

  useEffect(() => {
    const title = TITLES.find(([pattern]) => pattern.test(location.pathname))?.[1];
    document.title = title ? `${title} · DocTimings Admin` : 'DocTimings Admin';
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route index element={<TodayPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/new" element={<DoctorNewPage />} />
        <Route path="doctors/:id" element={<DoctorPage />} />
        <Route path="establishments" element={<EstablishmentsPage />} />
        <Route path="establishments/new" element={<EstablishmentNewPage />} />
        <Route path="establishments/:id" element={<EstablishmentPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
