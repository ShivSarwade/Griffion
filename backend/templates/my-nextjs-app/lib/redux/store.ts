import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import navigationReducer from './slices/navigationSlice'
import configReducer from './slices/configSlice'

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  navigation: navigationReducer,
  config: configReducer,
})

// Persist configuration
const persistConfig = {
  key: 'griffion-root',
  version: 1,
  storage,
  whitelist: ['auth', 'config'], // Only persist auth and config, not navigation
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
