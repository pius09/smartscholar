import {
  User,
  StudentProfile,
  Opportunity,
  Application,
  NotificationItem,
  SavedOpportunity,
  Recommendation,
  AdminAnalytics,
  MatchWeights,
} from '../types';

let currentToken: string = localStorage.getItem('smartscholar_token') || '';

export function setAuthToken(token: string) {
  currentToken = token;
  if (token) {
    localStorage.setItem('smartscholar_token', token);
  } else {
    localStorage.removeItem('smartscholar_token');
  }
}

export function getAuthToken(): string {
  return currentToken;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network request failed' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: User; profile: StudentProfile | null }> {
    return request('/api/auth/me');
  },

  async login(credentials: { email: string; password?: string }): Promise<{ token: string; user: User; profile: StudentProfile | null }> {
    const res = await request<{ token: string; user: User; profile: StudentProfile | null }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: {
    role: 'student' | 'admin';
    fullName: string;
    email: string;
    password: string;
    country?: string;
    phone?: string;
    studentType?: string;
    fieldOfStudy?: string;
    institution?: string;
    department?: string;
    adminTitle?: string;
  }): Promise<{ token: string; user: User; profile: StudentProfile | null }> {
    const res = await request<{ token: string; user: User; profile: StudentProfile | null }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    await request('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthToken('');
  },

  // Profile
  async getProfile(): Promise<{ user: User; profile: StudentProfile }> {
    return request('/api/profile');
  },

  async updateProfile(profileData: Partial<StudentProfile> & { fullName?: string; country?: string; phone?: string }): Promise<{ user: User; profile: StudentProfile }> {
    return request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async uploadCv(data: { fileName: string; rawText?: string; fileContent?: string }): Promise<{ success: boolean; extractedData: any; profile: StudentProfile }> {
    return request('/api/profile/cv', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Opportunities & Recommendations
  async getOpportunities(params: Record<string, string> = {}): Promise<Opportunity[]> {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request(`/api/opportunities${query}`);
  },

  async getOpportunity(id: string): Promise<Opportunity> {
    return request(`/api/opportunities/${id}`);
  },

  async getRecommendations(): Promise<Recommendation[]> {
    return request('/api/recommendations');
  },

  async getOpportunityMatchBreakdown(id: string): Promise<Recommendation> {
    return request(`/api/recommendations/${id}`);
  },

  // Saved Opportunities
  async getSavedOpportunities(): Promise<SavedOpportunity[]> {
    return request('/api/saved');
  },

  async saveOpportunity(id: string, notes?: string): Promise<SavedOpportunity> {
    return request(`/api/opportunities/${id}/save`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  },

  async removeSavedOpportunity(id: string): Promise<{ success: boolean }> {
    return request(`/api/opportunities/${id}/save`, {
      method: 'DELETE',
    });
  },

  // Applications
  async getApplications(): Promise<Application[]> {
    return request('/api/applications');
  },

  async createApplication(data: Partial<Application>): Promise<Application> {
    return request('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateApplication(id: string, data: Partial<Application>): Promise<Application> {
    return request(`/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteApplication(id: string): Promise<{ success: boolean }> {
    return request(`/api/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return request('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return request('/api/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Admin
  async getAdminDashboard(): Promise<AdminAnalytics & { matchWeights: MatchWeights }> {
    return request('/api/admin/dashboard');
  },

  async getAdminStudents(): Promise<any[]> {
    return request('/api/admin/students');
  },

  async getAdminOpportunities(): Promise<Opportunity[]> {
    return request('/api/admin/opportunities');
  },

  async createOpportunity(opp: Partial<Opportunity>): Promise<Opportunity> {
    return request('/api/admin/opportunities', {
      method: 'POST',
      body: JSON.stringify(opp),
    });
  },

  async updateOpportunity(id: string, opp: Partial<Opportunity>): Promise<Opportunity> {
    return request(`/api/admin/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(opp),
    });
  },

  async deleteOpportunity(id: string): Promise<{ success: boolean }> {
    return request(`/api/admin/opportunities/${id}`, {
      method: 'DELETE',
    });
  },

  async updateMatchWeights(weights: Partial<MatchWeights>): Promise<MatchWeights> {
    return request('/api/admin/match-weights', {
      method: 'PUT',
      body: JSON.stringify(weights),
    });
  },
};
