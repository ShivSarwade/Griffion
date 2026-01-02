'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppSelector } from '@/lib/redux/hooks'
import { selectIsAuthenticated, selectUser } from '@/lib/redux/slices/authSlice'
import { selectNavigation } from '@/lib/redux/slices/navigationSlice'
import { Sidebar, Navbar, type NavItem } from '@/components/layout'
import { selectTheme, selectSidebarOpen, toggleTheme, toggleSidebar } from '@/lib/redux/slices/configSlice'
import { useAppDispatch } from '@/lib/redux/hooks'
import { ChevronRight, FileText } from 'lucide-react'

/**
 * Dynamic Catch-All Route Handler
 * 
 * This component handles ALL dynamic routes in the app based on the navigation tree.
 * URL-first navigation means the sidebar generates links, and this route renders them.
 * 
 * Examples:
 * - /users → renders user management page
 * - /settings/profile → renders profile settings
 * - /admin/roles → renders role management
 * 
 * The route checks if a custom component exists for the path. If not, it renders
 * a placeholder indicating the route is ready for custom logic.
 */

export default function DynamicPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()

  // Redux state
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const user = useAppSelector(selectUser)
  const navTree = useAppSelector(selectNavigation)
  const isSidebarOpen = useAppSelector(selectSidebarOpen)
  const theme = useAppSelector(selectTheme)

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

    // Check authentication
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Find the page in navigation tree
    const navItem = findNavItemByPath(navTree || [], fullPath)
    
    const lastSegment = slug.filter(Boolean)[slug.filter(Boolean).length - 1] || ''
    
    setPageData({
      title: navItem?.name || formatTitle(lastSegment),
      breadcrumbs: slug.filter(Boolean).map(s => formatTitle(s || '')),
      navItem
    })
  }, [isAuthenticated, router, fullPath, slug, navTree])

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

  const handleToggleTheme = () => {
    dispatch(toggleTheme())
  }

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  useEffect(() => {
    // Apply theme to document
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme])

  if (!mounted || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-zinc-950 text-zinc-100 dark' : 'bg-gradient-to-br from-zinc-50 via-white to-zinc-100/50 text-zinc-900'}`}>
      <Sidebar 
        navTree={navTree || []}
        user={user}
        isOpen={isSidebarOpen}
        onClose={handleToggleSidebar}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all ${isSidebarOpen ? 'lg:pl-64' : ''}`}>
        <Navbar 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <main className="flex-1 p-8 md:p-16">
          <div className="max-w-6xl space-y-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <span className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer" onClick={() => router.push('/dashboard')}>
                Dashboard
              </span>
              {pageData.breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="h-4 w-4" />
                  <span className={index === pageData.breadcrumbs.length - 1 ? 'text-zinc-900 dark:text-zinc-100 font-medium' : 'hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer'}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* Page Title */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-tight text-zinc-900 dark:text-zinc-100">
                {pageData.title}
              </h1>
              <div className="w-24 h-2 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-full shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20" />
            </div>

            {/* Page Content */}
            <div className="space-y-6">
              {/* Route Information Card */}
              <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl p-8 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-600/10 rounded-lg">
                    <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      Dynamic Route Active
                    </h2>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                      This page is dynamically rendered based on your navigation tree. The route is live and ready for custom logic.
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Path:</span>
                        <code className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-indigo-600 dark:text-indigo-400 font-mono">
                          {fullPath}
                        </code>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Route Segments:</span>
                        <code className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 font-mono">
                          {JSON.stringify(slug)}
                        </code>
                      </div>

                      {pageData.navItem && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Icon:</span>
                            <code className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 font-mono">
                              {typeof pageData.navItem.icon === 'string' ? pageData.navItem.icon : 'icon'}
                            </code>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Type:</span>
                            <code className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-600 dark:text-zinc-400 font-mono">
                              {pageData.navItem.type}
                            </code>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">Access:</span>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              pageData.navItem.isPublic 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                            }`}>
                              {pageData.navItem.isPublic ? 'Public' : 'Protected'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Instructions */}
              <div className="bg-indigo-50 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-900 rounded-xl p-8 space-y-4">
                <h3 className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                  🎨 Ready for Custom Implementation
                </h3>
                <p className="text-indigo-700 dark:text-indigo-300">
                  To add custom logic to this page, you can:
                </p>
                <ul className="space-y-2 text-indigo-600 dark:text-indigo-400 list-disc list-inside">
                  <li>Create a specific component at <code className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded text-xs">app/(dashboard){fullPath}/page.tsx</code></li>
                  <li>Fetch data using the path segments from <code className="bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded text-xs">params.slug</code></li>
                  <li>Add CRUD operations, forms, tables, or any custom UI</li>
                  <li>Use Redux hooks to access user, auth, and config state</li>
                </ul>
                <div className="pt-4 border-t border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 italic">
                    💡 This catch-all route ensures every navigation item is accessible immediately, without creating files manually.
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                    {slug.length}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium uppercase tracking-wide">
                    Route Depth
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                    {navTree?.length || 0}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium uppercase tracking-wide">
                    Nav Items
                  </div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-lg p-6 text-center">
                  <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mb-2">
                    {user?.role || 'User'}
                  </div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium uppercase tracking-wide">
                    Your Role
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
