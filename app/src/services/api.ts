import { Platform } from 'react-native';
import { Doctor, LocationItem } from '../types';
import { ApiDoctor, mapDoctor, Origin } from './doctorMapper';

const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_BASE_URL = `${process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_HOST}/api/v1`;
const TIMEOUT_MS = 12000;

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

type ConnectivityListener = (online: boolean) => void;
const connectivityListeners = new Set<ConnectivityListener>();

export const onConnectivityChange = (listener: ConnectivityListener) => {
  connectivityListeners.add(listener);
  return () => {
    connectivityListeners.delete(listener);
  };
};

const reportConnectivity = (online: boolean) => connectivityListeners.forEach(listener => listener(online));

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers }
    });
    reportConnectivity(true);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || body.success === false) {
      throw new ApiError(body?.error?.message || `Request failed (${res.status})`, res.status);
    }
    return body as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    reportConnectivity(false);
    throw new ApiError('No internet connection', 0);
  } finally {
    clearTimeout(timer);
  }
};

interface ApiTown {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  doctorCount: number;
}

export interface Town extends LocationItem {
  doctorCount: number;
}

const toLocation = (t: Omit<ApiTown, 'doctorCount'>, doctorCount = 0): Town => ({
  id: t.id,
  name: t.name,
  nameBn: t.name,
  district: t.district,
  districtBn: t.district,
  state: 'West Bengal',
  pincode: '',
  latitude: t.latitude,
  longitude: t.longitude,
  isPopular: doctorCount > 0,
  doctorCount
});

export interface SearchParams {
  q?: string;
  specialty?: string;
  latitude: number;
  longitude: number;
  townId?: string;
  availableOnly?: boolean;
  page?: number;
}

export const SEARCH_PAGE_SIZE = 20;

export interface SearchTown {
  id: string;
  name: string;
  district: string;
  doctorCount: number;
}

export interface SearchResult {
  doctors: Doctor[];
  total: number;
  town: SearchTown | null;
  page: number;
  totalPages: number;
}

export const api = {
  checkHealth: async (): Promise<boolean> => {
    try {
      await request('/health');
      return true;
    } catch (err) {
      return err instanceof ApiError && err.status !== 0;
    }
  },

  towns: async (): Promise<{ towns: Town[]; defaultLocation: Town }> => {
    const body = await request<{ data: ApiTown[]; defaultLocation: Omit<ApiTown, 'doctorCount'> }>('/locations/towns');
    return { towns: body.data.map(t => toLocation(t, t.doctorCount)), defaultLocation: toLocation(body.defaultLocation) };
  },

  searchDoctors: async (params: SearchParams): Promise<SearchResult> => {
    const query = new URLSearchParams({
      latitude: String(params.latitude),
      longitude: String(params.longitude),
      page: String(params.page ?? 1),
      limit: String(SEARCH_PAGE_SIZE)
    });
    if (params.townId) query.set('townId', params.townId);
    if (params.q) query.set('q', params.q);
    if (params.specialty) query.set('specialty', params.specialty);
    if (params.availableOnly) query.set('availableOnly', 'true');

    const body = await request<{
      data: ApiDoctor[];
      pagination: { page: number; total: number; totalPages: number };
      searchMeta: { town: SearchTown | null };
    }>(`/search?${query.toString()}`);

    const origin: Origin = { latitude: params.latitude, longitude: params.longitude };
    return {
      doctors: body.data.map(d => mapDoctor(d, origin)),
      total: body.pagination.total,
      town: body.searchMeta.town,
      page: body.pagination.page,
      totalPages: body.pagination.totalPages
    };
  },

  getDoctor: async (id: string, origin?: Origin): Promise<Doctor> => {
    const body = await request<{ data: ApiDoctor }>(`/doctors/${encodeURIComponent(id)}`);
    return mapDoctor(body.data, origin);
  },

  submitReport: async (reportData: {
    doctorId?: string;
    establishmentId?: string;
    issueType: string;
    issueTitle: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
    reporterPhone?: string;
  }): Promise<{ success: boolean; data?: unknown; error?: string }> => {
    try {
      const body = await request<{ data: unknown }>('/reports', { method: 'POST', body: JSON.stringify(reportData) });
      return { success: true, data: body.data };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }
};
