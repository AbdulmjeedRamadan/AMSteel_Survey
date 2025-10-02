import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Share2,
  Copy,
  QrCode,
  Link,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Download,
  Eye,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Globe,
  Lock,
  Shield
} from 'lucide-react'

interface SurveySharingProps {
  surveyId: string
  surveyTitle: string
  surveyUrl: string
  isPublic: boolean
  onShare: (method: string, data: any) => void
}

export default function SurveySharing({ 
  surveyId, 
  surveyTitle, 
  surveyUrl, 
  isPublic, 
  onShare 
}: SurveySharingProps) {
  const [activeTab, setActiveTab] = useState('link')
  const [copied, setCopied] = useState(false)

  // Check if survey is published
  if (!isPublic) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">الاستطلاع غير منشور</h3>
          <p className="text-muted-foreground mb-6">
            يجب نشر الاستطلاع أولاً قبل إمكانية مشاركته
          </p>
          <div className="bg-muted/50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-muted-foreground">
              لنشر الاستطلاع، انتقل إلى تبويب "الإعدادات" واضغط على "نشر الاستطلاع"
            </p>
          </div>
        </div>
      </div>
    )
  }
  const [emailRecipients, setEmailRecipients] = useState('')
  const [emailSubject, setEmailSubject] = useState(`استطلاع: ${surveyTitle}`)
  const [emailMessage, setEmailMessage] = useState('')
  const [socialMessage, setSocialMessage] = useState('')
  const [embedWidth, setEmbedWidth] = useState('100%')
  const [embedHeight, setEmbedHeight] = useState('600px')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(surveyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleEmailShare = () => {
    const recipients = emailRecipients.split(',').map(email => email.trim()).filter(Boolean)
    onShare('email', {
      recipients,
      subject: emailSubject,
      message: emailMessage,
      surveyUrl
    })
  }

  const handleSocialShare = (platform: string) => {
    const message = socialMessage || `شارك في استطلاع: ${surveyTitle}`
    onShare('social', {
      platform,
      message,
      url: surveyUrl
    })
  }

  const generateQRCode = () => {
    // In a real app, this would generate an actual QR code
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">QR Code</text>
      </svg>
    `)}`
  }

  const generateEmbedCode = () => {
    return `<iframe 
      src="${surveyUrl}" 
      width="${embedWidth}" 
      height="${embedHeight}"
      frameborder="0"
      allowfullscreen>
    </iframe>`
  }

  const getShareStats = () => {
    return {
      totalViews: 245,
      uniqueVisitors: 189,
      completionRate: 78,
      averageTime: '4:32'
    }
  }

  const stats = getShareStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مشاركة الاستطلاع</h2>
          <p className="text-muted-foreground">
            شارك استطلاعك مع الجمهور المستهدف
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isPublic ? 'default' : 'secondary'} className="flex items-center space-x-1">
            {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            <span>{isPublic ? 'عام' : 'خاص'}</span>
          </Badge>
        </div>
      </div>

      {/* Share Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold">{stats.totalViews}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">الزوار الفريدون</p>
                <p className="text-2xl font-bold">{stats.uniqueVisitors}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">معدل الإكمال</p>
                <p className="text-2xl font-bold">{stats.completionRate}%</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">متوسط الوقت</p>
                <p className="text-2xl font-bold">{stats.averageTime}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="link">رابط مباشر</TabsTrigger>
          <TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
          <TabsTrigger value="social">وسائل التواصل</TabsTrigger>
          <TabsTrigger value="embed">التضمين</TabsTrigger>
        </TabsList>

        {/* Direct Link Tab */}
        <TabsContent value="link" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الرابط المباشر</CardTitle>
              <CardDescription>
                انسخ الرابط وشاركه مع المستجيبين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  value={surveyUrl}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={handleCopyLink} variant="outline">
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      نسخ
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => window.open(surveyUrl, '_blank')}>
                  <Eye className="h-4 w-4 mr-2" />
                  معاينة
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  تحميل QR Code
                </Button>
              </div>

              {!isPublic && (
                <Alert>
                  <Lock className="h-4 w-4" />
                  <AlertDescription>
                    هذا الاستطلاع خاص ويتطلب تسجيل دخول للوصول إليه.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* QR Code */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
              <CardDescription>
                استخدم رمز QR للمشاركة السريعة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                <img 
                  src={generateQRCode()} 
                  alt="QR Code" 
                  className="w-32 h-32"
                />
              </div>
              <div className="flex justify-center mt-4">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  تحميل QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Tab */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مشاركة عبر البريد الإلكتروني</CardTitle>
              <CardDescription>
                أرسل رابط الاستطلاع عبر البريد الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">المستلمون</Label>
                <Input
                  id="recipients"
                  placeholder="example@company.com, user@domain.com"
                  value={emailRecipients}
                  onChange={(e) => setEmailRecipients(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  اكتب عناوين البريد الإلكتروني مفصولة بفواصل
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">الموضوع</Label>
                <Input
                  id="subject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">الرسالة</Label>
                <Textarea
                  id="message"
                  placeholder="اكتب رسالتك هنا..."
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="include-link" defaultChecked />
                <Label htmlFor="include-link">تضمين رابط الاستطلاع</Label>
              </div>

              <Button onClick={handleEmailShare} className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                إرسال البريد الإلكتروني
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مشاركة على وسائل التواصل</CardTitle>
              <CardDescription>
                شارك الاستطلاع على منصات التواصل الاجتماعي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="social-message">الرسالة</Label>
                <Textarea
                  id="social-message"
                  placeholder="اكتب رسالتك للمشاركة..."
                  value={socialMessage}
                  onChange={(e) => setSocialMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleSocialShare('whatsapp')}
                  className="flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>واتساب</span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleSocialShare('twitter')}
                  className="flex items-center space-x-2"
                >
                  <Twitter className="h-4 w-4" />
                  <span>تويتر</span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleSocialShare('facebook')}
                  className="flex items-center space-x-2"
                >
                  <Facebook className="h-4 w-4" />
                  <span>فيسبوك</span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => handleSocialShare('instagram')}
                  className="flex items-center space-x-2"
                >
                  <Instagram className="h-4 w-4" />
                  <span>إنستغرام</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embed Tab */}
        <TabsContent value="embed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تضمين في الموقع</CardTitle>
              <CardDescription>
                ضع الاستطلاع في موقعك باستخدام كود التضمين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="embed-width">العرض</Label>
                  <Input
                    id="embed-width"
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="embed-height">الارتفاع</Label>
                  <Input
                    id="embed-height"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="embed-code">كود التضمين</Label>
                <Textarea
                  id="embed-code"
                  value={generateEmbedCode()}
                  readOnly
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(generateEmbedCode())}>
                  <Copy className="h-4 w-4 mr-2" />
                  نسخ الكود
                </Button>
                <Button variant="outline" onClick={() => setShowAdvanced(!showAdvanced)}>
                  <Settings className="h-4 w-4 mr-2" />
                  خيارات متقدمة
                </Button>
              </div>

              {showAdvanced && (
                <div className="p-4 bg-muted rounded-lg space-y-4">
                  <h4 className="font-medium">خيارات متقدمة</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="auto-resize" />
                      <Label htmlFor="auto-resize">تعديل الحجم تلقائياً</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-title" defaultChecked />
                      <Label htmlFor="show-title">إظهار عنوان الاستطلاع</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-progress" defaultChecked />
                      <Label htmlFor="show-progress">إظهار شريط التقدم</Label>
                    </div>
                  </div>
                </div>
              )}

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  تأكد من أن موقعك يدعم iframe قبل استخدام كود التضمين.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
