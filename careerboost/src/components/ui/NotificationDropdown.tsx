'use client'

import { useEffect, useRef } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { Notification } from '@/services/api'
import { formatDistanceToNow } from 'date-fns'
import { Check, CheckCheck, X } from 'lucide-react'

interface NotificationDropdownProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
  const {
    notifications,
    isLoading,
    error,
    markNotificationsAsRead,
    markAllAsRead,
    clearError
  } = useNotificationStore()

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, clearError])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markNotificationsAsRead([notification.id])
    }
  }

  const handleMarkAllRead = async () => {
    await markAllAsRead()
  }

  const formatNotificationTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Recently'
    }
  }

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'company_created':
        return '🏢'
      case 'job_posted':
        return '💼'
      case 'job_application':
        return '📄'
      case 'message':
        return '💬'
      case 'update':
        return '🔔'
      default:
        return '📢'
    }
  }

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <div className="flex items-center space-x-2">
            {notifications.some(n => !n.read_at) && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border-b border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-500">Loading notifications...</p>
        </div>
      )}

      {/* Notifications list */}
      {!isLoading && (
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-sm">No notifications yet</p>
              <p className="text-xs text-gray-400 mt-1">
                We&apos;ll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                    notification.read_at
                      ? 'hover:bg-gray-50'
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <span className="text-lg">
                        {getNotificationIcon(notification.event_type)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          notification.read_at ? 'text-gray-900' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read_at && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
                        )}
                      </div>

                      <p className={`text-sm mt-1 ${
                        notification.read_at ? 'text-gray-600' : 'text-gray-700'
                      }`}>
                        {notification.body}
                      </p>

                      <p className="text-xs text-gray-500 mt-2">
                        {formatNotificationTime(notification.created_at)}
                      </p>
                    </div>

                    {!notification.read_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markNotificationsAsRead([notification.id])
                        }}
                        className="flex-shrink-0 p-1 text-gray-400 hover:text-blue-600"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}