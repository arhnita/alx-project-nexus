'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const restoreSession = useAuthStore(state => state.restoreSession)

  useEffect(() => {
    // Restore session on app load
    console.log('AuthProvider: Calling restoreSession...')
    restoreSession()
  }, [restoreSession])

  return <>{children}</>
}