import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  MARGIN_LABELS,
  PREVIEW_PROMPT,
  PREVIEW_RESPONSE_A,
  PREVIEW_RESPONSE_B,
  methodologyTitle,
  type ConfigDraft,
  type MethodologyKind,
} from '@/lib/configure'
import { cn } from '@/lib/utils'
import type { Criterion } from '@/types'

export function LivePreview({ draft }: { draft: ConfigDraft }) {
  const [override, setOverride] = useState<MethodologyKind | null>(null)
  const activeKind: MethodologyKind = override ?? draft.methodologyKind
  const isOverridden = override !== null && override !== draft.methodologyKind

  return (
    <div className="rounded-lg border border-border bg-muted/30">
      <div className="border-b border-border px-5 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Live preview
            </h2>
            <p className="text-xs text-muted-foreground">Annotator view</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          <PreviewChip
            label="Binary"
            kind="binary"
            activeKind={activeKind}
            configKind={draft.methodologyKind}
            onClick={() =>
              setOverride(
                draft.methodologyKind === 'binary' ? null : 'binary',
              )
            }
          />
          <PreviewChip
            label="Margin"
            kind="margin"
            activeKind={activeKind}
            configKind={draft.methodologyKind}
            onClick={() =>
              setOverride(
                draft.methodologyKind === 'margin' ? null : 'margin',
              )
            }
          />
          <PreviewChip
            label="Multi-criteria"
            kind="multi_criteria"
            activeKind={activeKind}
            configKind={draft.methodologyKind}
            onClick={() =>
              setOverride(
                draft.methodologyKind === 'multi_criteria'
                  ? null
                  : 'multi_criteria',
              )
            }
          />
        </div>
        <div className="mt-3 h-4 text-[11px] text-muted-foreground">
          {isOverridden ? (
            <span>
              Previewing: {methodologyTitle(activeKind)} (config is{' '}
              {methodologyTitle(draft.methodologyKind)})
            </span>
          ) : null}
        </div>
      </div>

      <div className="px-5 py-5">
        <PreviewBody draft={draft} activeKind={activeKind} />
      </div>
    </div>
  )
}

function PreviewChip({
  label,
  kind,
  activeKind,
  configKind,
  onClick,
}: {
  label: string
  kind: MethodologyKind
  activeKind: MethodologyKind
  configKind: MethodologyKind
  onClick: () => void
}) {
  const isActive = activeKind === kind
  const isConfig = configKind === kind
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        isActive
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      {isConfig && (
        <span
          className={cn(
            'ml-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle',
            isActive ? 'bg-primary-foreground/80' : 'bg-primary',
          )}
          aria-label="Saved methodology"
        />
      )}
    </button>
  )
}

function PreviewBody({
  draft,
  activeKind,
}: {
  draft: ConfigDraft
  activeKind: MethodologyKind
}) {
  const [fadeKey, setFadeKey] = useState(activeKind)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (fadeKey === activeKind) return
    setVisible(false)
    const t = window.setTimeout(() => {
      setFadeKey(activeKind)
      setVisible(true)
    }, 120)
    return () => window.clearTimeout(t)
  }, [activeKind, fadeKey])

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          User prompt
        </div>
        <p className="mt-1 text-sm leading-relaxed text-foreground">
          {PREVIEW_PROMPT}
        </p>
      </div>

      <div className="grid gap-3">
        <ResponseCard label="Response A" body={PREVIEW_RESPONSE_A} />
        <ResponseCard label="Response B" body={PREVIEW_RESPONSE_B} />
      </div>

      <div
        className={cn(
          'transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        <RatingWidget kind={fadeKey} criteria={draft.criteria} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preview-justification" className="text-xs">
          Justification (optional)
        </Label>
        <Textarea
          id="preview-justification"
          rows={2}
          placeholder="Briefly explain your choice..."
          className="text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <label className="flex items-center gap-2">
          <Checkbox aria-label="Mark ambiguous" />
          <span>Mark ambiguous</span>
        </label>
        <label className="flex items-center gap-2">
          <Checkbox aria-label="Contains unsafe content" />
          <span>Contains unsafe content</span>
        </label>
      </div>

      <Button disabled className="w-full">
        Submit &amp; next
      </Button>
    </div>
  )
}

function ResponseCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  )
}

function RatingWidget({
  kind,
  criteria,
}: {
  kind: MethodologyKind
  criteria: Criterion[]
}) {
  if (kind === 'binary') return <BinaryWidget />
  if (kind === 'margin') return <MarginWidget />
  return <MultiCriteriaWidget criteria={criteria} />
}

function BinaryWidget() {
  const options = ['A is better', 'B is better', 'Tie', "Can't judge"]
  return (
    <div>
      <div className="text-xs font-medium text-foreground">Your judgment</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className="rounded-md border border-border bg-background px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-primary/5"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

function MarginWidget() {
  return (
    <div>
      <div className="text-xs font-medium text-foreground">
        Strength of preference
      </div>
      <div className="mt-2 grid grid-cols-7 gap-1">
        {MARGIN_LABELS.map((label, i) => (
          <button
            key={label}
            type="button"
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-md border border-border bg-background px-1 py-2 text-[10px] leading-tight text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-foreground',
            )}
          >
            <span
              className={cn(
                'h-1.5 w-full rounded-full',
                i === 3
                  ? 'bg-muted-foreground/30'
                  : i < 3
                    ? 'bg-primary/30'
                    : 'bg-primary/30',
              )}
            />
            <span className="text-center">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function MultiCriteriaWidget({ criteria }: { criteria: Criterion[] }) {
  return (
    <div className="space-y-4">
      <div className="text-xs font-medium text-foreground">
        Score each criterion
      </div>
      {criteria.map((criterion) => (
        <div key={criterion.id} className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-medium text-foreground">
              {criterion.name}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Scale 1–{criterion.scale}
            </span>
          </div>
          <CriterionRow label="Response A" scale={criterion.scale} />
          <CriterionRow label="Response B" scale={criterion.scale} />
        </div>
      ))}
    </div>
  )
}

function CriterionRow({ label, scale }: { label: string; scale: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 text-[11px] text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {Array.from({ length: scale }).map((_, i) => (
          <button
            key={i}
            type="button"
            className="h-7 flex-1 rounded border border-border bg-background text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:bg-primary/5 hover:text-foreground"
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
