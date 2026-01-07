/**
 * Component Validator Utility
 * Checks if page components exist in the app directory structure
 */

// Define explicit page components that exist as dedicated files
// Most routes will be handled by the catch-all (dashboard)/[...slug]/page.tsx
const AVAILABLE_ROUTES = new Set<string>([
  // Public routes (no sidebar/navbar)
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  
  // Add your custom explicit page components here
  // Example: '/custom/page',
])

// Enable catch-all route fallback for authenticated pages
// When true, any authenticated route not in AVAILABLE_ROUTES will show a default "create page" UI
// When false, routes must be explicitly registered
export const ENABLE_CATCHALL_FALLBACK = true

// Default page path (not used when catch-all is enabled)
export const DEFAULT_PAGE_PATH = '/dashboard'

/**
 * Check if a page component exists in the app directory
 * @param path - The path to check (e.g., '/dashboard', '/management/users')
 * @returns true if the component exists, false otherwise
 */
export function isComponentAvailable(path: string | undefined): boolean {
  if (!path) return false
  
  // Normalize path (remove trailing slashes)
  const normalizedPath = path.replace(/\/$/, '') || '/'
  
  // Check if the exact route exists (explicit page component)
  if (AVAILABLE_ROUTES.has(normalizedPath)) {
    return true
  }
  
  // If catch-all fallback is enabled, any path can be handled by [...slug]
  // Example: /audit/logs will be caught by (dashboard)/[...slug]/page.tsx
  if (ENABLE_CATCHALL_FALLBACK && normalizedPath.startsWith('/') && normalizedPath !== '/') {
    return true // Dynamic catch-all route will handle it
  }
  
  return false
}

/**
 * Validate and filter navigation items based on component availability
 * @param items - Navigation items to validate
 * @param showDefault - Whether to show default page for unavailable components
 * @returns Filtered navigation items
 */
export function validateNavigationItems<T extends { path?: string; children?: T[] }>(
  items: T[],
  showDefault: boolean = true
): T[] {
  return items
    .map(item => {
      // If item has children, recursively validate them
      if (item.children && item.children.length > 0) {
        const validChildren = validateNavigationItems(item.children, showDefault)
        
        // Keep section if it has valid children
        if (validChildren.length > 0) {
          return { ...item, children: validChildren }
        }
        return null
      }
      
      // For page items, check if component exists
      if (item.path) {
        const isAvailable = isComponentAvailable(item.path)
        const hasExplicitComponent = AVAILABLE_ROUTES.has(item.path.replace(/\/$/, ''))
        
        if (isAvailable) {
          // Log info about catch-all routes in development
          if (process.env.NODE_ENV === 'development' && !hasExplicitComponent && ENABLE_CATCHALL_FALLBACK) {
            console.info(`📄 Route "${item.path}" will be handled by catch-all: (dashboard)/[...slug]/page.tsx`)
          }
          return item
        } else {
          // If showDefault is true, redirect to default page
          if (showDefault) {
            console.warn(`Component not found for path: ${item.path}. Redirecting to default page.`)
            return { ...item, path: DEFAULT_PAGE_PATH }
          }
          // Otherwise, filter out the item
          return null
        }
      }
      
      // Keep items without paths (sections)
      return item
    })
    .filter((item): item is T => item !== null)
}

/**
 * Get a list of all available routes
 * @returns Array of available route paths
 */
export function getAvailableRoutes(): string[] {
  return Array.from(AVAILABLE_ROUTES)
}

/**
 * Add a custom route dynamically (useful for plugin systems)
 * @param path - The path to add
 */
export function registerCustomRoute(path: string): void {
  AVAILABLE_ROUTES.add(path)
}

/**
 * Remove a custom route
 * @param path - The path to remove
 */
export function unregisterCustomRoute(path: string): void {
  AVAILABLE_ROUTES.delete(path)
}
