'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { apiService, JobCreateData, ApiError, Company, Country, State, City, Skill } from '@/services/api'
import { useSkillsStore } from '@/store/skillsStore'
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
    salary_max: '',
    skills: []
  })
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
  const [selectedState, setSelectedState] = useState<number | null>(null)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([])
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([])
  const [skillSearchTerm, setSkillSearchTerm] = useState('')
  const [showSkillDropdown, setShowSkillDropdown] = useState(false)
  const { fetchAllSkills, skills } = useSkillsStore()

  const fetchSkills = useCallback(async () => {
    try {
      await fetchAllSkills()
    } catch (err) {
      console.error('Failed to fetch skills:', err)
    }
  }, [fetchAllSkills])

  // Update available skills when skills from store change
  useEffect(() => {
    console.log('Skills from store:', skills)
    setAvailableSkills(skills)
  }, [skills])

  useEffect(() => {
    if (isOpen) {
      fetchCompanies()
      fetchCountries()
      fetchSkills()
    }
  }, [isOpen, fetchSkills])

  useEffect(() => {
    if (selectedCountry) {
      fetchStates(selectedCountry)
      setSelectedState(null)
      setCities([])
      setFormData(prev => ({ ...prev, city: 0 }))
    }
  }, [selectedCountry])

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState)
      setFormData(prev => ({ ...prev, city: 0 }))
    }
  }, [selectedState])

  // Close skill dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowSkillDropdown(false)
    if (showSkillDropdown) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showSkillDropdown])

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

  const fetchCountries = async () => {
    try {
      const countriesData = await apiService.getCountries()
      setCountries(countriesData)
    } catch (err) {
      console.error('Failed to fetch countries:', err)
    }
  }

  const fetchStates = async (countryId: number) => {
    try {
      setLoadingStates(true)
      const statesData = await apiService.getStates(countryId)
      setStates(statesData)
    } catch (err) {
      console.error('Failed to fetch states:', err)
      setStates([])
    } finally {
      setLoadingStates(false)
    }
  }

  const fetchCities = async (stateId: number) => {
    try {
      setLoadingCities(true)
      const citiesData = await apiService.getCities(stateId)
      setCities(citiesData)
    } catch (err) {
      console.error('Failed to fetch cities:', err)
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  const handleInputChange = (field: keyof JobCreateData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handleSkillSelect = (skill: Skill) => {
    if (!selectedSkills.find(s => s.id === skill.id)) {
      const updatedSkills = [...selectedSkills, skill]
      setSelectedSkills(updatedSkills)
      setFormData(prev => ({
        ...prev,
        skills: updatedSkills.map(s => s.id)
      }))
    }
    setSkillSearchTerm('')
    setShowSkillDropdown(false)
  }

  const handleSkillRemove = (skillId: number) => {
    const updatedSkills = selectedSkills.filter(s => s.id !== skillId)
    setSelectedSkills(updatedSkills)
    setFormData(prev => ({
      ...prev,
      skills: updatedSkills.map(s => s.id)
    }))
  }

  const filteredSkills = availableSkills.filter(skill =>
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) &&
    !selectedSkills.find(s => s.id === skill.id)
  )

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
    if (!formData.city || formData.city === 0) {
      setError('Please select a city')
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
          salary_max: '',
          skills: []
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
      salary_max: '',
      skills: []
    })
    // Reset address selection
    setSelectedCountry(null)
    setSelectedState(null)
    setStates([])
    setCities([])
    // Reset skills selection
    setSelectedSkills([])
    setAvailableSkills([])
    setSkillSearchTerm('')
    setShowSkillDropdown(false)
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

            {/* Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country */}
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <div className="relative">
                  <select
                    id="country"
                    value={selectedCountry || ''}
                    onChange={(e) => setSelectedCountry(Number(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white text-black"
                    disabled={isLoading}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                <div className="relative">
                  <select
                    id="state"
                    value={selectedState || ''}
                    onChange={(e) => setSelectedState(Number(e.target.value) || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white text-black"
                    disabled={isLoading || loadingStates || !selectedCountry}
                  >
                    <option value="">
                      {loadingStates ? 'Loading...' : selectedCountry ? 'Select State' : 'Select Country First'}
                    </option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <div className="relative">
                  <select
                    id="city"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm appearance-none bg-white text-black"
                    disabled={isLoading || loadingCities || !selectedState}
                  >
                    <option value="">
                      {loadingCities ? 'Loading...' : selectedState ? 'Select City' : 'Select State First'}
                    </option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
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

            {/* Skills Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={skillSearchTerm}
                  onChange={(e) => {
                    setSkillSearchTerm(e.target.value)
                    setShowSkillDropdown(true)
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  placeholder="Search and select skills..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-black"
                  disabled={isLoading}
                />

                {/* Skills Dropdown */}
                {showSkillDropdown && filteredSkills.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSkills.slice(0, 10).map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => handleSkillSelect(skill)}
                        className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm text-black"
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
                      >
                        {skill.name}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(skill.id)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                          disabled={isLoading}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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