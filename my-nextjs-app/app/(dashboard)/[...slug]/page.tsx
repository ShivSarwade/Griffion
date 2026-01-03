'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectNavigation } from '@/lib/redux/slices/navigationSlice'
import { type NavItem } from '@/components/layout'
import { FileQuestion, Plus, Code } from 'lucide-react'

/**
 * Dynamic Catch-All Route Handler
 * 
 * This component handles all authenticated routes that don't have explicit page components.
 * It shows a "page doesn't exist" message with instructions to create the page.
 * 
 * The ConditionalDashboardLayout automatically wraps this with Sidebar/Navbar,
 * so this component only focuses on rendering the content area.
 */

export default function DynamicPage() {
  const params = useParams()
  const navTree = useAppSelector(selectNavigation)

  const [mounted, setMounted] = useState(false)
  const [pageData, setPageData] = useState<{
    title: string
    breadcrumbs: string[]
    navItem: NavItem | null
  }>({
    title: 'Page',
    breadcrumbs: [],
    navItem: null
  })

  // Extract slug from params
  const slug = Array.isArray(params.slug) ? params.slug : [params.slug]
  const fullPath = `/${slug.filter(Boolean).join('/')}`

  useEffect(() => {
    setMounted(true)

    // Find the page in navigation tree
    const navItem = findNavItemByPath(navTree || [], fullPath)
    
    const lastSegment = slug.filter(Boolean)[slug.filter(Boolean).length - 1] || ''
    
    // Build breadcrumbs from navigation path
    const breadcrumbs = buildBreadcrumbs(navTree || [], fullPath, slug.filter(Boolean) as string[])
    
    setPageData({
      title: navItem?.name || formatTitle(lastSegment),
      breadcrumbs,
      navItem
    })
  }, [fullPath, slug, navTree])

  // If navigation tree is loaded and page is NOT in the navigation tree, show 404
  const hasNavigationLoaded = navTree && navTree.length > 0
  const pageNotInNavigation = hasNavigationLoaded && !pageData.navItem

  // Build breadcrumbs from navigation tree
  const buildBreadcrumbs = (items: NavItem[], targetPath: string, slugSegments: string[]): string[] => {
    const pathParts = findPathToItem(items, targetPath)
    if (pathParts.length > 0) {
      return pathParts
    }
    return slugSegments.map(s => formatTitle(s))
  }

  // Find path to item in navigation tree (returns array of names)
  const findPathToItem = (items: NavItem[], targetPath: string, currentPath: string[] = []): string[] => {
    for (const item of items) {
      const newPath = [...currentPath, item.name]
      
      if (item.path === targetPath) {
        return newPath
      }
      
      if (item.children) {
        const found = findPathToItem(item.children, targetPath, newPath)
        if (found.length > 0) return found
      }
    }
    return []
  }

  // Recursively search navigation tree for matching path
  const findNavItemByPath = (items: NavItem[], path: string): NavItem | null => {
    for (const item of items) {
      if (item.path === path) {
        return item
      }
      if (item.children) {
        const found = findNavItemByPath(item.children, path)
        if (found) return found
      }
    }
    return null
  }

  // Format slug segment into readable title
  const formatTitle = (segment: string): string => {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600" />
      </div>
    )
  }

  // If page is not in user's navigation tree, show 404 Access Denied
  if (pageNotInNavigation) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-2xl w-full mx-auto text-center p-8">
          {/* 404 Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center">
              <FileQuestion size={48} className="text-red-500" />
            </div>
          </div>

          {/* 404 Message */}
          <h1 className="text-6xl font-black mb-3" style={{ color: 'var(--color-foreground)' }}>
            404
          </h1>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-foreground)' }}>
            Page Not Found
          </h2>
          <p className="text-lg mb-8" style={{ color: 'var(--color-muted-foreground)' }}>
            You don't have access to this page or it doesn't exist.
          </p>

          {/* Path Info */}
          <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--color-muted)' }}>
            <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
              Requested path: <span className="font-mono font-semibold" style={{ color: 'var(--color-foreground)' }}>{fullPath}</span>
            </p>
          </div>

          <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            This page is not available in your navigation menu. Please contact your administrator if you believe you should have access.
          </p>
        </div>
      </div>
    )
  }

  // Convert path to file path suggestion
  const suggestedFilePath = `app${fullPath}/page.tsx`

  // Page exists in navigation but no component - show "create page" message
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="max-w-2xl w-full mx-auto text-center p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 flex items-center justify-center">
              <FileQuestion size={48} className="text-orange-500" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
              <Plus size={20} className="text-white" />
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {pageData.breadcrumbs.length > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
            {pageData.breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                <span>{crumb}</span>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl font-black mb-3" style={{ color: 'var(--color-foreground)' }}>
          {pageData.title}
        </h1>

        {/* Subtitle */}
        <p className="text-xl mb-8" style={{ color: 'var(--color-muted-foreground)' }}>
          This page doesn&apos;t exist yet. Create it to add custom content.
        </p>

        {/* Instructions */}
        <div className="rounded-xl p-6 text-left mb-6" style={{ backgroundColor: 'var(--color-muted)' }}>
          <div className="flex items-start gap-3 mb-4">
            <Code size={20} className="text-indigo-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold mb-2" style={{ color: 'var(--color-foreground)' }}>
                To create this page:
              </h3>
              <ol className="space-y-2 text-sm" style={{ color: 'var(--color-foreground)' }}>
                <li>1. Create file: <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>{suggestedFilePath}</code></li>
                <li>2. Add your component code</li>
                <li>3. Refresh the page</li>
              </ol>
            </div>
          </div>

          {/* Example Code */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--color-muted-foreground)' }}>Example:</p>
            <pre className="rounded p-3 text-xs overflow-x-auto" style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-foreground)' }}>
              <code>{`'use client'

export default function ${formatTitle(pageData.title.replace(/\s+/g, ''))}Page() {
  return (
    <div>
      <h1>${pageData.title}</h1>
      <p>Your content here...</p>
    </div>
  )
}`}</code>
            </pre>
          </div>
        </div>

        {/* Path Info */}
        <p className="text-sm" style={{ color: 'var(--color-muted-foreground)' }}>
          Current path: <span className="font-mono" style={{ color: 'var(--color-foreground)' }}>{fullPath}</span>
        </p>

        {/* Navigation Status */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', color: 'rgb(22, 163, 74)', borderWidth: '1px', borderColor: 'rgba(34, 197, 94, 0.3)' }}>
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Found in navigation menu - Access granted
        </div>
      </div>
    </div>
  )
}
