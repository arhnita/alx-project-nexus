'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { FileUpload } from '@/components/ui/FileUpload'
import { useJobApplicationStore } from '@/store/jobApplicationStore'
import { useAuthStore } from '@/store/authStore'
import { Send, FileText, Briefcase, CheckCircle } from 'lucide-react'

export function JobApplicationModal() {
  const { user } = useAuthStore()
  const {
    showApplicationModal,
    currentJobId,
    isLoading,
    error,
    coverLetter,
    showSuccess,
    setShowApplicationModal,
    setCoverLetter,
    applyToJob,
    clearError
  } = useJobApplicationStore()

  const [needsResume, setNeedsResume] = useState(false)

  useEffect(() => {
    if (showApplicationModal) {
      clearError()
      // Check if error indicates missing resume
      setNeedsResume(error?.includes('resume') || false)
    }
  }, [showApplicationModal, error, clearError])

  const handleSubmit = async () => {
    if (!user || !currentJobId || !coverLetter.trim()) return

    await applyToJob(currentJobId, parseInt(user.id), coverLetter.trim())
  }

  const handleResumeUpload = () => {
    setNeedsResume(false)
    clearError()
  }

  if (!showApplicationModal) return null

  return (
    <Modal
      isOpen={showApplicationModal}
      onClose={() => setShowApplicationModal(false)}
      title="Apply to Job"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {showSuccess ? (
          <>
            {/* Success Message */}
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Application Submitted Successfully!
              </h3>
              <p className="text-gray-600">
                Your job application has been sent to the employer. We&apos;ll notify you of any updates.
              </p>
              <div className="mt-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Closing in 3 seconds...</p>
              </div>
            </div>
          </>
        ) : needsResume ? (
          <>
            {/* Resume Upload Section */}
            <div className="text-center">
              <FileText className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resume Required
              </h3>
              <p className="text-gray-600">
                Please upload your resume before applying to jobs. Your resume will be automatically attached to all applications.
              </p>
            </div>

            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <FileUpload
                type="resume"
                title="Upload Resume"
                description="Upload your resume (PDF, DOC, DOCX)"
                acceptedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                maxSizeInMB={5}
                userId={parseInt(user?.id || '0')}
                onUploadSuccess={handleResumeUpload}
              />
            </div>
          </>
        ) : (
          <>
            {/* Cover Letter Section */}
            <div className="text-center">
              <Briefcase className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Write Your Cover Letter
              </h3>
              <p className="text-gray-600">
                Personalize your application with a cover letter to stand out to employers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter *
                </label>
                <textarea
                  id="coverLetter"
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  placeholder="Write your cover letter here..."
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm text-black"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {coverLetter.length} characters
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowApplicationModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!coverLetter.trim() || isLoading}
                loading={isLoading}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Applying...' : 'Submit Application'}
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}