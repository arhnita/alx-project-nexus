import { create } from 'zustand'
import { apiService, Notification, ApiError } from '@/services/api'

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  isDropdownOpen: boolean
  fetchNotifications: () => Promise<void>
  fetchUnreadCount: () => Promise<void>
  markNotificationsAsRead: (notificationIds: number[]) => Promise<void>
  markAllAsRead: () => Promise<void>
  setDropdownOpen: (open: boolean) => void
  clearError: () => void
}


export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  isDropdownOpen: false,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await apiService.getNotifications()
      set({
        notifications: response.data || [],
        isLoading: false
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to fetch notifications'
      set({
        error: errorMessage,
        isLoading: false
      })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await apiService.getUnreadCount()
      set({ unreadCount: response.count || 0 })
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  },

  markNotificationsAsRead: async (notificationIds: number[]) => {
    try {
      await apiService.markNotificationsAsRead(notificationIds)

      // Update local state
      const { notifications } = get()
      const updatedNotifications = notifications.map(notification =>
        notificationIds.includes(notification.id)
          ? { ...notification, is_read: true }
          : notification
      )

      set({ notifications: updatedNotifications })

      // Refresh unread count
      get().fetchUnreadCount()
    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to mark notifications as read'
      set({ error: errorMessage })
    }
  },

  markAllAsRead: async () => {
    try {
      const { notifications } = get()
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id)

      if (unreadIds.length > 0) {
        await get().markNotificationsAsRead(unreadIds)
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to mark all notifications as read' })
    }
  },

  setDropdownOpen: (open: boolean) => {
    set({ isDropdownOpen: open })
    if (open) {
      // Fetch notifications when dropdown opens
      get().fetchNotifications()
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))