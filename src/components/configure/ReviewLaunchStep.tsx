import { Button } from '@/components/ui/button'
import {
  estimateCostPerAnnotation,
  methodologyTitle,
  type ConfigDraft,
} from '@/lib/configure'

export function ReviewLaunchStep({
  draft,
  onSaveDraft,
  onLaunch,
}: {
  draft: ConfigDraft
  onSaveDraft: () => void
  onLaunch: () => void
}) {
  const cost = estimateCostPerAnnotation(draft).toFixed(2)
  const rows: { label: string; value: string }[] = [
    { label: 'Methodology', value: methodologyTitle(draft.methodologyKind) },
  ]
  if (draft.methodologyKind === 'multi_criteria') {
    rows.push({
      label: 'Criteria',
      value: `${draft.criteria.length} ${
        draft.criteria.length === 1 ? 'dimension' : 'dimensions'
      }`,
    })
  }
  rows.push(
    {
      label: 'Annotators per item',
      value: String(draft.qualityControls.annotatorsPerItem),
    },
    {
      label: 'Annotator pool size',
      value: `${draft.annotatorPoolIds.length} ${
        draft.annotatorPoolIds.length === 1 ? 'annotator' : 'annotators'
      }`,
    },
    {
      label: 'Estimated cost per annotation',
      value: `$${cost}`,
    },
  )

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-border bg-card">
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-medium text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button variant="outline" onClick={onSaveDraft}>
          Save as draft
        </Button>
        <Button onClick={onLaunch}>Launch project</Button>
      </div>
    </div>
  )
}
