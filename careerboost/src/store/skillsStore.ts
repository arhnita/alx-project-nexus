import { create } from 'zustand'
import { Skill, UserSkill, apiService, AddMultipleSkillsData, ApiError } from '@/services/api'

interface SkillsState {
  skills: Skill[]
  userSkills: UserSkill[]
  isLoading: boolean
  error: string | null
  skillsPage: number
  hasMoreSkills: boolean
  fetchSkills: (page?: number) => Promise<void>
  fetchAllSkills: () => Promise<void>
  fetchUserSkills: () => Promise<void>
  addSkillsToUser: (skillIds: number[]) => Promise<void>
  clearError: () => void
  setSkills: (skills: Skill[]) => void
}

export const useSkillsStore = create<SkillsState>((set, get) => ({
  skills: [],
  userSkills: [],
  isLoading: false,
  error: null,
  skillsPage: 1,
  hasMoreSkills: true,

  fetchSkills: async (page = 1) => {
    const { skills: currentSkills } = get()

    set({ isLoading: true, error: null })

    try {
      const response = await apiService.getAllSkills(page)

      const newSkills = page === 1 ? response.results : [...currentSkills, ...response.results]

      set({
        skills: newSkills,
        skillsPage: page,
        hasMoreSkills: !!response.next,
        isLoading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to fetch skills'

      set({
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  },

  fetchAllSkills: async () => {
    set({ isLoading: true, error: null })

    try {
      let allSkills: Skill[] = []
      let page = 1
      let hasMore = true

      while (hasMore) {
        const response = await apiService.getAllSkills(page)
        allSkills = [...allSkills, ...response.results]
        hasMore = !!response.next
        page++
      }

      set({
        skills: allSkills,
        skillsPage: 1,
        hasMoreSkills: false,
        isLoading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to fetch all skills'

      set({
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  },

  fetchUserSkills: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await apiService.getUserSkills()

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user skills')
      }

      set({
        userSkills: response.data,
        isLoading: false,
        error: null
      })
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to fetch user skills'

      set({
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  },

  addSkillsToUser: async (skillIds: number[]) => {
    set({ isLoading: true, error: null })

    try {
      const data: AddMultipleSkillsData = { skills: skillIds }
      await apiService.addMultipleUserSkills(data)

      // Refresh user skills after adding
      await get().fetchUserSkills()
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to add skills'

      set({
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },

  setSkills: (skills: Skill[]) => {
    set({ skills })
  }
}))