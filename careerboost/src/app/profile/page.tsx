'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { apiService, UserProfileResponse, UpdateProfileData, FileUpload, FileListResponse } from '@/services/api'
import { User, Mail, Phone, Calendar, Shield, Edit, Save, X, Eye, EyeOff, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { FileUpload as FileUploadComponent } from '@/components/ui/FileUpload'
import { useApiWithVerification } from '@/hooks/useApiWithVerification'

interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  phone: string
  status: string
  is_email_verified: boolean
  created_at: string
  updated_at: string
}

export default function ProfilePage() {
  const { isAuthenticated, user, isInitialized } = useAuthStore()
  const { callApi } = useApiWithVerification()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [editForm, setEditForm] = useState<UpdateProfileData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: '',
    phone: '',
    status: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resumeFile, setResumeFile] = useState<FileUpload | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<FileUpload | null>(null)
  const [documentsLoading, setDocumentsLoading] = useState(false)
  const [isResendingVerification, setIsResendingVerification] = useState(false)
  const [verificationMessage, setVerificationMessage] = useState('')

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response: UserProfileResponse = await apiService.getUserProfile()
      if (response.success) {
        setProfile(response.data)
        // Initialize edit form with current data
        setEditForm({
          username: response.data.username,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          role: response.data.role,
          phone: response.data.phone,
          status: response.data.status,
          password: ''
        })
      } else {
        setError(response.message || 'Failed to load profile data')
      }
    } catch (err: unknown) {
      // Special handling for email verification errors
      const error = err as { message?: string; status_code?: number }
      if (error?.message?.includes('Email verification required') || error?.status_code === 403) {
        // Create a minimal profile from user data for verification purposes
        if (user) {
          const minimalProfile: UserProfile = {
            id: parseInt(user.id),
            username: user.email.split('@')[0], // Fallback username
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            role: user.userType === 'talent' ? 'talent' : 'recruiter',
            phone: '', // Will be empty until they can update
            status: 'pending',
            is_email_verified: false,
            created_at: user.createdAt.toISOString(),
            updated_at: user.createdAt.toISOString()
          }
          setProfile(minimalProfile)
          setEditForm({
            username: minimalProfile.username,
            email: minimalProfile.email,
            first_name: minimalProfile.first_name,
            last_name: minimalProfile.last_name,
            role: minimalProfile.role,
            phone: minimalProfile.phone,
            status: minimalProfile.status,
            password: ''
          })
          setError(null) // Clear error since we have fallback data
        } else {
          setError('Please verify your email to access full profile features')
        }
      } else {
        setError('Failed to load profile data')
        console.error('Profile fetch error:', error)
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchDocuments = useCallback(async () => {
    if (!user || user.userType !== 'talent') return

    try {
      setDocumentsLoading(true)
      const response: FileListResponse = await apiService.getUploadedFiles(undefined, 1, 20)

      const resume = response.results.find(file => file.type === 'resume')
      const coverLetter = response.results.find(file => file.type === 'cover_letter')

      setResumeFile(resume || null)
      setCoverLetterFile(coverLetter || null)
    } catch (err: unknown) {
      // Silently handle verification errors for documents
      const error = err as { message?: string; status_code?: number }
      if (error?.message?.includes('Email verification required') || error?.status_code === 403) {
        // Don't show error, just leave documents empty
        setResumeFile(null)
        setCoverLetterFile(null)
      } else {
        console.error('Failed to fetch documents:', error)
      }
    } finally {
      setDocumentsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login')
      return
    }

    fetchProfile()
    fetchDocuments()
  }, [isInitialized, isAuthenticated, router, fetchProfile, fetchDocuments])

  const handleResumeUpload = (file: FileUpload) => {
    setResumeFile(file)
  }

  const handleCoverLetterUpload = (file: FileUpload) => {
    setCoverLetterFile(file)
  }

  const handleResumeDelete = () => {
    setResumeFile(null)
  }

  const handleCoverLetterDelete = () => {
    setCoverLetterFile(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!editForm.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!editForm.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!editForm.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!editForm.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!editForm.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (editForm.password && editForm.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      await callApi(
        async () => {
          // Use PUT for complete update
          const updateData = { ...editForm }
          if (!updateData.password) {
            delete updateData.password // Don't send empty password
          }

          const response = await apiService.updateProfilePut(updateData as UpdateProfileData)

          if (response.success) {
            setProfile(response.data)
            setIsEditing(false)
            setEditForm(prev => ({ ...prev, password: '' })) // Clear password field
            setError(null)
          } else {
            setError(response.message || 'Failed to update profile')
          }

          return response
        },
        'update your profile',
        (errorMessage) => {
          setError(errorMessage)
        }
      )
    } catch (err) {
      // Error already handled by callApi
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      // Reset form to original values
      setEditForm({
        username: profile.username,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        role: profile.role,
        phone: profile.phone,
        status: profile.status,
        password: ''
      })
    }
    setIsEditing(false)
    setErrors({})
  }

  const handleResendVerification = async () => {
    if (!profile?.email) return

    setIsResendingVerification(true)
    setVerificationMessage('')

    try {
      await apiService.resendVerificationEmail(profile.email)
      // Redirect to OTP input page after successful resend
      router.push(`/verify-email?email=${encodeURIComponent(profile.email)}`)
    } catch {
      setVerificationMessage('Failed to send verification email. Please try again.')
      setTimeout(() => setVerificationMessage(''), 5000)
    } finally {
      setIsResendingVerification(false)
    }
  }

  const handleVerifyEmail = () => {
    if (profile?.email) {
      router.push(`/verify-email?email=${encodeURIComponent(profile.email)}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">{error || 'Profile not found'}</div>
              <Button onClick={fetchProfile}>Try Again</Button>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
              <p className="text-gray-600">Manage your account information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
              {/* Profile Overview Card */}
              <div className="lg:col-span-1">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-2xl font-bold">
                          {profile.first_name?.charAt(0)?.toUpperCase()}{profile.last_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profile.first_name} {profile.last_name}
                      </h2>
                      <p className="text-gray-600 mb-2">@{profile.username}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile.status)}`}>
                        {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Unknown'}
                      </span>
                      <div className="mt-4">
                        {!isEditing ? (
                          <>
                            <Button
                              className="w-full"
                              onClick={() => setIsEditing(true)}
                              disabled={!profile.is_email_verified}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Profile
                            </Button>
                            {!profile.is_email_verified && (
                              <p className="text-xs text-gray-500 text-center mt-2">
                                Verify your email to edit profile
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2">
                            <Button
                              className="w-full"
                              onClick={handleSave}
                              loading={saving}
                              disabled={saving}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={handleCancel}
                              disabled={saving}
                            >
                              <X className="w-4 h-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Profile Details Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          First Name
                        </label>
                        {isEditing ? (
                          <Input
                            name="first_name"
                            value={editForm.first_name}
                            onChange={handleInputChange}
                            error={errors.first_name}
                          />
                        ) : (
                          <div className="text-gray-900">{profile.first_name}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Last Name
                        </label>
                        {isEditing ? (
                          <Input
                            name="last_name"
                            value={editForm.last_name}
                            onChange={handleInputChange}
                            error={errors.last_name}
                          />
                        ) : (
                          <div className="text-gray-900">{profile.last_name}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Username
                        </label>
                        {isEditing ? (
                          <Input
                            name="username"
                            value={editForm.username}
                            onChange={handleInputChange}
                            error={errors.username}
                          />
                        ) : (
                          <div className="text-gray-900">{profile.username}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          <Mail className="w-4 h-4 inline mr-1" />
                          Email
                        </label>
                        {isEditing ? (
                          <Input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleInputChange}
                            error={errors.email}
                          />
                        ) : (
                          <div className="text-gray-900">{profile.email}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          <Phone className="w-4 h-4 inline mr-1" />
                          Phone
                        </label>
                        {isEditing ? (
                          <Input
                            type="tel"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleInputChange}
                            error={errors.phone}
                          />
                        ) : (
                          <div className="text-gray-900">{profile.phone}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          <Shield className="w-4 h-4 inline mr-1" />
                          Role
                        </label>
                        {isEditing ? (
                          <select
                            name="role"
                            value={editForm.role}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="talent">Talent</option>
                            <option value="recruiter">Recruiter</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <div className="text-gray-900 capitalize">{profile.role}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Status
                        </label>
                        {isEditing ? (
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <div className="text-gray-900 capitalize">{profile.status}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          User ID
                        </label>
                        <div className="text-gray-900">#{profile.id}</div>
                      </div>

                      {isEditing && (
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-1 block">
                            New Password (optional)
                          </label>
                          <div className="relative">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              value={editForm.password}
                              onChange={handleInputChange}
                              placeholder="Enter new password (leave empty to keep current)"
                              error={errors.password}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Email Verification Card */}
                <Card className="mt-6" id="verify-email">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="w-5 h-5 mr-2" />
                      Email Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {profile.is_email_verified ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {profile.is_email_verified ? 'Email Verified' : 'Email Not Verified'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {profile.is_email_verified
                                ? 'Your email address has been verified and you can access all features.'
                                : 'Please verify your email address to access all features like applying to jobs and creating job posts.'
                              }
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Email: <span className="font-medium">{profile.email}</span>
                            </p>
                          </div>
                        </div>

                        {!profile.is_email_verified && (
                          <div className="mt-4 flex flex-col sm:flex-row gap-3">
                            {/* For pending users, only show resend option since OTP would have expired */}
                            {profile.status === 'pending' ? (
                              <Button
                                variant="outline"
                                onClick={handleResendVerification}
                                loading={isResendingVerification}
                                disabled={isResendingVerification}
                              >
                                Resend Verification Email
                              </Button>
                            ) : (
                              <>
                                <Button
                                  onClick={handleVerifyEmail}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Verify Email Now
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={handleResendVerification}
                                  loading={isResendingVerification}
                                  disabled={isResendingVerification}
                                >
                                  Resend Verification Email
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {verificationMessage && (
                          <div className={`mt-3 p-3 rounded-lg text-sm ${
                            verificationMessage.includes('Failed')
                              ? 'bg-red-50 border border-red-200 text-red-700'
                              : 'bg-green-50 border border-green-200 text-green-700'
                          }`}>
                            {verificationMessage}
                          </div>
                        )}

                        {!profile.is_email_verified && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <div className="text-xs text-yellow-700">
                                <p className="font-medium mb-1">Verification Required</p>
                                <p>Until you verify your email, you won&apos;t be able to:</p>
                                <ul className="list-disc list-inside mt-1 space-y-0.5">
                                  <li>Apply to job postings</li>
                                  <li>Create job posts (for recruiters)</li>
                                  <li>Update your profile information</li>
                                  <li>Upload documents</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Account Information Card */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Account Created
                        </label>
                        <div className="text-gray-900">{formatDate(profile.created_at)}</div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          Last Updated
                        </label>
                        <div className="text-gray-900">{formatDate(profile.updated_at)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Documents Section - Only for Talent Users */}
                {user?.userType === 'talent' && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {!profile.is_email_verified && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                            <div>
                              <p className="text-sm font-medium text-yellow-800">Email Verification Required</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Please verify your email address to upload and manage documents.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {documentsLoading ? (
                        <div className="flex items-center justify-center h-32">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : profile.is_email_verified ? (
                        <div className="space-y-6">
                          {/* Resume Upload */}
                          <div className="w-full">
                            <FileUploadComponent
                              type="resume"
                              title="Resume / CV"
                              description="Upload your resume or curriculum vitae"
                              acceptedTypes={['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                              maxSizeInMB={10}
                              userId={profile.id}
                              existingFile={resumeFile || undefined}
                              onUploadSuccess={handleResumeUpload}
                              onDeleteSuccess={handleResumeDelete}
                            />
                          </div>

                          {/* Cover Letter Upload */}
                          <div className="w-full">
                            <FileUploadComponent
                              type="cover_letter"
                              title="Cover Letter"
                              description="Upload your cover letter"
                              acceptedTypes={['.pdf', '.doc', '.docx', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                              maxSizeInMB={10}
                              userId={profile.id}
                              existingFile={coverLetterFile || undefined}
                              onUploadSuccess={handleCoverLetterUpload}
                              onDeleteSuccess={handleCoverLetterDelete}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Document uploads are disabled</p>
                          <p className="text-sm text-gray-500">Please verify your email to upload documents</p>
                        </div>
                      )}

                      <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2 md:space-x-3">
                          <FileText className="w-4 h-4 md:w-5 md:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs md:text-sm">
                            <p className="font-medium text-blue-900 mb-1">Document Tips:</p>
                            <ul className="text-blue-700 space-y-0.5 md:space-y-1">
                              <li>• Keep your resume updated with latest experience and skills</li>
                              <li>• Tailor your cover letter for specific job applications</li>
                              <li>• Supported formats: PDF, DOC, DOCX (up to 10MB each)</li>
                              <li>• You can replace documents anytime by uploading new ones</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}