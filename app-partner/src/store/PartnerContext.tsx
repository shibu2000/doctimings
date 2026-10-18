import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AccessRole, Establishment, PracticeLocation, Doctor, DoctorScheduleSlot, TemporaryOverride } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface PartnerContextType {
  currentEstablishment: Establishment | null;
  establishments: Establishment[];
  practiceLocations: PracticeLocation[];
  rosterDoctors: Doctor[];
  schedules: DoctorScheduleSlot[];
  overrides: TemporaryOverride[];
  isLoadingEstablishment: boolean;
  accessRole: AccessRole | null;
  isDoctor: boolean;
  canManagePeople: boolean;
  unreadNotificationsCount: number;
  setEstablishment: (est: Establishment) => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshLocations: () => Promise<void>;
  refreshDoctors: () => Promise<void>;
  refreshOverrides: () => Promise<void>;
  refreshSchedules: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType>({
  currentEstablishment: null,
  establishments: [],
  practiceLocations: [],
  rosterDoctors: [],
  schedules: [],
  overrides: [],
  isLoadingEstablishment: false,
  accessRole: null,
  isDoctor: false,
  canManagePeople: false,
  unreadNotificationsCount: 0,
  setEstablishment: async () => {},
  refreshAll: async () => {},
  refreshLocations: async () => {},
  refreshDoctors: async () => {},
  refreshOverrides: async () => {},
  refreshSchedules: async () => {},
});

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, account, refreshAccount } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [currentEstablishment, setCurrentEstablishment] = useState<Establishment | null>(null);
  const [practiceLocations, setPracticeLocations] = useState<PracticeLocation[]>([]);
  const [rosterDoctors, setRosterDoctors] = useState<Doctor[]>([]);
  const [overrides, setOverrides] = useState<TemporaryOverride[]>([]);
  const [schedules, setSchedules] = useState<DoctorScheduleSlot[]>([]);
  const [isLoadingEstablishment, setIsLoadingEstablishment] = useState(false);
  const unreadNotificationsCount = 0;
  const isDoctor = Boolean(account?.doctor) && !account?.establishments.length;
  const accessRole: AccessRole | null = isDoctor ? 'Doctor' : currentEstablishment?.memberRole ?? null;
  const canManagePeople = accessRole === 'Owner';

  const refreshLocations = useCallback(async () => {
    if (!currentEstablishment) return;
    try {
      const res = await api.getPracticeLocations(currentEstablishment.id);
      if (res.success && res.data) {
        setPracticeLocations(res.data);
      }
    } catch (e) {
      console.error('Failed to load practice locations:', e);
    }
  }, [currentEstablishment]);

  const refreshDoctors = useCallback(async () => {
    if (!currentEstablishment) return;
    if (isDoctor && account?.doctor) {
      const res = await api.getDoctorById(account.doctor.id);
      if (res.success && res.data) setRosterDoctors([res.data]);
      return;
    }
    try {
      const res = await api.getDoctors({ establishmentId: currentEstablishment.id });
      if (res.success && res.data) {
        setRosterDoctors(res.data);
      }
    } catch (e) {
      console.error('Failed to load roster doctors:', e);
    }
  }, [currentEstablishment, isDoctor, account?.doctor]);

  const refreshSchedules = useCallback(async () => {
    if (!currentEstablishment) return;
    const res = await api.getSchedules(
      isDoctor && account?.doctor
        ? { doctorId: account.doctor.id, establishmentId: currentEstablishment.id }
        : { establishmentId: currentEstablishment.id }
    );
    if (res.success && res.data) setSchedules(res.data);
  }, [currentEstablishment, isDoctor, account?.doctor]);

  const refreshOverrides = useCallback(async () => {
    if (!currentEstablishment) return;
    try {
      const res = await api.getOverrides({ establishmentId: currentEstablishment.id });
      if (res.success && res.data) {
        setOverrides(res.data);
      }
    } catch (e) {
      console.error('Failed to load overrides:', e);
    }
  }, [currentEstablishment]);

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated || !account) return;
    setIsLoadingEstablishment(true);
    try {
      const places = account.establishments.length ? account.establishments : account.doctor?.establishments ?? [];
      setEstablishments(places);
      const savedId = await api.getSavedEstablishmentId();
      const target = places.find(e => e.id === savedId) ?? places[0] ?? null;
      setCurrentEstablishment(target);
      if (target) await api.saveEstablishmentId(target.id);
    } finally {
      setIsLoadingEstablishment(false);
    }
  }, [isAuthenticated, account]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    } else {
      setCurrentEstablishment(null);
      setEstablishments([]);
      setPracticeLocations([]);
      setRosterDoctors([]);
      setOverrides([]);
    }
  }, [isAuthenticated, refreshAll]);

  useEffect(() => {
    if (currentEstablishment) {
      refreshLocations();
      refreshDoctors();
      refreshOverrides();
      refreshSchedules();
    }
  }, [currentEstablishment, refreshLocations, refreshDoctors, refreshOverrides, refreshSchedules]);

  const setEstablishment = async (est: Establishment) => {
    if (!establishments.some(e => e.id === est.id)) return;
    setCurrentEstablishment(est);
    await api.saveEstablishmentId(est.id);
  };

  const refreshEverything = useCallback(async () => {
    await refreshAccount();
  }, [refreshAccount]);

  return (
    <PartnerContext.Provider
      value={{
        currentEstablishment,
        establishments,
        practiceLocations,
        rosterDoctors,
        schedules,
        overrides,
        isLoadingEstablishment,
        accessRole,
        isDoctor,
        canManagePeople,
        unreadNotificationsCount,
        setEstablishment,
        refreshAll: refreshEverything,
        refreshLocations,
        refreshDoctors,
        refreshOverrides,
        refreshSchedules,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
