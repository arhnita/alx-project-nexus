'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useJobApplicationStore } from '@/store/jobApplicationStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { SkillsMatch } from '@/components/ui/SkillsMatch'
import { JobApplicationModal } from '@/components/modals/JobApplicationModal'
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
  Briefcase,
  Filter,
  Globe,
  TrendingUp
} from 'lucide-react'

export default function JobsPage() {
  const { isAuthenticated, user, isInitialized } = useAuthStore()
  const { isSidebarCollapsed } = useUIStore()
  const { checkAndApply, isJobApplied, loadAppliedJobs } = useJobApplicationStore()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(12)
  const [sortBy, setSortBy] = useState<'date' | 'salary' | 'relevance'>('date')
  const [filters, setFilters] = useState({
    showRemoteOnly: false,
    showPromotedOnly: false,
    salaryRange: 'all'
  })
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

    if (isAuthenticated) {
      fetchJobs()
      loadAppliedJobs() // Load applied jobs to show status
    }
  }, [isInitialized, isAuthenticated, router, fetchJobs, currentPage, loadAppliedJobs])

  const handleSearch = async () => {
    setCurrentPage(1)
    await fetchJobs(searchTerm)
  }

  const handlePageChange = async (page: number) => {
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


  const totalPages = Math.ceil(pagination.count / pageSize)

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="animate-pulse">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>

              {/* Location and Salary */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>

              {/* Description */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>

              {/* Footer */}
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
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Jobs</h1>
                    <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
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
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

                {/* Filters and Sort */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={filters.showPromotedOnly ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setFilters(f => ({ ...f, showPromotedOnly: !f.showPromotedOnly }))}
                      className="flex items-center gap-1"
                    >
                      <Star className="w-3 h-3" />
                      Featured
                    </Button>
                    <Button
                      variant={filters.showRemoteOnly ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setFilters(f => ({ ...f, showRemoteOnly: !f.showRemoteOnly }))}
                      className="flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      Remote
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      <Filter className="w-3 h-3" />
                      More filters
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <Button
                      variant={sortBy === 'date' ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('date')}
                    >
                      Date
                    </Button>
                    <Button
                      variant={sortBy === 'salary' ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('salary')}
                    >
                      Salary
                    </Button>
                    <Button
                      variant={sortBy === 'relevance' ? "primary" : "outline"}
                      size="sm"
                      onClick={() => setSortBy('relevance')}
                    >
                      Relevance
                    </Button>
                  </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {searchTerm ? 'Try adjusting your search criteria or filters' : 'Check back later for new opportunities'}
                </p>
                {searchTerm && (
                  <Button
                    variant="outline"
                    onClick={() => { setSearchTerm(''); fetchJobs(); }}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {jobs.map((job) => (
                    <Card key={job.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm flex flex-col h-full">
                      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
                        <div className="flex-1 flex flex-col">
                          {/* Header */}
                          <div className="mb-3 sm:mb-4">
                          <div className="flex items-start justify-between mb-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 pr-2 flex-1">
                              {job.title}
                            </h2>
                            {job.is_promoted && (
                              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-1.5 rounded-full flex-shrink-0 ml-2">
                                <Star className="w-3 h-3 text-white fill-current" />
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-gray-600">
                            <Building2 className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-sm truncate">{job.company_name}</span>
                          </div>
                        </div>

                        {/* Location and Salary */}
                        <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                          <div className="flex items-start gap-1 text-xs sm:text-sm text-gray-600">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <span className="break-words">
                                {typeof job.physical_address === 'string' ? (
                                  job.city_name || job.physical_address
                                ) : job.physical_address.city && job.physical_address.state ? (
                                  `${job.physical_address.city}, ${job.physical_address.state}`
                                ) : (
                                  job.city_name || 'Location not specified'
                                )}
                              </span>
                              {typeof job.physical_address === 'object' && job.physical_address.country !== 'United States' && (
                                <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                                  {job.physical_address.country}
                                </span>
                              )}
                            </div>
                          </div>

                          {job.salary_min && job.salary_max && (
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600 font-medium">
                              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="truncate">${parseFloat(job.salary_min).toLocaleString()} - ${parseFloat(job.salary_max).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 leading-relaxed">
                          {job.description.length > 120
                            ? `${job.description.substring(0, 120)}...`
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

                        {/* Skills */}
                        {job.skills && job.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100"
                              >
                                {skill.name}
                              </span>
                            ))}
                            {job.skills.length > 4 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600">
                                +{job.skills.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>Posted {formatDate(job.date_posted)}</span>
                          </div>

                          {/* Skills Match */}
                          {user?.userType === 'talent' && job.skills && job.skills.length > 0 && (
                            <div className="flex justify-center mb-2">
                              <SkillsMatch jobSkills={job.skills} />
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row gap-2 w-full">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/jobs/${job.id}`)}
                              className="flex-1 px-2 py-1.5 text-xs sm:text-sm font-medium"
                            >
                              View Details
                            </Button>
                            {user?.userType === 'talent' && (
                              isJobApplied(job.id) ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled
                                  className="flex-1 px-2 py-1.5 text-xs sm:text-sm font-medium border-green-300 text-green-700 bg-green-50"
                                >
                                  Applied
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => checkAndApply(job.id)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 text-xs sm:text-sm font-medium"
                                >
                                  Apply
                                </Button>
                              )
                            )}
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
      <JobApplicationModal />
    </div>
  )
}