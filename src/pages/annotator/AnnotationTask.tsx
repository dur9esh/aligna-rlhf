import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { RatingWidget } from '@/components/annotate/RatingWidget'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  useProject,
  useTask,
  useTasksByProject,
} from '@/context/AppContext'
import { cn } from '@/lib/utils'
import type { AnnotationValue } from '@/types'

export function AnnotationTask() {
  const { taskId } = useParams<{ taskId: string }>()
  const task = useTask(taskId)
  const project = useProject(task?.projectId)
  const navigate = useNavigate()
  const projectTasks = useTasksByProject(task?.projectId ?? '')

  const [value, setValue] = useState<AnnotationValue | null>(null)
  const [justification, setJustification] = useState('')
  const [ambiguous, setAmbiguous] = useState(false)
  const [unsafe, setUnsafe] = useState(false)
  const [instructionsOpen, setInstructionsOpen] = useState(false)
  const [secondsElapsed, setSecondsElapsed] = useState(0)

  // Reset all task state when the task changes.
  useEffect(() => {
    setValue(null)
    setJustification('')
    setAmbiguous(false)
    setUnsafe(false)
    setInstructionsOpen(false)
    setSecondsElapsed(0)
  }, [taskId])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsElapsed((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [taskId])

  const { positionInProject, totalInProject, completedCount, nextPendingTaskId } =
    useMemo(() => {
      if (!project || !task) {
        return {
          positionInProject: 0,
          totalInProject: 0,
          completedCount: 0,
          nextPendingTaskId: null as string | null,
        }
      }
      const index = projectTasks.findIndex((t) => t.id === task.id)
      const completed = projectTasks.filter(
        (t) => t.status === 'completed',
      ).length
      const remainingPending = projectTasks
        .slice(index + 1)
        .find((t) => t.status === 'pending')
      return {
        positionInProject: index + 1,
        totalInProject: projectTasks.length,
        completedCount: completed,
        nextPendingTaskId: remainingPending?.id ?? null,
      }
    }, [project, task, projectTasks])

  if (!task || !project) {
    return (
      <div className="mx-auto w-full max-w-3xl px-8 py-16">
        <p className="text-sm text-muted-foreground">Task not found.</p>
        <Button
          variant="link"
          className="mt-2 px-0"
          onClick={() => navigate('/annotate')}
        >
          Back to queue
        </Button>
      </div>
    )
  }

  const progressPct =
    totalInProject > 0
      ? (Math.max(completedCount, positionInProject) / totalInProject) * 100
      : 0

  const submit = () => {
    toast('Submitted')
    if (nextPendingTaskId) {
      navigate(`/annotate/task/${nextPendingTaskId}`)
    } else {
      toast('All tasks done in this project. Great work.')
      navigate('/annotate')
    }
  }

  const skip = () => {
    if (nextPendingTaskId) {
      navigate(`/annotate/task/${nextPendingTaskId}`)
    } else {
      navigate('/annotate')
    }
  }

  return (
    <div>
      <TaskHeader
        projectName={project.name}
        position={positionInProject}
        total={totalInProject}
        progressPct={progressPct}
        secondsElapsed={secondsElapsed}
      />

      <div className="mx-auto w-full max-w-3xl px-6 pb-24 pt-6">
        <InstructionsBlock
          instructions={project.instructions}
          open={instructionsOpen}
          onOpenChange={setInstructionsOpen}
        />

        <section className="mt-6 rounded-lg border-l-2 border-l-primary/60 bg-muted/40 px-4 py-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            User prompt
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {task.prompt}
          </p>
        </section>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <ResponseCard label="Response A" body={task.responseA} />
          <ResponseCard label="Response B" body={task.responseB} />
        </div>

        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Your rating
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose the option that best reflects your judgment.
              </p>
            </div>
            <KeyboardHint />
          </div>
          <div className="mt-4">
            <RatingWidget
              methodology={project.methodology}
              value={value}
              onChange={setValue}
            />
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <Label htmlFor="justification">Justification (optional)</Label>
          <Textarea
            id="justification"
            rows={3}
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="Briefly explain your judgment if it isn't obvious."
          />
        </section>

        <section className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={ambiguous}
              onCheckedChange={(v) => setAmbiguous(v === true)}
              aria-label="Mark this task as ambiguous"
            />
            <span>Mark this task as ambiguous</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={unsafe}
              onCheckedChange={(v) => setUnsafe(v === true)}
              aria-label="This response contains unsafe content"
            />
            <span>This response contains unsafe content</span>
          </label>
        </section>

        <div className="mt-10 flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={skip}>
            Skip task
          </Button>
          <Button size="lg" className="px-8 shadow-sm" onClick={submit}>
            Submit &amp; next
          </Button>
        </div>
      </div>
    </div>
  )
}

function TaskHeader({
  projectName,
  position,
  total,
  progressPct,
  secondsElapsed,
}: {
  projectName: string
  position: number
  total: number
  progressPct: number
  secondsElapsed: number
}) {
  return (
    <div className="sticky top-14 z-10 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center gap-4 px-6 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-foreground">
            {projectName}
          </div>
          <div className="text-xs text-muted-foreground">
            Task {position} of {total}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
          <Timer className="h-3.5 w-3.5" />
          {formatDuration(secondsElapsed)}
        </div>
      </div>
      <Progress value={progressPct} className="h-1 rounded-none" />
    </div>
  )
}

function KeyboardHint() {
  return (
    <div className="hidden items-center gap-1.5 text-[11px] text-muted-foreground sm:flex">
      <span>Press</span>
      <Kbd>1</Kbd>
      <Kbd>2</Kbd>
      <Kbd>3</Kbd>
      <Kbd>4</Kbd>
      <span>to rate</span>
    </div>
  )
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-foreground">
      {children}
    </kbd>
  )
}

function ResponseCard({ label, body }: { label: string; body: string }) {
  return (
    <article className="flex max-h-80 flex-col rounded-lg border border-border bg-card">
      <header className="border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </header>
      <div className="overflow-auto px-4 py-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {body}
        </p>
      </div>
    </article>
  )
}

function InstructionsBlock({
  instructions,
  open,
  onOpenChange,
}: {
  instructions: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const paragraphs = useMemo(
    () =>
      instructions
        .split(/\n\n+/)
        .map((p) => p.trim())
        .filter(Boolean),
    [instructions],
  )
  const firstParagraph = paragraphs[0] ?? ''
  const rest = paragraphs.slice(1)
  const hasMore = rest.length > 0

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-start gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Instructions
            </div>
            <p
              className={cn(
                'mt-1 whitespace-pre-wrap text-sm leading-relaxed text-foreground',
              )}
            >
              {firstParagraph}
            </p>
            <CollapsibleContent>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-foreground">
                {rest.map((p, i) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {p}
                  </p>
                ))}
              </div>
            </CollapsibleContent>
          </div>
          {hasMore && (
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {open ? (
                  <>
                    Hide
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    Show more
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            </CollapsibleTrigger>
          )}
        </div>
      </div>
    </Collapsible>
  )
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`
}
