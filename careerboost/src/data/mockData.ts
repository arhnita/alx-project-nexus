import { Job, JobSeeker, Recruiter, Application, Interview } from '@/types'
import { v4 as uuidv4 } from 'uuid'

// Mock Companies
const companies = [
  'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Tesla', 'Uber',
  'Airbnb', 'Spotify', 'Stripe', 'Shopify', 'Twitter', 'LinkedIn', 'Adobe'
]

// Mock Skills
const skills = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'AWS',
  'Docker', 'Kubernetes', 'GraphQL', 'MongoDB', 'PostgreSQL', 'Redux',
  'Next.js', 'Vue.js', 'Angular', 'Spring Boot', 'Django', 'Flask', 'Git'
]

// Mock Locations
const locations = [
  'San Francisco, CA', 'New York, NY', 'Seattle, WA', 'Austin, TX', 'Los Angeles, CA',
  'Boston, MA', 'Chicago, IL', 'Denver, CO', 'Atlanta, GA', 'Remote'
]

// Generate Mock Jobs
export const generateMockJobs = (count: number = 20): Job[] => {
  const jobs: Job[] = []

  for (let i = 0; i < count; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)]
    const location = locations[Math.floor(Math.random() * locations.length)]
    const jobSkills = skills.slice(0, Math.floor(Math.random() * 5) + 2)
    const types: Job['type'][] = ['full-time', 'part-time', 'contract', 'internship']

    jobs.push({
      id: uuidv4(),
      title: generateJobTitle(),
      company,
      location,
      type: types[Math.floor(Math.random() * types.length)],
      salary: Math.random() > 0.3 ? {
        min: Math.floor(Math.random() * 50000) + 50000,
        max: Math.floor(Math.random() * 100000) + 100000,
        currency: 'USD'
      } : undefined,
      description: generateJobDescription(),
      requirements: generateRequirements(),
      skills: jobSkills,
      postedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
      isActive: Math.random() > 0.1,
      recruiterId: uuidv4(),
      applicationsCount: Math.floor(Math.random() * 100),
      viewsCount: Math.floor(Math.random() * 500) + 50,
      tags: ['Remote Friendly', 'Health Benefits', 'Equity', 'Flexible Hours'].slice(0, Math.floor(Math.random() * 3) + 1)
    })
  }

  return jobs
}

// Generate Mock Talent
export const generateMockJobSeeker = (): JobSeeker => {
  const userSkills = skills.slice(0, Math.floor(Math.random() * 8) + 3)

  return {
    id: uuidv4(),
    email: 'talent@example.com',
    firstName: 'John',
    lastName: 'Doe',
    userType: 'talent',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date(),
    skills: userSkills,
    experience: Math.floor(Math.random() * 10) + 1,
    location: 'San Francisco, CA',
    bio: 'Passionate full-stack developer with experience in modern web technologies. Love building scalable applications and working with innovative teams.',
    skillScore: 85,
    profileViews: 127,
    profileViewsGrowth: 15,
    applications: generateMockApplications(23),
    interviews: generateMockInterviews(4)
  }
}

// Generate Mock Recruiter
export const generateMockRecruiter = (): Recruiter => {
  return {
    id: uuidv4(),
    email: 'recruiter@example.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    userType: 'recruiter',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a64c9e?w=100&h=100&fit=crop&crop=face',
    createdAt: new Date(),
    company: 'Tech Corp',
    position: 'Senior Technical Recruiter',
    location: 'San Francisco, CA',
    bio: 'Experienced technical recruiter specializing in full-stack and DevOps roles. Passionate about connecting great talent with innovative companies.',
    jobPostings: generateMockJobs(12),
    hiresPerMonth: 7,
    hiresGoal: 10
  }
}

// Generate Mock Applications
const generateMockApplications = (count: number): Application[] => {
  const applications: Application[] = []
  const statuses: Application['status'][] = ['applied', 'reviewed', 'interview', 'rejected', 'accepted']

  for (let i = 0; i < count; i++) {
    applications.push({
      id: uuidv4(),
      jobId: uuidv4(),
      jobSeekerId: uuidv4(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      appliedDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
      notes: Math.random() > 0.7 ? 'Great fit for the role, strong technical background' : undefined
    })
  }

  return applications
}

// Generate Mock Interviews
const generateMockInterviews = (count: number): Interview[] => {
  const interviews: Interview[] = []
  const types: Interview['type'][] = ['phone', 'video', 'in-person']
  const statuses: Interview['status'][] = ['scheduled', 'completed', 'cancelled']

  for (let i = 0; i < count; i++) {
    interviews.push({
      id: uuidv4(),
      applicationId: uuidv4(),
      jobSeekerId: uuidv4(),
      recruiterId: uuidv4(),
      scheduledDate: new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
      type: types[Math.floor(Math.random() * types.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)]
    })
  }

  return interviews
}

// Helper Functions
const generateJobTitle = (): string => {
  const levels = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal']
  const roles = [
    'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'DevOps Engineer', 'Data Scientist', 'Product Manager', 'UX Designer', 'Mobile Developer'
  ]

  const level = Math.random() > 0.3 ? levels[Math.floor(Math.random() * levels.length)] + ' ' : ''
  const role = roles[Math.floor(Math.random() * roles.length)]

  return level + role
}

const generateJobDescription = (): string => {
  return `We are looking for a talented professional to join our growing team. You will be responsible for developing and maintaining high-quality applications, collaborating with cross-functional teams, and contributing to our technical architecture. This is an excellent opportunity to work with cutting-edge technologies and make a significant impact.`
}

const generateRequirements = (): string[] => {
  const requirements = [
    'Bachelor\'s degree in Computer Science or related field',
    '3+ years of professional experience',
    'Strong problem-solving skills',
    'Experience with agile development methodologies',
    'Excellent communication skills',
    'Experience with version control systems',
    'Knowledge of software testing principles'
  ]

  return requirements.slice(0, Math.floor(Math.random() * 4) + 3)
}

// Export mock data
export const mockJobs = generateMockJobs()
export const mockJobSeeker = generateMockJobSeeker()
export const mockRecruiter = generateMockRecruiter()