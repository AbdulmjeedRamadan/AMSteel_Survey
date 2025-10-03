import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { searchClients } from '@/lib/smartSearch'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Building,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'

interface Client {
  id: string
  name: string
  company: string
  email: string
  phone?: string
  location?: string
  joinDate: string
  totalSurveys: number
  completedSurveys: number
  averageRating: number
  lastActivity: string
  status: 'active' | 'inactive' | 'suspended'
  improvementPercentage: number
  trend: 'up' | 'down' | 'stable'
}

interface SurveyProgress {
  id: string
  title: string
  status: 'draft' | 'active' | 'completed'
  responses: number
  targetResponses: number
  completionRate: number
  averageRating: number
  lastResponse: string
  improvement: number
}

interface ClientTrackingProps {
  onExport: (clients: Client[], format: 'csv' | 'pdf') => void
}

export default function ClientTracking({ onExport: _onExport }: ClientTrackingProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('clients')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [trendFilter, setTrendFilter] = useState('all')

  // Mock data
  const clients: Client[] = [
    {
      id: '1',
      name: 'أحمد السعيد',
      company: 'شركة الرياض للتجارة',
      email: 'ahmed@riyadh-trade.com',
      phone: '+966501234567',
      location: 'الرياض',
      joinDate: '2024-01-01',
      totalSurveys: 2,
      completedSurveys: 1,
      averageRating: 4.2,
      lastActivity: '2024-01-20',
      status: 'active',
      improvementPercentage: 15,
      trend: 'up'
    },
    {
      id: '2',
      name: 'فاطمة محمد',
      company: 'مؤسسة جدة للاستثمار',
      email: 'fatima@jeddah-investment.com',
      phone: '+966507654321',
      location: 'جدة',
      joinDate: '2024-01-05',
      totalSurveys: 1,
      completedSurveys: 1,
      averageRating: 4.5,
      lastActivity: '2024-01-18',
      status: 'active',
      improvementPercentage: 8,
      trend: 'up'
    },
    {
      id: '3',
      name: 'محمد العلي',
      company: 'مجموعة الحلول المتكاملة',
      email: 'mohammed@integrated-solutions.com',
      phone: '0505678901',
      location: 'الدمام',
      joinDate: '2024-01-08',
      totalSurveys: 0,
      completedSurveys: 0,
      averageRating: 0,
      lastActivity: '2024-01-12',
      status: 'inactive',
      improvementPercentage: 0,
      trend: 'stable'
    },
    {
      id: '4',
      name: 'نورا الزهراني',
      company: 'شركة الابتكار التقني',
      email: 'nora.alzahrani@tech-innovation.sa',
      phone: '966-50-456-7890',
      location: 'أبها',
      joinDate: '2024-01-10',
      totalSurveys: 3,
      completedSurveys: 2,
      averageRating: 4.7,
      lastActivity: '2024-01-22',
      status: 'active',
      improvementPercentage: 25,
      trend: 'up'
    },
    {
      id: '5',
      name: 'خالد المطيري',
      company: 'مؤسسة الخليج للتطوير',
      email: 'khalid.almutairi@gulf-development.com',
      phone: '+966 50 789 0123',
      location: 'الكويت',
      joinDate: '2024-01-12',
      totalSurveys: 1,
      completedSurveys: 0,
      averageRating: 0,
      lastActivity: '2024-01-15',
      status: 'pending',
      improvementPercentage: -5,
      trend: 'down'
    },
    {
      id: '6',
      name: 'سارة القحطاني',
      company: 'شركة الرؤية المستقبلية',
      email: 'sara.alqahtani@future-vision.org',
      phone: '966505123456',
      location: 'الرياض',
      joinDate: '2024-01-15',
      totalSurveys: 2,
      completedSurveys: 2,
      averageRating: 4.1,
      lastActivity: '2024-01-21',
      status: 'active',
      improvementPercentage: 18,
      trend: 'up'
    }
  ]

  const clientProgress: SurveyProgress[] = [
    {
      id: '1',
      title: 'استطلاع رضا العملاء - Q1 2024',
      status: 'completed',
      responses: 45,
      targetResponses: 50,
      completionRate: 90,
      averageRating: 4.2,
      lastResponse: '2024-01-15',
      improvement: 12
    },
    {
      id: '2',
      title: 'تقييم الخدمات المقدمة',
      status: 'active',
      responses: 23,
      targetResponses: 30,
      completionRate: 77,
      averageRating: 3.8,
      lastResponse: '2024-01-14',
      improvement: -3
    }
  ]

  const filteredClients = searchClients(clients, searchTerm).filter(client => {
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    const matchesTrend = trendFilter === 'all' || client.trend === trendFilter
    return matchesStatus && matchesTrend
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'suspended': return 'معلق'
      default: return 'غير محدد'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable': return <Target className="h-4 w-4 text-blue-600" />
      default: return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      case 'stable': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }


  const getOverallStats = () => {
    const totalClients = clients.length
    const activeClients = clients.filter(c => c.status === 'active').length
    const averageRating = clients.reduce((acc, c) => acc + c.averageRating, 0) / clients.length
    const totalSurveys = clients.reduce((acc, c) => acc + c.totalSurveys, 0)
    
    return {
      totalClients,
      activeClients,
      averageRating: Math.round(averageRating * 10) / 10,
      totalSurveys
    }
  }

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('ui.management.clientTracking')}</h2>
          <p className="text-muted-foreground">
            {t('ui.management.viewTrackClientProgress')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي العملاء</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العملاء النشطون</p>
                <p className="text-2xl font-bold">{stats.activeClients}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط التقييم</p>
                <p className="text-2xl font-bold">{stats.averageRating}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الاستطلاعات</p>
                <p className="text-2xl font-bold">{stats.totalSurveys}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
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
                placeholder="بحث ذكي: اسم الشخص، اسم الشركة، الإيميل، رقم الجوال..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="suspended">معلق</SelectItem>
              </SelectContent>
            </Select>
            <Select value={trendFilter} onValueChange={setTrendFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="up">متقدم</SelectItem>
                <SelectItem value="down">متأخر</SelectItem>
                <SelectItem value="stable">مستقر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="clients">العملاء</TabsTrigger>
          <TabsTrigger value="progress">التقدم</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>قائمة العملاء</CardTitle>
              <CardDescription>
                عرض وإدارة جميع العملاء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div>
                              <h3 className="font-medium">{client.name}</h3>
                              <p className="text-sm text-muted-foreground">{client.company}</p>
                            </div>
                            <Badge className={getStatusColor(client.status)}>
                              {getStatusText(client.status)}
                            </Badge>
                            <div className={`flex items-center space-x-1 ${getTrendColor(client.trend)}`}>
                              {getTrendIcon(client.trend)}
                              <span className="text-sm font-medium">
                                {client.improvementPercentage > 0 ? '+' : ''}{client.improvementPercentage}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{client.email}</span>
                            </div>
                            {client.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{client.phone}</span>
                              </div>
                            )}
                            {client.location && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{client.location}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>انضم: {formatDate(client.joinDate)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>آخر نشاط: {formatDate(client.lastActivity)}</span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-lg font-bold text-primary">{client.totalSurveys}</div>
                              <div className="text-xs text-muted-foreground">إجمالي الاستطلاعات</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-green-600">{client.completedSurveys}</div>
                              <div className="text-xs text-muted-foreground">المكتملة</div>
                            </div>
                            <div>
                              <div className="text-lg font-bold text-yellow-600">{client.averageRating}</div>
                              <div className="text-xs text-muted-foreground">متوسط التقييم</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="mobile-button">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="mobile-button">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقدم الاستطلاعات</CardTitle>
              <CardDescription>
                مراقبة تقدم الاستطلاعات مع العملاء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientProgress.map((progress) => (
                  <Card key={progress.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="font-medium">{progress.title}</h3>
                            <Badge variant={progress.status === 'completed' ? 'default' : 'secondary'}>
                              {progress.status === 'completed' ? 'مكتمل' : 'نشط'}
                            </Badge>
                            <div className={`flex items-center space-x-1 ${
                              progress.improvement > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {progress.improvement > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="text-sm font-medium">
                                {progress.improvement > 0 ? '+' : ''}{progress.improvement}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">{progress.responses}</div>
                              <div className="text-xs text-muted-foreground">الردود</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{progress.targetResponses}</div>
                              <div className="text-xs text-muted-foreground">الهدف</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{progress.completionRate}%</div>
                              <div className="text-xs text-muted-foreground">معدل الإكمال</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-yellow-600">{progress.averageRating}</div>
                              <div className="text-xs text-muted-foreground">متوسط التقييم</div>
                            </div>
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress.completionRate}%` }}
                            ></div>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات العملاء</CardTitle>
              <CardDescription>
                إحصائيات مفصلة عن أداء العملاء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">التحليلات قيد التطوير</h3>
                <p className="text-muted-foreground">
                  ستتوفر التحليلات المتقدمة قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
