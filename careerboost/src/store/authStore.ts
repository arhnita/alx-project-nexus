import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { JobSeeker, Recruiter } from '@/types'
import { apiService, SignupData, ApiError, SignupResponse, LoginData, LoginResponse } from '@/services/api'


interface AuthState {
  user: (JobSeeker | Recruiter) | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (user: JobSeeker | Recruiter) => void
  loginWithAPI: (data: LoginData) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  signup: (data: SignupData) => Promise<void>
  clearError: () => void
  updateUser: (updates: Partial<JobSeeker | Recruiter>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: (user) => {
        set({ user, isAuthenticated: true, error: null })
      },

      loginWithAPI: async (data: LoginData) => {
        set({ isLoading: true, error: null })

        try {
          // Login to get tokens and user data
          const loginResult: LoginResponse = await apiService.login(data)

          if (!loginResult.success) {
            throw new Error(loginResult.message || 'Login failed')
          }

          const userData = loginResult.data.user

          // Transform API response to match our user types based on role
          let user: JobSeeker | Recruiter

          if (userData.role === 'talent') {
            user = {
              id: userData.id.toString(),
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              userType: 'talent' as const,
              avatar: undefined,
              createdAt: new Date(userData.created_at),
              skills: [],
              experience: 0,
              location: '',
              skillScore: 0,
              profileViews: 0,
              profileViewsGrowth: 0,
              applications: [],
              interviews: []
            } satisfies JobSeeker
          } else {
            user = {
              id: userData.id.toString(),
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              userType: 'recruiter' as const,
              avatar: undefined,
              createdAt: new Date(userData.created_at),
              company: '',
              position: '',
              location: '',
              jobPostings: [],
              hiresPerMonth: 0,
              hiresGoal: 0
            } satisfies Recruiter
          }

          // Store tokens
          localStorage.setItem('access_token', loginResult.data.access)
          localStorage.setItem('refresh_token', loginResult.data.refresh)

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = error instanceof ApiError
            ? error.message
            : 'Login failed'

          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            await apiService.logout({ refresh: refreshToken })
          }
        } catch (error) {
          // Even if logout API fails, we still clear local state
          console.error('Logout API failed:', error)
        } finally {
          // Always clear tokens and state
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ user: null, isAuthenticated: false, error: null })
        }
      },

      logoutAll: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token')
          if (refreshToken) {
            await apiService.logoutAll({ refresh: refreshToken })
          }
        } catch (error) {
          // Even if logout API fails, we still clear local state
          console.error('Logout all API failed:', error)
        } finally {
          // Always clear tokens and state
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          set({ user: null, isAuthenticated: false, error: null })
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null })

        try {
          const result: SignupResponse = await apiService.signup(data)

          // Transform API response to match our user types
          let user: JobSeeker | Recruiter

          if (data.role === 'talent') {
            user = {
              id: result.id,
              email: result.email,
              firstName: result.first_name,
              lastName: result.last_name,
              userType: 'talent' as const,
              avatar: result.avatar,
              createdAt: new Date(result.created_at),
              skills: [],
              experience: 0,
              location: '',
              skillScore: 0,
              profileViews: 0,
              profileViewsGrowth: 0,
              applications: [],
              interviews: []
            } satisfies JobSeeker
          } else {
            user = {
              id: result.id,
              email: result.email,
              firstName: result.first_name,
              lastName: result.last_name,
              userType: 'recruiter' as const,
              avatar: result.avatar,
              createdAt: new Date(result.created_at),
              company: '',
              position: '',
              location: '',
              jobPostings: [],
              hiresPerMonth: 0,
              hiresGoal: 0
            } satisfies Recruiter
          }

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
        } catch (error) {
          const errorMessage = error instanceof ApiError
            ? error.message
            : 'Registration failed'

          set({
            isLoading: false,
            error: errorMessage
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },

      updateUser: (updates) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } as JobSeeker | Recruiter })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)