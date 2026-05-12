import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { SCALE_OPTIONS, createCriterion } from '@/lib/configure'
import type { Criterion } from '@/types'

export function CriteriaStep({
  criteria,
  onChange,
}: {
  criteria: Criterion[]
  onChange: (next: Criterion[]) => void
}) {
  const update = (id: string, patch: Partial<Criterion>) => {
    onChange(criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  const remove = (id: string) => {
    onChange(criteria.filter((c) => c.id !== id))
  }
  const add = () => {
    onChange([...criteria, createCriterion()])
  }

  return (
    <div className="space-y-3">
      {criteria.map((criterion) => (
        <div
          key={criterion.id}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
            <div className="space-y-1.5">
              <Label htmlFor={`name-${criterion.id}`}>Name</Label>
              <Input
                id={`name-${criterion.id}`}
                value={criterion.name}
                onChange={(e) =>
                  update(criterion.id, { name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`scale-${criterion.id}`}>Scale</Label>
              <Select
                value={String(criterion.scale)}
                onValueChange={(v) =>
                  update(criterion.id, {
                    scale: Number(v) as Criterion['scale'],
                  })
                }
              >
                <SelectTrigger id={`scale-${criterion.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCALE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <Label htmlFor={`desc-${criterion.id}`}>Description</Label>
            <Textarea
              id={`desc-${criterion.id}`}
              rows={2}
              value={criterion.description}
              onChange={(e) =>
                update(criterion.id, { description: e.target.value })
              }
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove(criterion.id)}
              disabled={criteria.length === 1}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ))}
      <Button variant="outline" onClick={add} className="w-full">
        <Plus className="h-4 w-4" />
        Add criterion
      </Button>
    </div>
  )
}
