import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchSurveys } from '@/lib/smartSearch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Plus,
  Download,
  Eye,
  Edit,
  ChevronDown,
  BarChart3,
  Users,
  TrendingUp,
  FileText,
  Calendar,
  Target,
  CheckCircle,
  Play,
  MoreHorizontal,
  Share2,
  Trash2,
  Copy
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// Import new components
import ResponseManagement from '@/components/admin/ResponseManagement'
import ClientTracking from '@/components/admin/ClientTracking'
import SurveySharing from '@/components/admin/SurveySharing'
import SurveySettings from '@/components/admin/SurveySettings'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [selectedSurveys, setSelectedSurveys] = useState<string[]>([])
  const [selectedSurveyForSharing, setSelectedSurveyForSharing] = useState<string | null>(null)

  // Mock data - Only surveys owned by current admin
  const currentAdminId = 'admin-001' // In real app, this would come from auth store
  const surveys = [
    {
      id: '1',
      title: 'استطلاع رضا الموظفين',
      description: 'تقييم مستوى الرضا الوظيفي',
      status: 'active' as const,
      type: 'internal' as const,
      responses: 45,
      target: 100,
      created_at: '2024-01-15',
      updated_at: '2024-01-15',
      end_date: '2024-02-15',
      completion_rate: 75,
      admin_id: currentAdminId
    },
    {
      id: '2',
      title: 'تقييم الخدمات',
      description: 'تقييم جودة الخدمات المقدمة',
      status: 'draft' as const,
      type: 'external' as const,
      responses: 0,
      target: 50,
      created_at: '2024-01-20',
      updated_at: '2024-01-20',
      end_date: null,
      completion_rate: 0,
      client_name: 'شركة الرياض للتجارة',
      admin_id: currentAdminId
    },
    {
      id: '3',
      title: 'استطلاع التدريب',
      description: 'تقييم برامج التدريب',
      status: 'paused' as const,
      type: 'internal' as const,
      responses: 23,
      target: 80,
      created_at: '2024-01-10',
      updated_at: '2024-01-10',
      end_date: '2024-01-25',
      completion_rate: 60,
      admin_id: currentAdminId
    },
    {
      id: '4',
      title: 'استطلاع رضا العملاء',
      description: 'قياس مستوى رضا العملاء عن الخدمات',
      status: 'active' as const,
      type: 'external' as const,
      responses: 67,
      target: 100,
      created_at: '2024-01-05',
      updated_at: '2024-01-18',
      end_date: '2024-02-05',
      completion_rate: 67,
      client_name: 'مؤسسة جدة للاستثمار',
      admin_id: currentAdminId
    }
  ]

  // Get unique clients for filter dropdown
  const uniqueClients = [...new Set(surveys
    .filter(survey => survey.client_name)
    .map(survey => survey.client_name)
  )]

  const stats = {
    totalSurveys: surveys.length,
    activeSurveys: surveys.filter(s => s.status === 'active').length,
    totalResponses: surveys.reduce((sum, s) => sum + s.responses, 0),
    completionRate: Math.round(surveys.reduce((sum, s) => sum + s.completion_rate, 0) / surveys.length),
    thisMonth: 45,
    lastMonth: 38,
    totalClients: uniqueClients.length
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'closed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'draft': return 'مسودة'
      case 'paused': return 'متوقف'
      case 'closed': return 'مغلق'
      default: return 'غير محدد'
    }
  }

  const filteredSurveys = surveys.filter(survey => {
    // Admin can only see their own surveys
    const isOwnSurvey = survey.admin_id === currentAdminId
    
    // البحث الذكي
    const matchesSearch = !searchTerm.trim() || 
      searchSurveys([survey], searchTerm).length > 0
    
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter
    const matchesClient = clientFilter === 'all' || 
                         (survey.client_name && survey.client_name === clientFilter)
    return isOwnSurvey && matchesSearch && matchesStatus && matchesClient
  })

  // Survey Actions
  const handleViewSurvey = (surveyId: string) => {
    navigate(`/admin/survey-builder/${surveyId}?tab=preview`)
    toast.success('جاري فتح الاستطلاع')
  }

  const handleEditSurvey = (surveyId: string) => {
    navigate(`/admin/survey-builder/${surveyId}`)
    toast.success('جاري فتح محرر الاستطلاع')
  }

  const handleViewAnalytics = (surveyId: string) => {
    navigate(`/admin/survey-builder/${surveyId}?tab=analytics`)
    toast.success('جاري فتح التحليلات')
  }

  const handleShareSurvey = (surveyId: string) => {
    navigate(`/admin/survey-builder/${surveyId}?tab=sharing`)
    toast.success('جاري فتح خيارات المشاركة')
  }

  const handleDuplicateSurvey = (surveyId: string) => {
    const survey = surveys.find(s => s.id === surveyId)
    if (survey) {
      // Create a copy with new ID
      const newSurvey = {
        ...survey,
        id: Date.now().toString(),
        title: `${survey.title} (نسخة)`,
        status: 'draft' as const,
        responses: 0,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      }
      console.log('New survey created:', newSurvey)
      toast.success('تم نسخ الاستطلاع بنجاح')
      // In real app, this would save to backend
    }
  }

  const handleDeleteSurvey = (surveyId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الاستطلاع؟')) {
      console.log('Deleting survey:', surveyId)
      toast.success('تم حذف الاستطلاع')
      // In real app, this would delete from backend
    }
  }

  const handleExportData = (format: 'csv' | 'pdf' = 'csv') => {
    // Check if at least one survey is selected
    if (selectedSurveys.length === 0) {
      toast.error('يجب اختيار استطلاع واحد على الأقل للتصدير')
      return
    }

    // Get selected surveys data
    const surveysToExport = surveys.filter(s => selectedSurveys.includes(s.id))
    
    if (format === 'csv') {
      // CSV export logic
      const csvContent = surveysToExport.map(s => 
        `"${s.title}","${s.status}","${s.type}","${s.responses}","${s.created_at}","${s.client_name || 'N/A'}"`
      ).join('\n')
      const csvHeader = 'العنوان,الحالة,النوع,عدد الردود,تاريخ الإنشاء,العميل\n'
      const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `surveys-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === 'pdf') {
      // PDF export would be handled by a PDF library
      console.log('PDF export would be implemented with a PDF library')
    }
    
    toast.success(`تم تصدير ${surveysToExport.length} استطلاع بصيغة ${format.toUpperCase()}`)
  }

  const handleCreateSurvey = () => {
    navigate('/admin/survey-builder')
    toast.success('جاري إنشاء استطلاع جديد')
  }

  const handleSelectSurvey = (surveyId: string) => {
    setSelectedSurveys(prev => 
      prev.includes(surveyId) 
        ? prev.filter(id => id !== surveyId)
        : [...prev, surveyId]
    )
  }

  const handleSelectAllSurveys = () => {
    if (selectedSurveys.length === filteredSurveys.length) {
      setSelectedSurveys([])
    } else {
      setSelectedSurveys(filteredSurveys.map(s => s.id))
    }
  }

  const getSelectedSurveyForSharing = () => {
    if (!selectedSurveyForSharing) return null
    return surveys.find(s => s.id === selectedSurveyForSharing)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة المدير</h1>
          <p className="text-muted-foreground">
            إدارة الاستطلاعات والتحليلات
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                disabled={selectedSurveys.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                تصدير
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                تصدير CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                تصدير PDF
              </DropdownMenuItem>
              {selectedSurveys.length > 0 && (
                <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                  عدد الملفات المحددة: {selectedSurveys.length}
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleCreateSurvey}>
            <Plus className="h-4 w-4 mr-2" />
            استطلاع جديد
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">إجراءات سريعة</h3>
              <p className="text-sm text-muted-foreground">الوصول السريع للميزات الرئيسية</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleCreateSurvey}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>إنشاء استطلاع</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={selectedSurveys.length === 0}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>تصدير</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExportData('csv')}>
                    <Download className="h-4 w-4 mr-2" />
                    تصدير CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportData('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    تصدير PDF
                  </DropdownMenuItem>
                  {selectedSurveys.length > 0 && (
                    <div className="px-2 py-1 text-xs text-muted-foreground border-t">
                      عدد الملفات المحددة: {selectedSurveys.length}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="outline" 
                onClick={() => setActiveTab('settings')}
                className="flex items-center space-x-2"
              >
                <Target className="h-4 w-4" />
                <span>إعدادات الاستطلاعات</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الاستطلاعات</p>
                <p className="text-2xl font-bold">{stats.totalSurveys}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-muted-foreground mr-2">من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الاستطلاعات النشطة</p>
                <p className="text-2xl font-bold">{stats.activeSurveys}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Play className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">جميعها تعمل بشكل طبيعي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الردود</p>
                <p className="text-2xl font-bold">{stats.totalResponses}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+18%</span>
              <span className="text-muted-foreground mr-2">من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الإكمال</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+5%</span>
              <span className="text-muted-foreground mr-2">من الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">العملاء</p>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
              </div>
              <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">عملاء خارجيين</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="surveys">الاستطلاعات</TabsTrigger>
          <TabsTrigger value="responses">الردود</TabsTrigger>
          <TabsTrigger value="clients">العملاء</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          <TabsTrigger value="sharing">المشاركة</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الاستطلاعات الأخيرة</CardTitle>
                <CardDescription>
                  آخر الاستطلاعات التي تم إنشاؤها
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {surveys.slice(0, 3).map((survey) => (
                    <div key={survey.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{survey.title}</p>
                          <p className="text-sm text-muted-foreground">{survey.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(survey.status)}>
                          {getStatusText(survey.status)}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات هذا الشهر</CardTitle>
                <CardDescription>
                  مقارنة مع الشهر الماضي
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">الردود الجديدة</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{stats.thisMonth}</span>
                      <Badge variant="secondary" className="text-green-600">
                        +{stats.thisMonth - stats.lastMonth}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">الاستطلاعات النشطة</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{stats.activeSurveys}</span>
                      <Badge variant="secondary" className="text-blue-600">
                        +2
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">معدل المشاركة</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold">{stats.completionRate}%</span>
                      <Badge variant="secondary" className="text-green-600">
                        +5%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Surveys Tab */}
        <TabsContent value="surveys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة الاستطلاعات</CardTitle>
                  <CardDescription>
                    عرض وإدارة جميع الاستطلاعات
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedSurveys.length === filteredSurveys.length && filteredSurveys.length > 0}
                      onCheckedChange={handleSelectAllSurveys}
                    />
                    <span className="text-sm text-muted-foreground">
                      تحديد الكل ({selectedSurveys.length}/{filteredSurveys.length})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="بحث ذكي: عنوان الاستطلاع، الوصف، اسم العميل..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">الكل</SelectItem>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="paused">متوقف</SelectItem>
                        <SelectItem value="closed">مغلق</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="فلترة حسب العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع العملاء</SelectItem>
                        {uniqueClients.map((client) => (
                          <SelectItem key={client} value={client || ''}>
                            {client}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSurveys.map((survey) => (
                  <div key={survey.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center space-x-4">
                      <Checkbox
                        checked={selectedSurveys.includes(survey.id)}
                        onCheckedChange={() => handleSelectSurvey(survey.id)}
                      />
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{survey.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {survey.type === 'internal' ? 'داخلي' : 'خارجي'}
                          </Badge>
                          {survey.client_name && (
                            <Badge variant="secondary" className="text-xs">
                              {survey.client_name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{survey.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{survey.responses}/{survey.target} رد</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>أنشئ في {survey.created_at}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(survey.status)}>
                        {getStatusText(survey.status)}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewSurvey(survey.id)}
                          title="عرض الاستطلاع"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditSurvey(survey.id)}
                          title="تحرير الاستطلاع"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            setSelectedSurveyForSharing(survey.id)
                            setActiveTab('sharing')
                          }}
                          title="مشاركة الاستطلاع"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewAnalytics(survey.id)}
                          title="عرض التحليلات"
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleShareSurvey(survey.id)}
                          title="مشاركة الاستطلاع"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDuplicateSurvey(survey.id)}
                          title="تكرار الاستطلاع"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteSurvey(survey.id)}
                          title="حذف الاستطلاع"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Responses Tab */}
        <TabsContent value="responses" className="space-y-6">
          <ResponseManagement 
            surveyId={undefined}
            onExport={(responses, format) => {
              console.log('Export responses:', responses.length, 'format:', format)
              
              if (format === 'csv') {
                // CSV export logic
                const csvContent = responses.map(r => 
                  `"${r.surveyTitle}","${r.respondentName || 'مجهول'}","${r.status}","${r.startedAt}"`
                ).join('\n')
                const csvHeader = 'الاستطلاع,المستجيب,الحالة,تاريخ الإرسال\n'
                const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `responses-export-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              } else if (format === 'pdf') {
                // PDF export would be handled by a PDF library
                console.log('PDF export would be implemented with a PDF library')
              }
              
              toast.success(`تم تصدير ${responses.length} رد بصيغة ${format.toUpperCase()}!`)
            }}
          />
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients" className="space-y-6">
          <ClientTracking 
            onExport={(clients, format) => {
              console.log('Export clients:', clients.length, 'format:', format)
              
              if (format === 'csv') {
                // CSV export logic
                const csvContent = clients.map(c => 
                  `"${c.name}","${c.company}","${c.email}","${c.totalSurveys}","${c.averageRating}","${c.status}"`
                ).join('\n')
                const csvHeader = 'الاسم,الشركة,البريد الإلكتروني,عدد الاستطلاعات,متوسط التقييم,الحالة\n'
                const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `clients-export-${new Date().toISOString().split('T')[0]}.csv`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
              } else if (format === 'pdf') {
                // PDF export would be handled by a PDF library
                console.log('PDF export would be implemented with a PDF library')
              }
              
              toast.success(`تم تصدير ${clients.length} عميل بصيغة ${format.toUpperCase()}!`)
            }}
          />
        </TabsContent>


        {/* Analytics Tab */}
        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <SurveySettings 
            survey={{
              id: "1",
              title: "استطلاع رضا الموظفين",
              description: "استطلاع لقياس رضا الموظفين عن الخدمات المقدمة",
              type: "internal",
              status: "active",
              settings: {
                allowAnonymous: false,
                allowMultipleResponses: false,
                requireLogin: true,
                durationType: "unlimited",
                allowEditing: false,
                showProgressBar: true,
                trackIP: true,
                trackLocation: false,
                collectEmail: false,
                allowFileUpload: false,
                enableConditionalLogic: false,
                enableSkipLogic: false
              }
            }}
            onUpdate={(updates) => {
              console.log('Survey updated:', updates)
            }}
          />
        </TabsContent>

        {/* Sharing Tab */}
        <TabsContent value="sharing" className="space-y-6">
          {!selectedSurveyForSharing ? (
            <Card>
              <CardHeader>
                <CardTitle>مشاركة الاستطلاع</CardTitle>
                <CardDescription>
                  اختر الاستطلاع الذي تريد مشاركته
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">اختر استطلاع للمشاركة</h3>
                    <p className="text-muted-foreground mb-4">
                      يجب اختيار استطلاع واحد أولاً لإنشاء رابط المشاركة و QR Code
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الاستطلاعات المتاحة</Label>
                    <Select value={selectedSurveyForSharing || ''} onValueChange={setSelectedSurveyForSharing}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر استطلاع للمشاركة" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSurveys.map((survey) => (
                          <SelectItem key={survey.id} value={survey.id}>
                            <div className="flex items-center space-x-2">
                              <span>{survey.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {survey.type === 'internal' ? 'داخلي' : 'خارجي'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">مشاركة الاستطلاع</h3>
                  <p className="text-muted-foreground">
                    {getSelectedSurveyForSharing()?.title}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSurveyForSharing(null)}
                >
                  تغيير الاستطلاع
                </Button>
              </div>
              
              <SurveySharing 
                surveyId={selectedSurveyForSharing}
                surveyTitle={getSelectedSurveyForSharing()?.title || ''}
                surveyUrl={`https://survey.amsteel.com/survey/${selectedSurveyForSharing}`}
                isPublic={getSelectedSurveyForSharing()?.status === 'active'}
                onShare={(method, data) => {
                  switch (method) {
                    case 'email':
                      toast.success('تم إرسال رابط الاستطلاع عبر البريد الإلكتروني')
                      break
                    case 'social':
                      toast.success('تم مشاركة الاستطلاع على وسائل التواصل الاجتماعي')
                      break
                    case 'link':
                      navigator.clipboard.writeText(data.url)
                      toast.success('تم نسخ رابط الاستطلاع إلى الحافظة')
                      break
                    case 'embed':
                      navigator.clipboard.writeText(data.embedCode)
                      toast.success('تم نسخ كود التضمين إلى الحافظة')
                      break
                    default:
                      toast.success('تم مشاركة الاستطلاع بنجاح')
                  }
                }}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}