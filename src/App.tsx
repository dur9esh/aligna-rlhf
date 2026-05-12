import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { ProjectList } from '@/pages/admin/ProjectList'
import { ProjectDashboard } from '@/pages/admin/ProjectDashboard'
import { AnnotatorHome } from '@/pages/annotator/AnnotatorHome'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<ProjectList />} />
          <Route path="projects/:id" element={<ProjectDashboard />} />
        </Route>
        <Route path="/annotate" element={<AnnotatorHome />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  )
}

export default App
