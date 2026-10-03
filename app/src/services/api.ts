import { Platform } from 'react-native';
import { Doctor, Establishment, PracticeLocation, AvailabilityStatus, EstablishmentType } from '../types';

const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_HOST}/api/v1`;

const mapBackendToMobileDoctor = (backendDoc: any): Doctor => {
  const isAvailable = backendDoc.todayAvailability?.isAvailable;
  const availStatus: AvailabilityStatus = isAvailable ? 'available_today' : 'not_available';

  const practices: PracticeLocation[] = (backendDoc.affiliatedEstablishments || []).map((est: any) => ({
    id: `PRAC-${est.id}`,
    establishmentId: est.id,
    establishmentName: est.name,
    establishmentType: (est.type?.toLowerCase().replace(/ /g, '_') || 'doctor_chamber') as EstablishmentType,
    addressLine: est.address,
    locality: est.subDistrict || est.district,
    pincode: est.pinCode,
    latitude: est.latitude,
    longitude: est.longitude,
    phone: est.phone,
    distanceKm: backendDoc.distanceKm || 3.5,
    consultationFee: 300,
    availability: availStatus,
    lastVerifiedAt: est.lastUpdated || new Date().toISOString(),
    schedules: (backendDoc.schedules || []).map((s: any) => ({
      id: s.id,
      doctorPracticeId: `PRAC-${est.id}`,
      dayOfWeek: 1,
      dayName: s.dayOfWeek,
      dayNameBn: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      slotLabel: s.shiftName,
      slotLabelBn: s.shiftName,
      isToday: s.dayOfWeek === backendDoc.todayAvailability?.day
    }))
  }));

  return {
    id: backendDoc.id,
    name: backendDoc.fullName,
    displayName: backendDoc.fullName,
    photoUrl: backendDoc.photoUrl,
    bio: `${backendDoc.qualifications} with ${backendDoc.experienceYears} years experience. Registered with ${backendDoc.council}.`,
    qualifications: backendDoc.qualifications,
    experienceYears: backendDoc.experienceYears,
    consultationFee: 300,
    phone: backendDoc.primaryPhone,
    registrationNumber: backendDoc.registrationNumber,
    registrationCouncil: backendDoc.council,
    verificationStatus: (backendDoc.verificationStatus?.toLowerCase() || 'verified') as any,
    lastVerifiedAt: backendDoc.lastUpdated || new Date().toISOString(),
    specialties: [backendDoc.specialty],
    specialtiesBn: [backendDoc.specialty],
    languages: backendDoc.languages || ['Bengali', 'English'],
    practices,
    todayAvailability: availStatus
  };
};

export const api = {
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      const body = await res.json();
      return body.status === 'ok';
    } catch {
      return false;
    }
  },

  searchDoctors: async (params: {
    q?: string;
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    specialty?: string;
    dayOfWeek?: string;
    availableOnly?: boolean;
  }): Promise<{ success: boolean; data: Doctor[]; autoExpanded?: boolean }> => {
    try {
      const cleanParams: Record<string, string> = {};
      if (params.q) cleanParams.q = params.q;
      if (params.latitude !== undefined) cleanParams.latitude = String(params.latitude);
      if (params.longitude !== undefined) cleanParams.longitude = String(params.longitude);
      if (params.radiusKm !== undefined) cleanParams.radiusKm = String(params.radiusKm);
      if (params.specialty) cleanParams.specialty = params.specialty;
      if (params.dayOfWeek) cleanParams.dayOfWeek = params.dayOfWeek;
      if (params.availableOnly) cleanParams.availableOnly = 'true';

      const qs = new URLSearchParams(cleanParams).toString();
      const res = await fetch(`${API_BASE_URL}/search?${qs}`);
      const body = await res.json();

      if (!res.ok || !body.success) {
        return { success: false, data: [] };
      }

      const doctors: Doctor[] = (body.data || []).map(mapBackendToMobileDoctor);
      return {
        success: true,
        data: doctors,
        autoExpanded: body.searchMeta?.autoExpandedRadius
      };
    } catch {
      return { success: false, data: [] };
    }
  },

  getDoctorById: async (id: string): Promise<Doctor | null> => {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${id}`);
      const body = await res.json();
      if (!res.ok || !body.success || !body.data) return null;
      return mapBackendToMobileDoctor(body.data);
    } catch {
      return null;
    }
  },

  submitReport: async (reportData: {
    doctorId?: string;
    establishmentId?: string;
    issueType: string;
    issueTitle: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
    reporterPhone?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        return { success: false, error: body.error?.message || 'Failed to submit report' };
      }
      return { success: true, data: body.data };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  }
};
