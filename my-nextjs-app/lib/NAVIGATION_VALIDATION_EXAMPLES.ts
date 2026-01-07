/**
 * EXAMPLE: How Navigation Validation Works
 * 
 * This file demonstrates the navigation validation feature with practical examples.
 */

// ============================================================================
// EXAMPLE 1: API Returns Navigation with Missing Component
// ============================================================================

// API Response from Backend:
const apiResponse = {
  success: true,
  data: [
    {
      id: '1',
      name: 'Dashboard',
      type: 'page',
      path: '/dashboard',
      icon: 'dashboard',
      isPublic: false,
    },
    {
      id: '2',
      name: 'Reports',
      type: 'page',
      path: '/admin/reports',  // ⚠️ This component doesn't exist!
      icon: 'file-text',
      isPublic: false,
    },
    {
      id: '3',
      name: 'Settings',
      type: 'page',
      path: '/settings',
      icon: 'settings',
      isPublic: false,
    },
  ],
}

// After Validation (with showDefault = true):
const validatedNavigation = [
  {
    id: '1',
    name: 'Dashboard',
    type: 'page',
    path: '/dashboard',  // ✅ Component exists
    icon: 'dashboard',
    isPublic: false,
  },
  {
    id: '2',
    name: 'Reports',
    type: 'page',
    path: '/dashboard',  // ⚠️ Redirected to default page
    icon: 'file-text',
    isPublic: false,
  },
  {
    id: '3',
    name: 'Settings',
    type: 'page',
    path: '/settings',  // ✅ Component exists
    icon: 'settings',
    isPublic: false,
  },
]

// Console Output:
// "Component not found for path: /admin/reports. Redirecting to default page."

// ============================================================================
// EXAMPLE 2: Navigation with Nested Structure
// ============================================================================

const nestedApiResponse = {
  success: true,
  data: [
    {
      id: '1',
      name: 'Management',
      type: 'section',
      icon: 'folder',
      isPublic: false,
      children: [
        {
          id: '1-1',
          name: 'Users',
          type: 'page',
          path: '/management/users',  // ⚠️ Doesn't exist
          icon: 'users',
          isPublic: false,
        },
        {
          id: '1-2',
          name: 'User Directory',
          type: 'page',
          path: '/management/user-directory',  // ✅ Exists
          icon: 'users',
          isPublic: false,
        },
        {
          id: '1-3',
          name: 'Audit Logs',
          type: 'page',
          path: '/management/audit-logs',  // ✅ Exists
          icon: 'file-text',
          isPublic: false,
        },
      ],
    },
  ],
}

const validatedNestedNavigation = [
  {
    id: '1',
    name: 'Management',
    type: 'section',
    icon: 'folder',
    isPublic: false,
    children: [
      {
        id: '1-1',
        name: 'Users',
        type: 'page',
        path: '/dashboard',  // ⚠️ Redirected to default
        icon: 'users',
        isPublic: false,
      },
      {
        id: '1-2',
        name: 'User Directory',
        type: 'page',
        path: '/management/user-directory',  // ✅ Valid
        icon: 'users',
        isPublic: false,
      },
      {
        id: '1-3',
        name: 'Audit Logs',
        type: 'page',
        path: '/management/audit-logs',  // ✅ Valid
        icon: 'file-text',
        isPublic: false,
      },
    ],
  },
]

// ============================================================================
// EXAMPLE 3: Filtering Mode (showDefault = false)
// ============================================================================

// Same API response as Example 1
// But with showDefault = false in validateNavigationItems()

const filteredNavigation = [
  {
    id: '1',
    name: 'Dashboard',
    type: 'page',
    path: '/dashboard',  // ✅ Component exists
    icon: 'dashboard',
    isPublic: false,
  },
  // ❌ Reports entry is completely removed (not shown in menu)
  {
    id: '3',
    name: 'Settings',
    type: 'page',
    path: '/settings',  // ✅ Component exists
    icon: 'settings',
    isPublic: false,
  },
]

// ============================================================================
// EXAMPLE 4: Adding a New Page
// ============================================================================

/*
STEP 1: Create the component file
---------------------------------
File: my-nextjs-app/app/analytics/page.tsx

'use client'
import React from 'react'
import { Sidebar, Navbar } from '@/components/layout'

export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
    </div>
  )
}


STEP 2: Register the route
--------------------------
File: my-nextjs-app/lib/componentValidator.ts

const AVAILABLE_ROUTES = new Set([
  // ... existing routes
  '/analytics',  // Add this line
])


STEP 3: Add to backend navigation
---------------------------------
The backend should return this in the navigation API:

{
  id: 'analytics-1',
  name: 'Analytics',
  type: 'page',
  path: '/analytics',
  icon: 'bar-chart',
  isPublic: false,
}


RESULT:
------
✅ The Analytics menu item appears
✅ Clicking it navigates to /analytics
✅ The AnalyticsPage component renders correctly
*/

// ============================================================================
// EXAMPLE 5: Dynamic Route Registration
// ============================================================================

// For plugin systems or dynamic features:
/*
import { registerCustomRoute, isComponentAvailable } from '@/lib/componentValidator'

// Register a plugin route
registerCustomRoute('/plugins/my-plugin')

// Check if it's available
console.log(isComponentAvailable('/plugins/my-plugin')) // true

// Use in your plugin system
const pluginRoutes = loadPlugins().map(plugin => {
  registerCustomRoute(plugin.path)
  return {
    name: plugin.name,
    path: plugin.path,
    icon: plugin.icon,
  }
})
*/

// ============================================================================
// SUMMARY
// ============================================================================

/*
BENEFITS:
---------
1. ✅ Prevents 404 errors from API-provided routes
2. ✅ Graceful fallback to default page
3. ✅ Clear console warnings during development
4. ✅ Flexible filtering or redirection modes
5. ✅ Supports dynamic route registration
6. ✅ Works with nested navigation structures

WORKFLOW:
---------
API Response → Transform → Validate Components → Filter/Redirect → Display in Menu

CONFIGURATION:
--------------
- Default page: componentValidator.ts > DEFAULT_PAGE_PATH
- Validation mode: thunks.ts > validateNavigationItems(data, true/false)
- Available routes: componentValidator.ts > AVAILABLE_ROUTES

MAINTENANCE:
-----------
- Keep AVAILABLE_ROUTES synchronized with your app structure
- Use routeRegistry.ts helper during development
- Monitor console warnings for missing components
*/

export {}
