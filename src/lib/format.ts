import type { Methodology, Project } from '@/types'

export function methodologyLabel(m: Methodology): string {
  switch (m.kind) {
    case 'binary':
      return 'Binary preference'
    case 'margin':
      return 'Margin-graded'
    case 'multi_criteria':
      return `Multi-criteria (${m.criteria.length} dims)`
  }
}

const STATUS_COPY: Record<Project['status'], string> = {
  draft: 'Draft',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

export function statusLabel(s: Project['status']) {
  return STATUS_COPY[s]
}

export function statusVariant(
  s: Project['status'],
): 'success' | 'muted' | 'warning' | 'info' {
  switch (s) {
    case 'active':
      return 'success'
    case 'draft':
      return 'muted'
    case 'paused':
      return 'warning'
    case 'completed':
      return 'info'
  }
}

function hashString(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function deterministicAgreement(projectId: string) {
  const h = hashString(projectId)
  const span = 0.95 - 0.65
  return 0.65 + ((h % 1000) / 1000) * span
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function percent(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`
}
