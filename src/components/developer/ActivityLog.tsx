import { useState } from 'react'
import { searchActivityLogs } from '@/lib/smartSearch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity,
  Users,
  UserCheck,
  UserX,
  FileText,
  MessageSquare,
  Settings,
  Shield,
  Database,
  Download,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react'

interface ActivityLogEntry {
  id: string
  type: 'employee_registered' | 'employee_promoted' | 'employee_demoted' | 'survey_created' | 'survey_published' | 'survey_closed' | 'response_submitted' | 'system_backup' | 'security_scan' | 'login' | 'logout'
  title: string
  description: string
  user: string
  userId: string
  timestamp: string
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'user' | 'survey' | 'system' | 'security'
}

interface ActivityLogProps {
  onExport: (logs: ActivityLogEntry[]) => void
}

export default function ActivityLog({ onExport }: ActivityLogProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // Mock activity log data
  const activityLogs: ActivityLogEntry[] = [
    {
      id: '1',
      type: 'employee_promoted',
      title: 'ترقية موظف',
      description: 'تم ترقية أحمد محمد علي من موظف إلى مدير',
      user: 'المطور الرئيسي',
      userId: 'dev-001',
      timestamp: '2024-01-20T10:30:00Z',
      metadata: {
        employeeId: 'emp-001',
        fromRole: 'employee',
        toRole: 'admin',
        note: 'ترقية لمساهماته المتميزة'
      },
      severity: 'medium',
      category: 'user'
    },
    {
      id: '2',
      type: 'survey_created',
      title: 'إنشاء استطلاع',
      description: 'تم إنشاء استطلاع "رضا الموظفين Q1 2024"',
      user: 'فاطمة أحمد',
      userId: 'admin-002',
      timestamp: '2024-01-20T09:15:00Z',
      metadata: {
        surveyId: 'survey-001',
        surveyType: 'internal',
        title: 'رضا الموظفين Q1 2024'
      },
      severity: 'low',
      category: 'survey'
    },
    {
      id: '3',
      type: 'employee_registered',
      title: 'تسجيل موظف جديد',
      description: 'انضم محمد السعيد إلى النظام',
      user: 'محمد السعيد',
      userId: 'emp-003',
      timestamp: '2024-01-19T16:45:00Z',
      metadata: {
        department: 'المحاسبة',
        position: 'محاسب'
      },
      severity: 'low',
      category: 'user'
    },
    {
      id: '4',
      type: 'system_backup',
      title: 'نسخة احتياطية',
      description: 'تم إنشاء نسخة احتياطية للنظام بنجاح',
      user: 'النظام',
      userId: 'system',
      timestamp: '2024-01-20T02:00:00Z',
      metadata: {
        backupSize: '1.2 GB',
        duration: '15 minutes'
      },
      severity: 'low',
      category: 'system'
    },
    {
      id: '5',
      type: 'security_scan',
      title: 'فحص أمني',
      description: 'تم إجراء فحص أمني شامل للنظام',
      user: 'النظام',
      userId: 'system',
      timestamp: '2024-01-19T22:00:00Z',
      metadata: {
        threatsFound: 0,
        scanDuration: '5 minutes'
      },
      severity: 'medium',
      category: 'security'
    },
    {
      id: '6',
      type: 'employee_demoted',
      title: 'تراجع عن ترقية',
      description: 'تم تراجع ترقية سارة علي من مدير إلى موظف',
      user: 'المطور الرئيسي',
      userId: 'dev-001',
      timestamp: '2024-01-18T14:20:00Z',
      metadata: {
        employeeId: 'emp-004',
        fromRole: 'admin',
        toRole: 'employee',
        note: 'إعادة هيكلة الأدوار'
      },
      severity: 'medium',
      category: 'user'
    },
    {
      id: '7',
      type: 'survey_published',
      title: 'نشر استطلاع',
      description: 'تم نشر استطلاع "تقييم الخدمات"',
      user: 'أحمد محمد علي',
      userId: 'admin-001',
      timestamp: '2024-01-18T11:30:00Z',
      metadata: {
        surveyId: 'survey-002',
        targetAudience: 'external'
      },
      severity: 'low',
      category: 'survey'
    }
  ]

  const filteredLogs = searchActivityLogs(activityLogs, searchTerm).filter(log => {
    const matchesCategory = categoryFilter === 'all' || log.category === categoryFilter
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter
    return matchesCategory && matchesSeverity
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee_registered': return <Users className="h-4 w-4 text-blue-600" />
      case 'employee_promoted': return <UserCheck className="h-4 w-4 text-green-600" />
      case 'employee_demoted': return <UserX className="h-4 w-4 text-orange-600" />
      case 'survey_created': return <FileText className="h-4 w-4 text-purple-600" />
      case 'survey_published': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'survey_closed': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'response_submitted': return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'system_backup': return <Database className="h-4 w-4 text-gray-600" />
      case 'security_scan': return <Shield className="h-4 w-4 text-red-600" />
      case 'login': return <User className="h-4 w-4 text-green-600" />
      case 'logout': return <User className="h-4 w-4 text-gray-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low': return 'منخفض'
      case 'medium': return 'متوسط'
      case 'high': return 'عالي'
      case 'critical': return 'حرج'
      default: return 'غير محدد'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'user': return 'المستخدمون'
      case 'survey': return 'الاستطلاعات'
      case 'system': return 'النظام'
      case 'security': return 'الأمان'
      default: return 'غير محدد'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLogsByCategory = (category: string) => {
    return activityLogs.filter(log => log.category === category)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">سجل الأنشطة</h2>
          <p className="text-muted-foreground">
            تتبع جميع الأنشطة والتغييرات في النظام
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => onExport(filteredLogs)}>
            <Download className="h-4 w-4 mr-2" />
            تصدير السجل
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الأنشطة</p>
                <p className="text-2xl font-bold">{activityLogs.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">أنشطة المستخدمين</p>
                <p className="text-2xl font-bold">{getLogsByCategory('user').length}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">أنشطة الاستطلاعات</p>
                <p className="text-2xl font-bold">{getLogsByCategory('survey').length}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">أنشطة النظام</p>
                <p className="text-2xl font-bold">{getLogsByCategory('system').length + getLogsByCategory('security').length}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="بحث ذكي: العنوان، الوصف، اسم المستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                <SelectItem value="user">المستخدمون</SelectItem>
                <SelectItem value="survey">الاستطلاعات</SelectItem>
                <SelectItem value="system">النظام</SelectItem>
                <SelectItem value="security">الأمان</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="low">منخفض</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="high">عالي</SelectItem>
                <SelectItem value="critical">حرج</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="user">المستخدمون</TabsTrigger>
          <TabsTrigger value="survey">الاستطلاعات</TabsTrigger>
          <TabsTrigger value="system">النظام</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
        </TabsList>

        {/* All Activities Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>جميع الأنشطة</CardTitle>
              <CardDescription>
                سجل شامل لجميع الأنشطة في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getActivityIcon(log.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{log.title}</h3>
                              <Badge className={getSeverityColor(log.severity)}>
                                {getSeverityText(log.severity)}
                              </Badge>
                              <Badge variant="outline">
                                {getCategoryText(log.category)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {log.description}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{log.user}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(log.timestamp)}</span>
                              </div>
                            </div>
                            {log.metadata && (
                              <div className="mt-2 p-2 bg-muted rounded text-xs">
                                <strong>تفاصيل إضافية:</strong>
                                <pre className="mt-1 text-xs">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activities Tab */}
        <TabsContent value="user" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أنشطة المستخدمين</CardTitle>
              <CardDescription>
                الترقيات، التسجيلات، وأنشطة المستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.filter(log => log.category === 'user').map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{log.title}</h3>
                            <Badge className={getSeverityColor(log.severity)}>
                              {getSeverityText(log.severity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>بواسطة: {log.user}</span>
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Survey Activities Tab */}
        <TabsContent value="survey" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أنشطة الاستطلاعات</CardTitle>
              <CardDescription>
                إنشاء، نشر، وإدارة الاستطلاعات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.filter(log => log.category === 'survey').map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{log.title}</h3>
                            <Badge className={getSeverityColor(log.severity)}>
                              {getSeverityText(log.severity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>بواسطة: {log.user}</span>
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Activities Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أنشطة النظام</CardTitle>
              <CardDescription>
                النسخ الاحتياطية، الصيانة، وأنشطة النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.filter(log => log.category === 'system').map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{log.title}</h3>
                            <Badge className={getSeverityColor(log.severity)}>
                              {getSeverityText(log.severity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>بواسطة: {log.user}</span>
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Activities Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أنشطة الأمان</CardTitle>
              <CardDescription>
                الفحوصات الأمنية وأنشطة الحماية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredLogs.filter(log => log.category === 'security').map((log) => (
                  <Card key={log.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getActivityIcon(log.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{log.title}</h3>
                            <Badge className={getSeverityColor(log.severity)}>
                              {getSeverityText(log.severity)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {log.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>بواسطة: {log.user}</span>
                            <span>{formatDate(log.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
