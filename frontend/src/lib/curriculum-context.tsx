'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { curriculumsApi } from './api/curriculums'
import type { Curriculum } from '@/types'

interface CurriculumContextType {
  curriculums: Curriculum[]
  selectedCurriculum: Curriculum | null
  setSelectedCurriculum: (curriculum: Curriculum) => void
  isLoading: boolean
}

const CurriculumContext = createContext<CurriculumContextType | undefined>(undefined)

export function CurriculumProvider({ children }: { children: ReactNode }) {
  const [curriculums, setCurriculums] = useState<Curriculum[]>([])
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCurriculums = async () => {
      try {
        const response = await curriculumsApi.getAll({ page: 0, size: 100 })
        setCurriculums(response.content)
        // Set the first curriculum as default
        if (response.content.length > 0) {
          setSelectedCurriculum(response.content[0])
        }
      } catch (error) {
        console.error('Failed to load curriculums:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCurriculums()
  }, [])

  return (
    <CurriculumContext.Provider
      value={{ curriculums, selectedCurriculum, setSelectedCurriculum, isLoading }}
    >
      {children}
    </CurriculumContext.Provider>
  )
}

export function useCurriculum() {
  const context = useContext(CurriculumContext)
  if (context === undefined) {
    throw new Error('useCurriculum must be used within a CurriculumProvider')
  }
  return context
}
