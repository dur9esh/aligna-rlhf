import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import type { QualityControls } from '@/types'

export function QualityControlsStep({
  value,
  onChange,
}: {
  value: QualityControls
  onChange: (next: QualityControls) => void
}) {
  const set = <K extends keyof QualityControls>(
    key: K,
    next: QualityControls[K],
  ) => onChange({ ...value, [key]: next })

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-end justify-between gap-4">
          <Label htmlFor="annotators-per-item">Annotators per item</Label>
          <Input
            id="annotators-per-item"
            type="number"
            min={1}
            max={9}
            value={value.annotatorsPerItem}
            onChange={(e) =>
              set('annotatorsPerItem', clampInt(e.target.value, 1, 9, 3))
            }
            className="w-20 text-right tabular-nums"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Each task is independently judged by this many annotators. Higher
          numbers improve quality at higher cost.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="gold-rate">Gold task injection rate</Label>
          <span className="text-sm tabular-nums text-foreground">
            {(value.goldTaskInjectionRate * 100).toFixed(0)}%
          </span>
        </div>
        <Slider
          id="gold-rate"
          min={0}
          max={20}
          step={1}
          value={[Math.round(value.goldTaskInjectionRate * 100)]}
          onValueChange={(values) =>
            set('goldTaskInjectionRate', (values[0] ?? 0) / 100)
          }
        />
        <p className="text-xs text-muted-foreground">
          Percentage of tasks that are calibrated gold-standard tasks injected
          into the queue to silently measure annotator quality.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <Label htmlFor="agreement-threshold">
            Minimum agreement threshold
          </Label>
          <span className="text-sm tabular-nums text-foreground">
            {value.minAgreementThreshold.toFixed(2)}
          </span>
        </div>
        <Slider
          id="agreement-threshold"
          min={0.5}
          max={1}
          step={0.01}
          value={[value.minAgreementThreshold]}
          onValueChange={(values) =>
            set('minAgreementThreshold', values[0] ?? 0.7)
          }
        />
        <p className="text-xs text-muted-foreground">
          Tasks with inter-annotator agreement below this threshold are sent for
          adjudication.
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-end justify-between gap-4">
          <Label htmlFor="max-time">Max time per task (seconds)</Label>
          <Input
            id="max-time"
            type="number"
            min={10}
            max={3600}
            value={value.maxTimePerTaskSeconds}
            onChange={(e) =>
              set(
                'maxTimePerTaskSeconds',
                clampInt(e.target.value, 10, 3600, 180),
              )
            }
            className="w-24 text-right tabular-nums"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Tasks exceeding this are flagged as outliers; annotators are not
          blocked.
        </p>
      </div>
    </div>
  )
}

function clampInt(raw: string, min: number, max: number, fallback: number) {
  const parsed = parseInt(raw, 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.min(max, Math.max(min, parsed))
}
