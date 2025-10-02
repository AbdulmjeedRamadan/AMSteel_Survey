import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Eye,
  MessageSquare,
  Star,
  PieChart,
  Activity,
  Zap
} from 'lucide-react'

interface AnalyticsData {
  totalResponses: number
  completionRate: number
  averageTime: string
  satisfactionScore: number
  responseTrend: 'up' | 'down' | 'stable'
  deviceStats: {
    desktop: number
    mobile: number
    tablet: number
  }
  browserStats: {
    chrome: number
    safari: number
    firefox: number
    edge: number
  }
  locationStats: {
    riyadh: number
    jeddah: number
    dammam: number
    other: number
  }
  timeStats: {
    hourly: number[]
    daily: number[]
    weekly: number[]
  }
}

interface AdvancedAnalyticsProps {
  surveyId?: string
  onExport: (data: any) => void
}

export default function AdvancedAnalytics({ surveyId, onExport }: AdvancedAnalyticsProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30days')
  const [selectedSurvey, setSelectedSurvey] = useState('all')

  // Mock analytics data
  const analyticsData: AnalyticsData = {
    totalResponses: 1247,
    completionRate: 78.5,
    averageTime: '4:32',
    satisfactionScore: 4.2,
    responseTrend: 'up',
    deviceStats: {
      desktop: 45,
      mobile: 40,
      tablet: 15
    },
    browserStats: {
      chrome: 60,
      safari: 25,
      firefox: 10,
      edge: 5
    },
    locationStats: {
      riyadh: 50,
      jeddah: 30,
      dammam: 15,
      other: 5
    },
    timeStats: {
      hourly: [12, 8, 5, 3, 2, 4, 7, 15, 25, 30, 28, 22, 18, 20, 25, 30, 35, 40, 38, 32, 28, 22, 18, 15],
      daily: [45, 52, 38, 61, 48, 55, 42, 58, 67, 72, 65, 58, 52, 48, 55, 62, 68, 75, 71, 66, 59, 54, 48, 45, 52, 58, 65, 72, 68, 61],
      weekly: [320, 385, 420, 380, 450, 520, 480]
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">التحليلات المتقدمة</h2>
          <p className="text-muted-foreground">
            إحصائيات مفصلة وتحليلات متقدمة للاستطلاعات
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
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
                <p className="text-sm font-medium text-muted-foreground">إجمالي الردود</p>
                <p className="text-2xl font-bold">{analyticsData.totalResponses.toLocaleString()}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              {getTrendIcon(analyticsData.responseTrend)}
              <span className={`text-sm font-medium ${getTrendColor(analyticsData.responseTrend)}`}>
                +12% من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الإكمال</p>
                <p className="text-2xl font-bold">{analyticsData.completionRate}%</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                +5% من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الوقت</p>
                <p className="text-2xl font-bold">{analyticsData.averageTime}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                -30 ثانية من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الرضا</p>
                <p className="text-2xl font-bold">{analyticsData.satisfactionScore}/5</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                +0.3 من الشهر الماضي
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="devices">الأجهزة</TabsTrigger>
          <TabsTrigger value="locations">المواقع</TabsTrigger>
          <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
          <TabsTrigger value="questions">الأسئلة</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الأجهزة</CardTitle>
                <CardDescription>
                  إحصائيات الأجهزة المستخدمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-blue-600" />
                      <span>سطح المكتب</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.desktop}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.deviceStats.desktop}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-green-600" />
                      <span>الهاتف</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.mobile}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.deviceStats.mobile}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Tablet className="h-4 w-4 text-purple-600" />
                      <span>التابلت</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${analyticsData.deviceStats.tablet}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.deviceStats.tablet}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع المتصفحات</CardTitle>
                <CardDescription>
                  إحصائيات المتصفحات المستخدمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <span>Chrome</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analyticsData.browserStats.chrome}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.browserStats.chrome}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-gray-600" />
                      <span>Safari</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${analyticsData.browserStats.safari}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.browserStats.safari}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-orange-600" />
                      <span>Firefox</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: `${analyticsData.browserStats.firefox}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.browserStats.firefox}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      <span>Edge</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${analyticsData.browserStats.edge}%` }}></div>
                      </div>
                      <span className="text-sm font-medium">{analyticsData.browserStats.edge}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Devices Tab */}
        <TabsContent value="devices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأجهزة</CardTitle>
              <CardDescription>
                تفاصيل شاملة عن الأجهزة المستخدمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">تحليل الأجهزة قيد التطوير</h3>
                <p className="text-muted-foreground">
                  ستتوفر الرسوم البيانية التفصيلية قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Locations Tab */}
        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التوزيع الجغرافي</CardTitle>
              <CardDescription>
                إحصائيات المواقع الجغرافية للمستجيبين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-red-600" />
                    <span>الرياض</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: `${analyticsData.locationStats.riyadh}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{analyticsData.locationStats.riyadh}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span>جدة</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analyticsData.locationStats.jeddah}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{analyticsData.locationStats.jeddah}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span>الدمام</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: `${analyticsData.locationStats.dammam}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{analyticsData.locationStats.dammam}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span>أخرى</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-gray-600 h-2 rounded-full" style={{ width: `${analyticsData.locationStats.other}%` }}></div>
                    </div>
                    <span className="text-sm font-medium">{analyticsData.locationStats.other}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الجدول الزمني</CardTitle>
              <CardDescription>
                توزيع الردود عبر الوقت
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">الرسوم البيانية الزمنية قيد التطوير</h3>
                <p className="text-muted-foreground">
                  ستتوفر الرسوم البيانية التفاعلية قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions Tab */}
        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليل الأسئلة</CardTitle>
              <CardDescription>
                إحصائيات مفصلة لكل سؤال
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">تحليل الأسئلة قيد التطوير</h3>
                <p className="text-muted-foreground">
                  ستتوفر التحليلات التفصيلية للأسئلة قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
