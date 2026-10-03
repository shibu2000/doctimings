import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Doctor,
  Establishment,
  ScheduleSlot,
  ScheduleOverride,
  CommunityReport,
  HealthTopic,
  HealthArticle,
  AdminUser,
  AuditLogEntry,
  Territory,
  ResolutionOutcome
} from '../types';
import { apiClient, clearAuthToken, getAuthToken } from '../api/client';

// Purge legacy mock data cache from browser localStorage on init
const LEGACY_STORAGE_KEYS = [
  'wimd_doctors',
  'wimd_establishments',
  'wimd_schedules',
  'wimd_overrides',
  'wimd_reports',
  'wimd_articles',
  'wimd_users',
  'wimd_audit_logs'
];

try {
  LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
} catch {}

interface AdminContextType {
  currentUser: AdminUser | null;
  doctors: Doctor[];
  establishments: Establishment[];
  scheduleSlots: ScheduleSlot[];
  overrides: ScheduleOverride[];
  reports: CommunityReport[];
  healthTopics: HealthTopic[];
  articles: HealthArticle[];
  users: AdminUser[];
  territories: Territory[];
  auditLogs: AuditLogEntry[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  isBackendConnected: boolean;
  backendError: string | null;
  syncWithBackend: () => Promise<void>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addDoctor: (doctor: Omit<Doctor, 'id' | 'lastUpdated'>) => Promise<Doctor>;
  updateDoctor: (id: string, updates: Partial<Doctor>) => Promise<void>;
  addEstablishment: (establishment: Omit<Establishment, 'id' | 'lastUpdated' | 'doctorCount'>) => Promise<Establishment>;
  updateEstablishment: (id: string, updates: Partial<Establishment>) => Promise<void>;
  addScheduleSlot: (slot: Omit<ScheduleSlot, 'id'>) => Promise<ScheduleSlot>;
  updateScheduleSlot: (id: string, updates: Partial<ScheduleSlot>) => Promise<void>;
  deleteScheduleSlot: (id: string) => Promise<void>;
  addOverride: (override: Omit<ScheduleOverride, 'id' | 'createdAt'>) => Promise<ScheduleOverride>;
  removeOverride: (id: string) => Promise<void>;
  resolveReport: (
    id: string,
    resolution: {
      outcome: ResolutionOutcome;
      notes: string;
      summary: string;
      method: string;
    }
  ) => Promise<void>;
  rejectReport: (id: string, reason: string) => Promise<void>;
  addArticle: (article: Omit<HealthArticle, 'id' | 'viewsCount' | 'updatedAt'>) => HealthArticle;
  updateArticle: (id: string, updates: Partial<HealthArticle>) => void;
  inviteUser: (user: Omit<AdminUser, 'id' | 'lastActive'>) => Promise<AdminUser>;
  suspendUser: (id: string) => void;
  reactivateUser: (id: string) => void;
  logAuditEvent: (
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    entityName: string,
    details: string
  ) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    const token = getAuthToken();
    if (!token) {
      localStorage.removeItem('wimd_admin_user');
      return null;
    }
    const saved = localStorage.getItem('wimd_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Source of truth: Start with completely empty state, filled exclusively by backend API
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<ScheduleSlot[]>([]);
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [healthTopics, setHealthTopics] = useState<HealthTopic[]>([]);
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  const syncWithBackend = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        docsRes,
        estsRes,
        schedsRes,
        ovrsRes,
        rptsRes,
        logsRes,
        usersRes,
        topicsRes,
        artsRes
      ] = await Promise.all([
        apiClient.doctors.list({ limit: 100 }),
        apiClient.establishments.list({ limit: 100 }),
        apiClient.schedules.list(),
        apiClient.schedules.listOverrides(),
        apiClient.reports.list({ limit: 100 }),
        apiClient.audit.list({ limit: 100 }),
        apiClient.users.list(),
        apiClient.health.topics(),
        apiClient.health.articles()
      ]);

      // If backend is stopped or unreachable, apiClient returns network error
      const isConnectionFailed =
        !docsRes.success &&
        !estsRes.success &&
        (docsRes.error?.message?.includes('Network') ||
          docsRes.error?.message?.includes('Failed to fetch') ||
          docsRes.error?.message?.includes('connection'));

      if (isConnectionFailed) {
        setIsBackendConnected(false);
        setBackendError('Backend offline. Unable to reach DocTimings API server.');
        setDoctors([]);
        setEstablishments([]);
        setScheduleSlots([]);
        setOverrides([]);
        setReports([]);
        setAuditLogs([]);
        setUsers([]);
        setHealthTopics([]);
        setArticles([]);
        setTerritories([]);
        setIsLoading(false);
        return;
      }

      setIsBackendConnected(true);
      setBackendError(null);

      if (docsRes.success && Array.isArray(docsRes.data)) {
        setDoctors(docsRes.data as Doctor[]);
      }
      if (estsRes.success && Array.isArray(estsRes.data)) {
        const estList = (estsRes.data as Establishment[]).map(e => ({
          ...e,
          practiceLocations: e.practiceLocations || []
        }));
        setEstablishments(estList);

        // Derive territories dynamically from real backend establishments & doctors
        const territoryMap = new Map<string, {
          district: string;
          subDistrict: string;
          pinCodes: Set<string>;
          establishmentCount: number;
          doctorCount: number;
          verifiedCount: number;
        }>();

        estList.forEach(e => {
          const key = `${e.district}__${e.subDistrict}`;
          if (!territoryMap.has(key)) {
            territoryMap.set(key, {
              district: e.district,
              subDistrict: e.subDistrict,
              pinCodes: new Set(),
              establishmentCount: 0,
              doctorCount: 0,
              verifiedCount: 0
            });
          }
          const t = territoryMap.get(key)!;
          t.establishmentCount++;
          if (e.pinCode) t.pinCodes.add(e.pinCode);
          if (e.verificationStatus === 'Verified') t.verifiedCount++;
        });

        const docList = (docsRes.success && Array.isArray(docsRes.data) ? docsRes.data : []) as Doctor[];
        docList.forEach(d => {
          (d.affiliatedEstablishmentIds || []).forEach(estId => {
            const est = estList.find(e => e.id === estId);
            if (est) {
              const key = `${est.district}__${est.subDistrict}`;
              const t = territoryMap.get(key);
              if (t) t.doctorCount++;
            }
          });
        });

        const dynamicTerritories: Territory[] = Array.from(territoryMap.entries()).map(([_, t], idx) => ({
          id: `TERR-0${idx + 1}`,
          district: t.district,
          subDistrict: t.subDistrict,
          pinCodes: Array.from(t.pinCodes),
          establishmentCount: t.establishmentCount,
          doctorCount: t.doctorCount,
          verificationCoveragePercent: t.establishmentCount > 0 ? Math.round((t.verifiedCount / t.establishmentCount) * 100) : 0
        }));
        setTerritories(dynamicTerritories);
      }
      if (schedsRes.success && Array.isArray(schedsRes.data)) {
        setScheduleSlots(schedsRes.data as ScheduleSlot[]);
      }
      if (ovrsRes.success && Array.isArray(ovrsRes.data)) {
        setOverrides(ovrsRes.data as ScheduleOverride[]);
      }
      if (rptsRes.success && Array.isArray(rptsRes.data)) {
        setReports(rptsRes.data as CommunityReport[]);
      }
      if (logsRes.success && Array.isArray(logsRes.data)) {
        setAuditLogs(logsRes.data as AuditLogEntry[]);
      }
      if (usersRes.success && Array.isArray(usersRes.data)) {
        setUsers(usersRes.data as AdminUser[]);
      }
      if (topicsRes.success && Array.isArray(topicsRes.data)) {
        setHealthTopics(topicsRes.data as HealthTopic[]);
      }
      if (artsRes.success && Array.isArray(artsRes.data)) {
        setArticles(artsRes.data as HealthArticle[]);
      }
    } catch (err: any) {
      setIsBackendConnected(false);
      setBackendError(err?.message || 'Backend connection failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch from backend on initial mount
  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Persist session only (JWT and currentUser), not data entities
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wimd_admin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wimd_admin_user');
    }
  }, [currentUser]);

  const logAuditEvent = (
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    entityName: string,
    details: string
  ) => {
    const newEntry: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser ? currentUser.name : 'System Admin',
      actorRole: currentUser ? currentUser.role : 'Platform Admin',
      action,
      entityType,
      entityId,
      entityName,
      details
    };
    setAuditLogs(prev => [newEntry, ...prev]);

    // Send to backend audit endpoint
    apiClient.audit.create({
      action,
      entityType,
      entityId,
      entityName,
      details,
      actorId: currentUser ? currentUser.id : 'USR-ADMIN',
      actorName: currentUser ? currentUser.name : 'System Admin'
    }).catch(() => {});
  };

  const login = async (email: string, password = 'password123'): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    const res = await apiClient.auth.login(trimmedEmail, password);

    if (res.success && res.data?.user) {
      const apiUser: AdminUser = {
        id: res.data.user.id,
        name: res.data.user.name,
        email: res.data.user.email,
        phone: res.data.user.phone || '+91 98000 00000',
        role: res.data.user.role || 'Operations Admin',
        status: res.data.user.status || 'Active',
        lastActive: 'Just now'
      };
      setCurrentUser(apiUser);
      logAuditEvent('Signed In', 'User', apiUser.id, apiUser.name, 'Admin session authenticated via backend API');
      await syncWithBackend();
      return { success: true };
    }

    const errorMsg = res.error?.message || 'Authentication failed. Please verify credentials or backend connection.';
    return { success: false, error: errorMsg };
  };

  const logout = () => {
    clearAuthToken();
    localStorage.removeItem('wimd_admin_user');
    if (currentUser) {
      logAuditEvent('Signed Out', 'User', currentUser.id, currentUser.name, 'Admin session terminated');
    }
    setCurrentUser(null);
  };

  const addDoctor = async (data: Omit<Doctor, 'id' | 'lastUpdated'>): Promise<Doctor> => {
    const res = await apiClient.doctors.create({
      fullName: data.fullName,
      specialty: data.specialty,
      registrationNumber: data.registrationNumber,
      council: data.council,
      qualifications: data.qualifications,
      experienceYears: data.experienceYears,
      primaryPhone: data.primaryPhone,
      email: data.email,
      languages: data.languages,
      photoUrl: data.photoUrl,
      verificationStatus: data.verificationStatus,
      affiliatedEstablishmentIds: data.affiliatedEstablishmentIds
    });

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to save doctor to backend');
    }

    const createdDoc: Doctor = res.data;
    setDoctors(prev => [createdDoc, ...prev]);
    logAuditEvent('Added Doctor', 'Doctor', createdDoc.id, createdDoc.fullName, `Specialty: ${createdDoc.specialty}, Reg: ${createdDoc.registrationNumber}`);
    return createdDoc;
  };

  const updateDoctor = async (id: string, updates: Partial<Doctor>): Promise<void> => {
    const res = await apiClient.doctors.update(id, updates);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to update doctor on backend');
    }

    setDoctors(prev =>
      prev.map(doc => {
        if (doc.id === id) {
          const updated = { ...doc, ...(res.data || updates), lastUpdated: new Date().toISOString() };
          logAuditEvent('Updated Doctor Profile', 'Doctor', id, updated.fullName, `Modified fields: ${Object.keys(updates).join(', ')}`);
          return updated;
        }
        return doc;
      })
    );
  };

  const addEstablishment = async (data: Omit<Establishment, 'id' | 'lastUpdated' | 'doctorCount'>): Promise<Establishment> => {
    const res = await apiClient.establishments.create({
      name: data.name,
      type: data.type,
      district: data.district,
      subDistrict: data.subDistrict,
      address: data.address,
      pinCode: data.pinCode,
      phone: data.phone,
      proprietorName: data.proprietorName,
      licenseNumber: data.licenseNumber,
      latitude: data.latitude,
      longitude: data.longitude,
      verificationStatus: data.verificationStatus,
      accountStatus: data.accountStatus
    });

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to save establishment to backend');
    }

    const createdEst: Establishment = {
      ...res.data,
      doctorCount: 0,
      practiceLocations: res.data.practiceLocations || []
    };
    setEstablishments(prev => [createdEst, ...prev]);
    logAuditEvent('Added Establishment', 'Establishment', createdEst.id, createdEst.name, `Location: ${createdEst.subDistrict}, Type: ${createdEst.type}`);
    return createdEst;
  };

  const updateEstablishment = async (id: string, updates: Partial<Establishment>): Promise<void> => {
    const res = await apiClient.establishments.update(id, updates);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to update establishment on backend');
    }

    setEstablishments(prev =>
      prev.map(est => {
        if (est.id === id) {
          const updated = { ...est, ...(res.data || updates), lastUpdated: new Date().toISOString() };
          logAuditEvent('Updated Establishment', 'Establishment', id, updated.name, `Modified fields: ${Object.keys(updates).join(', ')}`);
          return updated;
        }
        return est;
      })
    );
  };

  const addScheduleSlot = async (slot: Omit<ScheduleSlot, 'id'>): Promise<ScheduleSlot> => {
    const res = await apiClient.schedules.create(slot);
    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to save schedule slot to backend');
    }

    const newSlot: ScheduleSlot = res.data;
    setScheduleSlots(prev => [...prev, newSlot]);
    logAuditEvent('Created Schedule Slot', 'Schedule', newSlot.id, `${newSlot.dayOfWeek} ${newSlot.startTime}`, `Doctor: ${newSlot.doctorId} at ${newSlot.establishmentId}`);
    return newSlot;
  };

  const updateScheduleSlot = async (id: string, updates: Partial<ScheduleSlot>): Promise<void> => {
    const res = await apiClient.schedules.update(id, updates);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to update schedule slot on backend');
    }

    setScheduleSlots(prev =>
      prev.map(slot => {
        if (slot.id === id) {
          const updated = { ...slot, ...(res.data || updates) };
          logAuditEvent('Updated Schedule Slot', 'Schedule', id, `${updated.dayOfWeek} ${updated.startTime}`, `Modified: ${Object.keys(updates).join(', ')}`);
          return updated;
        }
        return slot;
      })
    );
  };

  const deleteScheduleSlot = async (id: string): Promise<void> => {
    const res = await apiClient.schedules.delete(id);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to delete schedule slot from backend');
    }

    const slot = scheduleSlots.find(s => s.id === id);
    if (slot) {
      logAuditEvent('Deleted Schedule Slot', 'Schedule', id, `${slot.dayOfWeek} ${slot.startTime}`, `Removed slot for doctor ${slot.doctorId}`);
    }
    setScheduleSlots(prev => prev.filter(s => s.id !== id));
  };

  const addOverride = async (data: Omit<ScheduleOverride, 'id' | 'createdAt'>): Promise<ScheduleOverride> => {
    const res = await apiClient.schedules.createOverride({
      doctorId: data.doctorId,
      establishmentId: data.establishmentId,
      date: data.date,
      dayOfWeek: data.dayOfWeek,
      overrideType: data.overrideType,
      standardShift: data.standardShift,
      newStartTime: data.newStartTime,
      newEndTime: data.newEndTime,
      publicReason: data.publicReason,
      internalNote: data.internalNote,
      reportedBy: data.reportedBy
    });

    if (!res.success || !res.data) {
      throw new Error(res.error?.message || 'Failed to save schedule override to backend');
    }

    const newOvr: ScheduleOverride = res.data;
    setOverrides(prev => [newOvr, ...prev]);
    logAuditEvent('Added Schedule Override', 'Override', newOvr.id, `${newOvr.date} (${newOvr.overrideType})`, `Doctor: ${newOvr.doctorId}. Reason: ${newOvr.publicReason}`);
    return newOvr;
  };

  const removeOverride = async (id: string): Promise<void> => {
    const res = await apiClient.schedules.deleteOverride(id);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to remove schedule override from backend');
    }

    const ovr = overrides.find(o => o.id === id);
    if (ovr) {
      logAuditEvent('Removed Schedule Override', 'Override', id, `${ovr.date} (${ovr.overrideType})`, `Restored regular weekly schedule for doctor ${ovr.doctorId}`);
    }
    setOverrides(prev => prev.filter(o => o.id !== id));
  };

  const resolveReport = async (
    id: string,
    resolution: {
      outcome: ResolutionOutcome;
      notes: string;
      summary: string;
      method: string;
    }
  ): Promise<void> => {
    const res = await apiClient.reports.updateStatus(id, 'resolved', resolution.notes);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to update report status on backend');
    }

    setReports(prev =>
      prev.map(rpt => {
        if (rpt.id === id) {
          const resolved: CommunityReport = {
            ...rpt,
            status: 'resolved',
            resolutionOutcome: resolution.outcome,
            adminNotes: resolution.notes,
            resolutionSummary: resolution.summary,
            verificationMethod: resolution.method,
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser ? currentUser.name : 'Operations Admin'
          };
          logAuditEvent('Resolved Report', 'Report', id, rpt.issueTitle, `Outcome: ${resolution.outcome}. Summary: ${resolution.summary}`);
          return resolved;
        }
        return rpt;
      })
    );
  };

  const rejectReport = async (id: string, reason: string): Promise<void> => {
    const res = await apiClient.reports.updateStatus(id, 'rejected', reason);
    if (!res.success) {
      throw new Error(res.error?.message || 'Failed to reject report on backend');
    }

    setReports(prev =>
      prev.map(rpt => {
        if (rpt.id === id) {
          const rejected: CommunityReport = {
            ...rpt,
            status: 'rejected',
            resolutionOutcome: 'incorrect',
            resolutionSummary: reason,
            resolvedAt: new Date().toISOString(),
            resolvedBy: currentUser ? currentUser.name : 'Operations Admin'
          };
          logAuditEvent('Rejected Report', 'Report', id, rpt.issueTitle, `Reason: ${reason}`);
          return rejected;
        }
        return rpt;
      })
    );
  };

  const addArticle = (data: Omit<HealthArticle, 'id' | 'viewsCount' | 'updatedAt'>) => {
    const newArticle: HealthArticle = {
      ...data,
      id: `ART-${Date.now().toString().slice(-4)}`,
      viewsCount: 0,
      updatedAt: new Date().toISOString()
    };
    setArticles(prev => [newArticle, ...prev]);
    logAuditEvent('Created Health Article', 'Article', newArticle.id, newArticle.title, `Topic: ${newArticle.topicName}, Status: ${newArticle.status}`);
    return newArticle;
  };

  const updateArticle = (id: string, updates: Partial<HealthArticle>) => {
    setArticles(prev =>
      prev.map(art => {
        if (art.id === id) {
          const updated = { ...art, ...updates, updatedAt: new Date().toISOString() };
          logAuditEvent('Updated Health Article', 'Article', id, updated.title, `Modified: ${Object.keys(updates).join(', ')}`);
          return updated;
        }
        return art;
      })
    );
  };

  const inviteUser = async (userData: Omit<AdminUser, 'id' | 'lastActive'>): Promise<AdminUser> => {
    const res = await apiClient.users.invite({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      password: 'password123'
    });

    const newUser: AdminUser = res.success && res.data?.user
      ? res.data.user
      : {
          ...userData,
          id: `USR-${Date.now().toString().slice(-4)}`,
          lastActive: 'Invitation Sent'
        };

    setUsers(prev => [newUser, ...prev]);
    logAuditEvent('Invited User', 'User', newUser.id, newUser.name, `Role: ${newUser.role}, Email: ${newUser.email}`);
    return newUser;
  };

  const suspendUser = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, status: 'Suspended' as const };
          logAuditEvent('Suspended User', 'User', id, u.name, 'Revoked platform access');
          return updated;
        }
        return u;
      })
    );
  };

  const reactivateUser = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, status: 'Active' as const };
          logAuditEvent('Reactivated User', 'User', id, u.name, 'Restored platform access');
          return updated;
        }
        return u;
      })
    );
  };

  return (
    <AdminContext.Provider
      value={{
        currentUser,
        doctors,
        establishments,
        scheduleSlots,
        overrides,
        reports,
        healthTopics,
        articles,
        users,
        territories,
        auditLogs,
        searchQuery,
        setSearchQuery,
        isLoading,
        isBackendConnected,
        backendError,
        syncWithBackend,
        login,
        logout,
        addDoctor,
        updateDoctor,
        addEstablishment,
        updateEstablishment,
        addScheduleSlot,
        updateScheduleSlot,
        deleteScheduleSlot,
        addOverride,
        removeOverride,
        resolveReport,
        rejectReport,
        addArticle,
        updateArticle,
        inviteUser,
        suspendUser,
        reactivateUser,
        logAuditEvent
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
