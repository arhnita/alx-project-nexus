'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useSkillsStore } from '@/store/skillsStore'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skill } from '@/services/api'
import { Plus, X, Search, Award, Calendar, TrendingUp, CheckCircle } from 'lucide-react'

export default function SkillsPage() {
  const { isAuthenticated, logout } = useAuthStore()
  const {
    skills,
    userSkills,
    isLoading,
    error,
    fetchSkills,
    fetchUserSkills,
    addSkillsToUser,
    clearError
  } = useSkillsStore()
  const router = useRouter()
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        fetchUserSkills(),
        fetchSkills(1)
      ])
    } catch (err) {
      console.error('Skills fetch error:', err)
    }
  }, [fetchUserSkills, fetchSkills])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    fetchData()

    // Listen for session expiration events
    const handleSessionExpired = () => {
      showToast('Session expired. Please log in again.', 'error')
      logout()
      router.push('/login')
    }

    window.addEventListener('sessionExpired', handleSessionExpired)
    return () => window.removeEventListener('sessionExpired', handleSessionExpired)
  }, [isAuthenticated, router, logout, fetchData])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setFilteredSkills(skills)
    } else {
      const filtered = skills.filter(skill =>
        skill.name.toLowerCase().includes(term.toLowerCase()) ||
        skill.category?.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredSkills(filtered)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  const handleBulkAddSkills = async () => {
    if (selectedSkills.length === 0) return

    try {
      await addSkillsToUser(selectedSkills)
      showToast(`Successfully added ${selectedSkills.length} skill${selectedSkills.length > 1 ? 's' : ''}!`, 'success')
      setShowBulkModal(false)
      setSelectedSkills([])
      setSearchTerm('')
    } catch (err) {
      showToast('Failed to add skills', 'error')
      console.error('Add skills error:', err)
    }
  }

  const toggleSkillSelection = (skillId: number) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getLevelColor = (level?: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-yellow-100 text-yellow-800'
      case 'intermediate':
        return 'bg-blue-100 text-blue-800'
      case 'advanced':
        return 'bg-green-100 text-green-800'
      case 'expert':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Update filtered skills when main skills change
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSkills(skills)
    } else {
      const filtered = skills.filter(skill =>
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSkills(filtered)
    }
  }, [skills, searchTerm])

  // Filter out skills that user already has
  const availableSkills = filteredSkills.filter(skill =>
    !userSkills.some(userSkill => userSkill.skill.id === skill.id)
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Skills</h1>
                  <p className="text-gray-600">Manage your professional skills and expertise</p>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={() => setShowBulkModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Multiple Skills
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-red-600">{error}</div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    clearError()
                    fetchData()
                  }}
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* User Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSkills.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h3>
                  <p className="text-gray-600 mb-4">Start building your professional profile by adding your skills</p>
                  <Button onClick={() => setShowBulkModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Skills
                  </Button>
                </div>
              ) : (
                userSkills.map((userSkill) => (
                  <Card key={userSkill.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{userSkill.skill.name}</h3>
                          {userSkill.skill.category && (
                            <p className="text-sm text-gray-600">{userSkill.skill.category}</p>
                          )}
                        </div>
                        {userSkill.level && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(userSkill.level)}`}>
                            {userSkill.level}
                          </span>
                        )}
                      </div>

                      <div className="space-y-2">
                        {userSkill.experience_years && (
                          <div className="flex items-center text-sm text-gray-600">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            {userSkill.experience_years} year{userSkill.experience_years !== 1 ? 's' : ''} experience
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Added {formatDate(userSkill.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Bulk Add Skills Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Add Multiple Skills</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedSkills.length} skill{selectedSkills.length !== 1 ? 's' : ''} selected
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowBulkModal(false)
                    setSelectedSkills([])
                    setSearchTerm('')
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Search Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Skills
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search for skills..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Available Skills Grid */}
              <div className="max-h-96 overflow-y-auto">
                {availableSkills.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {searchTerm ? 'No skills found matching your search' : 'No more skills available to add'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.id)
                      return (
                        <button
                          key={skill.id}
                          onClick={() => toggleSkillSelection(skill.id)}
                          className={`text-left p-3 border rounded-lg transition-colors relative ${
                            isSelected
                              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-blue-300'
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-600 absolute top-2 right-2" />
                          )}
                          <div className="font-medium text-gray-900 pr-8">{skill.name}</div>
                          {skill.category && (
                            <div className="text-sm text-gray-600">{skill.category}</div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowBulkModal(false)
                    setSelectedSkills([])
                    setSearchTerm('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkAddSkills}
                  disabled={selectedSkills.length === 0 || isLoading}
                  className="flex-1"
                >
                  Add {selectedSkills.length} Skill{selectedSkills.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}