'use client'

import { useEffect } from 'react'
import { applyEnvTheme } from '@/lib/theme'

/**
 * ThemeInitializer
 * 
 * Client component that runs on mount to apply environment-based
 * theme configuration to CSS variables.
 * 
 * This enables zero-friction rebranding by reading colors, logo, and
 * other brand assets from .env and applying them at runtime.
 */
export function ThemeInitializer() {
  useEffect(() => {
    applyEnvTheme()
  }, [])

  return null
}
