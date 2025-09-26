'use client'

import { useState, useRef } from 'react'
import { Upload, File, X, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from './Button'
import { apiService, FileUpload as FileUploadType } from '@/services/api'

interface FileUploadProps {
  type: 'resume' | 'cover_letter'
  title: string
  description: string
  acceptedTypes: string[]
  maxSizeInMB: number
  userId: number
  existingFile?: FileUploadType
  onUploadSuccess?: (file: FileUploadType) => void
  onDeleteSuccess?: () => void
}

export function FileUpload({
  type,
  title,
  description,
  acceptedTypes,
  maxSizeInMB,
  userId,
  existingFile,
  onUploadSuccess,
  onDeleteSuccess
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return `File size must be less than ${maxSizeInMB}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const mimeTypeAllowed = acceptedTypes.some(type =>
      file.type === type || fileExtension === type
    )

    if (!mimeTypeAllowed) {
      return `File type must be one of: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError(null)

    try {
      const response = await apiService.uploadFile(file, type, userId, file.name)
      if (response.success) {
        onUploadSuccess?.(response.data)
      } else {
        setError(response.message || 'Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDelete = async () => {
    if (!existingFile?.id) return

    setDeleting(true)
    setError(null)

    try {
      const response = await apiService.deleteUploadedFile(existingFile.id)
      if (response.success) {
        onDeleteSuccess?.()
      } else {
        setError('Failed to delete file')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    } finally {
      setDeleting(false)
    }
  }


  const getFileIcon = () => {
    return <File className="w-8 h-8 text-blue-600" />
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {existingFile ? (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                {getFileIcon()}
                <div className="text-left min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{existingFile.name}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded {existingFile.created_at ? new Date(existingFile.created_at).toLocaleDateString() : 'Recently'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {existingFile.file_path && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(existingFile.file_path, '_blank')}
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center space-x-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  {deleting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Remove'}</span>
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="text-sm break-words">{error}</span>
          </div>
        )}

        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-900 mb-1 px-2">
                {existingFile ? 'Upload a new file to replace' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 px-2 break-words">
                {acceptedTypes.join(', ')} up to {maxSizeInMB}MB
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {existingFile && (
          <div className="mt-3 flex items-center justify-center space-x-1 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">File uploaded successfully</span>
          </div>
        )}
      </div>
    </div>
  )
}