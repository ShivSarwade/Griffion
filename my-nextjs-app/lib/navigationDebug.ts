/**
 * Navigation Validation Debug Utilities
 * 
 * Helper functions to debug and visualize navigation validation
 */

import { isComponentAvailable, getAvailableRoutes } from './componentValidator'

export interface NavigationDebugInfo {
  totalItems: number
  validItems: number
  invalidItems: number
  redirectedItems: string[]
  filteredItems: string[]
}

/**
 * Analyze navigation items and return debug information
 */
export function analyzeNavigation<T extends { path?: string; children?: T[] }>(
  items: T[],
  mode: 'redirect' | 'filter' = 'redirect'
): NavigationDebugInfo {
  const info: NavigationDebugInfo = {
    totalItems: 0,
    validItems: 0,
    invalidItems: 0,
    redirectedItems: [],
    filteredItems: [],
  }

  const analyzeItem = (item: T) => {
    if (item.path) {
      info.totalItems++
      
      if (isComponentAvailable(item.path)) {
        info.validItems++
      } else {
        info.invalidItems++
        
        if (mode === 'redirect') {
          info.redirectedItems.push(item.path)
        } else {
          info.filteredItems.push(item.path)
        }
      }
    }

    if (item.children) {
      item.children.forEach(analyzeItem)
    }
  }

  items.forEach(analyzeItem)
  return info
}

/**
 * Print navigation validation report to console
 */
export function printNavigationReport<T extends { path?: string; children?: T[] }>(
  items: T[],
  mode: 'redirect' | 'filter' = 'redirect'
): void {
  const info = analyzeNavigation(items, mode)
  
  console.group('📊 Navigation Validation Report')
  console.log(`Total Items: ${info.totalItems}`)
  console.log(`Valid Items: ${info.validItems} ✅`)
  console.log(`Invalid Items: ${info.invalidItems} ❌`)
  
  if (info.redirectedItems.length > 0) {
    console.group(`🔄 Redirected (${info.redirectedItems.length})`)
    info.redirectedItems.forEach(path => console.log(`  ${path} → /dashboard`))
    console.groupEnd()
  }
  
  if (info.filteredItems.length > 0) {
    console.group(`🚫 Filtered Out (${info.filteredItems.length})`)
    info.filteredItems.forEach(path => console.log(`  ${path}`))
    console.groupEnd()
  }
  
  console.groupEnd()
}

/**
 * Compare original vs validated navigation
 */
export function compareNavigation<T extends { path?: string; name?: string; children?: T[] }>(
  original: T[],
  validated: T[]
): void {
  console.group('🔍 Navigation Comparison')
  
  const getItemCount = (items: T[]): number => {
    let count = 0
    const countItem = (item: T) => {
      if (item.path) count++
      if (item.children) item.children.forEach(countItem)
    }
    items.forEach(countItem)
    return count
  }
  
  const originalCount = getItemCount(original)
  const validatedCount = getItemCount(validated)
  
  console.log(`Original Items: ${originalCount}`)
  console.log(`Validated Items: ${validatedCount}`)
  console.log(`Difference: ${originalCount - validatedCount} items changed`)
  
  console.groupEnd()
}

/**
 * Check a specific path and provide detailed info
 */
export function checkPath(path: string): void {
  const isAvailable = isComponentAvailable(path)
  const availableRoutes = getAvailableRoutes()
  
  console.group(`🔎 Path Check: ${path}`)
  console.log(`Status: ${isAvailable ? '✅ Available' : '❌ Not Available'}`)
  
  if (!isAvailable) {
    console.log(`Action: Will be redirected to /dashboard`)
    
    // Find similar paths
    const similar = availableRoutes.filter(route => 
      route.includes(path.split('/').pop() || '')
    )
    
    if (similar.length > 0) {
      console.log('💡 Similar routes found:')
      similar.forEach(route => console.log(`  ${route}`))
    }
  }
  
  console.groupEnd()
}

/**
 * Visualize navigation tree in console
 */
export function visualizeNavigationTree<T extends { 
  name?: string
  path?: string
  children?: T[] 
}>(items: T[], indent = 0): void {
  items.forEach(item => {
    const prefix = '  '.repeat(indent)
    const icon = item.path ? '📄' : '📁'
    const status = item.path 
      ? (isComponentAvailable(item.path) ? '✅' : '❌')
      : ''
    
    console.log(`${prefix}${icon} ${item.name || 'Unnamed'} ${status}`)
    
    if (item.path) {
      console.log(`${prefix}   → ${item.path}`)
    }
    
    if (item.children) {
      visualizeNavigationTree(item.children, indent + 1)
    }
  })
}

/**
 * Test mode - validate without Redux
 */
export function testNavigationValidation<T extends { 
  name?: string
  path?: string
  children?: T[] 
}>(mockData: T[]): void {
  console.log('🧪 Testing Navigation Validation')
  console.log('================================')
  
  // Show original
  console.log('\n📥 Original Navigation:')
  visualizeNavigationTree(mockData)
  
  // Show analysis
  console.log('\n')
  printNavigationReport(mockData, 'redirect')
  
  // Show all available routes
  console.log('\n📋 Available Routes:')
  getAvailableRoutes().forEach(route => console.log(`  ${route}`))
}

/**
 * Export debug info as JSON (useful for bug reports)
 */
export function exportDebugInfo<T extends { path?: string; children?: T[] }>(
  items: T[]
): string {
  const info = analyzeNavigation(items)
  const availableRoutes = getAvailableRoutes()
  
  const debugData = {
    timestamp: new Date().toISOString(),
    analysis: info,
    availableRoutes,
    itemsSnapshot: items,
  }
  
  return JSON.stringify(debugData, null, 2)
}
