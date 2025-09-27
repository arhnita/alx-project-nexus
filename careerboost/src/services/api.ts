const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://connect-hire.onrender.com'

export interface SignupData {
  username: string
  email: string
  first_name: string
  last_name: string
  role: 'talent' | 'recruiter'
  phone: string
  password: string
  password_confirm: string
}

export interface SignupResponse {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  role: string
  phone: string
  avatar?: string
  created_at: string
  message?: string
}

export interface LoginData {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  message: string
  data: {
    refresh: string
    access: string
    user: {
      id: number
      username: string
      email: string
      first_name: string
      last_name: string
      role: string
      phone: string
      status: string
      created_at: string
      updated_at: string
    }
  }
  status_code: number
}

export interface RefreshTokenData {
  refresh: string
}

export interface UserProfileResponse {
  success: boolean
  message: string
  data: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    role: string
    phone: string
    status: string
    created_at: string
    updated_at: string
  }
  status_code: number
}

export interface UpdateProfileData {
  username: string
  email: string
  first_name: string
  last_name: string
  role: string
  password?: string
  phone: string
  status: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface Skill {
  id: number
  name: string
  category?: string
  description?: string
}

export interface UserSkill {
  id: number
  user: number
  skill: string
  level?: string
  experience_years?: number
  created_at?: string
}

export type SkillsResponse = PaginatedResponse<Skill>

export interface UserSkillsResponse {
  success: boolean
  message: string
  data: UserSkill[]
  status_code: number
}

export interface AddSkillData {
  skill_id: number
  level?: string
  experience_years?: number
}

export interface AddMultipleSkillsData {
  skills: number[]
}

export interface DeleteSkillData {
  skills: number[]
}

export interface Job {
  id: number
  title: string
  description: string
  company: number
  company_name: string
  company_description: string
  physical_address: {
    city: string
    state: string
    street: string
    country: string
    zip_code: string
  }
  city: number
  city_name: string
  salary_min: string
  salary_max: string
  date_posted: string
  close_date: string
  updated_at: string
  categories: string[]
  is_promoted: boolean
  promotion_priority: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export type JobsResponse = PaginatedResponse<Job>

export interface FeedItem {
  id: number
  event_type: 'job_posted' | 'company_joined' | 'promotion_active'
  created_at: string
  score: string
  payload: {
    type: string
    job?: {
      id: number
      title: string
      company_name: string
      location: string | null
      date_posted: string
      salary_range?: string
    }
    company?: {
      id: number
      name: string
      industry?: string
    }
    promotion?: {
      id: number
      title: string
      description: string
      priority: number
    }
  }
}

export interface FeedResponse {
  results: FeedItem[]
  next_cursor: string | null
}

export interface FileUpload {
  id?: number
  file_path: string
  name: string
  thumbnail?: string
  content_type: string
  object_id: number
  type: 'resume' | 'cover_letter'
  created_at?: string
  updated_at?: string
}

export interface FileUploadResponse {
  success: boolean
  message: string
  data: FileUpload
  status_code: number
}

export type FileListResponse = PaginatedResponse<FileUpload>

export interface JobApplicationData {
  job: number
  user: number
  cover_letter: string
}

export interface JobApplication {
  job: number
  user: number
  status: string
  date_applied: string
  cover_letter: string
  updated_at: string
}

export interface JobApplicationResponse {
  success: boolean
  message: string
  data: JobApplication
  status_code: number
}

export type JobApplicationListResponse = PaginatedResponse<JobApplication>

export interface JobCreateData {
  title: string
  description: string
  company: number
  physical_address: string
  city: number
  salary_min: string
  salary_max: string
}

export interface JobCreateResponse {
  success: boolean
  message: string
  data: Job
  status_code: number
}

export interface Company {
  id: number
  name: string
  description: string
  contact_details: string
  website: string
  status: boolean
  created_at: string
  updated_at: string
}

export type CompaniesResponse = PaginatedResponse<Company>

export interface CompanyCreateData {
  name: string
  description: string
  contact_details: string
  website: string
}

export interface CompanyUpdateData {
  name: string
  description: string
  contact_details: string
  website: string
}

export interface CompanyResponse {
  success: boolean
  message: string
  data: Company
  status_code: number
}

export interface Notification {
  id: number
  event_type: string
  title: string
  body: string
  data: Record<string, unknown>
  status: string
  channels: number
  created_at: string
  read_at: string | null
}

export interface NotificationResponse {
  results: Notification[]
  page: number
  page_size: number
}

export interface UnreadCountResponse {
  count: number
}


class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      ...options,
    }

    // Debug logging
    console.log('Request details:', {
      url,
      method: config.method,
      headers: config.headers,
      body: config.body
    })

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        // Handle 401 unauthorized errors specifically
        if (response.status === 401) {
          // Clear tokens from localStorage
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')

          // Redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }

          throw new ApiError('Session expired. Please log in again.')
        }

        console.error('API Error:', {
          status: response.status,
          url,
          data,
          response
        })

        throw new ApiError(data.message || `HTTP ${response.status}: ${response.statusText}`, data.errors || data.data?.errors)
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error occurred')
    }
  }

  async signup(signupData: SignupData): Promise<SignupResponse> {
    return this.request<SignupResponse>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(signupData),
    })
  }

  async login(loginData: LoginData): Promise<LoginResponse> {
    return this.request<LoginResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
  }

  async refreshToken(refreshData: RefreshTokenData): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/api/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify(refreshData),
    })
  }

  async logout(refreshData: RefreshTokenData) {
    return this.request('/api/auth/logout/', {
      method: 'POST',
      body: JSON.stringify(refreshData),
    })
  }

  async logoutAll(refreshData: RefreshTokenData) {
    return this.request('/api/auth/logout-all/', {
      method: 'POST',
      body: JSON.stringify(refreshData),
    })
  }

  async getUserProfile(): Promise<UserProfileResponse> {
    const accessToken = localStorage.getItem('access_token')
    return this.request<UserProfileResponse>('/api/users/profile/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async updateProfilePatch(data: Partial<UpdateProfileData>): Promise<UserProfileResponse> {
    const accessToken = localStorage.getItem('access_token')
    return this.request<UserProfileResponse>('/api/users/profile/', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    })
  }

  async updateProfilePut(data: UpdateProfileData): Promise<UserProfileResponse> {
    const accessToken = localStorage.getItem('access_token')
    return this.request<UserProfileResponse>('/api/users/profile/', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    })
  }

  async getAllSkills(page?: number): Promise<SkillsResponse> {
    const accessToken = localStorage.getItem('access_token')
    let url = '/api/skills/'

    if (page) {
      url += `?page=${page}`
    }

    return this.request<SkillsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async getUserSkills(page?: number, pageSize?: number): Promise<UserSkillsResponse> {
    const accessToken = localStorage.getItem('access_token')
    let url = '/api/skills/user/'

    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (pageSize) params.append('page_size', pageSize.toString())

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return this.request<UserSkillsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async addUserSkill(data: AddSkillData): Promise<UserSkillsResponse> {
    const accessToken = localStorage.getItem('access_token')
    return this.request<UserSkillsResponse>('/api/skills/users/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    })
  }

  async addMultipleUserSkills(data: AddMultipleSkillsData): Promise<UserSkillsResponse> {
    const accessToken = localStorage.getItem('access_token')

    // Create headers object explicitly
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('Authorization', `Bearer ${accessToken}`)

    return this.request<UserSkillsResponse>('/api/skills/user/', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
  }

  async deleteUserSkill(data: DeleteSkillData): Promise<{ success: boolean; message: string }> {
    const accessToken = localStorage.getItem('access_token')

    // Create headers object explicitly
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set('Accept', 'application/json')
    headers.set('Authorization', `Bearer ${accessToken}`)

    return this.request<{ success: boolean; message: string }>('/api/skills/user/delete/', {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    })
  }

  async getJobs(page?: number, pageSize?: number, search?: string): Promise<JobsResponse> {
    const accessToken = localStorage.getItem('access_token')
    let url = '/api/jobs/'
    const params = new URLSearchParams()

    if (page) params.append('page', page.toString())
    if (pageSize) params.append('page_size', pageSize.toString())
    if (search) params.append('search', search)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return this.request<JobsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async getFeed(cursor?: string, limit?: number, types?: string[]): Promise<FeedResponse> {
    const accessToken = localStorage.getItem('access_token')
    let url = '/api/feed/'
    const params = new URLSearchParams()

    if (cursor) params.append('cursor', cursor)
    if (limit) params.append('limit', limit.toString())
    if (types && types.length > 0) {
      types.forEach(type => params.append('types', type))
    }

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return this.request<FeedResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async uploadFile(file: File, type: 'resume' | 'cover_letter', userId: number, name?: string): Promise<FileUploadResponse> {
    const accessToken = localStorage.getItem('access_token')

    // Generate filename with extension
    const fileName = name || file.name // Keep original name with extension

    // Generate thumbnail for image and PDF files
    let thumbnailBlob: Blob | null = null
    if (file.type.startsWith('image/')) {
      const thumbnailDataUrl = await this.generateImageThumbnail(file)
      thumbnailBlob = this.dataUrlToBlob(thumbnailDataUrl)
    } else if (file.type === 'application/pdf') {
      const thumbnailDataUrl = await this.generatePDFThumbnail()
      thumbnailBlob = this.dataUrlToBlob(thumbnailDataUrl)
    } else {
      const thumbnailDataUrl = this.generateGenericThumbnail(file.type)
      thumbnailBlob = this.dataUrlToBlob(thumbnailDataUrl)
    }

    // Use FormData for file upload
    const formData = new FormData()
    formData.append('file_path', file) // Binary file
    formData.append('name', fileName) // Name WITH extension
    formData.append('type', type)
    if (thumbnailBlob) {
      formData.append('thumbnail', thumbnailBlob, 'thumbnail.jpg') // Optional binary thumbnail
    }
    // Remove content_type as it expects a model reference, not MIME type
    formData.append('object_id', userId.toString())

    const url = `${this.baseUrl}/api/uploads/`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
        // Don't set Content-Type for FormData - browser will set it with boundary
      },
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle 401 unauthorized errors specifically
      if (response.status === 401) {
        // Clear tokens from localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        throw new ApiError('Session expired. Please log in again.')
      }

      console.error('Upload API Error:', {
        status: response.status,
        url,
        data,
        response
      })

      throw new ApiError(data.message || `HTTP ${response.status}: ${response.statusText}`, data.errors || data.data?.errors)
    }

    return data
  }

  private generateImageThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        // Set thumbnail dimensions (e.g., 150x150)
        const maxSize = 150
        let { width, height } = img

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw the image on canvas
        ctx?.drawImage(img, 0, 0, width, height)

        // Convert to base64
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnailDataUrl)
      }

      img.onerror = () => {
        reject(new Error('Failed to generate thumbnail'))
      }

      // Create object URL for the image
      img.src = URL.createObjectURL(file)
    })
  }

  private async generatePDFThumbnail(): Promise<string> {
    try {
      // For now, generate a simple PDF icon thumbnail
      // In production, you'd want to use PDF.js to render the first page
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      canvas.width = 150
      canvas.height = 150

      if (ctx) {
        // Draw PDF icon background
        ctx.fillStyle = '#dc2626'
        ctx.fillRect(0, 0, 150, 150)

        // Draw PDF text
        ctx.fillStyle = 'white'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('PDF', 75, 85)

        // Draw file icon outline
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 3
        ctx.strokeRect(25, 25, 100, 100)
      }

      return canvas.toDataURL('image/jpeg', 0.8)
    } catch {
      return this.generateGenericThumbnail('application/pdf')
    }
  }

  private generateGenericThumbnail(mimeType: string): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    canvas.width = 150
    canvas.height = 150

    if (ctx) {
      // Draw generic file icon
      ctx.fillStyle = '#6b7280'
      ctx.fillRect(0, 0, 150, 150)

      // Draw file extension or type
      ctx.fillStyle = 'white'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'

      const extension = mimeType.split('/')[1]?.toUpperCase() || 'FILE'
      ctx.fillText(extension, 75, 85)

      // Draw file icon outline
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 2
      ctx.strokeRect(25, 25, 100, 100)
    }

    return canvas.toDataURL('image/jpeg', 0.8)
  }

  private dataUrlToBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new Blob([u8arr], { type: mime })
  }



  async getUploadedFiles(type?: 'resume' | 'cover_letter', page?: number, pageSize?: number): Promise<FileListResponse> {
    const accessToken = localStorage.getItem('access_token')
    let url = '/api/uploads/'
    const params = new URLSearchParams()

    if (type) params.append('type', type)
    if (page) params.append('page', page.toString())
    if (pageSize) params.append('page_size', pageSize.toString())

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    return this.request<FileListResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async deleteUploadedFile(fileId: number): Promise<{ success: boolean; message: string }> {
    const accessToken = localStorage.getItem('access_token')

    return this.request<{ success: boolean; message: string }>(`/api/uploads/${fileId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async checkUserFiles(): Promise<{ hasResume: boolean }> {
    const files = await this.getUploadedFiles()

    const resumeFile = files.results.find(file => file.type === 'resume')

    return {
      hasResume: !!resumeFile
    }
  }

  async applyToJob(data: JobApplicationData): Promise<JobApplicationResponse> {
    const accessToken = localStorage.getItem('access_token')

    const url = `${this.baseUrl}/api/applications/`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
    })

    const responseData = await response.json()

    if (!response.ok) {
      // Handle 401 unauthorized errors specifically
      if (response.status === 401) {
        // Clear tokens from localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        throw new ApiError('Session expired. Please log in again.')
      }

      console.error('Job Application API Error:', {
        status: response.status,
        url,
        data: responseData,
        response
      })

      throw new ApiError(responseData.message || `HTTP ${response.status}: ${response.statusText}`, responseData.errors || responseData.data?.errors)
    }

    return responseData
  }

  async getUserApplications(page = 1, pageSize = 10): Promise<JobApplicationListResponse> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/applications/?page=${page}&page_size=${pageSize}`

    return this.request<JobApplicationListResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async getApplicationsCount(): Promise<{ count: number }> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/applications/?page=1&page_size=1`

    const response = await this.request<JobApplicationListResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    return { count: response.count }
  }

  async createJob(data: JobCreateData): Promise<JobCreateResponse> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/jobs/`

    return this.request<JobCreateResponse>(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }

  async getRecruiterJobs(page = 1, pageSize = 10): Promise<JobsResponse> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/jobs/?page=${page}&page_size=${pageSize}`

    return this.request<JobsResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async getCompanies(page = 1, pageSize = 50): Promise<CompaniesResponse> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/companies/?page=${page}&page_size=${pageSize}`

    return this.request<CompaniesResponse>(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async createCompany(data: CompanyCreateData): Promise<CompanyResponse> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/companies/`

    return this.request<CompanyResponse>(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }

  async updateCompany(companyId: number, data: CompanyUpdateData): Promise<CompanyResponse> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/companies/${companyId}/`

    return this.request<CompanyResponse>(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  }

  async deleteCompany(companyId: number): Promise<{ success: boolean; message: string }> {
    const accessToken = localStorage.getItem('access_token')
    const url = `/api/companies/${companyId}/`

    return this.request<{ success: boolean; message: string }>(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async getNotifications(): Promise<NotificationResponse> {
    const accessToken = localStorage.getItem('access_token')

    return this.request<NotificationResponse>('/api/notifications/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async getUnreadCount(): Promise<UnreadCountResponse> {
    const accessToken = localStorage.getItem('access_token')

    return this.request<UnreadCountResponse>('/api/notifications/unread_count/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
  }

  async markNotificationsAsRead(notificationIds: number[]): Promise<{ success: boolean; message: string }> {
    const accessToken = localStorage.getItem('access_token')

    return this.request<{ success: boolean; message: string }>('/api/notifications/mark-read/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ notification_ids: notificationIds })
    })
  }
}

export class ApiError extends Error {
  public errors?: Record<string, string[]>

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message)
    this.name = 'ApiError'
    this.errors = errors
  }
}

export const apiService = new ApiService(API_BASE_URL)