'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { ActivityFeed } from './ActivityFeed'
import { apiService } from '@/services/api'
import {
  FileText,
  Eye,
  TrendingUp,
  Target
} from 'lucide-react'

export function JobSeekerDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [applicationsCount, setApplicationsCount] = useState<number>(0)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getApplicationsCount()
        setApplicationsCount(response.count)
      } catch (error) {
        console.error('Failed to fetch applications count:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (!user || user.userType !== 'talent') return null

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          You have 3 new job matches this week. Keep building your profile!
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">
            View Recommendations
          </Button>
          <Button variant="outline" size="sm" className="border-blue-400 text-blue-100 hover:bg-blue-600">
            Update Profile
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/applications')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                {loadingStats ? (
                  <div className="h-9 w-12 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{applicationsCount}</p>
                )}
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <FileText className="w-4 h-4 mr-1" />
                  View all applications
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Skills Added</p>
                <p className="text-3xl font-bold text-gray-900">12</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +3 this week
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-3xl font-bold text-gray-900">127</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +15% this week
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Skill Score</p>
                <p className="text-3xl font-bold text-gray-900">85%</p>
                <p className="text-sm text-green-600">Above average</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <ActivityFeed />
    </div>
  )
}