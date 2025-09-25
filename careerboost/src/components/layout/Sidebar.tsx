'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Search,
  FileText,
  Users,
  BarChart3,
  Settings,
  Briefcase,
  User,
  Building2,
  Target,
  Menu,
  X
} from 'lucide-react'

interface SidebarProps {
  className?: string
  isMobileMenuOpen?: boolean
  onMobileMenuClose?: () => void
}

export function Sidebar({ className, isMobileMenuOpen, onMobileMenuClose }: SidebarProps) {
  const { user } = useAuthStore()
  const { isSidebarCollapsed, toggleSidebar } = useUIStore()
  const pathname = usePathname()

  const isJobSeeker = user?.userType === 'talent'
  const isRecruiter = user?.userType === 'recruiter'

  const jobSeekerNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Find Jobs',
      href: '/jobs',
      icon: Search
    },
    {
      title: 'Applications',
      href: '/applications',
      icon: FileText
    },
    {
      title: 'Skill Assessment',
      href: '/skills',
      icon: Target
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: User
    }
  ]

  const recruiterNavItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Job Postings',
      href: '/my-jobs',
      icon: Briefcase
    },
    {
      title: 'Candidates',
      href: '/candidates',
      icon: Users
    },
    {
      title: 'Applications',
      href: '/applications',
      icon: FileText
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: BarChart3
    },
    {
      title: 'Company',
      href: '/company',
      icon: Building2
    }
  ]

  const navItems = isJobSeeker ? jobSeekerNavItems : isRecruiter ? recruiterNavItems : []

  return (
    <aside className={cn(
      'fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
      // Desktop width based on collapsed state
      isSidebarCollapsed ? 'lg:w-12' : 'lg:w-64',
      // Mobile width - always full width on mobile
      'w-64',
      // Mobile show/hide
      isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      className
    )}>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onMobileMenuClose}
        />
      )}

      <div className="relative flex flex-col h-full">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className={cn('px-4', isSidebarCollapsed && 'px-1')}>
            {/* Toggle Button */}
            <div className="hidden lg:flex justify-end mb-4">
              <button
                onClick={toggleSidebar}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isSidebarCollapsed ? (
                  <Menu className="w-5 h-5" />
                ) : (
                  <X className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileMenuClose}
                    className={cn(
                      'group flex items-center py-2 text-sm font-medium rounded-md transition-colors relative',
                      isSidebarCollapsed ? 'px-2 justify-center' : 'px-2',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                    title={isSidebarCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn(
                      'flex-shrink-0 h-5 w-5',
                      isSidebarCollapsed ? 'mr-0' : 'mr-3',
                      isActive ? 'text-blue-500' : 'text-gray-400'
                    )} />
                    <span className={cn(
                      'truncate transition-all duration-300',
                      isSidebarCollapsed && 'opacity-0 w-0 overflow-hidden lg:hidden'
                    )}>
                      {item.title}
                    </span>
                  </Link>
                )
              })}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/settings"
                onClick={onMobileMenuClose}
                className={cn(
                  'group flex items-center py-2 text-sm font-medium rounded-md transition-colors',
                  isSidebarCollapsed ? 'px-2 justify-center' : 'px-2',
                  pathname === '/settings'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                title={isSidebarCollapsed ? 'Settings' : undefined}
              >
                <Settings className={cn(
                  'flex-shrink-0 h-5 w-5 text-gray-400',
                  isSidebarCollapsed ? 'mr-0' : 'mr-3'
                )} />
                <span className={cn(
                  'truncate transition-all duration-300',
                  isSidebarCollapsed && 'opacity-0 w-0 overflow-hidden lg:hidden'
                )}>
                  Settings
                </span>
              </Link>
            </div>

            {/* Quick Stats - Hide when collapsed */}
            {!isSidebarCollapsed && isJobSeeker && user && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-medium text-gray-900 mb-3 uppercase tracking-wide">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Applications</span>
                    <span className="text-xs font-medium text-gray-900">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Profile Views</span>
                    <span className="text-xs font-medium text-gray-900">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Skill Score</span>
                    <span className="text-xs font-medium text-blue-600">85%</span>
                  </div>
                </div>
              </div>
            )}

            {!isSidebarCollapsed && isRecruiter && user && (
              <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-medium text-gray-900 mb-3 uppercase tracking-wide">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Active Jobs</span>
                    <span className="text-xs font-medium text-gray-900">12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Applications</span>
                    <span className="text-xs font-medium text-gray-900">284</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">This Month</span>
                    <span className="text-xs font-medium text-green-600">7 hires</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}