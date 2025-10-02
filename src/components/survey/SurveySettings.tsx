import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, 
  Clock, 
  Users, 
  Eye, 
  Calendar,
  Mail
} from 'lucide-react'

interface SurveySettingsProps {
  survey: any
  onUpdate: (updates: any) => void
  onSave: () => void
  onPreview: () => void
  onPublish: () => void
  hasValidQuestions: boolean
}

export default function SurveySettings({
  survey,
  onUpdate,
  onSave,
  onPreview,
  onPublish,
  hasValidQuestions
}: SurveySettingsProps) {
  const [activeTab, setActiveTab] = useState('general')

  const handleUpdate = (updates: any) => {
    onUpdate({ ...survey, ...updates })
  }

  const canPublish = () => {
    return survey.title && 
           survey.description && 
           survey.questions && 
           survey.questions.length > 0 &&
           (survey.type !== 'external' || survey.client_name)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إعدادات الاستطلاع</h2>
          <p className="text-muted-foreground">
            إعدادات الاستطلاع والنشر
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-2" />
            معاينة
          </Button>
          <Button onClick={onSave}>
            حفظ المسودة
          </Button>
          {canPublish() ? (
            <Button onClick={onPublish} className="bg-green-600 hover:bg-green-700">
              نشر الاستطلاع
            </Button>
          ) : (
            <Button disabled>
              نشر الاستطلاع
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="general">إعدادات الاستطلاع</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>الإعدادات العامة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="survey-type">نوع الاستطلاع</Label>
                  <Select value={survey.type} onValueChange={(value) => handleUpdate({ type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">داخلي</SelectItem>
                      <SelectItem value="external">خارجي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {survey.type === 'external' && (
                  <div className="space-y-2">
                    <Label htmlFor="client-name">اسم العميل *</Label>
                    <Input
                      id="client-name"
                      value={survey.client_name || ''}
                      onChange={(e) => handleUpdate({ client_name: e.target.value })}
                      placeholder="أدخل اسم العميل"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-message">رسالة الترحيب</Label>
                <Textarea
                  id="welcome-message"
                  value={survey.welcome_message || ''}
                  onChange={(e) => handleUpdate({ welcome_message: e.target.value })}
                  placeholder="رسالة ترحيب للمشاركين"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thank-you-message">رسالة الشكر</Label>
                <Textarea
                  id="thank-you-message"
                  value={survey.thank_you_message || ''}
                  onChange={(e) => handleUpdate({ thank_you_message: e.target.value })}
                  placeholder="رسالة شكر بعد إكمال الاستطلاع"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>إعدادات التوقيت</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>مدة الاستطلاع</Label>
                <Select value={survey.duration_type} onValueChange={(value) => handleUpdate({ duration_type: value })}>
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
                    <Label htmlFor="start_date">تاريخ البداية</Label>
                    <Input
                      id="start_date"
                      type="datetime-local"
                      value={survey.start_date || ''}
                      onChange={(e) => handleUpdate({ start_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">تاريخ النهاية</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={survey.end_date || ''}
                      onChange={(e) => handleUpdate({ end_date: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>إعدادات المشاركة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={survey.is_anonymous}
                    onCheckedChange={(checked) => handleUpdate({ is_anonymous: checked })}
                  />
                  <Label htmlFor="anonymous">استطلاع مجهول</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-multiple"
                    checked={survey.allow_multiple}
                    onCheckedChange={(checked) => handleUpdate({ allow_multiple: checked })}
                  />
                  <Label htmlFor="allow-multiple">السماح بردود متعددة</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allow-editing"
                    checked={survey.allow_editing}
                    onCheckedChange={(checked) => handleUpdate({ allow_editing: checked })}
                  />
                  <Label htmlFor="allow-editing">السماح بتعديل الردود</Label>
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

      </Tabs>
    </div>
  )
}