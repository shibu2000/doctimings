import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DoctorsDirectoryPage } from './pages/doctors/DoctorsDirectoryPage';
import { AddDoctorPage } from './pages/doctors/AddDoctorPage';
import { DoctorDetailPage } from './pages/doctors/DoctorDetailPage';
import { SchedulesPage } from './pages/schedules/SchedulesPage';
import { ManageDoctorSchedulePage } from './pages/schedules/ManageDoctorSchedulePage';
import { TemporaryOverridesPage } from './pages/schedules/TemporaryOverridesPage';
import { EstablishmentsPage } from './pages/establishments/EstablishmentsPage';
import { AddEstablishmentPage } from './pages/establishments/AddEstablishmentPage';
import { EstablishmentDetailPage } from './pages/establishments/EstablishmentDetailPage';
import { PracticeLocationsPage } from './pages/establishments/PracticeLocationsPage';
import { VerificationQueuePage } from './pages/verification/VerificationQueuePage';
import { CommunityReportsPage } from './pages/reports/CommunityReportsPage';
import { ReportDetailPage } from './pages/reports/ReportDetailPage';
import { HealthGuidePage } from './pages/health-guide/HealthGuidePage';
import { HealthTopicsPage } from './pages/health-guide/HealthTopicsPage';
import { AddEditArticlePage } from './pages/health-guide/AddEditArticlePage';
import { TerritoriesPage } from './pages/territories/TerritoriesPage';
import { UsersAccessPage } from './pages/users/UsersAccessPage';
import { AuditLogPage } from './pages/audit/AuditLogPage';
import { SystemSettingsPage } from './pages/settings/SystemSettingsPage';
import { TitleUpdater } from './components/common/TitleUpdater';

export function App() {
  return (
    <AdminProvider>
      <BrowserRouter>
        <TitleUpdater />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<AdminLayout />}>
            <Route path="/" element={<DashboardPage />} />
            
            <Route path="/doctors" element={<DoctorsDirectoryPage />} />
            <Route path="/doctors/new" element={<AddDoctorPage />} />
            <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            
            <Route path="/establishments" element={<EstablishmentsPage />} />
            <Route path="/establishments/new" element={<AddEstablishmentPage />} />
            <Route path="/establishments/:id" element={<EstablishmentDetailPage />} />
            <Route path="/practice-locations" element={<PracticeLocationsPage />} />
            
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/schedules/doctor/:doctorId/establishment/:establishmentId" element={<ManageDoctorSchedulePage />} />
            <Route path="/schedules/overrides" element={<TemporaryOverridesPage />} />
            <Route path="/schedules/overrides/doctor/:doctorId/establishment/:establishmentId" element={<TemporaryOverridesPage />} />
            
            <Route path="/health-guide" element={<HealthGuidePage />} />
            <Route path="/health-guide/new" element={<AddEditArticlePage />} />
            <Route path="/health-guide/edit/:id" element={<AddEditArticlePage />} />
            <Route path="/health-topics" element={<HealthTopicsPage />} />
            
            <Route path="/verification-queue" element={<VerificationQueuePage />} />
            <Route path="/reports" element={<CommunityReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
            
            <Route path="/territories" element={<TerritoriesPage />} />
            <Route path="/users" element={<UsersAccessPage />} />
            <Route path="/settings" element={<SystemSettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminProvider>
  );
}

export default App;
