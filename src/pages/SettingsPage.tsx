import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell, 
  Shield, 
  Globe, 
  Palette,
  Save,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    language: 'ar',
    timezone: 'Asia/Riyadh',
    dateFormat: 'DD/MM/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    surveyReminders: true,
    responseAlerts: true,
    weeklyReports: false,
    
    // Privacy Settings
    profileVisibility: 'private',
    showEmail: false,
    showPhone: false,
    allowDirectMessages: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordChangeRequired: false,
    
    // Appearance Settings
    theme: 'light',
    fontSize: 'medium',
    compactMode: false,
    
    // Email Settings
    emailFrequency: 'immediate',
    digestType: 'weekly'
  })

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const handleSave = () => {
    // Here you would typically save to backend
    toast.success('تم حفظ الإعدادات بنجاح')
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast.error('كلمة المرور الجديدة غير متطابقة')
      return
    }
    if (newPassword.length < 8) {
      toast.error('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    
    // Here you would typically change password via API
    toast.success('تم تغيير كلمة المرور بنجاح')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground">
            تخصيص إعدادات حسابك وتفضيلاتك
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          حفظ التغييرات
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="privacy">الخصوصية</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>الإعدادات العامة</span>
              </CardTitle>
              <CardDescription>
                تخصيص اللغة والمنطقة الزمنية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="language">اللغة</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">المنطقة الزمنية</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Europe/London">لندن (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">نيويورك (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">تنسيق التاريخ</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => updateSetting('dateFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">يوم/شهر/سنة</SelectItem>
                      <SelectItem value="MM/DD/YYYY">شهر/يوم/سنة</SelectItem>
                      <SelectItem value="YYYY-MM-DD">سنة-شهر-يوم</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>إعدادات الإشعارات</span>
              </CardTitle>
              <CardDescription>
                تخصيص كيفية استلام الإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الإشعارات عبر البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">
                      استلام إشعارات مهمة عبر البريد الإلكتروني
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الإشعارات الفورية</Label>
                    <p className="text-sm text-muted-foreground">
                      استلام إشعارات فورية في المتصفح
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تذكيرات الاستطلاعات</Label>
                    <p className="text-sm text-muted-foreground">
                      تذكير بمواعيد انتهاء الاستطلاعات
                    </p>
                  </div>
                  <Switch
                    checked={settings.surveyReminders}
                    onCheckedChange={(checked) => updateSetting('surveyReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تنبيهات الردود</Label>
                    <p className="text-sm text-muted-foreground">
                      إشعار عند وصول ردود جديدة
                    </p>
                  </div>
                  <Switch
                    checked={settings.responseAlerts}
                    onCheckedChange={(checked) => updateSetting('responseAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>التقارير الأسبوعية</Label>
                    <p className="text-sm text-muted-foreground">
                      استلام ملخص أسبوعي للنشاط
                    </p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => updateSetting('weeklyReports', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>إعدادات الخصوصية</span>
              </CardTitle>
              <CardDescription>
                التحكم في معلوماتك الشخصية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>رؤية الملف الشخصي</Label>
                  <Select value={settings.profileVisibility} onValueChange={(value) => updateSetting('profileVisibility', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عام</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                      <SelectItem value="contacts">المعرفين فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إظهار البريد الإلكتروني</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للآخرين برؤية بريدك الإلكتروني
                    </p>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => updateSetting('showEmail', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إظهار رقم الهاتف</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للآخرين برؤية رقم هاتفك
                    </p>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => updateSetting('showPhone', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الرسائل المباشرة</Label>
                    <p className="text-sm text-muted-foreground">
                      السماح للآخرين بإرسال رسائل مباشرة
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowDirectMessages}
                    onCheckedChange={(checked) => updateSetting('allowDirectMessages', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span>إعدادات الأمان</span>
              </CardTitle>
              <CardDescription>
                حماية حسابك وكلمة المرور
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>المصادقة الثنائية</Label>
                    <p className="text-sm text-muted-foreground">
                      طبقة حماية إضافية لحسابك
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>مهلة الجلسة (دقائق)</Label>
                  <Select value={settings.sessionTimeout} onValueChange={(value) => updateSetting('sessionTimeout', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 دقيقة</SelectItem>
                      <SelectItem value="30">30 دقيقة</SelectItem>
                      <SelectItem value="60">ساعة واحدة</SelectItem>
                      <SelectItem value="240">4 ساعات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تغيير كلمة المرور مطلوب</Label>
                    <p className="text-sm text-muted-foreground">
                      إجبار تغيير كلمة المرور في المرة القادمة
                    </p>
                  </div>
                  <Switch
                    checked={settings.passwordChangeRequired}
                    onCheckedChange={(checked) => updateSetting('passwordChangeRequired', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">تغيير كلمة المرور</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الحالية"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أكد كلمة المرور الجديدة"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPasswords(!showPasswords)}
                    >
                      {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {showPasswords ? 'إخفاء كلمات المرور' : 'إظهار كلمات المرور'}
                    </span>
                  </div>

                  <Button onClick={handlePasswordChange}>
                    تغيير كلمة المرور
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>إعدادات المظهر</span>
              </CardTitle>
              <CardDescription>
                تخصيص مظهر واجهة المستخدم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>المظهر</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">فاتح</SelectItem>
                      <SelectItem value="dark">داكن</SelectItem>
                      <SelectItem value="auto">تلقائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>حجم الخط</Label>
                  <Select value={settings.fontSize} onValueChange={(value) => updateSetting('fontSize', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">صغير</SelectItem>
                      <SelectItem value="medium">متوسط</SelectItem>
                      <SelectItem value="large">كبير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>الوضع المضغوط</Label>
                    <p className="text-sm text-muted-foreground">
                      تقليل المسافات لعرض المزيد من المحتوى
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => updateSetting('compactMode', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
