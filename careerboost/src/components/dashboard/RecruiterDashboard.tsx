'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { ActivityFeed } from './ActivityFeed'
import { apiService } from '@/services/api'
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  AlertTriangle,
  FileText,
  Target,
  Clock,
  MapPin,
  Star,
  ArrowUpRight,
  Plus
} from 'lucide-react'

export function RecruiterDashboard() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [jobsCount, setJobsCount] = useState<number>(0)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getRecruiterJobs(1, 1) // Get first page to get count
        setJobsCount(response.count)
      } catch (error) {
        console.error('Failed to fetch jobs count:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user && user.userType === 'recruiter') {
      fetchStats()
    }
  }, [user])

  if (!user || user.userType !== 'recruiter') return null

  const activeJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      applications: 45,
      views: 234,
      postedDate: '5 days ago',
      status: 'active',
      urgent: false
    },
    {
      id: '2',
      title: 'Backend Engineer',
      applications: 32,
      views: 189,
      postedDate: '2 weeks ago',
      status: 'expiring',
      urgent: true
    },
    {
      id: '3',
      title: 'Product Manager',
      applications: 67,
      views: 312,
      postedDate: '1 week ago',
      status: 'active',
      urgent: false
    }
  ]

  const todayInterviews = [
    {
      id: '1',
      candidate: 'Sarah Johnson',
      position: 'Senior Frontend Developer',
      time: '10:00 AM',
      type: 'Technical Interview',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a64c9e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      candidate: 'Michael Chen',
      position: 'Backend Engineer',
      time: '2:30 PM',
      type: 'Final Round',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      candidate: 'Emily Davis',
      position: 'Product Manager',
      time: '4:00 PM',
      type: 'Culture Fit',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ]

  const topCandidates = [
    {
      id: '1',
      name: 'David Rodriguez',
      position: 'Senior Frontend Developer',
      match: 95,
      experience: '8 years',
      skills: ['React', 'TypeScript', 'Node.js'],
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '2',
      name: 'Lisa Wang',
      position: 'Backend Engineer',
      match: 92,
      experience: '6 years',
      skills: ['Python', 'Django', 'AWS'],
      location: 'Remote',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: '3',
      name: 'James Wilson',
      position: 'Product Manager',
      match: 88,
      experience: '5 years',
      skills: ['Product Strategy', 'Analytics', 'Leadership'],
      location: 'New York, NY',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  ]

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expiring':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName}! 🎯
        </h1>
        <p className="text-purple-100 mb-4">
          You have 3 interviews today and 52 new applications this week.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
          <Button variant="outline" size="sm" className="border-purple-400 text-purple-100 hover:bg-purple-600">
            View Analytics
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => router.push('/my-jobs')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                {loadingStats ? (
                  <div className="h-9 w-12 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">{jobsCount}</p>
                )}
                <p className="text-sm text-blue-600 flex items-center mt-1">
                  <Briefcase className="w-4 h-4 mr-1" />
                  View all jobs
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">284</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +52 this week
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled Interviews</p>
                <p className="text-3xl font-bold text-gray-900">18</p>
                <p className="text-sm text-blue-600">3 today</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hires This Month</p>
                <p className="text-3xl font-bold text-gray-900">7</p>
                <p className="text-sm text-green-600">Goal: 10</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Job Postings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Job Postings
              <Button variant="ghost" size="sm" onClick={() => router.push('/my-jobs')}>
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeJobs.map((job) => (
                <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">Posted {job.postedDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.urgent && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${getJobStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {job.applications} applications
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {job.views} views
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Today&apos;s Interviews
              <Button variant="ghost" size="sm">
                View Calendar
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayInterviews.map((interview) => (
                <div key={interview.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <Image
                    src={interview.avatar}
                    alt={interview.candidate}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{interview.candidate}</h4>
                    <p className="text-sm text-gray-600">{interview.position}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {interview.type}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-1" />
                      {interview.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Candidates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Top Candidates
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topCandidates.map((candidate) => (
              <div key={candidate.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Image
                      src={candidate.avatar}
                      alt={candidate.name}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full mr-3"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">{candidate.experience} experience</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">{candidate.match}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-800 font-medium mb-2">Applied for: {candidate.position}</p>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {candidate.location}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {candidate.skills.slice(0, 3).map((skill) => (
                    <span key={skill} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Profile
                  </Button>
                  <Button size="sm" className="flex-1">
                    Contact
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <Plus className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Post New Job</h3>
            <p className="text-sm text-gray-600 mb-4">Create a new job posting to attract talent</p>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
              Create Posting
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Browse Candidates</h3>
            <p className="text-sm text-gray-600 mb-4">Search through our talent database</p>
            <Button variant="outline" size="sm" className="border-green-300 text-green-700">
              Find Talent
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">Track your hiring performance</p>
            <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}