export interface ApiErrorResponse {
  success: boolean
  message: string
  data?: unknown
  status_code: number
  errors?: {
    detail?: string
    [key: string]: unknown
  }
}

export function isVerificationError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false

  const errorObj = error as ApiErrorResponse

  // Check for 403 status code
  if (errorObj.status_code === 403) return true

  // Check for verification-related messages
  const message = errorObj.message?.toLowerCase() || ''
  const detail = errorObj.errors?.detail?.toString().toLowerCase() || ''

  const verificationKeywords = [
    'email verification required',
    'verify your email',
    'verification',
    'email not verified',
    'pending verification'
  ]

  return verificationKeywords.some(keyword =>
    message.includes(keyword) || detail.includes(keyword)
  )
}

export function getErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An error occurred'

  const errorObj = error as ApiErrorResponse

  // Return the main message from the backend
  if (errorObj.message) {
    return errorObj.message
  }

  // Fallback to detail if available
  if (errorObj.errors?.detail) {
    return errorObj.errors.detail.toString()
  }

  return 'An error occurred'
}