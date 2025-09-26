import { create } from 'zustand'
import { apiService, JobApplicationData, ApiError } from '@/services/api'

interface JobApplicationState {
  isLoading: boolean
  error: string | null
  showApplicationModal: boolean
  currentJobId: number | null
  coverLetter: string
  showSuccess: boolean
  appliedJobs: Set<number>
  applyToJob: (jobId: number, userId: number, coverLetter: string) => Promise<void>
  setShowApplicationModal: (show: boolean) => void
  setCoverLetter: (coverLetter: string) => void
  clearError: () => void
  checkAndApply: (jobId: number, userId: number) => Promise<void>
  loadAppliedJobs: () => Promise<void>
  isJobApplied: (jobId: number) => boolean
}

export const useJobApplicationStore = create<JobApplicationState>((set, get) => ({
  isLoading: false,
  error: null,
  showApplicationModal: false,
  currentJobId: null,
  coverLetter: '',
  showSuccess: false,
  appliedJobs: new Set(),

  applyToJob: async (jobId: number, userId: number, coverLetter: string) => {
    set({ isLoading: true, error: null })

    try {
      const applicationData: JobApplicationData = {
        job: jobId,
        user: userId,
        cover_letter: coverLetter
      }

      await apiService.applyToJob(applicationData)

      // Add job to applied jobs set
      const { appliedJobs } = get()
      const newAppliedJobs = new Set(appliedJobs)
      newAppliedJobs.add(jobId)

      set({
        isLoading: false,
        error: null,
        showSuccess: true,
        appliedJobs: newAppliedJobs
      })

      // Hide success message after 3 seconds and close modal
      setTimeout(() => {
        set({
          showApplicationModal: false,
          currentJobId: null,
          coverLetter: '',
          showSuccess: false
        })
      }, 3000)

    } catch (error) {
      const errorMessage = error instanceof ApiError ? error.message : 'Failed to apply to job'
      set({
        isLoading: false,
        error: errorMessage
      })
    }
  },

  checkAndApply: async (jobId: number, _userId: number) => {
    // Check if user has resume first
    const fileCheck = await apiService.checkUserFiles()

    if (!fileCheck.hasResume) {
      // Show modal to upload resume first
      set({
        showApplicationModal: true,
        currentJobId: jobId,
        error: 'Please upload your resume before applying to jobs.'
      })
      return
    }

    // If resume exists, show application modal for cover letter
    set({
      showApplicationModal: true,
      currentJobId: jobId,
      coverLetter: 'Dear Hiring Manager,\n\nI am excited about this opportunity and believe my skills and experience make me a strong candidate for this position.\n\nSincerely,\n[Your Name]'
    })
  },

  setShowApplicationModal: (show: boolean) => {
    set({ showApplicationModal: show })
    if (!show) {
      set({ currentJobId: null, coverLetter: '', error: null, showSuccess: false })
    }
  },

  setCoverLetter: (coverLetter: string) => {
    set({ coverLetter })
  },

  clearError: () => {
    set({ error: null })
  },

  loadAppliedJobs: async () => {
    try {
      const response = await apiService.getUserApplications(1, 100) // Get all applications
      const appliedJobIds = response.results.map(app => app.job)
      set({ appliedJobs: new Set(appliedJobIds) })
    } catch (error) {
      console.error('Failed to load applied jobs:', error)
    }
  },

  isJobApplied: (jobId: number) => {
    const { appliedJobs } = get()
    return appliedJobs.has(jobId)
  }
}))