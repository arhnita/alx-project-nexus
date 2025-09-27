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
import { JobCreateModal } from '@/components/modals/JobCreateModal'
import { apiService, Job, JobsResponse } from '@/services/api'
import {
  Plus,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Star,
  Briefcase,
  Eye,
  Edit,
  Users,
  BarChart3
} from 'lucide-react'

export default function MyJobsPage() {
  const { isAuthenticated, user, isInitialized } = useAuthStore()
  const { isSidebarCollapsed } = useUIStore()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [pagination, setPagination] = useState<{
    count: number
    next: string | null
    previous: string | null
  }>({
    count: 0,
    next: null,
    previous: null
  })
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response: JobsResponse = await apiService.getRecruiterJobs(currentPage, pageSize)

      setJobs(response.results)
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous
      })
    } catch (err) {
      setError('Failed to load jobs')
      console.error('Jobs fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
      return
    }

    if (isInitialized && user?.userType !== 'recruiter') {
      router.push('/dashboard')
      return
    }

    if (isAuthenticated && user?.userType === 'recruiter') {
      fetchJobs()
    }
  }, [isInitialized, isAuthenticated, user, router, fetchJobs])

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

  const totalPages = Math.ceil(pagination.count / pageSize)

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (loading && jobs.length === 0) {
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
            <div className="max-w-7xl mx-auto">
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
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Jobs</h1>
                    <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      {pagination.count} job{pagination.count !== 1 ? 's' : ''} posted
                    </p>
                  </div>

                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post New Job
                  </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                          <p className="text-2xl font-bold text-gray-900">{pagination.count}</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Applications</p>
                          <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Users className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Views</p>
                          <p className="text-2xl font-bold text-gray-900">0</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600">{error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fetchJobs()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Jobs List */}
            {jobs.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Briefcase className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs posted yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Start by posting your first job to attract talented candidates
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </div>
            ) : (
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Loading jobs...</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {jobs.map((job) => (
                    <Card key={job.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 pr-2">
                                {job.title}
                              </h2>
                              {job.is_promoted && (
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-1.5 rounded-full">
                                  <Star className="w-3 h-3 text-white fill-current" />
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 mb-3">
                              <div className="flex items-center gap-1 text-sm">
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium">{job.company_name}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Location and Salary */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>
                              {typeof job.physical_address === 'string' ? (
                                job.city_name || job.physical_address
                              ) : job.physical_address.city && job.physical_address.state ? (
                                `${job.physical_address.city}, ${job.physical_address.state}`
                              ) : (
                                job.city_name || 'Location not specified'
                              )}
                            </span>
                            {typeof job.physical_address === 'object' && job.physical_address.country !== 'United States' && (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {job.physical_address.country}
                              </span>
                            )}
                          </div>

                          {job.salary_min && job.salary_max && (
                            <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                              <DollarSign className="w-4 h-4" />
                              <span>${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {job.description.length > 150
                            ? `${job.description.substring(0, 150)}...`
                            : job.description
                          }
                        </p>

                        {/* Categories */}
                        {job.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {job.categories.slice(0, 3).map((category, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                              >
                                {category}
                              </span>
                            ))}
                            {job.categories.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                                +{job.categories.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar className="w-3 h-3" />
                              <span>Posted {formatDate(job.date_posted)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-blue-600">
                              <Users className="w-3 h-3" />
                              <span>0 applications</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/jobs/${job.id}`)}
                              className="px-3 py-2 text-sm font-medium"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-3 py-2 text-sm font-medium"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.count)} of {pagination.count} jobs
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

      {/* Job Creation Modal */}
      <JobCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Refresh jobs list
          fetchJobs()
        }}
      />
    </div>
  )
}