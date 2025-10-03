import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { searchResponses } from '@/lib/smartSearch'
import { useTranslation } from '@/hooks/useTranslation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BarChart3,
  Users,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  Info
} from 'lucide-react'

interface Response {
  id: string
  surveyId: string
  surveyTitle: string
  respondentName: string
  respondentEmail: string
  respondentPhone?: string
  status: 'in_progress' | 'completed'
  startedAt: string
  completedAt?: string
  durationSeconds?: number
  ipAddress?: string
  location?: string
  deviceType: string
  browser: string
  os: string
  answers: Answer[]
}

interface Answer {
  id: string
  questionId: string
  questionText: string
  questionType: string
  answerText?: string
  answerNumber?: number
  answerChoices?: string[]
  answerFile?: string
}

interface ResponseManagementProps {
  surveyId?: string
  onExport: (responses: Response[], format: 'csv' | 'pdf') => void
  // Note: Admin can only view responses, not delete or modify them
}

export default function ResponseManagement({ surveyId, onExport }: ResponseManagementProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedResponses, setSelectedResponses] = useState<string[]>([])

  // Mock data
  const responses: Response[] = [
    {
      id: '1',
      surveyId: '1',
      surveyTitle: 'استطلاع رضا الموظفين',
      respondentName: 'أحمد محمد علي',
      respondentEmail: 'ahmed@company.com',
      respondentPhone: '+966501234567',
      status: 'completed',
      startedAt: '2024-01-15T10:30:00Z',
      completedAt: '2024-01-15T10:45:00Z',
      durationSeconds: 900,
      ipAddress: '192.168.1.100',
      location: 'الرياض، السعودية',
      deviceType: 'desktop',
      browser: 'Chrome',
      os: 'Windows 10',
      answers: [
        {
          id: '1',
          questionId: '1',
          questionText: 'ما هو تقييمك العام لخدماتنا؟',
          questionType: 'rating',
          answerNumber: 4
        },
        {
          id: '2',
          questionId: '2',
          questionText: 'ما هي أهم نقاط القوة؟',
          questionType: 'textarea',
          answerText: 'الخدمة السريعة والموظفين المهذبين'
        }
      ]
    },
    {
      id: '2',
      surveyId: '1',
      surveyTitle: 'استطلاع رضا الموظفين',
      respondentName: 'فاطمة أحمد',
      respondentEmail: 'fatima@company.com',
      respondentPhone: '+966502345678',
      status: 'in_progress',
      startedAt: '2024-01-15T14:20:00Z',
      deviceType: 'mobile',
      browser: 'Safari',
      os: 'iOS 17',
      answers: [
        {
          id: '3',
          questionId: '1',
          questionText: 'ما هو تقييمك العام لخدماتنا؟',
          questionType: 'rating',
          answerNumber: 3
        }
      ]
    },
    {
      id: '3',
      surveyId: '1',
      surveyTitle: 'استطلاع رضا العملاء',
      respondentName: 'محمد سالم',
      respondentEmail: 'mohammed.salem@email.com',
      respondentPhone: '+966503456789',
      status: 'completed',
      startedAt: '2024-01-16T09:15:00Z',
      completedAt: '2024-01-16T09:30:00Z',
      durationSeconds: 900,
      deviceType: 'tablet',
      browser: 'Chrome',
      os: 'Android 13',
      answers: []
    },
    {
      id: '4',
      surveyId: '2',
      surveyTitle: 'استطلاع الخدمات',
      respondentName: 'نورا عبدالله',
      respondentEmail: 'nora.abdullah@test.com',
      respondentPhone: '+966504567890',
      status: 'completed',
      startedAt: '2024-01-17T11:00:00Z',
      completedAt: '2024-01-17T11:20:00Z',
      durationSeconds: 1200,
      deviceType: 'desktop',
      browser: 'Firefox',
      os: 'macOS',
      answers: []
    },
    {
      id: '5',
      surveyId: '2',
      surveyTitle: 'استطلاع التقييم',
      respondentName: 'أحمد إبراهيم',
      respondentEmail: 'Ahmed.Ibrahim@company.sa',
      respondentPhone: '0505678901',
      status: 'completed',
      startedAt: '2024-01-18T08:30:00Z',
      completedAt: '2024-01-18T08:45:00Z',
      durationSeconds: 900,
      deviceType: 'mobile',
      browser: 'Chrome',
      os: 'Android 14',
      answers: []
    },
    {
      id: '6',
      surveyId: '1',
      surveyTitle: 'استطلاع الرضا',
      respondentName: 'فاطمة محمد',
      respondentEmail: 'fatima.mohammed@email.org',
      respondentPhone: '966-50-678-9012',
      status: 'in_progress',
      startedAt: '2024-01-19T13:15:00Z',
      deviceType: 'tablet',
      browser: 'Safari',
      os: 'iPadOS 17',
      answers: []
    },
    {
      id: '7',
      surveyId: '3',
      surveyTitle: 'استطلاع الجودة',
      respondentName: 'عبدالله أحمد',
      respondentEmail: 'abdullah.ahmed@domain.com',
      respondentPhone: '+966 50 789 0123',
      status: 'completed',
      startedAt: '2024-01-20T16:00:00Z',
      completedAt: '2024-01-20T16:25:00Z',
      durationSeconds: 1500,
      deviceType: 'desktop',
      browser: 'Edge',
      os: 'Windows 11',
      answers: []
    },
    {
      id: '8',
      surveyId: '4',
      surveyTitle: 'استطلاع تطوير المنتج',
      respondentName: 'سارة الزهراني',
      respondentEmail: 'sara.alzahrani@hotmail.com',
      respondentPhone: '966505123456',
      status: 'completed',
      startedAt: '2024-01-21T10:00:00Z',
      completedAt: '2024-01-21T10:30:00Z',
      durationSeconds: 1800,
      deviceType: 'mobile',
      browser: 'Chrome',
      os: 'Android 13',
      answers: []
    },
    {
      id: '9',
      surveyId: '4',
      surveyTitle: 'استطلاع تطوير المنتج',
      respondentName: 'خالد المطيري',
      respondentEmail: 'khalid.almutairi@gmail.com',
      respondentPhone: '05-0612-3456',
      status: 'in_progress',
      startedAt: '2024-01-21T14:15:00Z',
      deviceType: 'desktop',
      browser: 'Firefox',
      os: 'Ubuntu',
      answers: []
    },
    {
      id: '10',
      surveyId: '5',
      surveyTitle: 'استطلاع آراء العملاء',
      respondentName: 'ليلى القحطاني',
      respondentEmail: 'layla.alqahtani@yahoo.com',
      respondentPhone: '966 50 987 6543',
      status: 'completed',
      startedAt: '2024-01-22T09:30:00Z',
      completedAt: '2024-01-22T10:00:00Z',
      durationSeconds: 1800,
      deviceType: 'tablet',
      browser: 'Safari',
      os: 'iPadOS 17',
      answers: []
    }
  ]

  const filteredResponses = searchResponses(responses, searchQuery)

  const handleSelectResponse = (responseId: string) => {
    setSelectedResponses(prev => 
      prev.includes(responseId) 
        ? prev.filter(id => id !== responseId)
        : [...prev, responseId]
    )
  }

  const handleSelectAll = () => {
    setSelectedResponses(
      selectedResponses.length === filteredResponses.length 
        ? [] 
        : filteredResponses.map(r => r.id)
    )
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'غير محدد'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }


  return (
    <div className="space-y-6 mobile-spacing">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mobile-text">{t('ui.management.responseManagement')}</h2>
          <p className="text-muted-foreground mobile-text">
            {t('ui.management.viewManageSurveyResponses')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            {responses.length} رد
          </Badge>
          {selectedResponses.length > 0 && (
            <Button variant="destructive" onClick={() => onDelete(selectedResponses)}>
              <Trash2 className="h-4 w-4 mr-2" />
              حذف المحدد ({selectedResponses.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="font-medium">البحث والفلترة</h3>
            
            <div className="space-y-2">
              <Label htmlFor="search">البحث والفلترة</Label>
              <Input
                id="search"
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            <p className="text-sm text-muted-foreground">
              بحث ذكي: اسم الشخص، الإيميل، رقم الجوال، اسم الاستطلاع (مع تجاهل الرموز والمسافات والتشكيل)
            </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">قائمة الردود</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Responses List Tab */}
        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الردود</CardTitle>
                  <CardDescription>
                    عرض وإدارة جميع الردود
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedResponses.length === filteredResponses.length && filteredResponses.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">تحديد الكل</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredResponses.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center space-y-3">
                      <AlertCircle className="h-12 w-12 text-muted-foreground" />
                      <div className="space-y-1">
                        <h3 className="font-medium">لا توجد نتائج</h3>
                        {searchQuery.trim() ? (
                          <p className="text-sm text-muted-foreground">
                            لا يوجد شخص بالمعلومات "{searchQuery}"
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            لا توجد ردود متاحة حالياً
                          </p>
                        )}
                      </div>
                      {searchQuery.trim() && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSearchQuery('')}
                        >
                          مسح البحث
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  filteredResponses.map((response) => (
                  <Card key={response.id} className="hover:shadow-md transition-shadow mobile-card">
                    <CardContent className="p-4 mobile-card">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            checked={selectedResponses.includes(response.id)}
                            onCheckedChange={() => handleSelectResponse(response.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(response.status)}
                                <span className="font-medium">{response.respondentName}</span>
                              </div>
                              <Badge className={getStatusColor(response.status)}>
                                {getStatusText(response.status)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {response.surveyTitle}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4" />
                                <span>{response.respondentEmail}</span>
                              </div>
                              {response.respondentPhone && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="h-4 w-4" />
                                  <span>{response.respondentPhone}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>بدأ: {formatDate(response.startedAt)}</span>
                              </div>
                              {response.completedAt && (
                                <div className="flex items-center space-x-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>انتهى: {formatDate(response.completedAt)}</span>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>المدة: {formatDuration(response.durationSeconds)}</span>
                              </div>
                              {response.location && (
                                <div className="flex items-center space-x-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{response.location}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3 flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>{response.deviceType}</span>
                              <span>{response.browser}</span>
                              <span>{response.os}</span>
                              {response.ipAddress && <span>IP: {response.ipAddress}</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="mobile-button">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="mobile-button">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="mobile-button">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات الردود</CardTitle>
              <CardDescription>
                إحصائيات مفصلة عن الردود
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{responses.length}</div>
                  <div className="text-sm text-muted-foreground">إجمالي الردود</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {Math.round((responses.filter(r => r.status === 'completed').length / responses.length) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">معدل الإكمال</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {Math.round(responses.reduce((acc, r) => acc + (r.durationSeconds || 0), 0) / responses.length / 60)} دقيقة
                  </div>
                  <div className="text-sm text-muted-foreground">متوسط المدة</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <BarChart3 className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-muted-foreground">معدل الرضا</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
