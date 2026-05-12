import type {
  Criterion,
  Methodology,
  Project,
  QualityControls,
} from '@/types'

export type MethodologyKind = Methodology['kind']

export const DEFAULT_INSTRUCTIONS = `You will see a user prompt and two AI responses, labeled Response A and Response B. Read both carefully. Decide which response better answers the user's question while being helpful, accurate, and safe.

Take your time. Use the rating widget to express your judgment. If a task feels genuinely ambiguous — where both responses are equally good or equally bad — mark it as ambiguous so it can be reviewed.

If you see any unsafe content, flag it using the safety checkbox.

Aim for thoughtful, consistent judgments rather than speed.`

export const DEFAULT_CRITERIA: Criterion[] = [
  {
    id: 'c_helpfulness',
    name: 'Helpfulness',
    description:
      'Does the response actually address what the user asked, with useful information?',
    scale: 5,
  },
  {
    id: 'c_harmlessness',
    name: 'Harmlessness',
    description:
      'Is the response free of unsafe, biased, or potentially harmful content?',
    scale: 5,
  },
  {
    id: 'c_factuality',
    name: 'Factuality',
    description: 'Are the claims in the response accurate and well-grounded?',
    scale: 5,
  },
  {
    id: 'c_instruction_following',
    name: 'Instruction-following',
    description:
      'Does the response follow the format, constraints, and tone the user requested?',
    scale: 5,
  },
]

export type ConfigDraft = {
  methodologyKind: MethodologyKind
  criteria: Criterion[]
  instructions: string
  includeWorkedExamples: boolean
  qualityControls: QualityControls
  annotatorPoolIds: string[]
}

export function methodologyToDraft(m: Methodology): {
  kind: MethodologyKind
  criteria: Criterion[]
} {
  if (m.kind === 'multi_criteria') {
    return { kind: 'multi_criteria', criteria: m.criteria }
  }
  return { kind: m.kind, criteria: DEFAULT_CRITERIA }
}

export function draftToMethodology(d: ConfigDraft): Methodology {
  if (d.methodologyKind === 'multi_criteria') {
    return { kind: 'multi_criteria', criteria: d.criteria }
  }
  return { kind: d.methodologyKind }
}

export function projectToDraft(project: Project): ConfigDraft {
  const { kind, criteria } = methodologyToDraft(project.methodology)
  return {
    methodologyKind: kind,
    criteria,
    instructions: project.instructions || DEFAULT_INSTRUCTIONS,
    includeWorkedExamples: false,
    qualityControls: project.qualityControls,
    annotatorPoolIds: project.annotatorPoolIds,
  }
}

export function methodologyTitle(kind: MethodologyKind): string {
  switch (kind) {
    case 'binary':
      return 'Binary preference'
    case 'margin':
      return 'Margin-graded preference'
    case 'multi_criteria':
      return 'Multi-criteria scoring'
  }
}

export const SCALE_OPTIONS: { value: Criterion['scale']; label: string }[] = [
  { value: 3, label: '1-3 (low / medium / high)' },
  { value: 5, label: '1-5 (Likert)' },
  { value: 7, label: '1-7 (extended Likert)' },
]

export function estimateCostPerAnnotation(d: ConfigDraft) {
  const base = 0.3
  const perCriterion =
    d.methodologyKind === 'multi_criteria' ? d.criteria.length * 0.1 : 0
  return base + perCriterion
}

export function createCriterion(): Criterion {
  return {
    id: `c_${crypto.randomUUID().slice(0, 8)}`,
    name: 'New criterion',
    description: '',
    scale: 5,
  }
}

export const MARGIN_LABELS = [
  'A significantly better',
  'A better',
  'A slightly better',
  'Tie / unsure',
  'B slightly better',
  'B better',
  'B significantly better',
] as const

export const PREVIEW_PROMPT =
  'Explain how transformers work to a high school student.'

export const PREVIEW_RESPONSE_A =
  "Transformers are a class of neural network built around a mechanism called self-attention. For every token in a sequence the model computes weighted relationships to every other token, which lets it build context-aware representations in parallel. Stacking these attention layers with feed-forward blocks lets the network capture long-range dependencies without recurrence."

export const PREVIEW_RESPONSE_B =
  "Imagine reading a sentence. Instead of going strictly left to right, a transformer can look at every word at once and figure out which other words matter most for understanding each one. It does that by paying attention to relationships between words, then uses those relationships to build a richer sense of what the sentence means."
