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
import { CompanyModal } from '@/components/modals/CompanyModal'
import { apiService, Company, CompaniesResponse } from '@/services/api'
import {
  Plus,
  Building2,
  Globe,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  ExternalLink,
  AlertCircle
} from 'lucide-react'

export default function CompanyPage() {
  const { isAuthenticated, user, isInitialized } = useAuthStore()
  const { isSidebarCollapsed } = useUIStore()
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
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
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response: CompaniesResponse = await apiService.getCompanies(currentPage, pageSize)

      setCompanies(response.results)
      setPagination({
        count: response.count,
        next: response.next,
        previous: response.previous
      })
    } catch (err) {
      setError('Failed to load companies')
      console.error('Companies fetch error:', err)
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
      fetchCompanies()
    }
  }, [isInitialized, isAuthenticated, user, router, fetchCompanies])

  const handleDeleteCompany = async (company: Company) => {
    try {
      await apiService.deleteCompany(company.id)
      setDeletingCompany(null)
      await fetchCompanies() // Refresh the list
    } catch (err) {
      console.error('Failed to delete company:', err)
      setError('Failed to delete company')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatWebsiteUrl = (website: string) => {
    if (!website) return ''
    if (website.startsWith('http://') || website.startsWith('https://')) {
      return website
    }
    return `https://${website}`
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
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  if (loading && companies.length === 0) {
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Companies</h1>
                  <p className="text-sm sm:text-base text-gray-600 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {pagination.count} compan{pagination.count !== 1 ? 'ies' : 'y'} total
                  </p>
                </div>

                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600">{error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fetchCompanies()}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Companies List */}
            {companies.length === 0 && !loading ? (
              <div className="text-center py-12">
                <div className="bg-gray-50 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-6">
                  Start by adding your first company to begin posting jobs
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Company
                </Button>
              </div>
            ) : (
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center rounded-lg">
                    <div className="bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-gray-600">Loading companies...</span>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {companies.map((company) => (
                    <Card key={company.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 shadow-sm">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {company.name}
                              </h2>
                              <div className={cn(
                                'w-2 h-2 rounded-full',
                                company.status ? 'bg-green-500' : 'bg-red-500'
                              )} />
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {company.description.length > 120
                            ? `${company.description.substring(0, 120)}...`
                            : company.description
                          }
                        </p>

                        {/* Contact Details */}
                        <div className="space-y-2 mb-4">
                          {company.website && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Globe className="w-4 h-4" />
                              <a
                                href={formatWebsiteUrl(company.website)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 truncate flex items-center gap-1"
                              >
                                {company.website}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}

                          {company.contact_details && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4" />
                              <span className="truncate">{company.contact_details}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>Created {formatDate(company.created_at)}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-xs">
                            <span className={cn(
                              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                              company.status
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            )}>
                              {company.status ? 'Active' : 'Inactive'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingCompany(company)}
                              className="px-3 py-2 text-sm font-medium"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeletingCompany(company)}
                              className="px-3 py-2 text-sm font-medium text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
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
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.count)} of {pagination.count} companies
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

      {/* Delete Confirmation Modal */}
      {deletingCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Company</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deletingCompany.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeletingCompany(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteCompany(deletingCompany)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Company Create/Edit Modal */}
      <CompanyModal
        isOpen={showCreateModal || !!editingCompany}
        onClose={() => {
          setShowCreateModal(false)
          setEditingCompany(null)
        }}
        onSuccess={() => {
          // Refresh companies list
          fetchCompanies()
          setShowCreateModal(false)
          setEditingCompany(null)
        }}
        company={editingCompany}
      />
    </div>
  )
}