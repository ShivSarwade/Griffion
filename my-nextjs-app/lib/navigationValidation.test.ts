/**
 * Navigation Validation Test Suite
 * 
 * Run these tests to verify navigation validation is working correctly
 * Open browser console to see test results
 */

import { 
  isComponentAvailable, 
  validateNavigationItems, 
  DEFAULT_PAGE_PATH,
  getAvailableRoutes 
} from './componentValidator'

import {
  analyzeNavigation,
  printNavigationReport,
  visualizeNavigationTree,
  checkPath,
  testNavigationValidation
} from './navigationDebug'

// Test data
const MOCK_NAVIGATION = [
  {
    id: '1',
    name: 'Dashboard',
    type: 'page' as const,
    path: '/dashboard',
    icon: 'dashboard',
    isPublic: false,
  },
  {
    id: '2',
    name: 'Settings',
    type: 'page' as const,
    path: '/settings',
    icon: 'settings',
    isPublic: false,
  },
  {
    id: '3',
    name: 'Reports',
    type: 'page' as const,
    path: '/admin/reports', // This doesn't exist
    icon: 'file-text',
    isPublic: false,
  },
  {
    id: '4',
    name: 'Management',
    type: 'section' as const,
    icon: 'folder',
    isPublic: false,
    children: [
      {
        id: '4-1',
        name: 'User Directory',
        type: 'page' as const,
        path: '/management/user-directory',
        icon: 'users',
        isPublic: false,
      },
      {
        id: '4-2',
        name: 'Users',
        type: 'page' as const,
        path: '/management/users', // This doesn't exist
        icon: 'users',
        isPublic: false,
      },
      {
        id: '4-3',
        name: 'Audit Logs',
        type: 'page' as const,
        path: '/management/audit-logs',
        icon: 'file-text',
        isPublic: false,
      },
    ],
  },
]

/**
 * Test 1: Check individual paths
 */
export function testIndividualPaths() {
  console.group('🧪 TEST 1: Individual Path Checks')
  
  const testPaths = [
    '/dashboard',
    '/settings',
    '/admin/reports',
    '/management/user-directory',
    '/management/users',
    '/nonexistent/path',
  ]
  
  testPaths.forEach(path => {
    const exists = isComponentAvailable(path)
    console.log(`${exists ? '✅' : '❌'} ${path}`)
  })
  
  console.groupEnd()
}

/**
 * Test 2: Validate navigation with redirect mode
 */
export function testNavigationValidationRedirect() {
  console.group('🧪 TEST 2: Navigation Validation (Redirect Mode)')
  
  const validated = validateNavigationItems(MOCK_NAVIGATION, true)
  
  console.log('Before validation:', MOCK_NAVIGATION.length, 'root items')
  console.log('After validation:', validated.length, 'root items')
  
  printNavigationReport(MOCK_NAVIGATION, 'redirect')
  
  console.log('\nValidated structure:')
  visualizeNavigationTree(validated)
  
  console.groupEnd()
  
  return validated
}

/**
 * Test 3: Validate navigation with filter mode
 */
export function testNavigationValidationFilter() {
  console.group('🧪 TEST 3: Navigation Validation (Filter Mode)')
  
  const validated = validateNavigationItems(MOCK_NAVIGATION, false)
  
  console.log('Before validation:', MOCK_NAVIGATION.length, 'root items')
  console.log('After validation:', validated.length, 'root items')
  
  printNavigationReport(MOCK_NAVIGATION, 'filter')
  
  console.log('\nValidated structure:')
  visualizeNavigationTree(validated)
  
  console.groupEnd()
  
  return validated
}

/**
 * Test 4: Check nested navigation handling
 */
export function testNestedNavigation() {
  console.group('🧪 TEST 4: Nested Navigation Handling')
  
  const managementSection = MOCK_NAVIGATION.find(item => item.id === '4')
  
  if (managementSection && managementSection.children) {
    console.log('Original children:', managementSection.children.length)
    
    const validated = validateNavigationItems([managementSection as any], true)
    const validatedSection = validated[0]
    
    if (validatedSection && validatedSection.children) {
      console.log('Validated children:', validatedSection.children.length)
      
      console.log('\nChild items:')
      validatedSection.children.forEach((child: any) => {
        const status = isComponentAvailable(child.path || '') ? '✅' : '❌'
        console.log(`${status} ${child.name}: ${child.path}`)
      })
    }
  }
  
  console.groupEnd()
}

/**
 * Test 5: Get all available routes
 */
export function testGetAvailableRoutes() {
  console.group('🧪 TEST 5: Available Routes')
  
  const routes = getAvailableRoutes()
  console.log(`Total registered routes: ${routes.length}`)
  console.log('\nRoutes:')
  routes.forEach(route => console.log(`  ${route}`))
  
  console.groupEnd()
}

/**
 * Test 6: Check specific paths with detailed info
 */
export function testCheckPaths() {
  console.group('🧪 TEST 6: Detailed Path Checks')
  
  checkPath('/dashboard')
  checkPath('/admin/reports')
  checkPath('/management/users')
  
  console.groupEnd()
}

/**
 * Test 7: Analyze navigation statistics
 */
export function testAnalyzeNavigation() {
  console.group('🧪 TEST 7: Navigation Analysis')
  
  const info = analyzeNavigation(MOCK_NAVIGATION, 'redirect')
  
  console.log('Statistics:')
  console.table(info)
  
  if (info.redirectedItems.length > 0) {
    console.log('\nRedirected items:')
    info.redirectedItems.forEach(path => {
      console.log(`  ${path} → ${DEFAULT_PAGE_PATH}`)
    })
  }
  
  console.groupEnd()
}

/**
 * Run all tests
 */
export function runAllTests() {
  console.clear()
  console.log('🚀 Running Navigation Validation Tests')
  console.log('======================================\n')
  
  testIndividualPaths()
  console.log('\n')
  
  testNavigationValidationRedirect()
  console.log('\n')
  
  testNavigationValidationFilter()
  console.log('\n')
  
  testNestedNavigation()
  console.log('\n')
  
  testGetAvailableRoutes()
  console.log('\n')
  
  testCheckPaths()
  console.log('\n')
  
  testAnalyzeNavigation()
  console.log('\n')
  
  console.log('✅ All tests completed!')
  console.log('\nTo run individual tests:')
  console.log('  testIndividualPaths()')
  console.log('  testNavigationValidationRedirect()')
  console.log('  testNavigationValidationFilter()')
  console.log('  testNestedNavigation()')
  console.log('  testGetAvailableRoutes()')
  console.log('  testCheckPaths()')
  console.log('  testAnalyzeNavigation()')
}

/**
 * Quick test for a custom navigation structure
 */
export function testCustomNavigation(navigation: any[]) {
  console.log('🧪 Testing Custom Navigation')
  console.log('============================\n')
  
  testNavigationValidation(navigation)
}

// Usage examples in browser console:
/*
import { runAllTests, testCustomNavigation } from '@/lib/navigationValidation.test'

// Run all tests
runAllTests()

// Test custom navigation
const myNav = [{ name: 'Test', path: '/test', type: 'page', icon: 'test', isPublic: false }]
testCustomNavigation(myNav)
*/
