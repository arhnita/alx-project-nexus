'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { VerificationRequiredModal } from '@/components/ui/VerificationRequiredModal'
import { useAuthStore } from '@/store/authStore'
import { isVerificationError } from '@/utils/errorUtils'

interface VerificationContextType {
  showVerificationModal: (action: string) => void
  handleVerificationError: (error: unknown, action: string) => boolean
}

const VerificationContext = createContext<VerificationContextType | null>(null)

interface VerificationProviderProps {
  children: ReactNode
}

export function VerificationProvider({ children }: VerificationProviderProps) {
  const { user } = useAuthStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentAction, setCurrentAction] = useState('')

  const showVerificationModal = (action: string) => {
    setCurrentAction(action)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentAction('')
  }

  const handleVerificationError = (error: unknown, action: string): boolean => {
    // Check if this is a verification error using the utility function
    if (isVerificationError(error)) {
      showVerificationModal(action)
      return true // Error was handled
    }

    return false // Error was not a verification error
  }

  return (
    <VerificationContext.Provider value={{ showVerificationModal, handleVerificationError }}>
      {children}
      {user && (
        <VerificationRequiredModal
          isOpen={isModalOpen}
          onClose={closeModal}
          action={currentAction}
          userEmail={user.email}
        />
      )}
    </VerificationContext.Provider>
  )
}

export function useVerification() {
  const context = useContext(VerificationContext)
  if (!context) {
    throw new Error('useVerification must be used within a VerificationProvider')
  }
  return context
}