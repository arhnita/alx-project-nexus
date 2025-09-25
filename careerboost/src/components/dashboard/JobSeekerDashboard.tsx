'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { ActivityFeed } from './ActivityFeed'
import {
  FileText,
  Calendar,
  Eye,
  TrendingUp,
  Target,
  BookOpen,
  Users,
  ArrowUpRight,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react'

export function JobSeekerDashboard() {
  const { user } = useAuthStore()

  if (!user || user.userType !== 'talent') return null

  const recentApplications = [
    {
      id: '1',
      company: 'Google',
      position: 'Senior Frontend Developer',
      status: 'interview',
      appliedDate: '2 days ago',
      salary: '$120k - $160k'
    },
    {
      id: '2',
      company: 'Microsoft',
      position: 'Full Stack Engineer',
      status: 'reviewed',
      appliedDate: '5 days ago',
      salary: '$110k - $150k'
    },
    {
      id: '3',
      company: 'Apple',
      position: 'React Developer',
      status: 'applied',
      appliedDate: '1 week ago',
      salary: '$100k - $140k'
    }
  ]

  const upcomingInterviews = [
    {
      id: '1',
      company: 'Google',
      position: 'Senior Frontend Developer',
      date: 'Tomorrow',
      time: '2:00 PM',
      type: 'Technical Interview'
    },
    {
      id: '2',
      company: 'Stripe',
      position: 'Software Engineer',
      date: 'Friday',
      time: '10:00 AM',
      type: 'Final Round'
    }
  ]

  const recommendedJobs = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'Netflix',
      location: 'Remote',
      salary: '$130k - $170k',
      match: 95
    },
    {
      id: '2',
      title: 'Frontend Engineer',
      company: 'Airbnb',
      location: 'San Francisco, CA',
      salary: '$125k - $165k',
      match: 92
    },
    {
      id: '3',
      title: 'Full Stack Developer',
      company: 'Uber',
      location: 'New York, NY',
      salary: '$115k - $155k',
      match: 88
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'interview':
        return 'bg-blue-100 text-blue-800'
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800'
      case 'applied':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.firstName}! 👋
        </h1>
        <p className="text-blue-100 mb-4">
          You have 3 new job matches and 2 upcoming interviews this week.
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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">23</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +2 this week
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
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-3xl font-bold text-gray-900">4</p>
                <p className="text-sm text-blue-600">2 this week</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Applications
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{application.position}</h4>
                    <p className="text-sm text-gray-600">{application.company}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="text-xs text-gray-500">{application.appliedDate}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{application.salary}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Interviews */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Upcoming Interviews
              <Button variant="ghost" size="sm">
                View Calendar
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{interview.position}</h4>
                      <p className="text-sm text-gray-600">{interview.company}</p>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {interview.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {interview.date}
                    </div>
                    <div className="flex items-center">
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

      {/* Recommended Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recommended Jobs
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedJobs.map((job) => (
              <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    {job.match}% match
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {job.salary}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3">
                  Apply Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Skill Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">Take a quick assessment to boost your profile</p>
            <Button variant="outline" size="sm" className="border-blue-300 text-blue-700">
              Start Assessment
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Expand Network</h3>
            <p className="text-sm text-gray-600 mb-4">Connect with professionals in your field</p>
            <Button variant="outline" size="sm" className="border-green-300 text-green-700">
              Find Connections
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6 text-center">
            <Target className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Career Goals</h3>
            <p className="text-sm text-gray-600 mb-4">Set and track your career objectives</p>
            <Button variant="outline" size="sm" className="border-purple-300 text-purple-700">
              Set Goals
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}