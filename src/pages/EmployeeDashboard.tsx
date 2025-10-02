import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  TrendingUp,
  Calendar
} from 'lucide-react'
import { formatDate, formatRelativeTime } from '@/lib/utils'

// Mock data - replace with actual API calls
const mockAssignedSurveys = [
  {
    id: '1',
    title: 'استطلاع رضا الموظفين - Q1 2024',
    description: 'قياس مستوى رضا الموظفين عن بيئة العمل والخدمات المقدمة',
    department: 'تكنولوجيا المعلومات',
    status: 'not_started',
    deadline: '2024-02-15T23:59:59Z',
    estimated_time: '10 دقائق',
    created_at: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    title: 'تقييم الأداء السنوي',
    description: 'تقييم أداء الموظفين للعام 2024',
    department: 'جميع الأقسام',
    status: 'in_progress',
    deadline: '2024-02-20T23:59:59Z',
    estimated_time: '15 دقيقة',
    created_at: '2024-01-20T14:30:00Z',
    progress: 60,
  },
  {
    id: '3',
    title: 'استطلاع التدريب والتطوير',
    description: 'تقييم برامج التدريب والتطوير المهني',
    department: 'الموارد البشرية',
    status: 'completed',
    deadline: '2024-01-25T23:59:59Z',
    estimated_time: '8 دقائق',
    created_at: '2024-01-10T09:15:00Z',
    completed_at: '2024-01-24T16:30:00Z',
  },
]

const mockStats = {
  assigned_surveys: 3,
  completed_surveys: 1,
  pending_surveys: 2,
  overdue_surveys: 0,
  total_responses: 1,
  average_completion_time: '12 دقيقة',
}

export default function EmployeeDashboard() {
  const [assignedSurveys, setAssignedSurveys] = useState(mockAssignedSurveys)
  const [stats, setStats] = useState(mockStats)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'not_started':
        return 'bg-gray-100 text-gray-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتمل'
      case 'in_progress':
        return 'قيد التنفيذ'
      case 'not_started':
        return 'لم يبدأ'
      case 'overdue':
        return 'متأخر'
      default:
        return 'غير محدد'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'not_started':
        return <AlertCircle className="h-4 w-4" />
      case 'overdue':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة التحكم - الموظف</h1>
          <p className="text-muted-foreground">
            الاستطلاعات المخصصة لك
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            عرض التقارير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستطلاعات المخصصة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.assigned_surveys}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pending_surveys} في الانتظار
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed_surveys}</div>
            <p className="text-xs text-muted-foreground">
              من أصل {stats.assigned_surveys}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتأخرة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overdue_surveys}</div>
            <p className="text-xs text-muted-foreground">
              تحتاج إلى إكمال
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط وقت الإكمال</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.average_completion_time}</div>
            <p className="text-xs text-muted-foreground">
              لكل استطلاع
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Surveys */}
      <Card>
        <CardHeader>
          <CardTitle>الاستطلاعات المخصصة لك</CardTitle>
          <CardDescription>
            الاستطلاعات التي تحتاج إلى إكمالها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedSurveys.map((survey) => {
              const overdue = isOverdue(survey.deadline)
              const currentStatus = overdue && survey.status !== 'completed' ? 'overdue' : survey.status
              
              return (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(currentStatus)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{survey.title}</h3>
                        <Badge className={getStatusColor(currentStatus)}>
                          {getStatusText(currentStatus)}
                        </Badge>
                        {overdue && survey.status !== 'completed' && (
                          <Badge variant="destructive">متأخر</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {survey.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {survey.department}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {survey.estimated_time}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          انتهاء: {formatDate(survey.deadline)}
                        </span>
                      </div>
                      {survey.status === 'in_progress' && survey.progress && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>التقدم</span>
                            <span>{survey.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${survey.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {survey.status === 'completed' ? (
                      <div className="text-right">
                        <p className="text-sm text-green-600 font-medium">مكتمل</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(survey.completed_at || '')}
                        </p>
                      </div>
                    ) : (
                      <Button 
                        variant={currentStatus === 'overdue' ? 'destructive' : 'default'}
                        size="sm"
                      >
                        {currentStatus === 'in_progress' ? 'متابعة' : 'بدء الاستطلاع'}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {assignedSurveys.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد استطلاعات</h3>
              <p className="text-muted-foreground">
                لا توجد استطلاعات مخصصة لك حالياً
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Completed Surveys */}
      <Card>
        <CardHeader>
          <CardTitle>الاستطلاعات المكتملة</CardTitle>
          <CardDescription>
            الاستطلاعات التي أكملتها مؤخراً
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignedSurveys
              .filter(survey => survey.status === 'completed')
              .map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50/50"
                >
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-medium">{survey.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        مكتمل في {formatDate(survey.completed_at || '')}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    عرض التفاصيل
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
