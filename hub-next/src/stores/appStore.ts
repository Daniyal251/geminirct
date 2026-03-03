'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  // Навигация
  currentPage: string
  currentProject: string | null
  currentSubProject: string | null
  
  // Данные
  projects: any[]
  tasks: any[]
  staff: any[]
  partners: any[]
  
  // UI
  sidebarCollapsed: boolean
  aiChatOpen: boolean
  
  // Actions
  setCurrentPage: (page: string) => void
  setCurrentProject: (project: string | null) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleAIChat: () => void
  loadData: (data: any) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial state
      currentPage: 'projects',
      currentProject: null,
      currentSubProject: null,
      projects: [],
      tasks: [],
      staff: [],
      partners: [],
      sidebarCollapsed: false,
      aiChatOpen: false,

      // Actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setCurrentProject: (project) => set({ currentProject: project }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleAIChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),
      loadData: (data) => set(data),
    }),
    {
      name: 'rkt-hub-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        currentProject: state.currentProject,
      }),
    }
  )
)
