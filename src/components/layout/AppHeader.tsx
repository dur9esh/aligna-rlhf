import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

const roles = [
  { label: 'Admin', path: '/admin' },
  { label: 'Annotator', path: '/annotate' },
] as const

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()

  const activePath = roles.find((r) =>
    location.pathname.startsWith(r.path),
  )?.path

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center px-6">
        <NavLink to="/admin" className="flex items-baseline gap-2">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Aligna
          </span>
          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
            v0.1 prototype
          </span>
        </NavLink>

        <nav
          className="mx-auto flex items-center gap-1 rounded-full bg-muted p-1"
          aria-label="Role"
        >
          {roles.map((role) => {
            const isActive = activePath === role.path
            return (
              <button
                key={role.path}
                type="button"
                onClick={() => navigate(role.path)}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {role.label}
              </button>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
