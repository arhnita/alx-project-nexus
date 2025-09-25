'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import {
  Bell,
  Search,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Award
} from 'lucide-react'

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const isJobSeeker = user?.userType === 'talent'
  const isRecruiter = user?.userType === 'recruiter'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Connect Hire</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                {isJobSeeker && (
                  <>
                    <Link href="/jobs" className="text-gray-700 hover:text-blue-600 font-medium">
                      Jobs
                    </Link>
                    <Link href="/applications" className="text-gray-700 hover:text-blue-600 font-medium">
                      Applications
                    </Link>
                  </>
                )}
                {isRecruiter && (
                  <>
                    <Link href="/candidates" className="text-gray-700 hover:text-blue-600 font-medium">
                      Candidates
                    </Link>
                    <Link href="/my-jobs" className="text-gray-700 hover:text-blue-600 font-medium">
                      My Jobs
                    </Link>
                    <Link href="/analytics" className="text-gray-700 hover:text-blue-600 font-medium">
                      Analytics
                    </Link>
                  </>
                )}
              </>
            ) : (
              <>
                <Link href="/jobs" className="text-gray-700 hover:text-blue-600 font-medium">
                  Find Jobs
                </Link>
                <Link href="/companies" className="text-gray-700 hover:text-blue-600 font-medium">
                  Companies
                </Link>
                <Link href="/resources" className="text-gray-700 hover:text-blue-600 font-medium">
                  Resources
                </Link>
              </>
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
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

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
                      <Link
                        href="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
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
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {isJobSeeker && (
                    <>
                      <Link
                        href="/jobs"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Jobs
                      </Link>
                      <Link
                        href="/applications"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Applications
                      </Link>
                    </>
                  )}
                  {isRecruiter && (
                    <>
                      <Link
                        href="/candidates"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Candidates
                      </Link>
                      <Link
                        href="/my-jobs"
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Jobs
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/jobs"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Find Jobs
                  </Link>
                  <Link
                    href="/companies"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Companies
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}