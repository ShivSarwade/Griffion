/**
 * API Client for Griffion Backend
 * Handles all API requests with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ApiResponse<T = any>  {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface LoginCredentials {
  email?: string;
  username?: string;
  password: string;
  totpToken?: string;
}

interface RegisterData {
  email: string;
  username?: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

interface NavigationNode {
  id: string;
  name: string;
  type: 'page' | 'section';
  path?: string;
  icon: string;
  isPublic: boolean;
  order: number;
  accessRoles: string[];
  children?: NavigationNode[];
}

interface BackendConfig {
  primaryIdentifier: 'email' | 'username' | 'both';
  enable2FA: boolean;
  enablePasswordRecovery: boolean;
  enableAdminPanel: boolean;
  enableNavigation: boolean;
  appName: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'An error occurred',
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Health & Config
  async getHealth(): Promise<ApiResponse<BackendConfig>> {
    return this.request<BackendConfig>('/api/health');
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<{
    accessToken: string;
    refreshToken: string;
    user: any;
    requires2FA?: boolean;
  }>> {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterData): Promise<ApiResponse<any>> {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    return this.request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{
    accessToken: string;
  }>> {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User Profile
  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/api/users/me');
  }

  async updateProfile(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/api/users/me/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Navigation
  async getNavigation(): Promise<ApiResponse<NavigationNode[]>> {
    return this.request<NavigationNode[]>('/api/navigation/menu');
  }

  // Admin - Users
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.roleId) queryParams.append('roleId', params.roleId);

    return this.request(`/api/admin/users?${queryParams.toString()}`);
  }

  async getUserById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/api/admin/users/${id}`);
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/api/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Roles
  async getRoles(): Promise<ApiResponse<any>> {
    return this.request('/api/admin/roles');
  }

  async createRole(data: any): Promise<ApiResponse<any>> {
    return this.request('/api/admin/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRole(id: string, data: any): Promise<ApiResponse<any>> {
    return this.request(`/api/admin/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRole(id: string): Promise<ApiResponse> {
    return this.request(`/api/admin/roles/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin - Audit Logs
  async getAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
  }): Promise<ApiResponse<any>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.userId) queryParams.append('userId', params.userId);

    return this.request(`/api/admin/audit-logs?${queryParams.toString()}`);
  }

  // Admin - Statistics
  async getStatistics(): Promise<ApiResponse<any>> {
    return this.request('/api/admin/statistics');
  }

  // Password Recovery
  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // 2FA
  async enable2FA(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    return this.request('/api/auth/2fa/enable', {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  async verify2FA(token: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return this.request('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async disable2FA(password: string): Promise<ApiResponse> {
    return this.request('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }
}

export const api = new ApiClient();
export default api;
