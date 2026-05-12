import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

export function InstructionsStep({
  instructions,
  onInstructionsChange,
  includeWorkedExamples,
  onIncludeWorkedExamplesChange,
}: {
  instructions: string
  onInstructionsChange: (next: string) => void
  includeWorkedExamples: boolean
  onIncludeWorkedExamplesChange: (next: boolean) => void
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="instructions">Markdown is supported</Label>
        <Textarea
          id="instructions"
          rows={10}
          value={instructions}
          onChange={(e) => onInstructionsChange(e.target.value)}
          className="font-mono text-sm leading-relaxed"
        />
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-foreground">
              Include worked examples
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Show 2–3 example annotations at the top of the queue so annotators
              calibrate before scoring real tasks.
            </p>
          </div>
          <Switch
            checked={includeWorkedExamples}
            onCheckedChange={onIncludeWorkedExamplesChange}
            aria-label="Include worked examples"
          />
        </div>

        {includeWorkedExamples && (
          <div className="mt-4 rounded-md border border-dashed border-border p-3">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Worked examples
            </div>
            <p className="mt-2 text-sm text-foreground">Example 1 placeholder</p>
            <p className="mt-1 text-xs text-muted-foreground">
              The example builder isn't built yet. Examples added here will appear
              at the top of the annotator queue.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
