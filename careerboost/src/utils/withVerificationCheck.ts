import { useVerification } from '@/contexts/VerificationContext'

export function withVerificationCheck<T extends unknown[], R>(
  apiCall: (...args: T) => Promise<R>,
  actionDescription: string
) {
  return function WrappedApiCall(...args: T): Promise<R> {
    return apiCall(...args).catch((error) => {
      // Check if this is a verification error
      const errorObj = error as { message?: string; status_code?: number; error?: string }
      const isVerificationError =
        errorObj?.message?.toLowerCase().includes('email') &&
        errorObj?.message?.toLowerCase().includes('verify') ||
        errorObj?.message?.toLowerCase().includes('verification') ||
        errorObj?.status_code === 403 ||
        errorObj?.error === 'EMAIL_NOT_VERIFIED' ||
        errorObj?.message?.toLowerCase().includes('pending') ||
        errorObj?.message?.toLowerCase().includes('must verify')

      if (isVerificationError) {
        // This will be handled by the component using this wrapper
        throw { ...error, isVerificationError: true, actionDescription }
      }

      // Re-throw non-verification errors
      throw error
    })
  }
}

// Hook to use in components
export function useVerifiedApiCall() {
  const { handleVerificationError } = useVerification()

  const callWithVerification = async <T>(
    apiCall: () => Promise<T>,
    actionDescription: string
  ): Promise<T> => {
    try {
      return await apiCall()
    } catch (error: unknown) {
      const wasHandled = handleVerificationError(error, actionDescription)
      if (!wasHandled) {
        throw error // Re-throw if not a verification error
      }
      // If it was a verification error, we don't re-throw
      // The modal will be shown instead
      throw error
    }
  }

  return { callWithVerification }
}