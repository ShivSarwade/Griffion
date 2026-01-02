import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface BackendConfig {
  primaryIdentifier: 'email' | 'username' | 'both'
  enable2FA: boolean
  enablePasswordRecovery: boolean
  enableAdminPanel: boolean
  enableNavigation: boolean
  appName?: string
}

interface ConfigState {
  backend: BackendConfig | null
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  loading: boolean
}

const initialState: ConfigState = {
  backend: null,
  theme: 'dark',
  sidebarOpen: true,
  loading: false,
}

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setBackendConfig: (state, action: PayloadAction<BackendConfig>) => {
      state.backend = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setConfigLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
  },
})

export const {
  setBackendConfig,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setConfigLoading,
} = configSlice.actions

export default configSlice.reducer

// Selectors
export const selectBackendConfig = (state: { config: ConfigState }) => state.config.backend
export const selectTheme = (state: { config: ConfigState }) => state.config.theme
export const selectSidebarOpen = (state: { config: ConfigState }) => state.config.sidebarOpen
export const selectConfigLoading = (state: { config: ConfigState }) => state.config.loading
