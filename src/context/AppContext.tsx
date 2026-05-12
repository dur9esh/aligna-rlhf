import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { seed } from '@/data/seed'
import type { Annotation, Annotator, Project, Task } from '@/types'

type AppContextValue = {
  projects: Project[]
  tasks: Task[]
  annotators: Annotator[]
  annotations: Annotation[]
  currentAnnotatorId: string
  setCurrentAnnotatorId: (id: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentAnnotatorId, setCurrentAnnotatorId] = useState<string>(
    seed.annotators[0].id,
  )

  const value = useMemo<AppContextValue>(
    () => ({
      projects: seed.projects,
      tasks: seed.tasks,
      annotators: seed.annotators,
      annotations: seed.annotations,
      currentAnnotatorId,
      setCurrentAnnotatorId,
    }),
    [currentAnnotatorId],
  )
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider')
  }
  return ctx
}

export function useProjects() {
  return useAppContext().projects
}

export function useProject(id: string | undefined) {
  const { projects } = useAppContext()
  return projects.find((p) => p.id === id)
}

export function useTasksByProject(projectId: string) {
  const { tasks } = useAppContext()
  return tasks.filter((t) => t.projectId === projectId)
}

export function useTask(taskId: string | undefined) {
  const { tasks } = useAppContext()
  return tasks.find((t) => t.id === taskId)
}

export function useAnnotators() {
  return useAppContext().annotators
}

export function useAnnotations(taskId: string) {
  const { annotations } = useAppContext()
  return annotations.filter((a) => a.taskId === taskId)
}

export function useCurrentAnnotator() {
  const { annotators, currentAnnotatorId } = useAppContext()
  const found = annotators.find((a) => a.id === currentAnnotatorId)
  if (!found) {
    throw new Error('Current annotator not found in annotator pool')
  }
  return found
}

export function useSetCurrentAnnotator() {
  return useAppContext().setCurrentAnnotatorId
}
