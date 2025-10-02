import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  FileText,
  MessageSquare,
  Calendar,
  Clock,
  Activity,
  Eye,
  Target,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Shield,
  Database
} from 'lucide-react'

interface SystemStats {
  totalEmployees: number
  totalAdmins: number
  totalSurveys: number
  totalResponses: number
  newEmployeesThisWeek: number
  newEmployeesThisMonth: number
  activeSurveys: number
  completedSurveys: number
  averageResponseRate: number
  systemUptime: string
  lastBackup: string
  storageUsed: string
  totalStorage: string
}

interface ActivityTrend {
  date: string
  employees: number
  surveys: number
  responses: number
}

interface SystemStatisticsProps {
  onExport: (data: any) => void
}

export default function SystemStatistics({ onExport }: SystemStatisticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState('30days')

  // Mock data
  const systemStats: SystemStats = {
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

  const activityTrends: ActivityTrend[] = [
    { date: '2024-01-14', employees: 2, surveys: 1, responses: 45 },
    { date: '2024-01-15', employees: 1, surveys: 2, responses: 67 },
    { date: '2024-01-16', employees: 3, surveys: 0, responses: 23 },
    { date: '2024-01-17', employees: 0, surveys: 1, responses: 89 },
    { date: '2024-01-18', employees: 2, surveys: 1, responses: 56 },
    { date: '2024-01-19', employees: 1, surveys: 0, responses: 34 },
    { date: '2024-01-20', employees: 2, surveys: 1, responses: 78 }
  ]

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Target className="h-4 w-4 text-blue-600" />
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600'
    if (current < previous) return 'text-red-600'
    return 'text-blue-600'
  }

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const change = ((current - previous) / previous) * 100
    return `${change > 0 ? '+' : ''}${change.toFixed(1)}%`
  }


  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إحصائيات النظام</h2>
          <p className="text-muted-foreground">
            مراقبة أداء النظام والنمو
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">آخر 7 أيام</SelectItem>
              <SelectItem value="30days">آخر 30 يوم</SelectItem>
              <SelectItem value="90days">آخر 90 يوم</SelectItem>
              <SelectItem value="1year">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold">{systemStats.totalEmployees.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              {getTrendIcon(systemStats.newEmployeesThisMonth, 8)}
              <span className={`text-sm font-medium ${getTrendColor(systemStats.newEmployeesThisMonth, 8)}`}>
                +{systemStats.newEmployeesThisMonth} هذا الشهر
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المديرون</p>
                <p className="text-2xl font-bold">{systemStats.totalAdmins}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {((systemStats.totalAdmins / systemStats.totalEmployees) * 100).toFixed(1)}% من الموظفين
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الاستطلاعات</p>
                <p className="text-2xl font-bold">{systemStats.totalSurveys}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <Badge variant="outline" className="text-green-600">
                {systemStats.activeSurveys} نشط
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الردود</p>
                <p className="text-2xl font-bold">{systemStats.totalResponses.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {systemStats.averageResponseRate}% معدل الاستجابة
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="activity">النشاط</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="storage">التخزين</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>نمو الموظفين</CardTitle>
                <CardDescription>
                  إحصائيات تسجيل الموظفين الجدد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>هذا الأسبوع</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{systemStats.newEmployeesThisWeek}</span>
                      <Badge variant="outline" className="text-green-600">
                        +{systemStats.newEmployeesThisWeek}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <span>هذا الشهر</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{systemStats.newEmployeesThisMonth}</span>
                      <Badge variant="outline" className="text-green-600">
                        +{systemStats.newEmployeesThisMonth}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>حالة الاستطلاعات</CardTitle>
                <CardDescription>
                  توزيع الاستطلاعات حسب الحالة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-green-600" />
                      <span>نشط</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{systemStats.activeSurveys}</span>
                      <Badge variant="outline" className="text-green-600">
                        {((systemStats.activeSurveys / systemStats.totalSurveys) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span>مكتمل</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{systemStats.completedSurveys}</span>
                      <Badge variant="outline" className="text-blue-600">
                        {((systemStats.completedSurveys / systemStats.totalSurveys) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اتجاهات النشاط</CardTitle>
              <CardDescription>
                نشاط النظام خلال الفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityTrends.map((trend, index) => (
                  <div key={trend.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium">{formatDate(trend.date)}</div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{trend.employees}</div>
                        <div className="text-xs text-muted-foreground">موظفون جدد</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{trend.surveys}</div>
                        <div className="text-xs text-muted-foreground">استطلاعات</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{trend.responses}</div>
                        <div className="text-xs text-muted-foreground">ردود</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>أداء النظام</CardTitle>
              <CardDescription>
                مؤشرات الأداء التقنية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span>وقت التشغيل</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {systemStats.systemUptime}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>آخر نسخة احتياطية</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(systemStats.lastBackup)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <span>الأمان</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      آمن
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span>الوصول</span>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      متاح
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>استخدام التخزين</CardTitle>
              <CardDescription>
                مراقبة استخدام مساحة التخزين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">المساحة المستخدمة</span>
                    <span className="text-sm text-muted-foreground">
                      {systemStats.storageUsed} من {systemStats.totalStorage}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: '23%' }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    23% مستخدم
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Database className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-lg font-bold">1.2 GB</div>
                    <div className="text-xs text-muted-foreground">قاعدة البيانات</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold">0.8 GB</div>
                    <div className="text-xs text-muted-foreground">الملفات</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-lg font-bold">0.3 GB</div>
                    <div className="text-xs text-muted-foreground">التقارير</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
