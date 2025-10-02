import { useState, useEffect } from 'react'
import { searchResponses } from '@/lib/smartSearch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  MessageSquare,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Save,
  X,
  History,
  FileText,
  BarChart3,
  Users,
  Database
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Response {
  id: string
  surveyId: string
  surveyTitle: string
  employeeId?: string
  employeeName?: string
  respondentName?: string
  respondentEmail?: string
  respondentPhone?: string
  status: 'in_progress' | 'completed'
  ipAddress?: string
  userAgent?: string
  deviceType?: string
  browser?: string
  os?: string
  location?: {
    country: string
    city: string
    coordinates: [number, number]
  }
  startedAt: string
  completedAt?: string
  durationSeconds?: number
  modifiedByDeveloperId?: string
  modifiedAt?: string
  modificationReason?: string
  answers: Answer[]
}

interface Answer {
  id: string
  questionId: string
  questionText: string
  questionType: string
  answerText?: string
  answerNumber?: number
  answerBoolean?: boolean
  answerDate?: string
  answerTime?: string
  answerJson?: any
  originalValue?: string
  modifiedByDeveloperId?: string
  modifiedAt?: string
  modificationReason?: string
}

interface AdvancedResponseManagementProps {
  onModifyResponse: (responseId: string, data: Partial<Response>, reason: string) => void
  onDeleteResponse: (responseId: string, reason: string) => void
  onBulkDelete: (responseIds: string[], reason: string) => void
  onExport: (responses: Response[], format: 'csv' | 'excel' | 'pdf' | 'json') => void
}

export default function AdvancedResponseManagement({
  onModifyResponse,
  onDeleteResponse,
  onBulkDelete,
  onExport
}: AdvancedResponseManagementProps) {
  const [activeTab, setActiveTab] = useState('all')
  const [responses, setResponses] = useState<Response[]>([])
  const [selectedResponses, setSelectedResponses] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [surveyFilter, setSurveyFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [showModifyDialog, setShowModifyDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [modificationReason, setModificationReason] = useState('')
  const [deletionReason, setDeletionReason] = useState('')

  // Mock data
  useEffect(() => {
    const mockResponses: Response[] = [
      {
        id: '1',
        surveyId: 'survey-1',
        surveyTitle: 'استطلاع رضا الموظفين Q1 2024',
        employeeId: 'emp-001',
        employeeName: 'أحمد محمد علي',
        status: 'completed',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        deviceType: 'desktop',
        browser: 'Chrome',
        os: 'Windows',
        location: {
          country: 'Saudi Arabia',
          city: 'Riyadh',
          coordinates: [24.7136, 46.6753]
        },
        startedAt: '2024-01-20T09:00:00Z',
        completedAt: '2024-01-20T09:15:00Z',
        durationSeconds: 900,
        answers: [
          {
            id: 'ans-1',
            questionId: 'q-1',
            questionText: 'كيف تقيم رضاك العام عن العمل؟',
            questionType: 'rating',
            answerNumber: 4
          },
          {
            id: 'ans-2',
            questionId: 'q-2',
            questionText: 'ما هي اقتراحاتك للتحسين؟',
            questionType: 'text',
            answerText: 'تحسين بيئة العمل وزيادة الحوافز'
          }
        ]
      },
      {
        id: '2',
        surveyId: 'survey-2',
        surveyTitle: 'تقييم خدمة العملاء',
        respondentName: 'سارة أحمد',
        respondentEmail: 'sara@example.com',
        respondentPhone: '+966501234567',
        status: 'completed',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        deviceType: 'mobile',
        browser: 'Safari',
        os: 'iOS',
        location: {
          country: 'Saudi Arabia',
          city: 'Jeddah',
          coordinates: [21.4858, 39.1925]
        },
        startedAt: '2024-01-19T14:30:00Z',
        completedAt: '2024-01-19T14:45:00Z',
        durationSeconds: 900,
        modifiedByDeveloperId: 'dev-001',
        modifiedAt: '2024-01-20T10:00:00Z',
        modificationReason: 'تصحيح خطأ في البيانات',
        answers: [
          {
            id: 'ans-3',
            questionId: 'q-3',
            questionText: 'كيف تقيم جودة الخدمة؟',
            questionType: 'rating',
            answerNumber: 5,
            originalValue: '3',
            modifiedByDeveloperId: 'dev-001',
            modifiedAt: '2024-01-20T10:00:00Z',
            modificationReason: 'تصحيح خطأ في التقييم'
          }
        ]
      },
      {
        id: '3',
        surveyId: 'survey-1',
        surveyTitle: 'استطلاع رضا الموظفين Q1 2024',
        employeeId: 'emp-002',
        employeeName: 'فاطمة سالم',
        status: 'in_progress',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        deviceType: 'desktop',
        browser: 'Safari',
        os: 'macOS',
        startedAt: '2024-01-20T11:00:00Z',
        answers: [
          {
            id: 'ans-4',
            questionId: 'q-1',
            questionText: 'كيف تقيم رضاك العام عن العمل؟',
            questionType: 'rating',
            answerNumber: 3
          }
        ]
      }
    ]
    setResponses(mockResponses)
  }, [])

  const filteredResponses = searchResponses(responses.map(r => ({
    ...r,
    respondentPhone: r.respondentPhone || ''
  })), searchTerm).filter(response => {
    const matchesStatus = statusFilter === 'all' || response.status === statusFilter
    const matchesSurvey = surveyFilter === 'all' || response.surveyId === surveyFilter
    
    return matchesStatus && matchesSurvey
  })

  const handleSelectResponse = (responseId: string) => {
    setSelectedResponses(prev => 
      prev.includes(responseId)
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    )
  }

  const handleSelectAll = () => {
    if (selectedResponses.length === filteredResponses.length) {
      setSelectedResponses([])
    } else {
      setSelectedResponses(filteredResponses.map(r => r.id))
    }
  }

  const handleModifyResponse = (response: Response) => {
    setSelectedResponse(response)
    setShowModifyDialog(true)
  }

  const handleDeleteResponse = (response: Response) => {
    setSelectedResponse(response)
    setShowDeleteDialog(true)
  }

  const confirmModification = () => {
    if (selectedResponse && modificationReason.trim()) {
      onModifyResponse(selectedResponse.id, selectedResponse, modificationReason)
      setShowModifyDialog(false)
      setModificationReason('')
      setSelectedResponse(null)
      toast.success('تم تعديل الرد بنجاح!')
    }
  }

  const confirmDeletion = () => {
    if (selectedResponse && deletionReason.trim()) {
      onDeleteResponse(selectedResponse.id, deletionReason)
      setResponses(prev => prev.filter(r => r.id !== selectedResponse.id))
      setShowDeleteDialog(false)
      setDeletionReason('')
      setSelectedResponse(null)
      toast.success('تم حذف الرد بنجاح!')
    }
  }

  const handleBulkDelete = () => {
    if (selectedResponses.length > 0 && deletionReason.trim()) {
      onBulkDelete(selectedResponses, deletionReason)
      setResponses(prev => prev.filter(r => !selectedResponses.includes(r.id)))
      setSelectedResponses([])
      setDeletionReason('')
      toast.success(`تم حذف ${selectedResponses.length} رد بنجاح!`)
    }
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf' | 'json') => {
    const responsesToExport = selectedResponses.length > 0 
      ? responses.filter(r => selectedResponses.includes(r.id))
      : filteredResponses
    
    onExport(responsesToExport, format)
    toast.success(`تم تصدير ${responsesToExport.length} رد بصيغة ${format.toUpperCase()}!`)
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل'
      case 'in_progress': return 'قيد التقدم'
      default: return 'غير محدد'
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />
      case 'desktop': return <Monitor className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الردود المتقدمة</h2>
          <p className="text-muted-foreground">
            عرض وتعديل وحذف جميع ردود الاستطلاعات في النظام
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <MessageSquare className="h-3 w-3 mr-1" />
            {filteredResponses.length} رد
          </Badge>
          {selectedResponses.length > 0 && (
            <Badge variant="outline" className="text-sm">
              <CheckCircle className="h-3 w-3 mr-1" />
              {selectedResponses.length} محدد
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الردود</p>
                <p className="text-2xl font-bold">{responses.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الردود المكتملة</p>
                <p className="text-2xl font-bold">
                  {responses.filter(r => r.status === 'completed').length}
                </p>
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
                <p className="text-sm font-medium text-muted-foreground">قيد التقدم</p>
                <p className="text-2xl font-bold">
                  {responses.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدلة</p>
                <p className="text-2xl font-bold">
                  {responses.filter(r => r.modifiedByDeveloperId).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Edit className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="بحث ذكي: اسم الشخص، الإيميل، رقم الجوال، اسم الاستطلاع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="in_progress">قيد التقدم</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={surveyFilter} onValueChange={setSurveyFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الاستطلاعات</SelectItem>
                  <SelectItem value="survey-1">استطلاع رضا الموظفين</SelectItem>
                  <SelectItem value="survey-2">تقييم خدمة العملاء</SelectItem>
                </SelectContent>
              </Select>

              {selectedResponses.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف المحدد ({selectedResponses.length})
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('excel')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('pdf')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">جميع الردود</TabsTrigger>
          <TabsTrigger value="completed">المكتملة</TabsTrigger>
          <TabsTrigger value="in_progress">قيد التقدم</TabsTrigger>
          <TabsTrigger value="modified">المعدلة</TabsTrigger>
        </TabsList>

        {/* All Responses Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>جميع الردود</CardTitle>
                  <CardDescription>
                    عرض جميع ردود الاستطلاعات في النظام
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedResponses.length === filteredResponses.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <Label>تحديد الكل</Label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResponses.map((response) => (
                  <Card key={response.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedResponses.includes(response.id)}
                            onCheckedChange={() => handleSelectResponse(response.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{response.surveyTitle}</h3>
                              <Badge className={getStatusColor(response.status)}>
                                {getStatusText(response.status)}
                              </Badge>
                              {response.modifiedByDeveloperId && (
                                <Badge variant="outline" className="text-orange-600 border-orange-600">
                                  <Edit className="h-3 w-3 mr-1" />
                                  معدل
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <span>
                                  {response.employeeName || response.respondentName || 'مجهول'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(response.startedAt)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getDeviceIcon(response.deviceType || 'desktop')}
                                <span>{response.browser} - {response.os}</span>
                              </div>
                              {response.location && (
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{response.location.city}, {response.location.country}</span>
                                </div>
                              )}
                            </div>

                            {response.completedAt && response.durationSeconds && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                <span>مدة الإكمال: {formatDuration(response.durationSeconds)}</span>
                              </div>
                            )}

                            {response.modifiedAt && response.modificationReason && (
                              <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                                <div className="flex items-center space-x-2 text-orange-700">
                                  <History className="h-4 w-4" />
                                  <span>تم التعديل في {formatDate(response.modifiedAt)}</span>
                                </div>
                                <p className="mt-1 text-orange-600">السبب: {response.modificationReason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => console.log('View response:', response.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleModifyResponse(response)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteResponse(response)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* Other tabs with filtered content */}
        <TabsContent value="completed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الردود المكتملة</CardTitle>
              <CardDescription>
                الردود التي تم إكمالها بنجاح
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResponses.filter(r => r.status === 'completed').map((response) => (
                  <div key={response.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{response.surveyTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {response.employeeName || response.respondentName}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الردود قيد التقدم</CardTitle>
              <CardDescription>
                الردود التي لم يتم إكمالها بعد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResponses.filter(r => r.status === 'in_progress').map((response) => (
                  <div key={response.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{response.surveyTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {response.employeeName || response.respondentName}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modified" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الردود المعدلة</CardTitle>
              <CardDescription>
                الردود التي تم تعديلها من قبل المطورين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResponses.filter(r => r.modifiedByDeveloperId).map((response) => (
                  <div key={response.id} className="p-4 border rounded-lg">
                    <h3 className="font-medium">{response.surveyTitle}</h3>
                    <p className="text-sm text-muted-foreground">
                      {response.employeeName || response.respondentName}
                    </p>
                    <div className="mt-2 text-sm text-orange-600">
                      تم التعديل: {response.modificationReason}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modify Response Dialog */}
      <Dialog open={showModifyDialog} onOpenChange={setShowModifyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تعديل الرد</DialogTitle>
            <DialogDescription>
              تعديل بيانات الرد مع تسجيل سبب التعديل
            </DialogDescription>
          </DialogHeader>
          
          {selectedResponse && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  تحذير: تعديل الردود يؤثر على دقة البيانات. يرجى التأكد من ضرورة التعديل.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>الاستطلاع</Label>
                  <Input value={selectedResponse.surveyTitle} disabled />
                </div>
                
                <div>
                  <Label>المستجيب</Label>
                  <Input 
                    value={selectedResponse.employeeName || selectedResponse.respondentName || ''} 
                    disabled 
                  />
                </div>

                <div>
                  <Label htmlFor="modification-reason">سبب التعديل *</Label>
                  <Textarea
                    id="modification-reason"
                    value={modificationReason}
                    onChange={(e) => setModificationReason(e.target.value)}
                    placeholder="اكتب سبب التعديل..."
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowModifyDialog(false)}>
                    إلغاء
                  </Button>
                  <Button 
                    onClick={confirmModification}
                    disabled={!modificationReason.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    حفظ التعديل
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Response Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف الرد</DialogTitle>
            <DialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الرد نهائياً.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                تحذير: حذف الردود يؤثر على الإحصائيات والتقارير. يرجى التأكد من ضرورة الحذف.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="deletion-reason">سبب الحذف *</Label>
              <Textarea
                id="deletion-reason"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="اكتب سبب الحذف..."
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                إلغاء
              </Button>
              <Button 
                variant="destructive"
                onClick={selectedResponses.length > 1 ? handleBulkDelete : confirmDeletion}
                disabled={!deletionReason.trim()}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {selectedResponses.length > 1 ? `حذف ${selectedResponses.length} رد` : 'حذف الرد'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
