# Aligna

Internal tooling platform for managing human annotation work used to fine-tune
large language models.

This is the v0.1 prototype foundation. It provides:

- An `/admin` surface for configuring annotation projects.
- An `/annotate` surface where annotators complete tasks.

The annotator interface renders dynamically based on configurations set by
admins.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS with shadcn/ui patterns
- React Router v6
- React Context for state
- next-themes for dark/light mode
- lucide-react for icons

## Project structure

```
src/
  components/
    ui/          shadcn primitives
    layout/      AppShell, AppHeader, ThemeProvider
  pages/
    admin/       admin tool screens
    annotator/   annotator workspace screens
  context/       AppProvider and hooks
  types/         shared TypeScript types
  data/          mock data seeds
  lib/           utilities
```

## Scripts

```
npm install
npm run dev      # start dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build
npm run lint     # run ESLint
```

## Status

This commit sets up the foundation only. The product screens (project list,
config wizard, annotation interface) are intentionally not built yet.
