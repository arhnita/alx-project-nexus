'use client'

import { useVerification } from '@/contexts/VerificationContext'
import { isVerificationError, getErrorMessage } from '@/utils/errorUtils'

export function useApiWithVerification() {
  const { handleVerificationError } = useVerification()

  const callApi = async <T>(
    apiCall: () => Promise<T>,
    actionDescription: string,
    onError?: (errorMessage: string) => void
  ): Promise<T> => {
    try {
      return await apiCall()
    } catch (error: unknown) {
      // Check if this is a verification error
      if (isVerificationError(error)) {
        handleVerificationError(error, actionDescription)
        // Don't throw the error, the modal will handle it
        throw error
      } else {
        // For non-verification errors, call the onError callback if provided
        if (onError) {
          const errorMessage = getErrorMessage(error)
          onError(errorMessage)
        }
        throw error
      }
    }
  }

  return { callApi }
}