'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { X, Mail, AlertCircle } from 'lucide-react'

interface EmailVerificationBannerProps {
  userEmail: string
  userStatus: string
  onDismiss?: () => void
}

export function EmailVerificationBanner({ userEmail, userStatus, onDismiss }: EmailVerificationBannerProps) {
  const router = useRouter()
  const { resendVerificationEmail } = useAuthStore()
  const [isResending, setIsResending] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  const handleVerifyEmail = () => {
    router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`)
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      await resendVerificationEmail(userEmail)
      // Redirect to OTP input page after successful resend
      router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    } finally {
      setIsResending(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  if (isDismissed) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                Email Verification Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Your email address <strong>{userEmail}</strong> is not verified.
                  You&apos;ll need to verify your email to perform actions like applying to jobs, creating job posts, or updating your profile.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-4 text-yellow-400 hover:text-yellow-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>


          <div className="mt-4 flex space-x-3">
            {/* For pending users, only show resend option since OTP would have expired */}
            {userStatus === 'pending' ? (
              <button
                onClick={handleResendEmail}
                disabled={isResending}
                className="text-sm text-yellow-800 hover:text-yellow-900 underline disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Resend verification email'}
              </button>
            ) : (
              <>
                <Button
                  onClick={handleVerifyEmail}
                  size="sm"
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Verify Email
                </Button>
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="text-sm text-yellow-800 hover:text-yellow-900 underline disabled:opacity-50"
                >
                  {isResending ? 'Resending...' : 'Resend verification email'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}