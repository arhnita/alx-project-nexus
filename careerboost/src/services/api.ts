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
  job_id: number
  cover_letter?: string
  resume_id?: number
}

export interface JobApplicationResponse {
  success: boolean
  message: string
  data: {
    id: number
    job: number
    applicant: number
    cover_letter?: string
    resume?: number
    status: string
    applied_date: string
    created_at: string
    updated_at: string
  }
  status_code: number
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

    // Convert file to base64 since file_path might expect base64 content
    const fileBase64 = await this.fileToBase64(file)

    const uploadData = {
      file_path: fileBase64, // Base64 content of the file
      name: name || file.name.split('.')[0],
      thumbnail: '', // Optional thumbnail
      content_type: file.type,
      object_id: userId,
      type: type
    }

    return this.request<FileUploadResponse>('/api/uploads/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadData)
    })
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const result = reader.result as string
        // Return full data URL (includes data:application/pdf;base64,...)
        resolve(result)
      }
      reader.onerror = error => reject(error)
    })
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

  async applyToJob(data: JobApplicationData): Promise<JobApplicationResponse> {
    const accessToken = localStorage.getItem('access_token')

    return this.request<JobApplicationResponse>('/api/jobs/apply/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(data)
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