import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import LanguageToggle from '@/components/common/LanguageToggle'
import { useTranslation } from '@/hooks/useTranslation'

interface HeaderProps {
  className?: string
}

export default function Header({ className }: HeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t } = useTranslation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'developer':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'employee':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'developer':
        return t('roles.developer')
      case 'admin':
        return t('roles.admin')
      case 'employee':
        return t('roles.employee')
      default:
        return role
    }
  }

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Navigation */}
        <div className="flex items-center space-x-2 md:space-x-4 rtl:space-x-reverse">
          <Link
            to={user?.role === 'developer' ? '/developer/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : user?.role === 'employee' ? '/employee/dashboard' : '/login'}
            className="flex items-center space-x-2 rtl:space-x-reverse"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-base md:text-lg hidden sm:inline">{t('common.appName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 rtl:space-x-reverse">
            {user?.role === 'developer' && (
              <Link
                to="/developer/system-config"
                className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>{t('nav.systemConfig')}</span>
              </Link>
            )}
            {user?.role === 'employee' && (
              <Link
                to="/employee/dashboard"
                className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>{t('nav.assignedSurveys')}</span>
              </Link>
            )}
          </nav>
        </div>

        {/* User Menu */}
        <div className="flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
          {/* Language Toggle */}
          <div className="hidden sm:block">
            <LanguageToggle />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative hidden md:flex mobile-button">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 md:h-10 md:w-10 rounded-full hidden sm:flex mobile-button">
                <Avatar className="h-8 w-8 md:h-9 md:w-9">
                  <AvatarFallback>
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <Badge className={cn("w-fit mt-1", getRoleBadgeColor(user?.role || ''))}>
                    {getRoleText(user?.role || '')}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('nav.profile')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('nav.settings')}</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('nav.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="sm:hidden border-t bg-background">
          <div className="container px-4 py-4 space-y-3">
            {/* Language Toggle in Mobile Menu */}
            <div className="flex items-center justify-between pb-3 border-b">
              <span className="text-sm font-medium">{t('settings.language')}</span>
              <LanguageToggle />
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse pb-3 border-b">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {user?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                <Badge className={cn("w-fit", getRoleBadgeColor(user?.role || ''))}>
                  {getRoleText(user?.role || '')}
                </Badge>
              </div>
            </div>

            {/* Navigation Links */}
            {user?.role === 'developer' && (
              <Link
                to="/developer/system-config"
                className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-4 w-4" />
                <span>{t('nav.systemConfig')}</span>
              </Link>
            )}
            {user?.role === 'employee' && (
              <Link
                to="/employee/dashboard"
                className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FileText className="h-4 w-4" />
                <span>{t('nav.assignedSurveys')}</span>
              </Link>
            )}

            {/* Menu Items */}
            <Link
              to="/profile"
              className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>{t('nav.profile')}</span>
            </Link>
            <Link
              to="/settings"
              className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Settings className="h-4 w-4" />
              <span>{t('nav.settings')}</span>
            </Link>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false)
                handleLogout()
              }}
              className="flex items-center space-x-2 rtl:space-x-reverse text-sm font-medium text-red-600 hover:text-red-700 transition-colors py-2 w-full"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('nav.logout')}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
