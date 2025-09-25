'use client'

import { useAuthStore } from '@/store/authStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { JobSeekerDashboard } from '@/components/dashboard/JobSeekerDashboard'
import { RecruiterDashboard } from '@/components/dashboard/RecruiterDashboard'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="lg:flex">
        <Sidebar />
        <main className="flex-1 lg:ml-0 p-4 sm:p-6 lg:p-8">
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