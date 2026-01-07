/**
 * Theme Utilities
 * 
 * Applies environment-based branding to CSS variables at runtime.
 * This enables zero-friction rebranding without rebuilding the app.
 * 
 * Usage:
 * - Call applyEnvTheme() on app mount
 * - Theme colors, logo, and other brand assets are read from .env
 * - CSS variables are updated dynamically
 */

interface ThemeConfig {
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  logoPath?: string
}

/**
 * Apply environment-based theme configuration to CSS variables
 */
export function applyEnvTheme() {
  if (typeof window === 'undefined') return

  const config: ThemeConfig = {
    primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR,
    secondaryColor: process.env.NEXT_PUBLIC_SECONDARY_COLOR,
    accentColor: process.env.NEXT_PUBLIC_ACCENT_COLOR,
    logoPath: process.env.NEXT_PUBLIC_LOGO_PATH,
  }

  const root = document.documentElement

  if (config.primaryColor) {
    root.style.setProperty('--brand-primary', config.primaryColor)
  }

  if (config.secondaryColor) {
    root.style.setProperty('--brand-secondary', config.secondaryColor)
  }

  if (config.accentColor) {
    root.style.setProperty('--brand-accent', config.accentColor)
  }

  if (config.logoPath) {
    root.style.setProperty('--brand-logo-path', `url(${config.logoPath})`)
  }
}

/**
 * Get the current brand colors from CSS variables
 */
export function getBrandColors() {
  if (typeof window === 'undefined') {
    return {
      primary: '#4f46e5',
      secondary: '#7c3aed',
      accent: '#0ea5e9',
    }
  }

  const root = getComputedStyle(document.documentElement)

  return {
    primary: root.getPropertyValue('--brand-primary').trim(),
    secondary: root.getPropertyValue('--brand-secondary').trim(),
    accent: root.getPropertyValue('--brand-accent').trim(),
  }
}

/**
 * Get the logo path from CSS variables
 */
export function getLogoPath(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_LOGO_PATH || '/logo.svg'
  }

  const root = getComputedStyle(document.documentElement)
  const logoPath = root.getPropertyValue('--brand-logo-path').trim()

  // Remove url() wrapper if present
  return logoPath.replace(/^url\(['"]?(.+?)['"]?\)$/, '$1') || '/logo.svg'
}

/**
 * Apply theme (light/dark) class to document
 */
export function applyThemeClass(theme: 'light' | 'dark') {
  if (typeof window === 'undefined') return

  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    document.documentElement.classList.remove('dark')
  }
}

/**
 * Get authentication strategy from environment
 */
export function getAuthStrategy(): 'email' | 'username' | 'both' {
  return (process.env.NEXT_PUBLIC_AUTH_STRATEGY as 'email' | 'username' | 'both') || 'email'
}

/**
 * Get self-registration roles from environment
 */
export function getSelfRegisterRoles(): string[] {
  const rolesEnv = process.env.NEXT_PUBLIC_SELF_REGISTER_ROLES
  if (!rolesEnv) return []

  try {
    return JSON.parse(rolesEnv)
  } catch {
    return []
  }
}

/**
 * Get app title from environment
 */
export function getAppTitle(): string {
  return process.env.NEXT_PUBLIC_APP_TITLE || 'Griffion'
}

/**
 * Get app description from environment
 */
export function getAppDescription(): string {
  return process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Next.js Application'
}

/**
 * Check if 2FA is enabled
 */
export function is2FAEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_2FA === 'true'
}
