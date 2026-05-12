import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useAnnotators } from '@/context/AppContext'
import { initials, percent } from '@/lib/format'
import { cn } from '@/lib/utils'

const FILTERS = [
  'All',
  'Quality > 90%',
  'Completed similar projects',
  'Available now',
] as const

export function AnnotatorPoolStep({
  selectedIds,
  onChange,
}: {
  selectedIds: string[]
  onChange: (next: string[]) => void
}) {
  const annotators = useAnnotators()
  const selected = new Set(selectedIds)

  const toggle = (id: string) => {
    if (selected.has(id)) {
      onChange(selectedIds.filter((x) => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter, idx) => (
          <button
            key={filter}
            type="button"
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              idx === 0
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {annotators.map((annotator) => {
          const isSelected = selected.has(annotator.id)
          return (
            <button
              key={annotator.id}
              type="button"
              onClick={() => toggle(annotator.id)}
              className={cn(
                'group relative flex items-start gap-3 rounded-lg border bg-card p-3 text-left transition-all',
                isSelected
                  ? 'border-primary shadow-sm ring-2 ring-primary/30'
                  : 'border-border hover:border-foreground/30 hover:bg-muted/30 hover:shadow-sm',
              )}
              aria-pressed={isSelected}
            >
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback>{initials(annotator.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {annotator.name}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Quality {percent(annotator.qualityScore)}</span>
                  <span aria-hidden>·</span>
                  <span>{annotator.tasksCompleted} tasks</span>
                </div>
              </div>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggle(annotator.id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Assign ${annotator.name}`}
                className="mt-0.5"
              />
            </button>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {selected.size} of {annotators.length} annotators selected
        </span>
        <Badge variant="muted">
          {selected.size === 0
            ? 'No coverage'
            : selected.size < 3
              ? 'Limited coverage'
              : 'Good coverage'}
        </Badge>
      </div>
    </div>
  )
}
