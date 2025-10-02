import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Clock,
  Users,
  Globe,
  AlertCircle
} from 'lucide-react'

interface SurveySettingsProps {
  survey: any
  onUpdate: (updates: any) => void
}

export default function SurveySettings({
  survey,
  onUpdate
}: SurveySettingsProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    isAnonymous: survey.is_anonymous || false,
    allowMultiple: survey.allow_multiple || false,
    allowEditing: survey.allow_editing || false,
    requireLogin: survey.require_login || false,
    showResults: survey.show_results || false,
    allowFileUpload: survey.allow_file_upload || false,
    maxFileSize: survey.max_file_size || 10,
    allowedFileTypes: survey.allowed_file_types || ['pdf', 'doc', 'docx', 'jpg', 'png']
  })
  const [hasChanges, setHasChanges] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    onUpdate({ [key]: value })
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إعدادات الاستطلاع</h2>
          <p className="text-muted-foreground">
            إدارة إعدادات الاستطلاع والخيارات المتقدمة
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(survey.status)}>
            {getStatusText(survey.status)}
          </Badge>
        </div>
      </div>

      {/* Survey Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription>{survey.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {survey.type === 'internal' ? 'داخلي' : 'خارجي'}
              </Badge>
              {survey.client_name && (
                <Badge variant="secondary">
                  {survey.client_name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {survey.responses || 0} رد
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                أنشئ في {survey.created_at || 'غير محدد'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {survey.is_public ? 'عام' : 'خاص'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="duration">المدة</TabsTrigger>
          <TabsTrigger value="advanced">متقدم</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات العامة</CardTitle>
              <CardDescription>
                الإعدادات الأساسية للاستطلاع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>استطلاع مجهول</Label>
                    <p className="text-sm text-muted-foreground">
                      عدم جمع معلومات شخصية من المستجيبين
                    </p>
                  </div>
                  <Switch
                    checked={settings.isAnonymous}
                    onCheckedChange={(checked) => handleSettingChange('isAnonymous', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>السماح بردود متعددة</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للمستخدم الواحد بالإجابة أكثر من مرة
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowMultiple}
                    onCheckedChange={(checked) => handleSettingChange('allowMultiple', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>السماح بتعديل الردود</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للمستجيبين بتعديل إجاباتهم
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowEditing}
                    onCheckedChange={(checked) => handleSettingChange('allowEditing', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>يتطلب تسجيل الدخول</Label>
                    <p className="text-sm text-muted-foreground">
                      يجب على المستجيبين تسجيل الدخول أولاً
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireLogin}
                    onCheckedChange={(checked) => handleSettingChange('requireLogin', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Duration Settings Tab */}
        <TabsContent value="duration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المدة</CardTitle>
              <CardDescription>
                تحديد مدة الاستطلاع وتواريخ البداية والنهاية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع المدة</Label>
                  <Select value={survey.duration_type} onValueChange={(value) => onUpdate({ duration_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unlimited">غير محدودة</SelectItem>
                      <SelectItem value="limited">محدودة بتاريخ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {survey.duration_type === 'limited' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">تاريخ البداية</Label>
                      <Input
                        id="start-date"
                        type="datetime-local"
                        value={survey.start_date || ''}
                        onChange={(e) => onUpdate({ start_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">تاريخ الانتهاء</Label>
                      <Input
                        id="end-date"
                        type="datetime-local"
                        value={survey.end_date || ''}
                        onChange={(e) => onUpdate({ end_date: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    إذا كان الاستطلاع محدود المدة، سيتم إغلاقه تلقائياً في التاريخ المحدد.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Settings Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات المتقدمة</CardTitle>
              <CardDescription>
                إعدادات متقدمة للاستطلاع والميزات الإضافية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>السماح برفع الملفات</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للمستجيبين برفع الملفات
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowFileUpload}
                    onCheckedChange={(checked) => handleSettingChange('allowFileUpload', checked)}
                  />
                </div>

                {settings.allowFileUpload && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxFileSize">الحد الأقصى لحجم الملف (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={settings.maxFileSize}
                        onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إظهار النتائج للمستجيبين</Label>
                    <p className="text-sm text-muted-foreground">
                      إظهار ملخص النتائج بعد إكمال الاستطلاع
                    </p>
                  </div>
                  <Switch
                    checked={settings.showResults}
                    onCheckedChange={(checked) => handleSettingChange('showResults', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              تغييرات غير محفوظة
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}