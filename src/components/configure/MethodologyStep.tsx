import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { MethodologyKind } from '@/lib/configure'

type Option = {
  kind: MethodologyKind | 'custom'
  title: string
  subtitle: string
  diagram: 'binary' | 'margin' | 'multi_criteria' | 'custom'
  disabled?: boolean
}

const OPTIONS: Option[] = [
  {
    kind: 'binary',
    title: 'Binary preference',
    subtitle: 'Annotator picks A or B. Anthropic HH-RLHF style.',
    diagram: 'binary',
  },
  {
    kind: 'margin',
    title: 'Margin-graded preference',
    subtitle: '4-level magnitude of preference. Meta Llama 2 style.',
    diagram: 'margin',
  },
  {
    kind: 'multi_criteria',
    title: 'Multi-criteria scoring',
    subtitle: 'Likert scale per dimension.',
    diagram: 'multi_criteria',
  },
  {
    kind: 'custom',
    title: 'Custom',
    subtitle: 'Bring your own annotation schema.',
    diagram: 'custom',
    disabled: true,
  },
]

export function MethodologyStep({
  value,
  onChange,
}: {
  value: MethodologyKind
  onChange: (next: MethodologyKind) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {OPTIONS.map((option) => {
        const isSelected =
          !option.disabled && option.kind === value
        return (
          <button
            key={option.kind}
            type="button"
            disabled={option.disabled}
            onClick={() => {
              if (!option.disabled && option.kind !== 'custom') {
                onChange(option.kind)
              }
            }}
            className={cn(
              'group relative flex h-full flex-col rounded-lg border bg-card p-4 text-left transition-colors',
              option.disabled
                ? 'cursor-not-allowed border-border opacity-70'
                : isSelected
                  ? 'border-primary ring-2 ring-primary/30'
                  : 'border-border hover:border-foreground/30 hover:bg-muted/40',
            )}
            aria-pressed={!option.disabled ? isSelected : undefined}
          >
            {option.disabled && (
              <Badge variant="muted" className="absolute right-3 top-3">
                Coming in V2
              </Badge>
            )}
            <div className="font-medium text-foreground">{option.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {option.subtitle}
            </div>
            <div className="mt-4 flex flex-1 items-end">
              <Diagram kind={option.diagram} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

function Diagram({ kind }: { kind: Option['diagram'] }) {
  switch (kind) {
    case 'binary':
      return (
        <div className="w-full space-y-1.5">
          <div className="h-3 rounded bg-muted" />
          <div className="h-3 rounded bg-muted" />
          <div className="mt-2 flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full border border-border bg-background"
              />
            ))}
          </div>
        </div>
      )
    case 'margin':
      return (
        <div className="w-full">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-2.5 flex-1 rounded-sm',
                  i === 3
                    ? 'bg-foreground/60'
                    : 'bg-muted',
                )}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <span>A</span>
            <span>B</span>
          </div>
        </div>
      )
    case 'multi_criteria':
      return (
        <div className="w-full space-y-1.5">
          {[0, 1, 2].map((row) => (
            <div key={row} className="flex items-center gap-1.5">
              <div className="h-1.5 w-10 rounded bg-muted" />
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      i <= row + 1 ? 'bg-foreground/50' : 'bg-muted',
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )
    case 'custom':
      return (
        <div className="grid w-full grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-2 rounded bg-muted/70" />
          ))}
        </div>
      )
  }
}
