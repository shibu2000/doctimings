import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';

export const TitleUpdater: React.FC = () => {
  const location = useLocation();
  const { doctors, establishments, reports } = useAdmin();

  useEffect(() => {
    const path = location.pathname;
    const baseSuffix = ' · DocTimings';

    if (path === '/login') {
      document.title = `Sign In${baseSuffix}`;
      return;
    }

    if (path === '/') {
      document.title = `Dashboard${baseSuffix}`;
      return;
    }

    if (path === '/doctors') {
      document.title = `Doctors Directory${baseSuffix}`;
      return;
    }

    if (path === '/doctors/new') {
      document.title = `Add Doctor${baseSuffix}`;
      return;
    }

    if (path.startsWith('/doctors/')) {
      const parts = path.split('/');
      const id = parts[2];
      const sub = parts[3];
      const doc = doctors.find(d => d.id === id);
      const name = doc ? doc.fullName : 'Doctor Profile';
      if (sub === 'schedule') {
        document.title = `Schedule: ${name}${baseSuffix}`;
      } else if (sub === 'overrides') {
        document.title = `Overrides: ${name}${baseSuffix}`;
      } else {
        document.title = `${name}${baseSuffix}`;
      }
      return;
    }

    if (path === '/establishments') {
      document.title = `Establishments${baseSuffix}`;
      return;
    }

    if (path === '/establishments/new') {
      document.title = `Add Establishment${baseSuffix}`;
      return;
    }

    if (path.startsWith('/establishments/')) {
      const id = path.split('/')[2];
      const est = establishments.find(e => e.id === id);
      document.title = `${est ? est.name : 'Establishment'}${baseSuffix}`;
      return;
    }

    if (path === '/practice-locations') {
      document.title = `Practice Locations${baseSuffix}`;
      return;
    }

    if (path === '/schedules') {
      document.title = `Master Schedules${baseSuffix}`;
      return;
    }

    if (path.startsWith('/schedules/doctor')) {
      document.title = `Manage Schedule${baseSuffix}`;
      return;
    }

    if (path.startsWith('/schedules/overrides')) {
      document.title = `Temporary Overrides${baseSuffix}`;
      return;
    }

    if (path === '/health-guide') {
      document.title = `Health Guide${baseSuffix}`;
      return;
    }

    if (path === '/health-guide/new') {
      document.title = `Create Health Article${baseSuffix}`;
      return;
    }

    if (path.startsWith('/health-guide/edit/')) {
      document.title = `Edit Health Article${baseSuffix}`;
      return;
    }

    if (path === '/health-topics') {
      document.title = `Health Topics${baseSuffix}`;
      return;
    }

    if (path === '/verification-queue') {
      document.title = `Verification Queue${baseSuffix}`;
      return;
    }

    if (path === '/reports') {
      document.title = `Community Reports${baseSuffix}`;
      return;
    }

    if (path.startsWith('/reports/')) {
      const id = path.split('/')[2];
      const rep = reports.find(r => r.id === id);
      document.title = `Report #${rep ? rep.id : id}${baseSuffix}`;
      return;
    }

    if (path === '/audit-log') {
      document.title = `Audit Log${baseSuffix}`;
      return;
    }

    if (path === '/territories') {
      document.title = `Territory Management${baseSuffix}`;
      return;
    }

    if (path === '/users') {
      document.title = `Users & Access${baseSuffix}`;
      return;
    }

    if (path === '/settings') {
      document.title = `System Settings${baseSuffix}`;
      return;
    }

    document.title = `DocTimings — Admin Operations & Governance Portal`;
  }, [location.pathname, doctors, establishments, reports]);

  return null;
};
