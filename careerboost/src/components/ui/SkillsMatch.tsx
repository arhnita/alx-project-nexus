'use client'

import { useState, useEffect, useCallback } from 'react'
import { Target } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSkillsStore } from '@/store/skillsStore'
import { apiService, Job } from '@/services/api'

interface SkillsMatchProps {
  jobId?: number
  jobSkills?: any[]
  className?: string
  showIcon?: boolean
}

export function SkillsMatch({ jobId, jobSkills, className = '', showIcon = true }: SkillsMatchProps) {
  const { user } = useAuthStore()
  const { userSkills, fetchUserSkills } = useSkillsStore()
  const [skillsMatch, setSkillsMatch] = useState<number | null>(null)

  // Calculate skills match percentage
  const calculateSkillsMatch = useCallback((skills: any[]) => {
    if (!skills || skills.length === 0 || userSkills.length === 0) {
      return 0
    }

    const userSkillNames = userSkills.map(skill => skill.skill)

    // Get skill names from the job skills to match with user skill names
    const matchingSkills = skills.filter(jobSkill =>
      userSkillNames.includes(jobSkill.name)
    )

    return Math.round((matchingSkills.length / skills.length) * 100)
  }, [userSkills])

  useEffect(() => {
    const fetchAndCalculateMatch = async () => {
      if (user?.userType !== 'talent') return

      // Only work with directly provided job skills for now
      if (!jobSkills || jobSkills.length === 0) return

      // Ensure user skills are loaded
      if (userSkills.length === 0) {
        try {
          await fetchUserSkills()
        } catch (error) {
          console.error('Failed to fetch user skills:', error)
          return
        }
      }

      // Calculate skills match
      const match = calculateSkillsMatch(jobSkills)
      setSkillsMatch(match)
    }

    fetchAndCalculateMatch()
  }, [jobSkills, userSkills, calculateSkillsMatch, fetchUserSkills, user?.userType])

  // Don't show for non-talent users
  if (user?.userType !== 'talent') return null

  // Don't show if no skills provided or no match calculated yet
  if (!jobSkills || jobSkills.length === 0 || skillsMatch === null) return null

  const getMatchColor = (match: number) => {
    if (match >= 80) return 'text-green-600'
    if (match >= 60) return 'text-yellow-600'
    if (match >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className={`text-xs flex items-center ${getMatchColor(skillsMatch)} ${className}`}>
      {showIcon && <Target className="w-3 h-3 mr-1" />}
      Skills Match: {skillsMatch}%
    </div>
  )
}