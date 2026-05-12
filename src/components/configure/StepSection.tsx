import type { ReactNode } from 'react'

export function StepSection({
  id,
  number,
  title,
  description,
  children,
}: {
  id: string
  number: number
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Step {number}
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h2>
      </div>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  )
}
