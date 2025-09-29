export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  userType: 'talent' | 'recruiter'
  status: string
  avatar?: string
  createdAt: Date
}

export interface JobSeeker extends User {
  userType: 'talent'
  skills: string[]
  experience: number
  location: string
  bio?: string
  resume?: string
  skillScore: number
  profileViews: number
  profileViewsGrowth: number
  applications: Application[]
  interviews: Interview[]
}

export interface Recruiter extends User {
  userType: 'recruiter'
  company: string
  position: string
  location: string
  bio?: string
  jobPostings: Job[]
  hiresPerMonth: number
  hiresGoal: number
}

export interface Job {
  id: string
  title: string
  company: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'internship'
  salary?: {
    min: number
    max: number
    currency: string
  }
  description: string
  requirements: string[]
  skills: string[]
  postedDate: Date
  expiryDate?: Date
  isActive: boolean
  recruiterId: string
  applicationsCount: number
  viewsCount: number
  tags: string[]
}

export interface Application {
  id: string
  jobId: string
  jobSeekerId: string
  status: 'applied' | 'reviewed' | 'interview' | 'rejected' | 'accepted'
  appliedDate: Date
  notes?: string
  job?: Job
}

export interface Interview {
  id: string
  applicationId: string
  jobSeekerId: string
  recruiterId: string
  scheduledDate: Date
  type: 'phone' | 'video' | 'in-person'
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  job?: Job
}

export interface Notification {
  id: string
  userId: string
  type: 'application' | 'interview' | 'message' | 'job_match'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
  data?: Record<string, unknown>
}

export interface DashboardStats {
  jobSeeker: {
    totalApplications: number
    applicationGrowth: number
    scheduledInterviews: number
    nextInterview?: Interview
    profileViews: number
    profileViewsGrowth: number
    skillScore: number
    isAboveAverage: boolean
  }
  recruiter: {
    activeJobs: number
    expiringJobs: number
    totalApplications: number
    applicationGrowth: number
    scheduledInterviews: number
    todayInterviews: Interview[]
    hiresThisMonth: number
    hiresGoal: number
  }
}