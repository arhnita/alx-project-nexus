'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { apiService, FeedItem, FeedResponse } from '@/services/api'
import {
  Briefcase,
  Building2,
  TrendingUp,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Activity
} from 'lucide-react'

interface ActivityFeedProps {
  className?: string
}

export function ActivityFeed({ className }: ActivityFeedProps) {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchFeed = useCallback(async (cursor?: string) => {
    try {
      setLoading(true)
      setError(null)

      const response: FeedResponse = await apiService.getFeed(cursor, 10)

      setFeedItems(response.results)
      setNextCursor(response.next_cursor)
    } catch (err) {
      setError('Failed to load activity feed')
      console.error('Feed fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const handleNextPage = () => {
    if (nextCursor) {
      fetchFeed(nextCursor)
      setCurrentPage(prev => prev + 1)
    }
  }

  const handlePreviousPage = () => {
    // For now, we'll go back to the first page since API doesn't provide previous cursor
    if (currentPage > 1) {
      fetchFeed()
      setCurrentPage(1)
    }
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    fetchFeed()
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

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'job_posted':
        return <Briefcase className="w-4 h-4 text-blue-600" />
      case 'company_joined':
        return <Building2 className="w-4 h-4 text-green-600" />
      case 'promotion_active':
        return <TrendingUp className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'job_posted':
        return 'border-l-blue-500'
      case 'company_joined':
        return 'border-l-green-500'
      case 'promotion_active':
        return 'border-l-purple-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const renderFeedItem = (item: FeedItem) => {
    const { event_type, payload, created_at } = item

    switch (event_type) {
      case 'job_posted':
        return (
          <div key={item.id} className={`p-4 border-l-4 ${getEventColor(event_type)} bg-white rounded-r-lg shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">New job posted</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1 sm:mt-0">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(created_at)}
                  </div>
                </div>
                {payload.job && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{payload.job.title}</h4>
                    <p className="text-sm text-gray-600">{payload.job.company_name}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-gray-500 mt-1">
                      {payload.job.location && <span>{payload.job.location}</span>}
                      {payload.job.salary_range && payload.job.location && (
                        <span className="hidden sm:inline">•</span>
                      )}
                      {payload.job.salary_range && <span>{payload.job.salary_range}</span>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'company_joined':
        return (
          <div key={item.id} className={`p-4 border-l-4 ${getEventColor(event_type)} bg-white rounded-r-lg shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Company joined</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1 sm:mt-0">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(created_at)}
                  </div>
                </div>
                {payload.company && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{payload.company.name}</h4>
                    {payload.company.industry && (
                      <p className="text-sm text-gray-600">{payload.company.industry}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'promotion_active':
        return (
          <div key={item.id} className={`p-4 border-l-4 ${getEventColor(event_type)} bg-white rounded-r-lg shadow-sm hover:shadow-md transition-shadow`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Promotion created</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-400 mt-1 sm:mt-0">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(created_at)}
                  </div>
                </div>
                {payload.promotion && (
                  <div className="bg-gray-50 rounded-lg p-3 mt-2">
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{payload.promotion.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{payload.promotion.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-600" />
            Activity Feed
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 text-sm">{error}</div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </div>
        )}

        {loading && feedItems.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : feedItems.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity yet</h3>
            <p className="text-gray-600">Check back later for updates from your network</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {feedItems.map(renderFeedItem)}
            </div>

            {/* Pagination */}
            {(nextCursor || currentPage > 1) && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 order-2 sm:order-1">
                  Page {currentPage}
                </div>

                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage <= 1 || loading}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">First Page</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!nextCursor || loading}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}