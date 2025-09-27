'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useJobApplicationStore } from '@/store/jobApplicationStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { JobApplicationModal } from '@/components/modals/JobApplicationModal'
import { cn } from '@/lib/utils'
import { apiService, Job } from '@/services/api'
import {
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ArrowLeft,
  Briefcase,
  Star,
  CheckCircle
} from 'lucide-react'

export default function JobDetailsPage() {
  const { id } = useParams()
  const { isAuthenticated, user, isInitialized } = useAuthStore()
  const { isSidebarCollapsed } = useUIStore()
  const { checkAndApply, showSuccess, isJobApplied, loadAppliedJobs } = useJobApplicationStore()
  const router = useRouter()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchJobDetails = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // For now, we'll fetch from the jobs list API and find the specific job
      const response = await apiService.getJobs(1, 100) // Get more jobs to find the one we want
      const foundJob = response.results.find(j => j.id === parseInt(id as string))

      if (foundJob) {
        setJob(foundJob)
      } else {
        setError('Job not found')
      }
    } catch (err) {
      setError('Failed to load job details')
      console.error('Job details fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
      return
    }

    fetchJobDetails()
    loadAppliedJobs() // Load applied jobs to show status
  }, [isInitialized, isAuthenticated, router, fetchJobDetails, loadAppliedJobs])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatSalary = (min: string, max: string) => {
    return `$${parseFloat(min).toLocaleString()} - $${parseFloat(max).toLocaleString()}`
  }

  const handleApply = async () => {
    if (!user || !job) return
    await checkAndApply(job.id)
  }

  const handleGoBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="sm:flex">
          <Sidebar />
          <main className={cn(
            'flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300',
            isSidebarCollapsed ? 'sm:ml-12' : 'sm:ml-0',
            'ml-0'
          )}>
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="sm:flex">
          <Sidebar />
          <main className={cn(
            'flex-1 p-4 sm:p-6 md:p-8 transition-all duration-300',
            isSidebarCollapsed ? 'sm:ml-12' : 'sm:ml-0',
            'ml-0'
          )}>
            <div className="max-w-4xl mx-auto">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="mb-6 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Jobs</span>
              </Button>

              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {error || 'Job not found'}
                </h3>
                <p className="text-gray-600">
                  The job you&apos;re looking for might have been removed or doesn&apos;t exist.
                </p>
                <Button
                  onClick={() => router.push('/jobs')}
                  className="mt-4"
                >
                  Browse All Jobs
                </Button>
              </div>
            </div>
          </main>
        </div>
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
          isSidebarCollapsed ? 'sm:ml-12' : 'sm:ml-0',
          'ml-0'
        )}>
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="mb-6 flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Jobs</span>
            </Button>

            {/* Job Header Card */}
            <Card className="mb-6 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {job.title}
                      </h1>
                      {job.is_promoted && (
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-2 rounded-full">
                          <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Building2 className="w-5 h-5" />
                        <div>
                          <p className="font-medium text-gray-900">{job.company_name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <div>
                          <p className="text-sm">
                            {typeof job.physical_address === 'string' ? (
                              job.city_name || job.physical_address
                            ) : job.physical_address.city && job.physical_address.state ? (
                              `${job.physical_address.city}, ${job.physical_address.state}`
                            ) : (
                              job.city_name || 'Location not specified'
                            )}
                          </p>
                          {typeof job.physical_address === 'object' && job.physical_address.country !== 'United States' && (
                            <p className="text-xs text-blue-600 font-medium">
                              {job.physical_address.country}
                            </p>
                          )}
                        </div>
                      </div>

                      {job.salary_min && job.salary_max && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <DollarSign className="w-5 h-5" />
                          <div>
                            <p className="text-sm font-medium text-green-600">
                              {formatSalary(job.salary_min, job.salary_max)}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-gray-600">
                        <Calendar className="w-5 h-5" />
                        <div>
                          <p className="text-sm">Posted {formatDate(job.date_posted)}</p>
                        </div>
                      </div>
                    </div>

                    {job.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {job.categories.map((category, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Apply Section */}
                  <div className="flex-shrink-0 lg:ml-8">
                    {user?.userType === 'talent' && (
                      <div className="text-center lg:text-right">
                        {showSuccess || (job && isJobApplied(job.id)) ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-medium">
                                {showSuccess ? 'Application Submitted!' : 'Applied'}
                              </span>
                            </div>
                            <p className="text-sm text-green-600">
                              {showSuccess ? "We'll notify you about next steps" : 'You have already applied to this job'}
                            </p>
                          </div>
                        ) : (
                          <Button
                            size="lg"
                            onClick={handleApply}
                            disabled={false}
                            className="w-full lg:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                          >
                            Apply for This Job
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Job Description */}
              <div className="lg:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5" />
                      <span>Job Description</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {job.description}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Required Skills */}
                {job.skills && job.skills.length > 0 && (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="w-5 h-5" />
                        <span>Required Skills</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                          >
                            {skill.name}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Company Info */}
              <div className="space-y-6">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="w-5 h-5" />
                      <span>Company</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg text-gray-900 mb-3">
                      {job.company_name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {job.company_description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {typeof job.physical_address === 'string' ? (
                            // Handle string format
                            <>
                              {job.physical_address}<br />
                              {job.city_name}
                            </>
                          ) : (
                            // Handle object format
                            <>
                              {job.physical_address.street}<br />
                              {job.physical_address.city}, {job.physical_address.state} {job.physical_address.zip_code}<br />
                              {job.physical_address.country}
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                {user?.userType === 'talent' && !showSuccess && !(job && isJobApplied(job.id)) && (
                  <Card className="shadow-sm bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <h3 className="font-medium text-blue-900 mb-2">Ready to Apply?</h3>
                      <p className="text-sm text-blue-700 mb-4">
                        Make sure your profile and documents are up to date before applying.
                      </p>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push('/profile')}
                          className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          Update Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <JobApplicationModal />
    </div>
  )
}