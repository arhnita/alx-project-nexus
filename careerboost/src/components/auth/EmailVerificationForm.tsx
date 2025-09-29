'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { useAuthStore } from '@/store/authStore'

interface EmailVerificationFormProps {
  email: string
  onBack?: () => void
}

export function EmailVerificationForm({ email, onBack }: EmailVerificationFormProps) {
  const router = useRouter()
  const { isLoading, error, clearError, verifyEmail, resendVerificationEmail } = useAuthStore()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value

    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (error) {
      clearError()
    }
    if (localError) {
      setLocalError('')
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (pastedData.length === 6) {
      const newCode = pastedData.split('')
      setCode(newCode)
      inputRefs.current[5]?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const verificationCode = code.join('')
    if (verificationCode.length !== 6) {
      setLocalError('Please enter all 6 digits')
      return
    }

    setIsVerifying(true)
    setLocalError('')
    setSuccessMessage('')

    try {
      await verifyEmail(verificationCode)
      setSuccessMessage('Email verified successfully! Redirecting to dashboard...')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (error) {
      setLocalError('Invalid verification code. Please try again.')
      console.error('Email verification failed:', error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setLocalError('')

    try {
      await resendVerificationEmail(email)
      setSuccessMessage('Verification code sent! Please check your email.')
      setResendCooldown(60)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      setLocalError('Failed to resend verification code. Please try again.')
      console.error('Resend verification failed:', error)
    } finally {
      setIsResending(false)
    }
  }

  const isCodeComplete = code.every(digit => digit !== '')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 hover:bg-blue-700 transition-colors cursor-pointer">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Verify your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent a 6-digit verification code to
          </p>
          <p className="text-sm font-medium text-blue-600">{email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Enter verification code</CardTitle>
            <CardDescription>
              Please enter the 6-digit code sent to your email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center space-x-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-lg font-semibold text-black border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors"
                    disabled={isVerifying || isLoading}
                  />
                ))}
              </div>

              {(error || localError) && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded text-sm text-center">
                  {localError || error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded text-sm text-center">
                  {successMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={isVerifying}
                disabled={!isCodeComplete || isVerifying}
              >
                Verify Email
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Didn&apos;t receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || isResending}
                  className="text-blue-600 hover:text-blue-500 font-medium text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isResending
                    ? 'Resending...'
                    : resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : 'Resend code'
                  }
                </button>
              </div>

              {onBack && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-gray-600 hover:text-gray-500 text-sm"
                  >
                    ← Back to login
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}