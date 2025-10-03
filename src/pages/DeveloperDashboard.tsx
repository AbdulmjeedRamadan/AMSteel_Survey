import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  UserCheck, 
  FileText, 
  BarChart3, 
  Activity,
  Shield,
  Database,
  Crown,
  Target,
  Settings
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

// Import new components
import EmployeeManagement from '@/components/developer/EmployeeManagement'
import SystemStatistics from '@/components/developer/SystemStatistics'
import ActivityLog from '@/components/developer/ActivityLog'
import NotificationSystem from '@/components/developer/NotificationSystem'
import SystemConfiguration from '@/components/developer/SystemConfiguration'
import AdvancedResponseManagement from '@/components/developer/AdvancedResponseManagement'
import BackupRestore from '@/components/developer/BackupRestore'
import LanguageTest from '@/components/common/LanguageTest'

export default function DeveloperDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data
  const stats = {
    totalEmployees: 156,
    totalAdmins: 8,
    totalSurveys: 45,
    totalResponses: 1247,
    newEmployeesThisWeek: 3,
    newEmployeesThisMonth: 12,
    activeSurveys: 12,
    completedSurveys: 33,
    averageResponseRate: 78.5,
    systemUptime: '99.9%',
    lastBackup: '2024-01-20T02:00:00Z',
    storageUsed: '2.3 GB',
    totalStorage: '10 GB'
  }

  const recentActivity = [
    {
      id: '1',
      type: 'employee_registered',
      message: t('ui.activity.employeeRegistered').replace('{name}', 'أحمد محمد'),
      timestamp: '2024-01-20T10:30:00Z',
      user: 'أحمد محمد'
    },
    {
      id: '2',
      type: 'survey_created',
      message: t('ui.activity.surveyCreated').replace('{title}', 'رضا الموظفين'),
      timestamp: '2024-01-20T09:15:00Z',
      user: 'فاطمة أحمد'
    },
    {
      id: '3',
      type: 'promotion',
      message: t('ui.activity.promotion').replace('{name}', 'محمد السعيد'),
      timestamp: '2024-01-19T16:45:00Z',
      user: t('ui.activity.mainDeveloper')
    }
  ]


  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee_registered': return <Users className="h-4 w-4 text-blue-600" />
      case 'survey_created': return <FileText className="h-4 w-4 text-green-600" />
      case 'promotion': return <Crown className="h-4 w-4 text-purple-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'employee_registered': return 'text-blue-600'
      case 'survey_created': return 'text-green-600'
      case 'promotion': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mobile-spacing">
        <div>
          <h1 className="text-3xl font-bold mobile-text">{t('ui.dashboard.developerDashboard')}</h1>
          <p className="text-muted-foreground mobile-text">
            {t('ui.dashboard.welcomeMessage').replace('{name}', user?.full_name || 'المستخدم')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/developer/system-config')} className="mobile-button">
            <Settings className="h-4 w-4 mr-2" />
            {t('ui.buttons.systemSettings')}
          </Button>
          <Button variant="outline" onClick={() => window.open('/admin/dashboard', '_blank')} className="mobile-button">
            <Users className="h-4 w-4 mr-2" />
            {t('ui.buttons.adminDashboard')}
          </Button>
          <Button variant="outline" onClick={() => window.open('/admin/survey-builder', '_blank')} className="mobile-button">
            <FileText className="h-4 w-4 mr-2" />
            {t('ui.buttons.createSurvey')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="overview">{t('ui.navigation.overview')}</TabsTrigger>
          <TabsTrigger value="employees">{t('ui.navigation.employees')}</TabsTrigger>
          <TabsTrigger value="responses">{t('ui.navigation.responses')}</TabsTrigger>
          <TabsTrigger value="statistics">{t('ui.navigation.statistics')}</TabsTrigger>
          <TabsTrigger value="activity">{t('ui.navigation.activityLog')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('ui.navigation.notifications')}</TabsTrigger>
          <TabsTrigger value="configuration">{t('ui.navigation.settings')}</TabsTrigger>
          <TabsTrigger value="backup">{t('ui.navigation.backups')}</TabsTrigger>
          <TabsTrigger value="system">{t('ui.navigation.system')}</TabsTrigger>
          <TabsTrigger value="test">{t('ui.navigation.languageTest')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mobile-spacing">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ui.cards.totalEmployees')}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.newEmployeesThisWeek} {t('ui.cards.thisWeek')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ui.cards.managers')}</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAdmins}</div>
                <p className="text-xs text-muted-foreground">
                  {t('ui.cards.canCreateSurveys')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ui.cards.totalSurveys')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSurveys}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeSurveys} {t('ui.cards.active')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('ui.cards.totalResponses')}</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalResponses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.averageResponseRate}% {t('ui.cards.responseRate')}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mobile-spacing">
            <Card>
              <CardHeader>
                <CardTitle>{t('ui.sections.latestActivity')}</CardTitle>
                <CardDescription>
                  {t('ui.sections.latestActivitiesInSystem')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {t('ui.activity.by')} {activity.user} • {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('ui.sections.systemStatus')}</CardTitle>
                <CardDescription>
                  {t('ui.sections.technicalPerformanceIndicators')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{t('ui.sections.security')}</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {t('ui.sections.secure')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{t('ui.sections.uptime')}</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {stats.systemUptime}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Database className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">{t('ui.sections.lastBackup')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(stats.lastBackup)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">{t('ui.sections.storage')}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stats.storageUsed} {t('ui.sections.outOf')} {stats.totalStorage}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <EmployeeManagement 
            onPromote={(employeeId, note) => {
              console.log('Promote:', employeeId, note)
              toast.success('تم ترقية الموظف بنجاح! يمكنه الآن إنشاء الاستطلاعات.')
              // Here you would typically make an API call to update the employee role
            }}
            onDemote={(employeeId, note) => {
              console.log('Demote:', employeeId, note)
              toast.success('تم تراجع الترقية بنجاح!')
              // Here you would typically make an API call to update the employee role
            }}
            onExport={(employees) => {
              console.log('Export employees:', employees)
              // Here you would typically trigger a download or API call for export
            }}
          />
        </TabsContent>

        {/* Advanced Response Management Tab */}
        <TabsContent value="responses" className="space-y-6">
          <AdvancedResponseManagement 
            onModifyResponse={(responseId, data, reason) => {
              console.log('Modify response:', responseId, data, reason)
              toast.success('تم تعديل الرد بنجاح!')
              // Here you would typically make an API call to modify the response
            }}
            onDeleteResponse={(responseId, reason) => {
              console.log('Delete response:', responseId, reason)
              toast.success('تم حذف الرد بنجاح!')
              // Here you would typically make an API call to delete the response
            }}
            onBulkDelete={(responseIds, reason) => {
              console.log('Bulk delete responses:', responseIds, reason)
              toast.success(`تم حذف ${responseIds.length} رد بنجاح!`)
              // Here you would typically make an API call for bulk deletion
            }}
            onExport={(responses, format) => {
              console.log('Export responses:', responses.length, format)
              toast.success(`تم تصدير ${responses.length} رد بصيغة ${format.toUpperCase()}!`)
              // Here you would typically trigger a download or API call for export
            }}
          />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-6">
          <SystemStatistics 
            onExport={(data) => console.log('Export statistics:', data)}
          />
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity" className="space-y-6">
          <ActivityLog 
            onExport={(logs) => {
              console.log('Export activity logs:', logs)
              toast.success('تم تصدير سجل الأنشطة بنجاح!')
            }}
          />
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <NotificationSystem 
            onSendNotification={(notification) => {
              console.log('Send notification:', notification)
              toast.success('تم إرسال الإشعار بنجاح!')
            }}
            onMarkAsRead={(notificationId) => {
              console.log('Mark as read:', notificationId)
              toast.success('تم تعليم الإشعار كمقروء!')
            }}
            onDeleteNotification={(notificationId) => {
              console.log('Delete notification:', notificationId)
              toast.success('تم حذف الإشعار!')
            }}
          />
        </TabsContent>

        {/* System Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <SystemConfiguration 
            onSave={(config) => {
              console.log('Save configuration:', config)
              toast.success('تم حفظ الإعدادات بنجاح!')
            }}
            onReset={() => {
              console.log('Reset configuration')
              toast.success('تم إعادة تعيين الإعدادات!')
            }}
            onExport={(config) => {
              console.log('Export configuration:', config)
              const dataStr = JSON.stringify(config, null, 2)
              const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
              const exportFileDefaultName = 'amsteel-system-config.json'
              const linkElement = document.createElement('a')
              linkElement.setAttribute('href', dataUri)
              linkElement.setAttribute('download', exportFileDefaultName)
              linkElement.click()
              toast.success('تم تصدير الإعدادات!')
            }}
            onImport={(config) => {
              console.log('Import configuration:', config)
              toast.success('تم استيراد الإعدادات!')
            }}
          />
        </TabsContent>

        {/* Backup & Restore Tab */}
        <TabsContent value="backup" className="space-y-6">
          <BackupRestore 
            onCreateBackup={(config) => {
              console.log('Create backup:', config)
              toast.success('تم بدء إنشاء النسخة الاحتياطية!')
            }}
            onRestoreBackup={(backupId, options) => {
              console.log('Restore backup:', backupId, options)
              toast.success('تم بدء عملية الاستعادة!')
            }}
            onDeleteBackup={(backupId) => {
              console.log('Delete backup:', backupId)
              toast.success('تم حذف النسخة الاحتياطية!')
            }}
            onScheduleBackup={(schedule) => {
              console.log('Schedule backup:', schedule)
              toast.success('تم جدولة النسخة الاحتياطية!')
            }}
          />
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="mobile-text">{t('ui.sections.systemManagement')}</CardTitle>
              <CardDescription className="mobile-text">
                {t('ui.sections.systemManagementTools')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="mobile-text">{t('ui.sections.security')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.securityStatus')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('ui.sections.secure')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.lastScan')}</span>
                      <span className="text-xs text-muted-foreground">{t('ui.sections.hoursAgo')}</span>
                    </div>
                    <Button variant="outline" className="w-full mobile-button">
                      <Shield className="h-4 w-4 mr-2" />
                      {t('ui.buttons.securityScan')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      <span className="mobile-text">{t('ui.navigation.backups')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.lastBackup')}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(stats.lastBackup)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.lastBackupSize')}</span>
                      <span className="text-xs text-muted-foreground">1.2 GB</span>
                    </div>
                    <Button variant="outline" className="w-full mobile-button">
                      <Database className="h-4 w-4 mr-2" />
                      {t('ui.buttons.createBackup')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <span className="mobile-text">{t('ui.sections.uptime')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.uptime')}</span>
                      <Badge className="bg-green-100 text-green-800">{stats.systemUptime}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.serverResponse')}</span>
                      <span className="text-xs text-muted-foreground">45ms</span>
                    </div>
                    <Button variant="outline" className="w-full mobile-button">
                      <Activity className="h-4 w-4 mr-2" />
                      {t('ui.buttons.performanceCheck')}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-orange-600" />
                      <span className="mobile-text">{t('ui.sections.storage')}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.used')}</span>
                      <span className="text-xs text-muted-foreground">{stats.storageUsed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm mobile-text">{t('ui.sections.available')}</span>
                      <span className="text-xs text-muted-foreground">7.7 GB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                    <Button variant="outline" className="w-full mobile-button">
                      <Target className="h-4 w-4 mr-2" />
                      {t('ui.buttons.storageCleanup')}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Test Tab */}
        <TabsContent value="test" className="space-y-6">
          <LanguageTest />
        </TabsContent>
      </Tabs>
    </div>
  )
}