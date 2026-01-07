/**
 * Route Registry Helper
 * 
 * This file helps maintain the list of available routes.
 * When you add new pages, update this file and copy the routes to componentValidator.ts
 * 
 * This is a development helper - the actual validation uses the static list in componentValidator.ts
 */

// Organized by category for easier maintenance
export const ROUTE_REGISTRY = {
  // Public pages (no auth required)
  public: [
    '/login',
    '/forgot-password',
    '/reset-password',
  ],
  
  // Main app pages (require auth)
  main: [
    '/dashboard',
    '/home',
  ],
  
  // User features
  user: [
    '/settings',
    '/billing',
    '/help-center',
  ],
  
  // Management pages
  management: {
    root: [],
    userDirectory: ['/management/user-directory'],
    auditLogs: ['/management/audit-logs'],
  },
  
  // Infrastructure pages
  infrastructure: [
    '/management/infrastructure/database',
    '/management/infrastructure/api-keys',
  ],
  
  // Add your custom sections here
  custom: [
    // Example: '/admin/reports',
    // Example: '/analytics/dashboard',
  ],
}

/**
 * Get all routes as a flat array
 */
export function getAllRoutes(): string[] {
  const routes: string[] = []
  
  const addRoutes = (obj: any) => {
    if (Array.isArray(obj)) {
      routes.push(...obj)
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach(addRoutes)
    }
  }
  
  addRoutes(ROUTE_REGISTRY)
  return routes
}

/**
 * Print all routes to console (for easy copying to componentValidator.ts)
 */
export function printRoutes(): void {
  const routes = getAllRoutes()
  console.log('=== Available Routes ===')
  console.log('Copy these to AVAILABLE_ROUTES in componentValidator.ts:')
  console.log('')
  routes.forEach(route => {
    console.log(`  '${route}',`)
  })
  console.log('')
  console.log(`Total: ${routes.length} routes`)
}

/**
 * Check for duplicate routes
 */
export function checkDuplicates(): string[] {
  const routes = getAllRoutes()
  const seen = new Set<string>()
  const duplicates: string[] = []
  
  routes.forEach(route => {
    if (seen.has(route)) {
      duplicates.push(route)
    } else {
      seen.add(route)
    }
  })
  
  return duplicates
}

/**
 * Validate route format (should start with /)
 */
export function validateRouteFormat(): { invalid: string[]; valid: number } {
  const routes = getAllRoutes()
  const invalid = routes.filter(route => !route.startsWith('/'))
  
  return {
    invalid,
    valid: routes.length - invalid.length,
  }
}

// Example usage (uncomment to use in development):
// printRoutes()
// console.log('Duplicates:', checkDuplicates())
// console.log('Format validation:', validateRouteFormat())
