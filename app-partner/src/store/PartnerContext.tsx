import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Establishment, PracticeLocation, Doctor, TemporaryOverride } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface PartnerContextType {
  currentEstablishment: Establishment | null;
  establishments: Establishment[];
  practiceLocations: PracticeLocation[];
  rosterDoctors: Doctor[];
  overrides: TemporaryOverride[];
  isLoadingEstablishment: boolean;
  unreadNotificationsCount: number;
  setEstablishment: (est: Establishment) => Promise<void>;
  refreshAll: () => Promise<void>;
  refreshLocations: () => Promise<void>;
  refreshDoctors: () => Promise<void>;
  refreshOverrides: () => Promise<void>;
}

const PartnerContext = createContext<PartnerContextType>({
  currentEstablishment: null,
  establishments: [],
  practiceLocations: [],
  rosterDoctors: [],
  overrides: [],
  isLoadingEstablishment: false,
  unreadNotificationsCount: 2,
  setEstablishment: async () => {},
  refreshAll: async () => {},
  refreshLocations: async () => {},
  refreshDoctors: async () => {},
  refreshOverrides: async () => {},
});

export const PartnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [currentEstablishment, setCurrentEstablishment] = useState<Establishment | null>(null);
  const [practiceLocations, setPracticeLocations] = useState<PracticeLocation[]>([]);
  const [rosterDoctors, setRosterDoctors] = useState<Doctor[]>([]);
  const [overrides, setOverrides] = useState<TemporaryOverride[]>([]);
  const [isLoadingEstablishment, setIsLoadingEstablishment] = useState(false);
  const [unreadNotificationsCount] = useState(2);

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
    try {
      const res = await api.getDoctors({ establishmentId: currentEstablishment.id });
      if (res.success && res.data) {
        setRosterDoctors(res.data);
      }
    } catch (e) {
      console.error('Failed to load roster doctors:', e);
    }
  }, [currentEstablishment]);

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
    if (!isAuthenticated) return;
    setIsLoadingEstablishment(true);
    try {
      const estRes = await api.getEstablishments();
      if (estRes.success && estRes.data && estRes.data.length > 0) {
        setEstablishments(estRes.data);
        const savedId = await api.getSavedEstablishmentId();
        let target = estRes.data.find(e => e.id === savedId);
        if (!target && user?.establishmentId) {
          target = estRes.data.find(e => e.id === user.establishmentId);
        }
        if (!target) {
          target = estRes.data[0];
        }
        setCurrentEstablishment(target);
        if (target) {
          await api.saveEstablishmentId(target.id);
        }
      }
    } catch (err) {
      console.error('Failed to refresh partner establishment:', err);
    } finally {
      setIsLoadingEstablishment(false);
    }
  }, [isAuthenticated, user?.establishmentId]);

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
    }
  }, [currentEstablishment, refreshLocations, refreshDoctors, refreshOverrides]);

  const setEstablishment = async (est: Establishment) => {
    setCurrentEstablishment(est);
    await api.saveEstablishmentId(est.id);
  };

  return (
    <PartnerContext.Provider
      value={{
        currentEstablishment,
        establishments,
        practiceLocations,
        rosterDoctors,
        overrides,
        isLoadingEstablishment,
        unreadNotificationsCount,
        setEstablishment,
        refreshAll,
        refreshLocations,
        refreshDoctors,
        refreshOverrides,
      }}
    >
      {children}
    </PartnerContext.Provider>
  );
};

export const usePartner = () => useContext(PartnerContext);
