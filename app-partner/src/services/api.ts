import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import {
  Doctor,
  Establishment,
  PracticeLocation,
  DoctorScheduleSlot,
  TemporaryOverride,
  PartnerUser,
  PartnerAccount,
  TeamView,
  CreatedInvite
} from '../types';

const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_HOST}/api/v1`;

const TOKEN_KEY = '@doctimings_partner_token';
const ESTABLISHMENT_KEY = '@doctimings_partner_current_establishment_id';

const SECURE_TOKEN_KEY = 'doctimings_partner_token';

const tokenStore = {
  get: () => (Platform.OS === 'web' ? AsyncStorage.getItem(TOKEN_KEY) : SecureStore.getItemAsync(SECURE_TOKEN_KEY)),
  set: (value: string) =>
    Platform.OS === 'web' ? AsyncStorage.setItem(TOKEN_KEY, value) : SecureStore.setItemAsync(SECURE_TOKEN_KEY, value),
  clear: () => (Platform.OS === 'web' ? AsyncStorage.removeItem(TOKEN_KEY) : SecureStore.deleteItemAsync(SECURE_TOKEN_KEY))
};

type Result<T> = { success: boolean; data?: T; error?: { code?: string; message: string } };

const mapOverride = (o: any): TemporaryOverride => ({
  id: o.id,
  doctorId: o.doctorId,
  doctorName: o.doctorName,
  establishmentId: o.establishmentId,
  establishmentName: o.establishmentName,
  overrideDate: o.date,
  overrideType: o.overrideType,
  note: o.publicReason ?? '',
  startTime: o.newStartTime ?? undefined,
  endTime: o.newEndTime ?? undefined,
  createdAt: o.createdAt
});

class ApiService {
  private token: string | null = null;
  private unauthorizedListener: (() => void) | null = null;

  onUnauthorized(listener: (() => void) | null) {
    this.unauthorizedListener = listener;
  }

  async initToken(): Promise<string | null> {
    try {
      this.token = await tokenStore.get();
      await AsyncStorage.multiRemove(['@doctimings_partner_token', '@docnear_partner_token']).catch(() => {});
      return this.token;
    } catch {
      return null;
    }
  }

  async setToken(token: string | null): Promise<void> {
    this.token = token;
    if (token) {
      await tokenStore.set(token);
    } else {
      await tokenStore.clear().catch(() => {});
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

      if (res.status === 401 && this.token && !endpoint.startsWith('/auth/login')) {
        this.unauthorizedListener?.();
      }

      if (!res.ok || !json.success) {
        return {
          success: false,
          error: json.error || { message: `Request failed with status ${res.status}` },
        };
      }

      return { success: true, data: json.data };
    } catch {
      return {
        success: false,
        error: { message: 'No internet connection. Please check your connection and try again.' },
      };
    }
  }

  async getAccount() {
    return this.request<PartnerAccount>('/auth/partner');
  }

  async activate(data: { code: string; name: string; email: string; phone: string; password: string }) {
    const res = await this.request<{ token: string; user: PartnerUser }>('/auth/activate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.success && res.data?.token) {
      await this.setToken(res.data.token);
    }
    return res;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const res = await this.request<{ token: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (res.success && res.data?.token) {
      await this.setToken(res.data.token);
    }
    return res;
  }

  async getTeam(establishmentId: string) {
    return this.request<TeamView>(`/establishments/${establishmentId}/access`);
  }

  async inviteStaff(establishmentId: string, data: { name: string; phone: string }) {
    return this.request<CreatedInvite>(`/establishments/${establishmentId}/invitations`, {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'Staff' }),
    });
  }

  async removeMember(establishmentId: string, memberId: string) {
    return this.request<unknown>(`/establishments/${establishmentId}/members/${memberId}`, { method: 'DELETE' });
  }

  async cancelInvite(id: string) {
    return this.request<unknown>(`/admin/invitations/${id}`, { method: 'DELETE' });
  }

  async searchDirectory(search: string) {
    return this.request<Doctor[]>(`/doctors?search=${encodeURIComponent(search)}&limit=20`);
  }

  async submitClaim(
    doctorId: string,
    data: { claimantName: string; phone: string; email?: string; registrationNumber: string; message?: string }
  ) {
    return this.request<{ id: string }>(`/doctors/${doctorId}/claims`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
    if (params.q) query.append('search', params.q);
    query.append('limit', '200');

    return this.request<Doctor[]>(`/doctors?${query.toString()}`);
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
      fullName: data.fullName.trim(),
      specialty: data.specialty,
      registrationNumber: data.registrationNumber.trim(),
      council: data.council || 'West Bengal Medical Council',
      qualifications: data.qualifications.trim(),
      experienceYears: data.experienceYears ?? 0,
      primaryPhone: data.primaryPhone.trim(),
      email: data.email?.trim() || undefined,
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
      practiceLocationId: data.practiceLocationId || undefined,
      dayOfWeek: data.dayOfWeek,
      shiftName: data.shiftName || 'General Consultation',
      startTime: data.startTime,
      endTime: data.endTime,
      roomNumber: data.roomNumber || undefined,
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
    const res = await this.request<any[]>(`/schedules/overrides${qs}`);
    return { ...res, data: res.data?.map(mapOverride) } as Result<TemporaryOverride[]>;
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
    const payload = {
      doctorId: data.doctorId,
      establishmentId: data.establishmentId,
      date: data.overrideDate,
      overrideType: data.overrideType,
      newStartTime: data.startTime || undefined,
      newEndTime: data.endTime || undefined,
      publicReason: data.publicReason || data.note || (data.delayMinutes ? `Doctor running late by ${data.delayMinutes} mins` : 'Not available today'),
      internalNote: data.internalNote || '',
    };

    const res = await this.request<any>('/schedules/overrides', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { ...res, data: res.data ? mapOverride(res.data) : undefined } as Result<TemporaryOverride>;
  }

  async deleteOverride(id: string) {
    return this.request<{ success: boolean }>(`/schedules/overrides/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
