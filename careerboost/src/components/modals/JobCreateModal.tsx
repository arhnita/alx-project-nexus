'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiService, JobCreateData, ApiError, Company } from '@/services/api'
import { Building2, DollarSign, MapPin, FileText, X, ChevronDown } from 'lucide-react'

interface JobCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function JobCreateModal({ isOpen, onClose, onSuccess }: JobCreateModalProps) {
  const [formData, setFormData] = useState<JobCreateData>({
    title: '',
    description: '',
    company: 0,
    physical_address: '',
    city: 0, // Will need to be set based on city selection
    salary_min: '',
    salary_max: ''
  })
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchCompanies()
    }
  }, [isOpen])

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true)
      const response = await apiService.getCompanies(1, 50)
      setCompanies(response.results.filter(company => company.status)) // Only show active companies
    } catch (err) {
      console.error('Failed to fetch companies:', err)
      setError('Failed to load companies')
    } finally {
      setLoadingCompanies(false)
    }
  }

  const handleInputChange = (field: keyof JobCreateData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Job title is required')
      return false
    }
    if (!formData.description.trim()) {
      setError('Job description is required')
      return false
    }
    if (!formData.company || formData.company === 0) {
      setError('Please select a company')
      return false
    }
    if (!formData.physical_address.trim()) {
      setError('Physical address is required')
      return false
    }
    if (!formData.salary_min || !formData.salary_max) {
      setError('Both minimum and maximum salary are required')
      return false
    }
    if (parseFloat(formData.salary_min) >= parseFloat(formData.salary_max)) {
      setError('Maximum salary must be greater than minimum salary')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError(null)

    try {
      // Use selected company and placeholder city ID for now
      const jobData: JobCreateData = {
        ...formData,
        city: 1 // Placeholder city ID - will need to be updated when city selection is implemented
      }

      await apiService.createJob(jobData)

      setSuccess(true)

      // Close modal and refresh jobs list after 2 seconds
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          title: '',
          description: '',
          company: 0,
          physical_address: '',
          city: 0,
          salary_min: '',
          salary_max: ''
        })
        setCompanies([])
      }, 2000)

    } catch (err) {
      const errorMessage = err instanceof ApiError ? err.message : 'Failed to create job'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (isLoading) return
    onClose()
    setError(null)
    setSuccess(false)
    // Reset form data
    setFormData({
      title: '',
      description: '',
      company: 0,
      physical_address: '',
      city: 0,
      salary_min: '',
      salary_max: ''
    })
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Post New Job"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Job Posted Successfully!
            </h3>
            <p className="text-gray-600">
              Your job posting is now live and candidates can start applying.
            </p>
            <div className="mt-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Closing in 2 seconds...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Company Selection */}
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                <select
                  id="company"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', parseInt(e.target.value))}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black appearance-none bg-white"
                  disabled={isLoading || loadingCompanies}
                >
                  <option value={0}>
                    {loadingCompanies ? 'Loading companies...' : 'Select a company'}
                  </option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              {companies.length === 0 && !loadingCompanies && (
                <p className="text-xs text-amber-600 mt-1">
                  No companies available. You may need to create a company first.
                </p>
              )}
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the role, responsibilities, requirements, and benefits..."
                  rows={6}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm text-black"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length} characters
              </p>
            </div>

            {/* Physical Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Physical Address *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="address"
                  type="text"
                  value={formData.physical_address}
                  onChange={(e) => handleInputChange('physical_address', e.target.value)}
                  placeholder="e.g. 123 Main St, San Francisco, CA"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Salary Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary_min" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => handleInputChange('salary_min', e.target.value)}
                    placeholder="50000"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="salary_max" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => handleInputChange('salary_max', e.target.value)}
                    placeholder="80000"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
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
                {isLoading ? 'Posting...' : 'Post Job'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}