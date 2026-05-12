import { NavLink } from 'react-router-dom'
import {
  FolderKanban,
  Users,
  Gauge,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Item = {
  label: string
  icon: LucideIcon
  to: string
  enabled: boolean
}

const items: Item[] = [
  { label: 'Projects', icon: FolderKanban, to: '/admin', enabled: true },
  {
    label: 'Annotator pool',
    icon: Users,
    to: '/admin/annotators',
    enabled: false,
  },
  {
    label: 'Quality dashboard',
    icon: Gauge,
    to: '/admin/quality',
    enabled: false,
  },
  {
    label: 'Templates',
    icon: FileText,
    to: '/admin/templates',
    enabled: false,
  },
  { label: 'Settings', icon: Settings, to: '/admin/settings', enabled: false },
]

export function AdminSidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-border bg-background">
      <nav className="flex flex-col gap-0.5 p-4">
        {items.map((item) => {
          const Icon = item.icon
          if (!item.enabled) {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() =>
                  toast(`${item.label} is in the V2 roadmap.`)
                }
                className="flex items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                <Badge
                  variant="muted"
                  className="px-1.5 py-0 text-[10px] font-medium"
                >
                  Soon
                </Badge>
              </button>
            )
          }
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-muted',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
