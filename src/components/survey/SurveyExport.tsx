import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  FileText, 
  Table, 
  FileSpreadsheet, 
  FileImage,
  Calendar,
  Filter,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  BarChart3,
  Mail,
  Share2
} from 'lucide-react'

interface ExportOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  format: 'csv' | 'excel' | 'pdf' | 'json'
  size: string
  includes: string[]
}

interface SurveyExportProps {
  survey: any
  responses: any[]
  onExport: (format: string, options: any) => void
}

export default function SurveyExport({ survey, responses, onExport }: SurveyExportProps) {
  const [activeTab, setActiveTab] = useState('formats')
  const [selectedFormat, setSelectedFormat] = useState('csv')
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    includeTimestamps: true,
    includeUserInfo: false,
    anonymizeData: false,
    dateRange: 'all',
    customDateFrom: '',
    customDateTo: '',
    includeCharts: true,
    includeComments: true,
    groupBy: 'none'
  })

  // Admin-only export formats (CSV and PDF only)
  const exportFormats: ExportOption[] = [
    {
      id: 'csv',
      name: 'CSV',
      description: 'ملف نصي مفصول بفواصل - مناسب للتحليل',
      icon: <Table className="h-5 w-5" />,
      format: 'csv',
      size: '2.3 MB',
      includes: ['الردود', 'التواريخ', 'المعرفات']
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'تقرير PDF شامل مع الرسوم البيانية',
      icon: <FileImage className="h-5 w-5" />,
      format: 'pdf',
      size: '8.7 MB',
      includes: ['التقرير الكامل', 'الرسوم البيانية', 'التحليلات', 'التوصيات']
    }
  ]

  const handleExport = () => {
    onExport(selectedFormat, exportOptions)
  }

  const getFormatIcon = (format: string) => {
    const formatData = exportFormats.find(f => f.id === format)
    return formatData?.icon || <FileText className="h-4 w-4" />
  }

  const getEstimatedSize = () => {
    const formatData = exportFormats.find(f => f.id === selectedFormat)
    return formatData?.size || 'غير محدد'
  }

  const getEstimatedTime = () => {
    const responseCount = responses.length
    if (responseCount < 100) return 'أقل من دقيقة'
    if (responseCount < 1000) return '1-2 دقيقة'
    if (responseCount < 5000) return '2-5 دقائق'
    return '5+ دقائق'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تصدير الاستطلاع</h2>
          <p className="text-muted-foreground">
            تصدير البيانات والتحليلات بصيغ مختلفة
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            {responses.length} رد
          </Badge>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            تصدير الآن
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="formats">الصيغ</TabsTrigger>
          <TabsTrigger value="options">الخيارات</TabsTrigger>
          <TabsTrigger value="preview">معاينة</TabsTrigger>
          <TabsTrigger value="schedule">جدولة</TabsTrigger>
        </TabsList>

        {/* Formats Tab */}
        <TabsContent value="formats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>اختر صيغة التصدير</CardTitle>
              <CardDescription>
                اختر الصيغة المناسبة لاحتياجاتك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format) => (
                  <Card
                    key={format.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedFormat === format.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedFormat(format.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          selectedFormat === format.id ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {format.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium">{format.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {format.size}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {format.description}
                          </p>
                          <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">يشمل:</p>
                            <div className="flex flex-wrap gap-1">
                              {format.includes.map((item, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {item}
                                </Badge>
                              ))}
                            </div>
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

        {/* Options Tab */}
        <TabsContent value="options" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>خيارات التصدير</CardTitle>
              <CardDescription>
                تخصيص البيانات المصدّرة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Options */}
              <div className="space-y-4">
                <h3 className="font-medium">الخيارات الأساسية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeMetadata"
                      checked={exportOptions.includeMetadata}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeMetadata: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeMetadata">تضمين البيانات الوصفية</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeTimestamps"
                      checked={exportOptions.includeTimestamps}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeTimestamps: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeTimestamps">تضمين التواريخ والأوقات</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeUserInfo"
                      checked={exportOptions.includeUserInfo}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeUserInfo: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeUserInfo">تضمين معلومات المستخدم</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymizeData"
                      checked={exportOptions.anonymizeData}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, anonymizeData: checked as boolean })
                      }
                    />
                    <Label htmlFor="anonymizeData">إخفاء هوية المستخدمين</Label>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-4">
                <h3 className="font-medium">نطاق التاريخ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الفترة الزمنية</Label>
                    <Select
                      value={exportOptions.dateRange}
                      onValueChange={(value) => setExportOptions({ ...exportOptions, dateRange: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الردود</SelectItem>
                        <SelectItem value="today">اليوم</SelectItem>
                        <SelectItem value="week">هذا الأسبوع</SelectItem>
                        <SelectItem value="month">هذا الشهر</SelectItem>
                        <SelectItem value="custom">فترة مخصصة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {exportOptions.dateRange === 'custom' && (
                    <>
                      <div className="space-y-2">
                        <Label>من تاريخ</Label>
                        <Input
                          type="date"
                          value={exportOptions.customDateFrom}
                          onChange={(e) => setExportOptions({ ...exportOptions, customDateFrom: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>إلى تاريخ</Label>
                        <Input
                          type="date"
                          value={exportOptions.customDateTo}
                          onChange={(e) => setExportOptions({ ...exportOptions, customDateTo: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-4">
                <h3 className="font-medium">خيارات متقدمة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeCharts"
                      checked={exportOptions.includeCharts}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeCharts: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeCharts">تضمين الرسوم البيانية</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeComments"
                      checked={exportOptions.includeComments}
                      onCheckedChange={(checked) => 
                        setExportOptions({ ...exportOptions, includeComments: checked as boolean })
                      }
                    />
                    <Label htmlFor="includeComments">تضمين التعليقات</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>تجميع البيانات</Label>
                    <Select
                      value={exportOptions.groupBy}
                      onValueChange={(value) => setExportOptions({ ...exportOptions, groupBy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">بدون تجميع</SelectItem>
                        <SelectItem value="department">حسب القسم</SelectItem>
                        <SelectItem value="position">حسب المنصب</SelectItem>
                        <SelectItem value="date">حسب التاريخ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معاينة التصدير</CardTitle>
              <CardDescription>
                معاينة البيانات التي ستتم تصديرها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getFormatIcon(selectedFormat)}
                  </div>
                  <div className="text-lg font-bold">{selectedFormat.toUpperCase()}</div>
                  <div className="text-sm text-muted-foreground">الصيغة المختارة</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Clock className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">{getEstimatedTime()}</div>
                  <div className="text-sm text-muted-foreground">الوقت المتوقع</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Download className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg font-bold">{getEstimatedSize()}</div>
                  <div className="text-sm text-muted-foreground">الحجم المتوقع</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">ملخص البيانات</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-primary">{responses.length}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الردود</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-muted-foreground">معدل الإكمال</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-muted-foreground">عدد الأسئلة</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">3</div>
                    <div className="text-sm text-muted-foreground">الأيام الماضية</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>جدولة التصدير</CardTitle>
              <CardDescription>
                جدولة تصدير دوري للبيانات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">الجدولة قيد التطوير</h3>
                <p className="text-muted-foreground">
                  ستتوفر ميزة الجدولة قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
