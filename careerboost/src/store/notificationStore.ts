import { create } from 'zustand'

export interface Notification {
  id: number
  title: string
  message: string
  is_read: boolean
  created_at: string
  notification_type?: string
}

export interface NotificationResponse {
  success: boolean
  message: string
  data: Notification[]
  status_code: number
}

export interface UnreadCountResponse {
  count: number
}

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://connect-hire.onrender.com'

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const accessToken = localStorage.getItem('access_token')
  const url = `${API_BASE_URL}${endpoint}`

  const config: RequestInit = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
    mode: 'cors',
    ...options,
  }

  const response = await fetch(url, config)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return data
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
      const response = await apiRequest<NotificationResponse>('/api/notifications/')
      set({
        notifications: response.data || [],
        isLoading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        isLoading: false
      })
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await apiRequest<UnreadCountResponse>('/api/notifications/unread_count/')
      set({ unreadCount: response.count || 0 })
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  },

  markNotificationsAsRead: async (notificationIds: number[]) => {
    try {
      await apiRequest('/api/notifications/mark-read/', {
        method: 'POST',
        body: JSON.stringify({ notification_ids: notificationIds })
      })

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
      set({ error: error instanceof Error ? error.message : 'Failed to mark notifications as read' })
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