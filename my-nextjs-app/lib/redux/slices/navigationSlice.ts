import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  id: string
  name: string
  type: 'page' | 'section'
  path?: string
  icon: string | LucideIcon
  isPublic: boolean
  order?: number
  accessRoles?: string[]
  children?: NavItem[]
}

interface NavigationState {
  items: NavItem[]
  loading: boolean
  error: string | null
}

const initialState: NavigationState = {
  items: [],
  loading: false,
  error: null,
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setNavigation: (state, action: PayloadAction<NavItem[]>) => {
      state.items = action.payload
      state.loading = false
      state.error = null
    },
    setNavigationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setNavigationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    },
    clearNavigation: (state) => {
      state.items = []
      state.error = null
    },
  },
})

export const {
  setNavigation,
  setNavigationLoading,
  setNavigationError,
  clearNavigation,
} = navigationSlice.actions

export default navigationSlice.reducer

// Selectors
export const selectNavigation = (state: { navigation: NavigationState }) => state.navigation.items
export const selectNavigationLoading = (state: { navigation: NavigationState }) => state.navigation.loading
export const selectNavigationError = (state: { navigation: NavigationState }) => state.navigation.error
