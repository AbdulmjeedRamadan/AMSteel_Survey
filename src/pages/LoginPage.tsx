import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuthStore } from '@/store/authStore'
import { FileText, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const { setUser, setToken } = useAuthStore()
  const { t } = useTranslation()

  // Mock users data
  const mockUsers = [
    {
      id: '1',
      email: 'admin@amsteel.com',
      password: 'admin123',
      fullName: 'أحمد محمد',
      role: 'admin',
      department: 'الإدارة',
      position: 'مدير النظام',
      created_at: '2024-01-15T08:00:00Z'
    },
    {
      id: '2',
      email: 'developer@amsteel.com',
      password: 'dev123',
      fullName: 'محمد أحمد',
      role: 'developer',
      department: 'تكنولوجيا المعلومات',
      position: 'مطور النظام',
      created_at: '2023-12-01T09:30:00Z'
    },
    {
      id: '3',
      email: 'employee@amsteel.com',
      password: 'emp123',
      fullName: 'فاطمة علي',
      role: 'employee',
      department: 'الموارد البشرية',
      position: 'موظف',
      created_at: '2024-02-20T10:15:00Z'
    }
  ]

  // Debug function
  const debugLogin = () => {
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Mock users:', mockUsers)
    const user = mockUsers.find(u => u.email === email && u.password === password)
    console.log('Found user:', user)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Debug
    debugLogin()

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Find user
      const user = mockUsers.find(u => u.email === email && u.password === password)
      
      console.log('Searching for user with:', { email, password })
      console.log('Found user:', user)
      
      if (!user) {
        setError(t('auth.invalidCredentials'))
        setIsLoading(false)
        return
      }

      // Set user data
      const userData = {
        id: user.id,
        role: user.role as 'developer' | 'admin' | 'employee',
        full_name: user.fullName,
        email: user.email,
        department: user.department,
        position: user.position,
        is_active: true,
        email_verified: true,
        created_at: user.created_at,
        updated_at: new Date().toISOString()
      }

      console.log('Setting user data:', userData)
      setUser(userData)
      setToken('mock-token-' + user.id)

      // Navigate based on role
      console.log('Navigating to role:', user.role)
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard')
          break
        case 'developer':
          navigate('/developer/dashboard')
          break
        case 'employee':
          navigate('/employee/dashboard')
          break
        default:
          navigate('/')
      }

    } catch (error) {
      console.error('Login error:', error)
      setError(t('auth.loginError'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t('auth.login')}</CardTitle>
            <CardDescription>
              {t('common.appName')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-center mb-2">
                {t('common.welcome')}
              </h2>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.email')}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('auth.password')}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('auth.password')}
                    required
                    className="text-right pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    {t('auth.rememberMe')}
                  </Label>
                </div>
                <Button variant="link" className="p-0 h-auto text-sm">
                  {t('auth.forgotPassword')}
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? t('auth.loggingIn') : t('auth.loginButton')}
              </Button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium mb-3">{t('roles.admin')}: admin@amsteel.com / admin123</h3>
              <h3 className="text-sm font-medium mb-3">{t('roles.developer')}: developer@amsteel.com / dev123</h3>
              <h3 className="text-sm font-medium mb-3">{t('roles.employee')}: employee@amsteel.com / emp123</h3>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}