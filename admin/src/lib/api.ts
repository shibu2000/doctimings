import type {
  AuditLog,
  CreatedInvite,
  DoctorAccess,
  DoctorClaim,
  Member,
  Invitation,
  Doctor,
  Establishment,
  Override,
  OverrideType,
  Paginated,
  Report,
  Role,
  Room,
  Session,
  Snapshot,
  User
} from './types';

const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (import.meta.env.PROD && (!configured || /localhost|127\.0\.0\.1/.test(configured))) {
    return 'https://doctimings-api.docnear.workers.dev/api/v1';
  }
  return configured || 'http://localhost:4000/api/v1';
};

const BASE_URL = resolveBaseUrl();
const SESSION_KEY = 'doctimings_admin_session';

export interface StoredSession {
  token: string;
  user: User;
}

export const sessionStore = {
  read(): StoredSession | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as StoredSession) : null;
    } catch {
      return null;
    }
  },
  write(session: StoredSession) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  },
  clear() {
    localStorage.removeItem(SESSION_KEY);
  }
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const listeners = new Set<() => void>();

export const onUnauthorized = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const request = async <T>(method: string, path: string, body?: unknown): Promise<T> => {
  const token = sessionStore.read()?.token;
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your internet connection and try again.', 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401 && token) {
      listeners.forEach(listener => listener());
    }
    throw new ApiError(payload?.error?.message || `Request failed (${response.status})`, response.status);
  }
  return payload as T;
};

type Envelope<T> = { success: true; data: T };

const data = async <T>(promise: Promise<Envelope<T>>) => (await promise).data;

export interface DoctorInput {
  fullName: string;
  specialty: string;
  primaryPhone?: string;
  qualifications?: string;
  registrationNumber?: string;
  experienceYears?: number;
  email?: string;
  languages?: string[];
  isActive?: boolean;
  verificationStatus?: Doctor['verificationStatus'];
}

export type EstablishmentInput = Omit<
  Establishment,
  'id' | 'createdAt' | 'updatedAt' | 'accountStatus' | 'verificationStatus' | 'isActive'
> &
  Partial<Pick<Establishment, 'verificationStatus' | 'isActive'>>;

export interface OverrideInput {
  doctorId: string;
  establishmentId: string;
  date: string;
  overrideType: OverrideType;
  newStartTime?: string;
  newEndTime?: string;
  publicReason: string;
}

export const api = {
  login: (email: string, password: string) =>
    data(request<Envelope<StoredSession>>('POST', '/auth/login', { email, password })),
  me: () => data(request<Envelope<User>>('GET', '/auth/me')),

  snapshot: () => data(request<Envelope<Snapshot>>('GET', '/admin/snapshot')),

  createDoctor: (input: DoctorInput & { sittings: { establishmentId: string; sessions: Session[] }[] }) =>
    data(request<Envelope<Doctor>>('POST', '/doctors', input)),
  updateDoctor: (id: string, input: Partial<DoctorInput>) => data(request<Envelope<Doctor>>('PUT', `/doctors/${id}`, input)),
  deleteDoctor: (id: string) => request('DELETE', `/doctors/${id}`),
  saveSitting: (doctorId: string, establishmentId: string, sessions: Session[]) =>
    request('PUT', `/doctors/${doctorId}/sittings/${establishmentId}`, { sessions }),
  removeSitting: (doctorId: string, establishmentId: string) =>
    request('DELETE', `/doctors/${doctorId}/sittings/${establishmentId}`),
  markAway: (doctorId: string, input: { from: string; to: string; establishmentIds: string[]; reason: string }) =>
    data(request<Envelope<Override[]>>('POST', `/doctors/${doctorId}/leave`, input)),

  createOverride: (input: OverrideInput) => data(request<Envelope<Override>>('POST', '/schedules/overrides', input)),
  deleteOverride: (id: string) => request('DELETE', `/schedules/overrides/${id}`),

  createEstablishment: (input: EstablishmentInput) =>
    data(request<Envelope<Establishment>>('POST', '/establishments', input)),
  updateEstablishment: (id: string, input: Partial<EstablishmentInput>) =>
    data(request<Envelope<Establishment>>('PUT', `/establishments/${id}`, input)),
  deleteEstablishment: (id: string) => request('DELETE', `/establishments/${id}`),
  addRoom: (establishmentId: string, name: string) =>
    data(request<Envelope<Room>>('POST', `/establishments/${establishmentId}/locations`, { name })),
  renameRoom: (establishmentId: string, roomId: string, name: string) =>
    data(request<Envelope<Room>>('PUT', `/establishments/${establishmentId}/locations/${roomId}`, { name, roomDesignation: name })),
  deleteRoom: (establishmentId: string, roomId: string) =>
    request('DELETE', `/establishments/${establishmentId}/locations/${roomId}`),

  reports: (status: string) => request<Paginated<Report>>('GET', `/reports?status=${status}&limit=200`),
  updateReport: (id: string, status: Report['status'], resolutionNotes?: string) =>
    data(request<Envelope<Report>>('PUT', `/reports/${id}/status`, { status, resolutionNotes })),

  users: () => data(request<Envelope<User[]>>('GET', '/auth/users')),
  createUser: (input: { name: string; email: string; phone: string; password: string; role: Role }) =>
    data(request<Envelope<User>>('POST', '/auth/users', input)),
  updateUser: (id: string, input: Partial<{ role: Role; status: User['status']; password: string }>) =>
    data(request<Envelope<User>>('PATCH', `/auth/users/${id}`, input)),

  activity: (page: number) => request<Paginated<AuditLog>>('GET', `/audit?page=${page}&limit=50`),

  establishmentAccess: (id: string) =>
    data(request<Envelope<{ members: Member[]; invitations: Invitation[] }>>('GET', `/establishments/${id}/access`)),
  inviteToEstablishment: (id: string, input: { role: 'Owner' | 'Staff'; name: string; phone: string }) =>
    data(request<Envelope<CreatedInvite>>('POST', `/establishments/${id}/invitations`, input)),
  removeMember: (establishmentId: string, memberId: string) => request('DELETE', `/establishments/${establishmentId}/members/${memberId}`),
  revokeInvitation: (id: string) => request('DELETE', `/admin/invitations/${id}`),

  doctorAccess: (id: string) => data(request<Envelope<DoctorAccess>>('GET', `/doctors/${id}/access`)),
  inviteDoctor: (id: string, input: { name?: string; phone?: string }) =>
    data(request<Envelope<CreatedInvite>>('POST', `/doctors/${id}/invitations`, input)),
  removeDoctorAccount: (id: string) => request('DELETE', `/doctors/${id}/account`),

  claims: (status: string) => data(request<Envelope<DoctorClaim[]>>('GET', `/admin/claims?status=${status}`)),
  reviewClaim: (id: string, decision: 'approve' | 'reject', note?: string) =>
    data(request<Envelope<{ status: string; invite: CreatedInvite | null }>>('POST', `/admin/claims/${id}/review`, { decision, note }))
};
