import { NavLink } from 'react-router-dom'
import {
  FolderKanban,
  Users,
  Gauge,
  FileText,
  Settings,
  type LucideIcon,
} from 'lucide-react'
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
              <span
                key={item.label}
                aria-disabled="true"
                className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground/70"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
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
