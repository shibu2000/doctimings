import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Doctor,
  Establishment,
  PracticeLocation,
  DoctorScheduleSlot,
  TemporaryOverride,
  PartnerUser,
  TeamMember,
  NotificationItem
} from '../types';

const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_HOST}/api/v1`;

const TOKEN_KEY = '@doctimings_partner_token';
const ESTABLISHMENT_KEY = '@doctimings_partner_current_establishment_id';

class ApiService {
  private token: string | null = null;

  async initToken(): Promise<string | null> {
    try {
      this.token = (await AsyncStorage.getItem(TOKEN_KEY)) || (await AsyncStorage.getItem('@docnear_partner_token'));
      return this.token;
    } catch {
      return null;
    }
  }

  async setToken(token: string | null): Promise<void> {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem('@docnear_partner_token').catch(() => {});
    }
  }

  getToken(): string | null {
    return this.token;
  }

  async getSavedEstablishmentId(): Promise<string | null> {
    try {
      return (await AsyncStorage.getItem(ESTABLISHMENT_KEY)) || (await AsyncStorage.getItem('@docnear_partner_current_establishment_id'));
    } catch {
      return null;
    }
  }

  async saveEstablishmentId(id: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ESTABLISHMENT_KEY, id);
    } catch {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: { code?: string; message: string } }> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const json = await res.json().catch(() => ({
        success: false,
        error: { message: `HTTP ${res.status}: Failed to parse response` },
      }));

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || { message: `Request failed with status ${res.status}` },
        };
      }

      return { success: true, data: json.data };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.message || 'Network error. Please check your connection.' },
      };
    }
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    const res = await this.request<{ token: string; user: PartnerUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data?.token) {
      await this.setToken(res.data.token);
    }
    return res;
  }

  async getMe() {
    return this.request<PartnerUser>('/auth/me');
  }

  async logout() {
    await this.setToken(null);
  }

  // --- Establishment Endpoints ---
  async getEstablishments() {
    return this.request<Establishment[]>('/establishments');
  }

  async getEstablishmentById(id: string) {
    return this.request<Establishment>(`/establishments/${id}`);
  }

  async updateEstablishment(id: string, data: Partial<Establishment>) {
    return this.request<Establishment>(`/establishments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPracticeLocations(establishmentId: string) {
    return this.request<PracticeLocation[]>(`/establishments/${establishmentId}/locations`);
  }

  async addPracticeLocation(
    establishmentId: string,
    data: { name: string; roomDesignation: string; floor?: string }
  ) {
    return this.request<PracticeLocation>(`/establishments/${establishmentId}/locations`, {
      method: 'POST',
      body: JSON.stringify({
        establishmentId,
        name: data.name,
        roomDesignation: data.roomDesignation,
        floor: data.floor || 'Ground Floor',
      }),
    });
  }

  // --- Doctor Endpoints ---
  async getDoctors(params: { establishmentId?: string; specialty?: string; q?: string } = {}) {
    const query = new URLSearchParams();
    if (params.establishmentId) query.append('establishmentId', params.establishmentId);
    if (params.specialty) query.append('specialty', params.specialty);
    if (params.q) query.append('q', params.q);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<Doctor[]>(`/doctors${qs}`);
  }

  async getDoctorById(id: string) {
    return this.request<Doctor>(`/doctors/${id}`);
  }

  async createDoctor(data: {
    fullName: string;
    specialty: string;
    registrationNumber: string;
    council?: string;
    qualifications: string;
    experienceYears?: number;
    primaryPhone: string;
    email?: string;
    languages?: string[];
    photoUrl?: string;
    affiliatedEstablishmentIds?: string[];
    consultationFee?: number;
  }) {
    const payload = {
      fullName: data.fullName,
      specialty: data.specialty,
      registrationNumber: data.registrationNumber,
      council: data.council || 'West Bengal Medical Council',
      qualifications: data.qualifications || 'MBBS',
      experienceYears: data.experienceYears ?? 5,
      primaryPhone: data.primaryPhone && data.primaryPhone.trim().length >= 10 ? data.primaryPhone.trim() : '+91 98000 00000',
      languages: data.languages || ['Bengali', 'English'],
      affiliatedEstablishmentIds: data.affiliatedEstablishmentIds || [],
    };
    return this.request<Doctor>('/doctors', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateDoctor(id: string, data: Partial<Doctor>) {
    return this.request<Doctor>(`/doctors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Schedules & Overrides Endpoints ---
  async getSchedules(params: { doctorId?: string; establishmentId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.doctorId) query.append('doctorId', params.doctorId);
    if (params.establishmentId) query.append('establishmentId', params.establishmentId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<DoctorScheduleSlot[]>(`/schedules${qs}`);
  }

  async createSchedule(data: {
    doctorId: string;
    establishmentId: string;
    practiceLocationId?: string;
    dayOfWeek: string;
    shiftName: string;
    startTime: string;
    endTime: string;
    roomNumber?: string;
    maxTokens?: number;
    tokenPolicy?: string;
    consultationFee?: number;
  }) {
    const payload = {
      doctorId: data.doctorId,
      establishmentId: data.establishmentId,
      practiceLocationId: data.practiceLocationId || 'LOC-JHR-301-1',
      dayOfWeek: data.dayOfWeek,
      shiftName: data.shiftName || 'General Consultation',
      startTime: data.startTime,
      endTime: data.endTime,
      roomNumber: data.roomNumber || 'Chamber 1',
      tokenPolicy: data.tokenPolicy || 'First Come First Served',
      maxTokens: data.maxTokens || 25,
    };
    return this.request<DoctorScheduleSlot>('/schedules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateSchedule(id: string, data: Partial<DoctorScheduleSlot>) {
    return this.request<DoctorScheduleSlot>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSchedule(id: string) {
    return this.request<{ success: boolean }>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  async getOverrides(params: { doctorId?: string; establishmentId?: string } = {}) {
    const query = new URLSearchParams();
    if (params.doctorId) query.append('doctorId', params.doctorId);
    if (params.establishmentId) query.append('establishmentId', params.establishmentId);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.request<TemporaryOverride[]>(`/schedules/overrides${qs}`);
  }

  async createOverride(data: {
    scheduleId?: string;
    doctorId: string;
    establishmentId: string;
    overrideDate: string;
    overrideType: 'unavailable' | 'changed' | 'additional';
    note: string;
    delayMinutes?: number;
    startTime?: string;
    endTime?: string;
    standardShift?: string;
    publicReason?: string;
    internalNote?: string;
  }) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const parsedDate = new Date(data.overrideDate);
    const dayOfWeek = isNaN(parsedDate.getTime())
      ? 'Monday'
      : days[parsedDate.getDay()];

    const payload = {
      doctorId: data.doctorId,
      establishmentId: data.establishmentId,
      date: data.overrideDate,
      dayOfWeek,
      overrideType: data.overrideType,
      standardShift: data.standardShift || (data.startTime && data.endTime ? `${data.startTime} - ${data.endTime}` : 'Regular Shift'),
      newStartTime: data.startTime,
      newEndTime: data.endTime,
      publicReason: data.publicReason || data.note || (data.delayMinutes ? `Doctor running late by ${data.delayMinutes} mins` : 'Chamber unavailable for today'),
      internalNote: data.internalNote || data.note || '',
      reportedBy: 'Counter Staff',
    };

    return this.request<TemporaryOverride>('/schedules/overrides', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async deleteOverride(id: string) {
    return this.request<{ success: boolean }>(`/schedules/overrides/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
