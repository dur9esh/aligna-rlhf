import { useNavigate } from 'react-router-dom'
import { ChevronRight, FolderPlus, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProjects } from '@/context/AppContext'
import { useTasksByProject } from '@/context/AppContext'
import {
  deterministicAgreement,
  methodologyLabel,
  percent,
  statusLabel,
  statusVariant,
} from '@/lib/format'
import type { Project } from '@/types'

export function ProjectList() {
  const projects = useProjects()
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-6xl px-8 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Internal tooling for human alignment data
          </p>
        </div>
        <Button
          onClick={() =>
            toast('New project', {
              description: 'The project wizard is not built yet.',
            })
          }
        >
          <Plus className="h-4 w-4" />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={FolderPlus}
            title="No projects yet"
            description="Create your first annotation project to start collecting alignment data."
          />
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[28%]">Name</TableHead>
                <TableHead>Methodology</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[22%]">Progress</TableHead>
                <TableHead className="text-right">Annotators</TableHead>
                <TableHead className="text-right">Quality</TableHead>
                <TableHead className="w-8" aria-label="" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onOpen={() => navigate(`/admin/projects/${project.id}`)}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function ProjectRow({
  project,
  onOpen,
}: {
  project: Project
  onOpen: () => void
}) {
  const tasks = useTasksByProject(project.id)
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'completed').length
  const pct = total > 0 ? (done / total) * 100 : 0
  const agreement = deterministicAgreement(project.id)

  return (
    <TableRow
      tabIndex={0}
      role="button"
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="cursor-pointer focus:outline-none focus-visible:bg-muted/60"
    >
      <TableCell>
        <div className="font-medium text-foreground">{project.name}</div>
        <div className="text-xs text-muted-foreground">{project.customer}</div>
      </TableCell>
      <TableCell>
        <Badge variant="muted">{methodologyLabel(project.methodology)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant={statusVariant(project.status)}>
          {statusLabel(project.status)}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Progress value={pct} className="h-1.5 max-w-32" />
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {done} / {total} tasks
          </span>
        </div>
      </TableCell>
      <TableCell className="text-right tabular-nums text-sm">
        {project.annotatorPoolIds.length}
      </TableCell>
      <TableCell className="text-right tabular-nums text-sm">
        {percent(agreement)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        <ChevronRight className="h-4 w-4" />
      </TableCell>
    </TableRow>
  )
}
