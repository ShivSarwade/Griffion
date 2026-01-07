'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  Menu,
  ShieldCheck,
  Moon, 
  Sun,
  type LucideIcon
} from 'lucide-react'
import { getIcon } from '@/lib/iconMapper'
import { useAppDispatch } from '@/lib/redux/hooks'
import { logout } from '@/lib/redux/slices/authSlice'
import { clearNavigation } from '@/lib/redux/slices/navigationSlice'

interface NavItem {
  id: string
  name: string
  type: 'page' | 'section'
  icon: string | LucideIcon
  isPublic: boolean
  path?: string
  href?: string
  children?: NavItem[]
}

interface SidebarItemProps {
  item: NavItem
  depth?: number
}

const SidebarItem: React.FC<SidebarItemProps> = ({ item, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(true)
  const hasChildren = item.children && item.children.length > 0
  
  // Get icon component - handle both string names and direct components
  const Icon = typeof item.icon === 'string' ? getIcon(item.icon) : item.icon

  const content = (
    <>
      <div 
        className={`p-1.5 rounded-md transition-colors ${item.type === 'section' ? 'bg-transparent' : ''}`}
        style={item.type !== 'section' ? { 
          backgroundColor: 'var(--sidebar-hover-bg)' 
        } : {}}
      >
        <Icon size={16} />
      </div>
      <div className="flex-1 text-left truncate flex items-center gap-2">
        <span>{item.name}</span>
        {item.isPublic && (
          <span className="text-[8px] font-black bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-transparent px-1.5 py-0.5 rounded uppercase tracking-tighter shrink-0">
            Public
          </span>
        )}
      </div>
      {hasChildren && (
        <div style={{ color: 'var(--sidebar-foreground)', opacity: 0.6 }}>
          {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </div>
      )}
    </>
  )

  return (
    <div className="w-full">
      {item.type === 'section' || hasChildren ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium group
            ${depth === 0 ? 'mb-1' : 'mt-0.5'}
          `}
          style={{ 
            paddingLeft: `${(depth * 16) + 12}px`,
            color: 'var(--sidebar-foreground)',
            backgroundColor: item.type !== 'section' ? 'var(--sidebar-hover-bg)' : 'transparent'
          }}
        >
          {content}
        </button>
      ) : (
        <Link
          href={item.path || item.href || '#'}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium group
            ${depth === 0 ? 'mb-1' : 'mt-0.5'}
          `}
          style={{ 
            paddingLeft: `${(depth * 16) + 12}px`,
            color: 'var(--sidebar-foreground)',
            backgroundColor: 'var(--sidebar-hover-bg)'
          }}
        >
          {content}
        </Link>
      )}

      {hasChildren && isOpen && (
        <div className="relative">
          <div 
            className="absolute left-6 top-0 bottom-0 w-px ml-[-4px]" 
            style={{ backgroundColor: 'var(--sidebar-border)' }}
          />
          {item.children!.map(child => (
            <SidebarItem key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  navTree: NavItem[]
  user: {
    firstName?: string
    lastName?: string
    role?: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ navTree, user, isOpen, onClose }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  
  const handleLogout = () => {
    dispatch(logout())
    dispatch(clearNavigation())
    router.push('/login')
  }

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 w-64 border-r transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{
        backgroundColor: 'var(--sidebar-background)',
        borderColor: 'var(--sidebar-border)'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header: Branding */}
        <Link 
          href="/" 
          className="h-16 flex items-center px-6 border-b gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg transform -rotate-3">
            <ShieldCheck size={20} />
          </div>
          <span 
            className="font-black tracking-tighter text-xl uppercase italic"
            style={{ color: 'var(--sidebar-foreground)' }}
          >
            Griffion
          </span>
        </Link>

        {/* Navigation Tree */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="px-3 mb-2">
            <span 
              className="text-[10px] font-black uppercase tracking-widest opacity-50"
              style={{ color: 'var(--sidebar-foreground)' }}
            >
              Main Menu
            </span>
          </div>
          {navTree && navTree.length > 0 ? (
            navTree.map(item => (
              <SidebarItem key={item.id} item={item} />
            ))
          ) : (
            <div className="px-3 py-4 text-center text-xs text-zinc-500">
              No navigation items available
            </div>
          )}
        </nav>

        {/* Sidebar Footer: User Name beside Logout Icon */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div 
            className="flex items-center justify-between px-3 py-2 rounded-xl border hover:opacity-90 transition-all"
            style={{
              backgroundColor: 'var(--sidebar-hover-bg)',
              borderColor: 'var(--sidebar-border)'
            }}
          >
            <div className="flex flex-col min-w-0">
              <span 
                className="text-sm font-bold truncate"
                style={{ color: 'var(--sidebar-foreground)' }}
              >
                {user?.firstName || ''} {user?.lastName || ''}
              </span>
              <span 
                className="text-[10px] uppercase font-black tracking-tighter opacity-60"
                style={{ color: 'var(--sidebar-foreground)' }}
              >
                {user?.role || 'User'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ 
                color: 'var(--sidebar-foreground)',
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
      `}</style>
    </aside>
  )
}

interface NavbarProps {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, onToggleSidebar, theme, onToggleTheme }) => {
  return (
    <header 
      className="h-16 backdrop-blur-xl border-b sticky top-0 z-40 px-4 md:px-8"
      style={{
        backgroundColor: 'var(--navbar-background)',
        borderColor: 'var(--navbar-border)'
      }}
    >
      <div className="h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg transition-colors lg:hidden"
            style={{ color: 'var(--navbar-foreground)' }}
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <span 
              className="text-xs font-black uppercase tracking-[0.2em] italic opacity-60"
              style={{ color: 'var(--navbar-foreground)' }}
            >
              Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onToggleTheme}
            className="p-2 rounded-xl transition-all border shadow-sm hover:shadow"
            style={{
              color: 'var(--navbar-foreground)',
              borderColor: 'var(--navbar-border)'
            }}
          >
            {theme === 'dark' ? (
              <Sun size={20} className="text-amber-500" />
            ) : (
              <Moon size={20} className="text-indigo-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

// Export types for use in other components
export type { NavItem }
