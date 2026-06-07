import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { DashboardPage } from './pages/DashboardPage'
import { NewObservationPage } from './pages/NewObservationPage'
import { ObservationPage } from './pages/ObservationPage'

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/observations/new" element={<NewObservationPage />} />
        <Route path="/observations/:id" element={<ObservationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
