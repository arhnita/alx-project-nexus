'use client'

import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { JobSeekerDashboard } from '@/components/dashboard/JobSeekerDashboard'
import { RecruiterDashboard } from '@/components/dashboard/RecruiterDashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, isInitialized } = useAuthStore()
  const { isSidebarCollapsed } = useUIStore()
  const router = useRouter()

  useEffect(() => {
    console.log('Dashboard: Auth state ->', { isLoading, isAuthenticated, isInitialized, user: !!user })
    // Only redirect if auth is initialized and not authenticated
    if (isInitialized && !isAuthenticated) {
      console.log('Dashboard: Redirecting to login - not authenticated')
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, isInitialized, router, user])

  if (!isInitialized || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="sm:flex">
        <Sidebar />
        <main className={cn(
          'flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300',
          // Adjust left margin based on sidebar state on desktop
          isSidebarCollapsed ? 'sm:ml-12' : 'sm:ml-0',
          // No left margin on mobile
          'ml-0'
        )}>
          {user.userType === 'talent' ? (
            <JobSeekerDashboard />
          ) : (
            <RecruiterDashboard />
          )}
        </main>
      </div>
    </div>
  )
}