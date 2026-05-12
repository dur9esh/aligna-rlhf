export type Methodology =
  | { kind: 'binary' }
  | { kind: 'margin' }
  | { kind: 'multi_criteria'; criteria: Criterion[] }

export type Criterion = {
  id: string
  name: string
  description: string
  scale: 1 | 3 | 5 | 7
}

export type QualityControls = {
  annotatorsPerItem: number
  goldTaskInjectionRate: number
  minAgreementThreshold: number
  maxTimePerTaskSeconds: number
}

export type Project = {
  id: string
  name: string
  customer: string
  description: string
  methodology: Methodology
  qualityControls: QualityControls
  instructions: string
  status: 'draft' | 'active' | 'paused' | 'completed'
  annotatorPoolIds: string[]
  createdAt: string
}

export type Task = {
  id: string
  projectId: string
  prompt: string
  responseA: string
  responseB: string
  status: 'pending' | 'in_progress' | 'completed'
  isGoldTask: boolean
  goldAnswer?: AnnotationValue
}

export type AnnotationValue =
  | { kind: 'binary'; choice: 'A' | 'B' | 'tie' | 'cant_judge' }
  | {
      kind: 'margin'
      choice:
        | 'A_significantly'
        | 'A_better'
        | 'A_slightly'
        | 'tie'
        | 'B_slightly'
        | 'B_better'
        | 'B_significantly'
    }
  | {
      kind: 'multi_criteria'
      scores: Record<string, number>
      overallChoice?: 'A' | 'B' | 'tie'
    }

export type Annotation = {
  id: string
  taskId: string
  annotatorId: string
  value: AnnotationValue
  justification?: string
  flaggedAmbiguous: boolean
  flaggedUnsafe: boolean
  timeSpentSeconds: number
  submittedAt: string
}

export type Annotator = {
  id: string
  name: string
  qualityScore: number
  tasksCompleted: number
  agreementRate: number
  qualifiedProjectIds: string[]
}
