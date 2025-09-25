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
import { Input } from '@/components/ui/Input'
import { apiService, Job, JobsResponse } from '@/services/api'
import {
  Search,
  MapPin,
  Calendar,
  Building2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Briefcase
} from 'lucide-react'

export default function JobsPage() {
  const { isAuthenticated } = useAuthStore()
  const { isSidebarCollapsed } = useUIStore()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [pagination, setPagination] = useState<{
    count: number
    next: string | null
    previous: string | null
  }>({
    count: 0,
    next: null,
    previous: null
  })

  const fetchJobs = useCallback(async (search?: string) => {
    try {
      setLoading(true)
      setError(null)

      const response: JobsResponse = await apiService.getJobs(currentPage, pageSize, search)

      if (response.success) {
        setJobs(response.data.results)
        setPagination({
          count: response.data.count,
          next: response.data.next,
          previous: response.data.previous
        })
      } else {
        setError(response.message || 'Failed to load jobs')
      }
    } catch (err) {
      setError('Failed to load jobs')
      console.error('Jobs fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchJobs()
  }, [isAuthenticated, router, fetchJobs])

  const handleSearch = async () => {
    setCurrentPage(1)
    await fetchJobs(searchTerm)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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

  const isClosingSoon = (closeDateString: string) => {
    const closeDate = new Date(closeDateString)
    const now = new Date()
    const diffTime = closeDate.getTime() - now.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays >= 0
  }

  const totalPages = Math.ceil(pagination.count / pageSize)

  if (loading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="lg:flex">
        <Sidebar />
        <main className={cn(
          'flex-1 p-4 sm:p-6 lg:p-8 transition-all duration-300',
          isSidebarCollapsed ? 'lg:ml-12' : 'lg:ml-0',
          'ml-0'
        )}>
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Jobs</h1>
                  <p className="text-sm sm:text-base text-gray-600">
                    {pagination.count} job{pagination.count !== 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64 lg:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search jobs, companies, locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    Search
                  </Button>
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
            <div className="space-y-4 sm:space-y-6">
              {jobs.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                  <p className="text-gray-600">
                    {searchTerm ? 'Try adjusting your search criteria' : 'Check back later for new opportunities'}
                  </p>
                </div>
              ) : (
                jobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-2 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{job.title}</h2>
                            {job.is_promoted && (
                              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 fill-current" />
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4" />
                              {job.company_name}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {job.location || `${job.address_city}, ${job.address_state}`}
                            </div>
                            {job.salary_range && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                {job.salary_range}
                              </div>
                            )}
                          </div>

                          <p className="text-gray-700 mb-4 line-clamp-3">
                            {job.description.length > 200
                              ? `${job.description.substring(0, 200)}...`
                              : job.description
                            }
                          </p>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Posted {formatDate(job.date_posted)}
                              </div>
                              {isClosingSoon(job.close_date) && (
                                <div className="flex items-center gap-1 text-orange-600">
                                  <Clock className="w-4 h-4" />
                                  Closing soon
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {job.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {job.categories.slice(0, 2).map((category, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {category}
                                    </span>
                                  ))}
                                  {job.categories.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{job.categories.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <Button className="ml-0 sm:ml-6 mt-3 sm:mt-0 w-full sm:w-auto">
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

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
                    onClick={() => handlePageChange(currentPage - 1)}
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
                          onClick={() => handlePageChange(pageNum)}
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
                    onClick={() => handlePageChange(currentPage + 1)}
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