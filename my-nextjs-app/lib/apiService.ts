/**
 * API Service for Griffion Backend
 * Redux-aware - uses apiClient that reads tokens from Redux store
 */

import apiClient from './apiClient'

export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

export interface LoginCredentials {
  email?: string
  username?: string
  password: string
  totpToken?: string
}

export interface RegisterData {
  email?: string
  username?: string
  password: string
  firstName?: string
  lastName?: string
  role?: string
}

export interface NavigationNode {
  id: string
  name: string
  type: 'page' | 'section'
  path?: string
  icon: string
  isPublic: boolean
  order?: number
  accessRoles?: string[]
  children?: NavigationNode[]
}

export interface BackendConfig {
  primaryIdentifier?: 'email' | 'username' | 'both'
  enable2FA?: boolean
  enablePasswordRecovery?: boolean
  enableAdminPanel?: boolean
  enableNavigation?: boolean
  appName?: string
}

// Helper function to handle API responses
async function handleRequest<T>(promise: Promise<any>): Promise<ApiResponse<T>> {
  try {
    const response = await promise
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'An error occurred',
    }
  }
}

// Health & Config
export async function getHealth(): Promise<ApiResponse<BackendConfig>> {
  return handleRequest(apiClient.get('/api/health'))
}

// Authentication
export async function login(credentials: LoginCredentials): Promise<ApiResponse<{
  accessToken: string
  refreshToken: string
  user: any
  requires2FA?: boolean
}>> {
  return handleRequest(apiClient.post('/api/auth/login', credentials))
}

export async function register(data: RegisterData): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.post('/api/auth/register', data))
}

export async function logout(refreshToken: string): Promise<ApiResponse> {
  return handleRequest(apiClient.post('/api/auth/logout', { refreshToken }))
}

export async function refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
  return handleRequest(apiClient.post('/api/auth/refresh', { refreshToken }))
}

// User Profile
export async function getProfile(): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.get('/api/users/me'))
}

export async function updateProfile(data: any): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.put('/api/users/me', data))
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
  return handleRequest(apiClient.post('/api/users/me/change-password', { currentPassword, newPassword }))
}

// Navigation
export async function getNavigation(): Promise<ApiResponse<NavigationNode[]>> {
  return handleRequest(apiClient.get('/api/navigation/menu'))
}

// Admin - Users
export async function getUsers(params?: {
  page?: number
  limit?: number
  search?: string
  roleId?: string
}): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.get('/api/admin/users', { params }))
}

export async function getUserById(id: string): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.get(`/api/admin/users/${id}`))
}

export async function createUser(data: any): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.post('/api/admin/users', data))
}

export async function updateUser(id: string, data: any): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.put(`/api/admin/users/${id}`, data))
}

export async function deleteUser(id: string): Promise<ApiResponse> {
  return handleRequest(apiClient.delete(`/api/admin/users/${id}`))
}

// Admin - Roles
export async function getRoles(): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.get('/api/admin/roles'))
}

export async function createRole(data: any): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.post('/api/admin/roles', data))
}

export async function updateRole(id: string, data: any): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.put(`/api/admin/roles/${id}`, data))
}

export async function deleteRole(id: string): Promise<ApiResponse> {
  return handleRequest(apiClient.delete(`/api/admin/roles/${id}`))
}

// Admin - Audit Logs
export async function getAuditLogs(params?: {
  page?: number
  limit?: number
  action?: string
  userId?: string
}): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.get('/api/admin/audit-logs', { params }))
}

// Admin - Statistics
export async function getStatistics(): Promise<ApiResponse<any>> {
  return handleRequest(apiClient.get('/api/admin/statistics'))
}

// Password Recovery
export async function forgotPassword(email: string): Promise<ApiResponse> {
  return handleRequest(apiClient.post('/api/auth/forgot-password', { email }))
}

export async function resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
  return handleRequest(apiClient.post('/api/auth/reset-password', { token, newPassword }))
}

// 2FA
export async function enable2FA(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
  return handleRequest(apiClient.post('/api/auth/2fa/enable', {}))
}

export async function verify2FA(token: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
  return handleRequest(apiClient.post('/api/auth/2fa/verify', { token }))
}

export async function disable2FA(password: string): Promise<ApiResponse> {
  return handleRequest(apiClient.post('/api/auth/2fa/disable', { password }))
}

// Export all as default for compatibility
const api = {
  getHealth,
  login,
  register,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  getNavigation,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getAuditLogs,
  getStatistics,
  forgotPassword,
  resetPassword,
  enable2FA,
  verify2FA,
  disable2FA,
}

export default api
