import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { AnnotationValue, Criterion, Methodology } from '@/types'

const BINARY_OPTIONS: { value: 'A' | 'B' | 'tie' | 'cant_judge'; label: string }[] =
  [
    { value: 'A', label: 'A is better' },
    { value: 'B', label: 'B is better' },
    { value: 'tie', label: 'Tie' },
    { value: 'cant_judge', label: "Can't judge" },
  ]

const MARGIN_OPTIONS: {
  value:
    | 'A_significantly'
    | 'A_better'
    | 'A_slightly'
    | 'tie'
    | 'B_slightly'
    | 'B_better'
    | 'B_significantly'
  label: string
}[] = [
  { value: 'A_significantly', label: 'A significantly better' },
  { value: 'A_better', label: 'A better' },
  { value: 'A_slightly', label: 'A slightly better' },
  { value: 'tie', label: 'Tie / unsure' },
  { value: 'B_slightly', label: 'B slightly better' },
  { value: 'B_better', label: 'B better' },
  { value: 'B_significantly', label: 'B significantly better' },
]

export function RatingWidget({
  methodology,
  value,
  onChange,
}: {
  methodology: Methodology
  value: AnnotationValue | null
  onChange: (next: AnnotationValue) => void
}) {
  if (methodology.kind === 'binary') {
    const current = value?.kind === 'binary' ? value.choice : null
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {BINARY_OPTIONS.map((option) => {
          const isActive = current === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                onChange({ kind: 'binary', choice: option.value })
              }
              className={cn(
                'rounded-md border px-4 py-3 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-foreground hover:border-foreground/30 hover:bg-muted/40',
              )}
              aria-pressed={isActive}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    )
  }

  if (methodology.kind === 'margin') {
    const current = value?.kind === 'margin' ? value.choice : null
    return (
      <div className="grid grid-cols-7 gap-1.5">
        {MARGIN_OPTIONS.map((option, i) => {
          const isActive = current === option.value
          const isCenter = i === 3
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ kind: 'margin', choice: option.value })}
              className={cn(
                'flex h-full flex-col items-center gap-2 rounded-md border px-1.5 py-3 text-[11px] leading-tight transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground',
              )}
              aria-pressed={isActive}
            >
              <span
                className={cn(
                  'h-1.5 w-full rounded-full',
                  isActive
                    ? 'bg-primary'
                    : isCenter
                      ? 'bg-muted-foreground/30'
                      : 'bg-primary/25',
                )}
              />
              <span className="text-center">{option.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <MultiCriteriaWidget
      criteria={methodology.criteria}
      value={value?.kind === 'multi_criteria' ? value : null}
      onChange={onChange}
    />
  )
}

function MultiCriteriaWidget({
  criteria,
  value,
  onChange,
}: {
  criteria: Criterion[]
  value: Extract<AnnotationValue, { kind: 'multi_criteria' }> | null
  onChange: (next: AnnotationValue) => void
}) {
  const scores = value?.scores ?? {}
  const overall = value?.overallChoice

  const setScore = (criterionId: string, score: number) => {
    onChange({
      kind: 'multi_criteria',
      scores: { ...scores, [criterionId]: score },
      overallChoice: overall,
    })
  }

  const setOverall = (next: 'A' | 'B' | 'tie' | undefined) => {
    onChange({
      kind: 'multi_criteria',
      scores,
      overallChoice: next,
    })
  }

  return (
    <div className="space-y-6">
      {criteria.map((criterion) => (
        <div key={criterion.id} className="space-y-3">
          <div>
            <div className="text-sm font-medium text-foreground">
              {criterion.name}
            </div>
            {criterion.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {criterion.description}
              </p>
            )}
          </div>
          <CriterionRow
            label="Response A"
            scale={criterion.scale}
            value={scores[`${criterion.id}__A`]}
            onChange={(score) => setScore(`${criterion.id}__A`, score)}
          />
          <CriterionRow
            label="Response B"
            scale={criterion.scale}
            value={scores[`${criterion.id}__B`]}
            onChange={(score) => setScore(`${criterion.id}__B`, score)}
          />
        </div>
      ))}

      <div className="rounded-md border border-border bg-muted/30 p-4">
        <div className="text-sm font-medium text-foreground">
          Overall (optional)
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          A single overall preference, if you have one. Otherwise skip.
        </p>
        <RadioGroup
          className="mt-3 grid-cols-4 gap-3 sm:flex sm:gap-6"
          value={overall ?? ''}
          onValueChange={(v) =>
            setOverall(
              v === 'A' || v === 'B' || v === 'tie'
                ? (v as 'A' | 'B' | 'tie')
                : undefined,
            )
          }
        >
          {[
            { value: 'A', label: 'A' },
            { value: 'B', label: 'B' },
            { value: 'tie', label: 'Tie' },
            { value: 'skip', label: 'Skip' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={opt.value}
                id={`overall-${opt.value}`}
                onClick={() => {
                  if (opt.value === 'skip') setOverall(undefined)
                }}
              />
              <Label htmlFor={`overall-${opt.value}`} className="font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
}

function CriterionRow({
  label,
  scale,
  value,
  onChange,
}: {
  label: string
  scale: number
  value: number | undefined
  onChange: (n: number) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="w-20 shrink-0 text-xs text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: scale }).map((_, i) => {
          const score = i + 1
          const isActive = value === score
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={cn(
                'h-9 flex-1 rounded-md border text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground',
              )}
              aria-pressed={isActive}
            >
              {score}
            </button>
          )
        })}
      </div>
    </div>
  )
}
