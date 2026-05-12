import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BarChart3,
  CircleDollarSign,
  Coins,
  ListChecks,
  Pause,
  PlayCircle,
  ShieldCheck,
  Sliders,
  TrendingUp,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useAnnotators,
  useProject,
  useTasksByProject,
} from '@/context/AppContext'
import {
  deterministicAgreement,
  initials,
  methodologyLabel,
  percent,
  statusLabel,
  statusVariant,
} from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Annotator, Methodology, Project } from '@/types'

const COMING_SOON = 'This action will be wired up in a follow-up.'

export function ProjectDashboard() {
  const { id } = useParams<{ id: string }>()
  const project = useProject(id)
  const navigate = useNavigate()

  if (!project) {
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

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <ProjectHeader project={project} />
      <KpiRow project={project} />
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AnnotatorLeaderboard project={project} />
        <DisagreementQueue project={project} />
      </div>
      <RecentAnnotations project={project} />
    </div>
  )
}

function ProjectHeader({ project }: { project: Project }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          to="/admin"
          className="rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Projects
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{project.name}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {project.name}
            </h1>
            <Badge variant={statusVariant(project.status)}>
              {statusLabel(project.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.customer} · {methodologyLabel(project.methodology)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="default">
            <Link to={`/admin/projects/${project.id}/configure`}>
              <Sliders className="h-4 w-4" />
              Configure
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => toast('Live preview', { description: COMING_SOON })}
          >
            <PlayCircle className="h-4 w-4" />
            Live preview
          </Button>
          <Button
            variant="outline"
            onClick={() => toast('Pause project', { description: COMING_SOON })}
          >
            <Pause className="h-4 w-4" />
            Pause
          </Button>
          <Button
            variant="outline"
            onClick={() => toast('Export data', { description: COMING_SOON })}
          >
            <BarChart3 className="h-4 w-4" />
            Export data
          </Button>
        </div>
      </div>
    </div>
  )
}

type Kpi = {
  icon: typeof TrendingUp
  title: string
  value: string
  trend?: { direction: 'up' | 'down'; label: string }
}

function KpiRow({ project }: { project: Project }) {
  const tasks = useTasksByProject(project.id)
  const agreement = deterministicAgreement(project.id)
  const completed = tasks.filter((t) => t.status === 'completed').length

  const throughputToday = 60 + (completed % 90)
  const goldPass = 0.85 + (deterministicAgreement(project.id + '_gold') - 0.65) * 0.3
  const costPerAnnotation = (
    0.65 +
    ((deterministicAgreement(project.id + '_cost') - 0.65) * 0.6) % 0.6
  ).toFixed(2)

  const kpis: Kpi[] = [
    {
      icon: TrendingUp,
      title: 'Throughput today',
      value: `${throughputToday} annotations`,
    },
    {
      icon: Users,
      title: 'Inter-annotator agreement',
      value: percent(agreement),
      trend: { direction: 'up', label: '+1.4 pts vs. last week' },
    },
    {
      icon: ShieldCheck,
      title: 'Gold task pass rate',
      value: percent(goldPass),
      trend: { direction: 'down', label: '−0.6 pts vs. last week' },
    },
    {
      icon: CircleDollarSign,
      title: 'Cost per annotation',
      value: `$${costPerAnnotation}`,
    },
  ]

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon
        return (
          <Card key={kpi.title}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight text-foreground">
                {kpi.value}
              </div>
              {kpi.trend && (
                <div
                  className={cn(
                    'mt-1 flex items-center gap-1 text-xs',
                    kpi.trend.direction === 'up'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400',
                  )}
                >
                  {kpi.trend.direction === 'up' ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  {kpi.trend.label}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

type LeaderboardColumn = 'name' | 'tasks' | 'agreement' | 'gold'

function AnnotatorLeaderboard({ project }: { project: Project }) {
  const allAnnotators = useAnnotators()
  const [sortBy, setSortBy] = useState<LeaderboardColumn>('agreement')

  const rows = useMemo(() => {
    const qualified = allAnnotators.filter((a) =>
      a.qualifiedProjectIds.includes(project.id),
    )
    const base =
      qualified.length > 0 ? qualified : [...allAnnotators]
    return [...base]
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 5)
  }, [allAnnotators, project.id])

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => compare(a, b, sortBy))
  }, [rows, sortBy])

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>Annotator leaderboard</CardTitle>
        <button
          type="button"
          onClick={() =>
            toast('Annotator pool', {
              description: 'The full annotator pool view is not built yet.',
            })
          }
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <SortHeader
                label="Name"
                column="name"
                sortBy={sortBy}
                onSort={setSortBy}
              />
              <SortHeader
                label="Tasks"
                column="tasks"
                sortBy={sortBy}
                onSort={setSortBy}
                align="right"
              />
              <SortHeader
                label="Agreement"
                column="agreement"
                sortBy={sortBy}
                onSort={setSortBy}
                align="right"
              />
              <SortHeader
                label="Gold pass"
                column="gold"
                sortBy={sortBy}
                onSort={setSortBy}
                align="right"
              />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((annotator) => (
              <TableRow key={annotator.id} className="hover:bg-muted/40">
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>
                        {initials(annotator.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {annotator.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {annotator.tasksCompleted}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {percent(annotator.agreementRate)}
                </TableCell>
                <TableCell className="text-right tabular-nums text-sm">
                  {percent(annotator.qualityScore)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function compare(a: Annotator, b: Annotator, by: LeaderboardColumn) {
  switch (by) {
    case 'name':
      return a.name.localeCompare(b.name)
    case 'tasks':
      return b.tasksCompleted - a.tasksCompleted
    case 'agreement':
      return b.agreementRate - a.agreementRate
    case 'gold':
      return b.qualityScore - a.qualityScore
  }
}

function SortHeader({
  label,
  column,
  sortBy,
  onSort,
  align = 'left',
}: {
  label: string
  column: LeaderboardColumn
  sortBy: LeaderboardColumn
  onSort: (c: LeaderboardColumn) => void
  align?: 'left' | 'right'
}) {
  const isActive = sortBy === column
  return (
    <TableHead className={align === 'right' ? 'text-right' : undefined}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wide',
          isActive ? 'text-foreground' : 'text-muted-foreground',
          'hover:text-foreground',
        )}
      >
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </button>
    </TableHead>
  )
}

const DISAGREEMENT_SEEDS = [
  {
    prompt:
      'Help me draft a strongly-worded complaint email about a delayed delivery.',
    conflicts: 3,
  },
  {
    prompt: 'Explain the risks of taking ibuprofen with high blood pressure.',
    conflicts: 4,
  },
  {
    prompt:
      "Write a polite email declining a meeting invitation from a senior colleague.",
    conflicts: 3,
  },
  {
    prompt:
      "What's the best way to negotiate a salary increase when your manager just changed?",
    conflicts: 2,
  },
  {
    prompt: 'Describe the symptoms of pneumonia and when to see a doctor.',
    conflicts: 3,
  },
]

function DisagreementQueue({ project }: { project: Project }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <CardTitle>Disagreement queue</CardTitle>
          <Badge variant="muted">
            {DISAGREEMENT_SEEDS.length} items
          </Badge>
        </div>
        <button
          type="button"
          onClick={() =>
            toast('Disagreement queue', {
              description: 'The full review queue is not built yet.',
            })
          }
          className="text-xs font-medium text-primary hover:underline"
        >
          View all
        </button>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-border">
          {DISAGREEMENT_SEEDS.map((item, index) => (
            <li
              key={`${project.id}-${index}`}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-foreground">
                  {item.prompt}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.conflicts} conflicting annotations
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast('Review', { description: COMING_SOON })
                }
              >
                Review
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function methodologyIcon(m: Methodology) {
  switch (m.kind) {
    case 'binary':
      return Coins
    case 'margin':
      return BarChart3
    case 'multi_criteria':
      return ListChecks
  }
}

const RECENT_PROMPTS = [
  'Explain how transformers work to a high school student.',
  'How do I fix a leaking faucet?',
  'Write a polite email declining a meeting invitation.',
  "I'm feeling overwhelmed at work. What should I do?",
  'Describe the symptoms of pneumonia.',
  'How do I start learning to play guitar?',
  'What are some healthy dinner ideas for picky eaters?',
  'Summarize the plot of Hamlet in three sentences.',
  "What's the best way to negotiate a salary increase?",
  'Help me draft a strongly-worded complaint email.',
]

const TIME_AGOS = [
  '2 min ago',
  '7 min ago',
  '12 min ago',
  '18 min ago',
  '26 min ago',
  '34 min ago',
  '41 min ago',
  '52 min ago',
  '1 hr ago',
  '1 hr 12 min ago',
]

function RecentAnnotations({ project }: { project: Project }) {
  const annotators = useAnnotators()
  const Icon = methodologyIcon(project.methodology)

  const recent = RECENT_PROMPTS.slice(0, 10).map((prompt, i) => ({
    id: `${project.id}-recent-${i}`,
    annotator: annotators[i % annotators.length],
    prompt,
    timeAgo: TIME_AGOS[i],
  }))

  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold tracking-tight text-foreground">
        Recent annotations
      </h2>
      <Card className="mt-3">
        <ul className="divide-y divide-border">
          {recent.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center gap-3 px-6 py-3"
            >
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback>{initials(entry.annotator.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  <span className="font-medium">{entry.annotator.name}</span>
                  <span className="text-muted-foreground">
                    {' '}
                    submitted an annotation on{' '}
                  </span>
                  <span className="text-foreground/80">"{entry.prompt}"</span>
                </p>
              </div>
              <Icon
                className="h-4 w-4 shrink-0 text-muted-foreground"
                aria-label={methodologyLabel(project.methodology)}
              />
              <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                {entry.timeAgo}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  )
}
