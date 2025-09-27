'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { apiService, JobApplication, Job, JobApplicationListResponse } from '@/services/api'
import {
  Calendar,
  Building2,
  MapPin,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export default function ApplicationsPage() {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore()
  const { isSidebarCollapsed } = useUIStore()
  const router = useRouter()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [jobs, setJobs] = useState<Record<number, Job>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [pagination, setPagination] = useState({
    count: 0,
    next: null as string | null,
    previous: null as string | null
  })

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response: JobApplicationListResponse = await apiService.getUserApplications(currentPage, pageSize)
      setApplications(response.results)
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous
      })

      // Get job details for each application
      const jobIds = response.results.map(app => app.job)
      const uniqueJobIds = [...new Set(jobIds)]

      // Fetch job details (assuming we can get jobs by ID or from the jobs list)
      const jobsResponse = await apiService.getJobs(1, 100) // Get more jobs to find matches
      const jobsMap: Record<number, Job> = {}

      uniqueJobIds.forEach(jobId => {
        const job = jobsResponse.results.find(j => j.id === jobId)
        if (job) {
          jobsMap[jobId] = job
        }
      })

      setJobs(jobsMap)
    } catch (err) {
      setError('Failed to load applications')
      console.error('Applications fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isAuthenticated) {
      fetchApplications()
    }
  }, [isInitialized, isAuthenticated, router, fetchApplications])

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'reviewing':
      case 'under_review':
        return <Eye className="w-4 h-4 text-orange-600" />
      case 'accepted':
      case 'hired':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'reviewing':
      case 'under_review':
        return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'accepted':
      case 'hired':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const totalPages = Math.ceil(pagination.count / pageSize)

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (loading && applications.length === 0) {
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
              <div className="mb-8">
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <LoadingSkeleton />
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
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Track the status of your job applications
              </p>
              {pagination.count > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {pagination.count} application{pagination.count !== 1 ? 's' : ''} total
                </p>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600">{error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fetchApplications()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Applications List */}
            {applications.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Start applying to jobs to see your applications here
                </p>
                <Button onClick={() => router.push('/jobs')}>
                  Browse Jobs
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => {
                  const job = jobs[application.job]
                  return (
                    <Card key={`${application.job}-${application.date_applied}`} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {job?.title || `Job #${application.job}`}
                              </h3>
                              <div className={cn(
                                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                                getStatusColor(application.status)
                              )}>
                                {getStatusIcon(application.status)}
                                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                              </div>
                            </div>

                            {job && (
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    <span>{job.company_name}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{job.physical_address.city}, {job.physical_address.state}</span>
                                  </div>
                                  {job.salary_min && job.salary_max && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <DollarSign className="w-4 h-4" />
                                      <span>${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-1 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>Applied {formatDate(application.date_applied)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {job && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/jobs/${job.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Job
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Cover Letter Preview */}
                        {application.cover_letter && (
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Cover Letter
                            </h4>
                            <p className="text-sm text-gray-600 line-clamp-3">
                              {application.cover_letter}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.count)} of {pagination.count} applications
                </div>

                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.previous || loading}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>

                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={loading}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.next || loading}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}