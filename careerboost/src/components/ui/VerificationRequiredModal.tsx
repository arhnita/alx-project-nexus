'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { Mail, Shield, X } from 'lucide-react'

interface VerificationRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  action: string // e.g., "apply to this job", "create a job post", "update your profile"
  userEmail: string
}

export function VerificationRequiredModal({
  isOpen,
  onClose,
  action,
  userEmail
}: VerificationRequiredModalProps) {
  const router = useRouter()
  const { resendVerificationEmail } = useAuthStore()
  const [isResending, setIsResending] = useState(false)

  const handleVerifyEmail = () => {
    onClose()
    router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`)
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      await resendVerificationEmail(userEmail)
      onClose()
      router.push(`/verify-email?email=${encodeURIComponent(userEmail)}`)
    } catch (error) {
      console.error('Failed to resend verification email:', error)
    } finally {
      setIsResending(false)
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Email Verification Required
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-4">
            To {action}, you need to verify your email address first.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
            <div className="flex">
              <Mail className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-700">
                  Your email address needs verification:
                </p>
                <p className="text-sm font-medium text-yellow-800">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            This helps us ensure the security of your account and prevents unauthorized access.
          </p>
        </div>

        <div className="flex flex-col space-y-3">
          <Button
            onClick={handleResendEmail}
            loading={isResending}
            disabled={isResending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Mail className="w-4 h-4 mr-2" />
            {isResending ? 'Sending...' : 'Send Verification Email'}
          </Button>

          <Button
            onClick={handleVerifyEmail}
            variant="outline"
            className="w-full"
          >
            I Already Have a Code
          </Button>

          <button
            onClick={onClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  )
}