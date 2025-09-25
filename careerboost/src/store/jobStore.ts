import { create } from 'zustand'
import { Job, Application } from '@/types'

interface JobState {
  jobs: Job[]
  filteredJobs: Job[]
  applications: Application[]
  searchQuery: string
  locationFilter: string
  typeFilter: string
  salaryRange: [number, number]
  skillsFilter: string[]

  // Actions
  setJobs: (jobs: Job[]) => void
  addJob: (job: Job) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  deleteJob: (id: string) => void

  // Applications
  addApplication: (application: Application) => void
  updateApplication: (id: string, updates: Partial<Application>) => void

  // Filters
  setSearchQuery: (query: string) => void
  setLocationFilter: (location: string) => void
  setTypeFilter: (type: string) => void
  setSalaryRange: (range: [number, number]) => void
  setSkillsFilter: (skills: string[]) => void
  applyFilters: () => void
  clearFilters: () => void
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  filteredJobs: [],
  applications: [],
  searchQuery: '',
  locationFilter: '',
  typeFilter: '',
  salaryRange: [0, 200000],
  skillsFilter: [],

  setJobs: (jobs) => {
    set({ jobs, filteredJobs: jobs })
  },

  addJob: (job) => {
    const { jobs } = get()
    const newJobs = [...jobs, job]
    set({ jobs: newJobs, filteredJobs: newJobs })
  },

  updateJob: (id, updates) => {
    const { jobs } = get()
    const updatedJobs = jobs.map(job =>
      job.id === id ? { ...job, ...updates } : job
    )
    set({ jobs: updatedJobs })
    get().applyFilters()
  },

  deleteJob: (id) => {
    const { jobs } = get()
    const filteredJobs = jobs.filter(job => job.id !== id)
    set({ jobs: filteredJobs, filteredJobs })
  },

  addApplication: (application) => {
    const { applications } = get()
    set({ applications: [...applications, application] })
  },

  updateApplication: (id, updates) => {
    const { applications } = get()
    const updatedApplications = applications.map(app =>
      app.id === id ? { ...app, ...updates } : app
    )
    set({ applications: updatedApplications })
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })
    get().applyFilters()
  },

  setLocationFilter: (location) => {
    set({ locationFilter: location })
    get().applyFilters()
  },

  setTypeFilter: (type) => {
    set({ typeFilter: type })
    get().applyFilters()
  },

  setSalaryRange: (range) => {
    set({ salaryRange: range })
    get().applyFilters()
  },

  setSkillsFilter: (skills) => {
    set({ skillsFilter: skills })
    get().applyFilters()
  },

  applyFilters: () => {
    const {
      jobs,
      searchQuery,
      locationFilter,
      typeFilter,
      salaryRange,
      skillsFilter
    } = get()

    let filtered = [...jobs]

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Location filter
    if (locationFilter) {
      filtered = filtered.filter(job =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    // Type filter
    if (typeFilter) {
      filtered = filtered.filter(job => job.type === typeFilter)
    }

    // Salary range filter
    if (salaryRange[0] > 0 || salaryRange[1] < 200000) {
      filtered = filtered.filter(job => {
        if (!job.salary) return true
        return job.salary.min >= salaryRange[0] && job.salary.max <= salaryRange[1]
      })
    }

    // Skills filter
    if (skillsFilter.length > 0) {
      filtered = filtered.filter(job =>
        skillsFilter.some(skill =>
          job.skills.some(jobSkill =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      )
    }

    set({ filteredJobs: filtered })
  },

  clearFilters: () => {
    const { jobs } = get()
    set({
      searchQuery: '',
      locationFilter: '',
      typeFilter: '',
      salaryRange: [0, 200000],
      skillsFilter: [],
      filteredJobs: jobs
    })
  }
}))