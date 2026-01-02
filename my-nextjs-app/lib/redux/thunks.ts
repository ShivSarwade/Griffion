import { createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../apiService'
import { LoginCredentials, RegisterData } from '../apiService'
import type { NavItem } from '@/components/layout'

// Transform backend navigation format to frontend NavItem format
const transformNavigationTree = (nodes: any[]): NavItem[] => {
  return nodes.map(node => ({
    id: node.id || String(node.name),
    name: node.name,
    type: node.type || 'page',
    icon: node.icon || 'folder',
    isPublic: node.isPublic || false,
    path: node.path,
    children: node.children ? transformNavigationTree(node.children) : undefined
  }))
}

// Auth thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.login(credentials)
      if (response.success && response.data) {
        return response.data
      }
      return rejectWithValue(response.error || 'Login failed')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      const response = await api.register(data)
      if (response.success) {
        return response.data
      }
      return rejectWithValue(response.error || 'Registration failed')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Registration failed')
    }
  }
)

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getProfile()
      if (response.success && response.data) {
        return response.data
      }
      return rejectWithValue(response.error || 'Failed to fetch profile')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch profile')
    }
  }
)

// Navigation thunks
export const fetchNavigation = createAsyncThunk(
  'navigation/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getNavigation()
      if (response.success && response.data) {
        // Transform backend format to frontend NavItem format
        return transformNavigationTree(response.data)
      }
      return rejectWithValue(response.error || 'Failed to fetch navigation')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch navigation')
    }
  }
)

// Config thunks
export const fetchBackendConfig = createAsyncThunk(
  'config/fetchBackend',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getHealth()
      if (response.success && response.data) {
        return response.data
      }
      return rejectWithValue(response.error || 'Failed to fetch config')
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch config')
    }
  }
)
