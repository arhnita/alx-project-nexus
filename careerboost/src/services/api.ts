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
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(data.message || 'An error occurred', data.errors)
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
    return this.request<SignupResponse>('/api/users/', {
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