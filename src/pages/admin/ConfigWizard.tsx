import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AnnotatorPoolStep } from '@/components/configure/AnnotatorPoolStep'
import { CriteriaStep } from '@/components/configure/CriteriaStep'
import { InstructionsStep } from '@/components/configure/InstructionsStep'
import { LivePreview } from '@/components/configure/LivePreview'
import { MethodologyStep } from '@/components/configure/MethodologyStep'
import { QualityControlsStep } from '@/components/configure/QualityControlsStep'
import { ReviewLaunchStep } from '@/components/configure/ReviewLaunchStep'
import { StepSection } from '@/components/configure/StepSection'
import { useProject } from '@/context/AppContext'
import {
  DEFAULT_CRITERIA,
  projectToDraft,
  type ConfigDraft,
  type MethodologyKind,
} from '@/lib/configure'
import { cn } from '@/lib/utils'

type StepDef = { id: string; label: string; show: (d: ConfigDraft) => boolean }

const STEPS: StepDef[] = [
  { id: 'methodology', label: 'Methodology', show: () => true },
  {
    id: 'criteria',
    label: 'Criteria',
    show: (d) => d.methodologyKind === 'multi_criteria',
  },
  { id: 'instructions', label: 'Instructions', show: () => true },
  { id: 'quality-controls', label: 'Quality controls', show: () => true },
  { id: 'annotator-pool', label: 'Annotator pool', show: () => true },
  { id: 'review-launch', label: 'Review & launch', show: () => true },
]

export function ConfigWizard() {
  const { id } = useParams<{ id: string }>()
  const project = useProject(id)
  const navigate = useNavigate()

  const initialDraft = useMemo(
    () => (project ? projectToDraft(project) : null),
    [project],
  )
  const [draft, setDraft] = useState<ConfigDraft | null>(initialDraft)

  if (!project || !draft) {
    return (
      <div className="mx-auto w-full max-w-5xl px-8 py-16">
        <p className="text-sm text-muted-foreground">Project not found.</p>
        <Button
          variant="link"
          className="mt-2 px-0"
          onClick={() => navigate('/admin')}
        >
          Back to projects
        </Button>
      </div>
    )
  }

  const visibleSteps = STEPS.filter((s) => s.show(draft))

  const setMethodology = (kind: MethodologyKind) => {
    setDraft((prev) => {
      if (!prev) return prev
      // Re-seed criteria when switching into multi-criteria with no criteria
      const nextCriteria =
        kind === 'multi_criteria' && prev.criteria.length === 0
          ? DEFAULT_CRITERIA
          : prev.criteria
      return { ...prev, methodologyKind: kind, criteria: nextCriteria }
    })
  }

  const finish = (action: 'draft' | 'launch') => {
    toast(
      action === 'launch' ? 'Project launched' : 'Draft saved',
      {
        description:
          action === 'launch'
            ? 'New configuration is live (prototype: not persisted).'
            : 'Your changes are saved as a draft (prototype: not persisted).',
      },
    )
    navigate(`/admin/projects/${project.id}`)
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-8 py-8">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          to="/admin"
          className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Projects
        </Link>
        <span aria-hidden>/</span>
        <Link
          to={`/admin/projects/${project.id}`}
          className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {project.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">Configure</span>
      </div>

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Configure task
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tune the methodology, criteria, instructions, and quality bar.
            Changes you make here update the live preview on the right in real
            time.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <Stepper steps={visibleSteps} />
          <div className="mt-8 space-y-12">
            <StepSection
              id="methodology"
              number={1}
              title="Methodology"
              description="Pick how annotators express preference. This shapes the rest of the wizard and the annotator UI."
            >
              <MethodologyStep
                value={draft.methodologyKind}
                onChange={setMethodology}
              />
            </StepSection>

            {draft.methodologyKind === 'multi_criteria' && (
              <StepSection
                id="criteria"
                number={2}
                title="Scoring criteria"
                description="Annotators score each response on every criterion. Keep names short and descriptions concrete."
              >
                <CriteriaStep
                  criteria={draft.criteria}
                  onChange={(criteria) =>
                    setDraft((prev) => prev && { ...prev, criteria })
                  }
                />
              </StepSection>
            )}

            <StepSection
              id="instructions"
              number={draft.methodologyKind === 'multi_criteria' ? 3 : 2}
              title="Annotator instructions"
              description="Annotators see this at the top of every task. Keep it brief and concrete."
            >
              <InstructionsStep
                instructions={draft.instructions}
                onInstructionsChange={(instructions) =>
                  setDraft((prev) => prev && { ...prev, instructions })
                }
                includeWorkedExamples={draft.includeWorkedExamples}
                onIncludeWorkedExamplesChange={(includeWorkedExamples) =>
                  setDraft(
                    (prev) =>
                      prev && { ...prev, includeWorkedExamples },
                  )
                }
              />
            </StepSection>

            <StepSection
              id="quality-controls"
              number={draft.methodologyKind === 'multi_criteria' ? 4 : 3}
              title="Quality controls"
              description="Set the trade-off between cost and signal quality."
            >
              <QualityControlsStep
                value={draft.qualityControls}
                onChange={(qualityControls) =>
                  setDraft((prev) => prev && { ...prev, qualityControls })
                }
              />
            </StepSection>

            <StepSection
              id="annotator-pool"
              number={draft.methodologyKind === 'multi_criteria' ? 5 : 4}
              title="Assign annotators"
              description="Pick from the qualified pool. You can adjust this after launch."
            >
              <AnnotatorPoolStep
                selectedIds={draft.annotatorPoolIds}
                onChange={(annotatorPoolIds) =>
                  setDraft((prev) => prev && { ...prev, annotatorPoolIds })
                }
              />
            </StepSection>

            <StepSection
              id="review-launch"
              number={draft.methodologyKind === 'multi_criteria' ? 6 : 5}
              title="Review & launch"
              description="One last look before annotators start seeing tasks."
            >
              <ReviewLaunchStep
                draft={draft}
                onSaveDraft={() => finish('draft')}
                onLaunch={() => finish('launch')}
              />
            </StepSection>
          </div>
        </div>

        <div className="lg:sticky lg:top-20 lg:self-start">
          <LivePreview draft={draft} />
        </div>
      </div>
    </div>
  )
}

function Stepper({ steps }: { steps: StepDef[] }) {
  return (
    <nav
      aria-label="Configuration steps"
      className="sticky top-14 z-20 -mx-2 overflow-x-auto rounded-lg border border-border bg-background px-2 py-2 shadow-sm"
    >
      <ol className="flex items-center gap-1">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-center gap-1">
            <a
              href={`#${step.id}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              )}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-border text-[10px] tabular-nums">
                {index + 1}
              </span>
              <span className="whitespace-nowrap">{step.label}</span>
            </a>
            {index < steps.length - 1 && (
              <span aria-hidden className="text-muted-foreground/60">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
