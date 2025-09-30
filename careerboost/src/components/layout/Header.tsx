'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { Button } from '@/components/ui/Button'
import { NotificationDropdown } from '@/components/ui/NotificationDropdown'
import {
  Bell,
  Search,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Award,
  LayoutDashboard,
  FileText,
  Briefcase,
  Building2
} from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const {
    unreadCount,
    isDropdownOpen,
    setDropdownOpen,
    fetchUnreadCount
  } = useNotificationStore()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  // Fetch unread count when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()

      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, fetchUnreadCount])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isJobSeeker = user?.userType === 'talent'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Connect Hire</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated && (
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Search */}
                <div className="hidden lg:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 xl:w-64"
                  />
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  <NotificationDropdown
                    isOpen={isDropdownOpen}
                    onClose={() => setDropdownOpen(false)}
                  />
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.firstName?.charAt(0)?.toUpperCase()}{user?.lastName?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      {isJobSeeker && (
                        <Link
                          href="/skills"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Award className="w-4 h-4 mr-3" />
                          Skills
                        </Link>
                      )}
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Get started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="space-y-1 px-4">
              <Link
                href="/dashboard"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5 mr-3 text-gray-400" />
                Dashboard
              </Link>

              {isJobSeeker ? (
                <>
                  <Link
                    href="/jobs"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Search className="w-5 h-5 mr-3 text-gray-400" />
                    Find Jobs
                  </Link>
                  <Link
                    href="/applications"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="w-5 h-5 mr-3 text-gray-400" />
                    Applications
                  </Link>
                  <Link
                    href="/skills"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Award className="w-5 h-5 mr-3 text-gray-400" />
                    Skills
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/my-jobs"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Briefcase className="w-5 h-5 mr-3 text-gray-400" />
                    Job Postings
                  </Link>
                  <Link
                    href="/applications"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FileText className="w-5 h-5 mr-3 text-gray-400" />
                    Applications
                  </Link>
                  <Link
                    href="/company"
                    className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Building2 className="w-5 h-5 mr-3 text-gray-400" />
                    Company
                  </Link>
                </>
              )}

              <hr className="my-3" />

              <Link
                href="/profile"
                className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-5 h-5 mr-3 text-gray-400" />
                Profile
              </Link>

              <button
                onClick={() => {
                  handleLogout()
                  setIsMenuOpen(false)
                }}
                className="flex items-center w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign out
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}