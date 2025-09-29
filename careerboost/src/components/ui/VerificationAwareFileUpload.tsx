'use client'

import { FileUpload } from '@/components/ui/FileUpload'
import { FileUpload as FileUploadType } from '@/services/api'

interface VerificationAwareFileUploadProps {
  type: 'resume' | 'cover_letter'
  title: string
  description: string
  acceptedTypes: string[]
  maxSizeInMB: number
  userId: number
  existingFile?: FileUploadType
  onUploadSuccess: (file: FileUploadType) => void
  onDeleteSuccess: () => void
  onError?: (errorMessage: string) => void
}

export function VerificationAwareFileUpload(props: VerificationAwareFileUploadProps) {

  const handleUploadSuccess = (file: FileUploadType) => {
    // For successful uploads, just call the original callback
    props.onUploadSuccess(file)
  }


  const handleDeleteSuccess = () => {
    // For successful deletes, just call the original callback
    props.onDeleteSuccess()
  }

  const { onError, ...fileUploadProps } = props
  // onError is intentionally excluded from props but kept for interface compatibility

  return (
    <FileUpload
      {...fileUploadProps}
      onUploadSuccess={handleUploadSuccess}
      onDeleteSuccess={handleDeleteSuccess}
    />
  )
}