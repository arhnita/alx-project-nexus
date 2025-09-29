import { useAuthStore } from '@/store/authStore'
import { apiService } from '@/services/api'
import { useState, useEffect } from 'react'

interface EmailVerificationStatus {
  needsVerification: boolean
  userEmail: string
  userStatus: string | null
}

export function useEmailVerification(): EmailVerificationStatus {
  const { user } = useAuthStore()
  const [verificationStatus, setVerificationStatus] = useState<EmailVerificationStatus>({
    needsVerification: false,
    userEmail: '',
    userStatus: null
  })

  useEffect(() => {
    if (user) {
      // Get user profile to check status and email verification
      const checkVerificationStatus = async () => {
        try {
          const response = await apiService.getUserProfile()
          const userData = response.data

          setVerificationStatus({
            needsVerification: userData.status === 'pending' || !userData.is_email_verified,
            userEmail: userData.email || user.email,
            userStatus: userData.status
          })
        } catch (error) {
          console.error('Failed to check verification status:', error)
          setVerificationStatus({
            needsVerification: false,
            userEmail: user.email,
            userStatus: null
          })
        }
      }

      checkVerificationStatus()
    }
  }, [user])

  return verificationStatus
}