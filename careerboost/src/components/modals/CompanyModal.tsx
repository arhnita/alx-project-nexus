'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiService, CompanyCreateData, ApiError, Company } from '@/services/api'
import { Building2, Globe, Phone, FileText, X, CheckCircle } from 'lucide-react'

interface CompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  company?: Company | null // If editing existing company
}

export function CompanyModal({ isOpen, onClose, onSuccess, company }: CompanyModalProps) {
  const isEditing = !!company
  const [formData, setFormData] = useState<CompanyCreateData>({
    name: '',
    description: '',
    contact_details: '',
    website: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen && company) {
      // Pre-fill form when editing
      setFormData({
        name: company.name,
        description: company.description,
        contact_details: company.contact_details,
        website: company.website
      })
    } else if (isOpen && !company) {
      // Reset form when creating new
      setFormData({
        name: '',
        description: '',
        contact_details: '',
        website: ''
      })
    }
  }, [isOpen, company])

  const handleInputChange = (field: keyof CompanyCreateData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
    // Clear field-specific errors when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: []
      }))
    }
  }

  const validateForm = () => {
    const errors: Record<string, string[]> = {}

    if (!formData.name.trim()) {
      errors.name = ['Company name is required']
    }

    if (!formData.description.trim()) {
      errors.description = ['Company description is required']
    }

    if (!formData.contact_details.trim()) {
      errors.contact_details = ['Contact details are required']
    }

    if (formData.website && !isValidUrl(formData.website)) {
      errors.website = ['Please enter a valid website URL (e.g., https://example.com)']
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return false
    }

    setFieldErrors({})
    return true
  }

  const isValidUrl = (string: string) => {
    if (!string.trim()) return true // Empty is valid since it's optional

    try {
      // Check if it already has protocol
      if (string.startsWith('http://') || string.startsWith('https://')) {
        const url = new URL(string)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } else {
        // Try adding https:// prefix
        const url = new URL(`https://${string}`)
        return url.hostname.includes('.')
      }
    } catch {
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      if (isEditing && company) {
        await apiService.updateCompany(company.id, formData)
      } else {
        await apiService.createCompany(formData)
      }

      setSuccess(true)

      // Close modal and refresh companies list after 2 seconds
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          name: '',
          description: '',
          contact_details: '',
          website: ''
        })
      }, 2000)

    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        // Handle field-specific errors from API
        setFieldErrors(err.errors)
        setError(err.message || 'Please correct the errors below')
      } else {
        const errorMessage = err instanceof ApiError
          ? err.message
          : `Failed to ${isEditing ? 'update' : 'create'} company`
        setError(errorMessage)
        setFieldErrors({})
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
    setError(null)
    setFieldErrors({})
    setSuccess(false)
    // Reset form data
    setFormData({
      name: '',
      description: '',
      contact_details: '',
      website: ''
    })
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Company' : 'Create Company'}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Company {isEditing ? 'Updated' : 'Created'} Successfully!
            </h3>
            <p className="text-gray-600">
              Your company information has been {isEditing ? 'updated' : 'saved'} successfully.
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Closing in 2 seconds...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className={`pl-10 ${fieldErrors.name?.length ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.name && fieldErrors.name.length > 0 && (
                <div className="mt-1">
                  {fieldErrors.name.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                </div>
              )}
            </div>

            {/* Company Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your company, what you do, your mission and values..."
                  rows={5}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 resize-none text-sm text-black ${
                    fieldErrors.description?.length
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.description && fieldErrors.description.length > 0 && (
                <div className="mt-1">
                  {fieldErrors.description.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
            </div>

            {/* Contact Details */}
            <div>
              <label htmlFor="contact_details" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Details *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="contact_details"
                  type="text"
                  value={formData.contact_details}
                  onChange={(e) => handleInputChange('contact_details', e.target.value)}
                  placeholder="e.g. +1 (555) 123-4567 or contact@company.com"
                  className={`pl-10 ${fieldErrors.contact_details?.length ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.contact_details && fieldErrors.contact_details.length > 0 && (
                <div className="mt-1">
                  {fieldErrors.contact_details.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Phone number or email address for company contact
              </p>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="e.g. https://www.company.com"
                  className={`pl-10 ${fieldErrors.website?.length ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.website && fieldErrors.website.length > 0 && (
                <div className="mt-1">
                  {fieldErrors.website.map((error, index) => (
                    <p key={index} className="text-xs text-red-600">{error}</p>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Optional - Enter a valid URL (e.g., https://www.company.com)
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                loading={isLoading}
                className="flex-1"
              >
                <Building2 className="w-4 h-4 mr-2" />
                {isLoading
                  ? (isEditing ? 'Updating...' : 'Creating...')
                  : (isEditing ? 'Update Company' : 'Create Company')
                }
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}