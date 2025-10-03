import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useLanguageStore } from './store/languageStore'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DeveloperDashboard from './pages/DeveloperDashboard'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import SurveyBuilder from './pages/SurveyBuilder'
import SurveyViewer from './pages/SurveyViewer'
import PublicSurvey from './pages/PublicSurvey'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import SystemConfigurationPage from './pages/SystemConfigurationPage'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

function App() {
  const { language, direction } = useLanguageStore()

  // Apply language and direction to document root on mount and changes
  useEffect(() => {
    document.documentElement.setAttribute('lang', language)
    document.documentElement.setAttribute('dir', direction)
    document.documentElement.className = direction
  }, [language, direction])

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/survey/:slug" element={<PublicSurvey />} />
        <Route path="/survey/preview" element={<PublicSurvey />} />
        
        {/* Developer Routes */}
        <Route path="/developer/dashboard" element={
          <ProtectedRoute requiredRole={['developer']}>
            <Layout>
              <DeveloperDashboard />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole={['admin']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/admin/survey-builder/:id?" element={
          <ProtectedRoute requiredRole={['admin']}>
            <Layout>
              <SurveyBuilder />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/developer/system-config" element={
          <ProtectedRoute requiredRole={['developer']}>
            <SystemConfigurationPage />
          </ProtectedRoute>
        } />

        {/* Employee Routes */}
        <Route path="/employee/dashboard" element={
          <ProtectedRoute requiredRole={['employee']}>
            <Layout>
              <EmployeeDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/employee/survey/:id" element={
          <ProtectedRoute requiredRole={['employee']}>
            <Layout>
              <SurveyViewer />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Profile and Settings Routes (for all authenticated users) */}
        <Route path="/profile" element={
          <ProtectedRoute requiredRole={['admin', 'developer', 'employee']}>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute requiredRole={['admin', 'developer', 'employee']}>
            <Layout>
              <SettingsPage />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  )
}

export default App
