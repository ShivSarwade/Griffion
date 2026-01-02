'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
      <div className={`p-1.5 rounded-md transition-colors ${item.type === 'section' ? 'bg-transparent' : 'bg-zinc-100/80 dark:bg-zinc-800 group-hover:bg-white group-hover:shadow-sm dark:group-hover:bg-zinc-700'}`}>
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
        <div className="text-zinc-400 dark:text-zinc-500">
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
            ${item.type === 'section' ? 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100' : 'text-zinc-700 hover:bg-zinc-100/80 hover:shadow-sm dark:text-zinc-300 dark:hover:bg-zinc-800'}
          `}
          style={{ paddingLeft: `${(depth * 16) + 12}px` }}
        >
          {content}
        </button>
      ) : (
        <Link
          href={item.path || item.href || '#'}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium group
            ${depth === 0 ? 'mb-1' : 'mt-0.5'}
            text-zinc-700 hover:bg-zinc-100/80 hover:shadow-sm dark:text-zinc-300 dark:hover:bg-zinc-800
          `}
          style={{ paddingLeft: `${(depth * 16) + 12}px` }}
        >
          {content}
        </Link>
      )}

      {hasChildren && isOpen && (
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-200/80 dark:bg-zinc-800 ml-[-4px]" />
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
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 transition-transform lg:translate-x-0 shadow-xl shadow-zinc-900/5 dark:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header: Branding */}
        <Link href="/" className="h-16 flex items-center px-6 border-b border-zinc-200/80 dark:border-zinc-800 gap-3 bg-gradient-to-b from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-900 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 transform -rotate-3">
            <ShieldCheck size={20} />
          </div>
          <span className="font-black tracking-tighter text-xl uppercase italic text-zinc-900 dark:text-white">Griffion</span>
        </Link>

        {/* Navigation Tree */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Main Menu</span>
          </div>
          {navTree.map(item => (
            <SidebarItem key={item.id} item={item} />
          ))}
        </nav>

        {/* Sidebar Footer: User Name beside Logout Icon */}
        <div className="p-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-gradient-to-b from-white to-zinc-50/30 dark:from-zinc-900 dark:to-zinc-900">
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-100/50 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">
                {user?.firstName || ''} {user?.lastName || ''}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-black tracking-tighter">
                {user?.role || 'User'}
              </span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
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
    <header className="h-16 bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800 sticky top-0 z-40 px-4 md:px-8 shadow-sm shadow-zinc-900/5 dark:shadow-none">
      <div className="h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 rounded-lg transition-colors lg:hidden text-zinc-700 dark:text-zinc-300"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 italic">
              Workspace
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onToggleTheme}
            className="p-2 text-zinc-600 dark:text-zinc-500 hover:bg-zinc-100/80 dark:hover:bg-zinc-800 rounded-xl transition-all border border-zinc-200/50 dark:border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow"
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
