'use client'

import { useState } from 'react'
import { useEmailVerification } from './useEmailVerification'

interface VerificationCheckResult {
  showVerificationModal: boolean
  openVerificationModal: (action: string) => void
  closeVerificationModal: () => void
  currentAction: string
  userEmail: string
  checkAndProceed: (action: string, callback: () => void) => void
}

export function useVerificationCheck(): VerificationCheckResult {
  const { needsVerification, userEmail } = useEmailVerification()
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [currentAction, setCurrentAction] = useState('')

  const openVerificationModal = (action: string) => {
    setCurrentAction(action)
    setShowVerificationModal(true)
  }

  const closeVerificationModal = () => {
    setShowVerificationModal(false)
    setCurrentAction('')
  }

  const checkAndProceed = (action: string, callback: () => void) => {
    if (needsVerification) {
      openVerificationModal(action)
    } else {
      callback()
    }
  }

  return {
    showVerificationModal,
    openVerificationModal,
    closeVerificationModal,
    currentAction,
    userEmail,
    checkAndProceed
  }
}