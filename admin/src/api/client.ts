const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://doctimings-api.docnear.workers.dev/api/v1' : 'http://localhost:4000/api/v1');

export const getAuthToken = (): string | null => {
  return localStorage.getItem('wimd_jwt_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('wimd_jwt_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('wimd_jwt_token');
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: any; pagination?: any }> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/auth/login') {
        clearAuthToken();
        localStorage.removeItem('wimd_admin_user');
      }
      return {
        success: false,
        error: body?.error || { message: `Request failed with status ${response.status}` }
      };
    }

    return body;
  } catch (err: any) {
    return {
      success: false,
      error: { message: err?.message || 'Network connection to backend failed' }
    };
  }
};

export const apiClient = {
  auth: {
    login: async (email: string, password = 'password123') => {
      const res = await apiRequest<{ token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.success && res.data?.token) {
        setAuthToken(res.data.token);
      }
      return res;
    },
    me: async () => {
      return apiRequest<any>('/auth/me');
    }
  },

  doctors: {
    list: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return apiRequest<any[]>(`/doctors${query}`);
    },
    getById: async (id: string) => {
      return apiRequest<any>(`/doctors/${id}`);
    },
    create: async (data: any) => {
      return apiRequest<any>('/doctors', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: any) => {
      return apiRequest<any>(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete: async (id: string) => {
      return apiRequest<any>(`/doctors/${id}`, {
        method: 'DELETE'
      });
    }
  },

  establishments: {
    list: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return apiRequest<any[]>(`/establishments${query}`);
    },
    getById: async (id: string) => {
      return apiRequest<any>(`/establishments/${id}`);
    },
    create: async (data: any) => {
      return apiRequest<any>('/establishments', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: any) => {
      return apiRequest<any>(`/establishments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    addLocation: async (establishmentId: string, data: any) => {
      return apiRequest<any>(`/establishments/${establishmentId}/locations`, {
        method: 'POST',
        body: JSON.stringify({ ...data, establishmentId })
      });
    },
    getLocations: async (establishmentId: string) => {
      return apiRequest<any[]>(`/establishments/${establishmentId}/locations`);
    }
  },

  schedules: {
    list: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return apiRequest<any[]>(`/schedules${query}`);
    },
    getById: async (id: string) => {
      return apiRequest<any>(`/schedules/${id}`);
    },
    create: async (data: any) => {
      return apiRequest<any>('/schedules', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    update: async (id: string, data: any) => {
      return apiRequest<any>(`/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    delete: async (id: string) => {
      return apiRequest<any>(`/schedules/${id}`, {
        method: 'DELETE'
      });
    },
    listOverrides: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return apiRequest<any[]>(`/schedules/overrides${query}`);
    },
    createOverride: async (data: any) => {
      return apiRequest<any>('/schedules/overrides', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    deleteOverride: async (id: string) => {
      return apiRequest<any>(`/schedules/overrides/${id}`, {
        method: 'DELETE'
      });
    }
  },

  reports: {
    list: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return apiRequest<any[]>(`/reports${query}`);
    },
    getById: async (id: string) => {
      return apiRequest<any>(`/reports/${id}`);
    },
    updateStatus: async (id: string, status: string, resolutionNotes?: string) => {
      return apiRequest<any>(`/reports/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, resolutionNotes })
      });
    }
  },

  audit: {
    list: async (params?: Record<string, string | number>) => {
      const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
      return apiRequest<any[]>(`/audit${query}`);
    },
    create: async (data: any) => {
      return apiRequest<any>('/audit', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  users: {
    list: async () => {
      return apiRequest<any[]>('/auth/users');
    },
    invite: async (data: any) => {
      return apiRequest<any>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
  },

  health: {
    check: async () => {
      return apiRequest<any>('/health');
    },
    topics: async () => {
      return apiRequest<any[]>('/health/topics');
    },
    articles: async () => {
      return apiRequest<any[]>('/health/articles');
    }
  }
};
