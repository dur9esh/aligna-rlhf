import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  useAnnotators,
  useCurrentAnnotator,
  useProjects,
  useSetCurrentAnnotator,
  useTasksByProject,
} from '@/context/AppContext'
import {
  deterministicAgreement,
  initials,
  methodologyLabel,
  percent,
} from '@/lib/format'
import type { Project } from '@/types'

export function TaskQueue() {
  const annotator = useCurrentAnnotator()
  const annotators = useAnnotators()
  const setCurrentAnnotator = useSetCurrentAnnotator()
  const projects = useProjects()

  const visibleProjects = useMemo(() => {
    const qualified = projects.filter((p) =>
      annotator.qualifiedProjectIds.includes(p.id),
    )
    if (qualified.length > 0) return qualified
    return projects.filter((p) => p.status === 'active')
  }, [projects, annotator.qualifiedProjectIds])

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11">
            <AvatarFallback>{initials(annotator.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {annotator.name}
              </h1>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    Switch
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[14rem]">
                  <DropdownMenuLabel>Switch annotator</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={annotator.id}
                    onValueChange={(value) => setCurrentAnnotator(value)}
                  >
                    {annotators.map((a) => (
                      <DropdownMenuRadioItem key={a.id} value={a.id}>
                        {a.name}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">
              Quality {percent(annotator.qualityScore)} ·{' '}
              {annotator.tasksCompleted} tasks ·{' '}
              {percent(annotator.agreementRate)} agreement
            </p>
          </div>
        </div>
      </header>

      <Tabs defaultValue="my-tasks" className="mt-8">
        <TabsList>
          <TabsTrigger value="my-tasks">My tasks</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="calibration">Calibration</TabsTrigger>
        </TabsList>

        <TabsContent value="my-tasks">
          <div className="mt-2 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <MyTasksList projects={visibleProjects} />
            </div>
            <div className="space-y-4">
              <TodayStatsCard />
              <QualityCard
                agreementRate={annotator.agreementRate}
                qualityScore={annotator.qualityScore}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <PlaceholderTab
            title="Completed"
            description="Your completed annotations will show up here, filterable by project and date."
          />
        </TabsContent>

        <TabsContent value="calibration">
          <PlaceholderTab
            title="Calibration"
            description="Gold tasks and qualification quizzes go here. Coming in the next milestone."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function MyTasksList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        No active projects. Check back later.
      </div>
    )
  }

  const groups = groupByStatus(projects)
  const order: Project['status'][] = ['active', 'paused', 'draft', 'completed']

  return (
    <div className="space-y-6">
      {order.map((status) => {
        const list = groups[status]
        if (!list || list.length === 0) return null
        return (
          <section key={status}>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {sectionTitle(status)}
            </h2>
            <div className="mt-2 space-y-3">
              {list.map((project) => (
                <ProjectRow key={project.id} project={project} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ProjectRow({ project }: { project: Project }) {
  const tasks = useTasksByProject(project.id)
  const navigate = useNavigate()

  const pending = tasks.filter((t) => t.status === 'pending')
  const remaining = tasks.length - tasks.filter((t) => t.status === 'completed').length
  const nextTask = pending[0] ?? tasks[0]

  return (
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-card p-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{project.name}</div>
        <div className="text-xs text-muted-foreground">{project.customer}</div>
        <p className="mt-2 line-clamp-2 max-w-xl text-sm text-muted-foreground">
          {project.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="muted">{methodologyLabel(project.methodology)}</Badge>
          <span aria-hidden>·</span>
          <span>{remaining} tasks remaining</span>
        </div>
      </div>
      <Button
        onClick={() =>
          nextTask
            ? navigate(`/annotate/task/${nextTask.id}`)
            : undefined
        }
        disabled={!nextTask || remaining === 0}
      >
        Start annotating
      </Button>
    </div>
  )
}

function TodayStatsCard() {
  const rows: { label: string; value: string }[] = [
    { label: 'Tasks completed today', value: '47' },
    { label: 'Time spent', value: '2h 14m' },
    { label: 'Current streak', value: '5 days' },
    { label: 'Projected earnings', value: '$38.40' },
  ]
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Today's stats</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 py-2 first:pt-0 last:pb-0"
            >
              <dt className="text-sm text-muted-foreground">{row.label}</dt>
              <dd className="text-sm font-medium tabular-nums text-foreground">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}

function QualityCard({
  agreementRate,
  qualityScore,
}: {
  agreementRate: number
  qualityScore: number
}) {
  const goldPass = 0.88 + (deterministicAgreement(`gold-${qualityScore}`) - 0.65) * 0.23
  const top = qualityScore > 0.85
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Quality</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <div className="flex items-center justify-between gap-3 py-2 first:pt-0">
            <dt className="text-sm text-muted-foreground">Agreement rate</dt>
            <dd className="text-sm font-medium tabular-nums text-foreground">
              {percent(agreementRate)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 py-2 last:pb-0">
            <dt className="text-sm text-muted-foreground">Gold task pass rate</dt>
            <dd className="text-sm font-medium tabular-nums text-foreground">
              {percent(goldPass)}
            </dd>
          </div>
        </dl>
        {top && (
          <div className="mt-3 flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>You're in the top 15% on the platform.</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PlaceholderTab({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
      <h2 className="text-base font-medium text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function groupByStatus(projects: Project[]) {
  const map: Partial<Record<Project['status'], Project[]>> = {}
  for (const project of projects) {
    const list = map[project.status] ?? []
    list.push(project)
    map[project.status] = list
  }
  return map
}

function sectionTitle(status: Project['status']): string {
  switch (status) {
    case 'active':
      return 'Active projects'
    case 'paused':
      return 'Paused projects'
    case 'draft':
      return 'Drafts'
    case 'completed':
      return 'Completed projects'
  }
}
