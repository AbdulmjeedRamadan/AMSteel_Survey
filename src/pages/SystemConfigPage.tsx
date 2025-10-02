import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings, 
  Palette, 
  Globe, 
  Shield, 
  Zap, 
  Save, 
  RotateCcw, 
  Eye, 
  History,
  AlertTriangle,
  CheckCircle,
  Info,
  Lock,
  Smartphone,
  Mail,
  Clock,
  Database,
  Monitor
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import FeatureFlagManager from '@/components/admin/FeatureFlagManager'

interface SystemConfiguration {
  system: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    maintenanceMode: boolean
  }
  branding: {
    logo: {
      primary: string
      alternative: string
      favicon: string
    }
    colors: {
      primary: string
      secondary: string
      accent: string
      background: {
        light: string
        dark: string
      }
    }
  }
  internationalization: {
    defaultLanguage: string
    supportedLanguages: string[]
    rtlLanguages: string[]
  }
  security: {
    passwordPolicy: {
      minLength: number
      complexity: {
        requireUppercase: boolean
        requireLowercase: boolean
        requireNumbers: boolean
        requireSpecialCharacters: boolean
      }
      maxAttempts: number
      lockoutDuration: number
    }
    authentication: {
      twoFactorEnabled: boolean
      allowedMethods: string[]
    }
    rateLimit: {
      apiRequestsPerMinute: number
      loginAttemptsPerHour: number
    }
  }
  performance: {
    caching: {
      enabled: boolean
      strategy: 'aggressive' | 'balanced' | 'minimal'
      ttl: number
    }
    lazyLoading: {
      enabled: boolean
      threshold: number
    }
    compression: {
      level: number
      excludedRoutes: string[]
    }
  }
}

export default function SystemConfigPage() {
  const [activeTab, setActiveTab] = useState('system')
  const [config, setConfig] = useState<SystemConfiguration>({
    system: {
      name: 'AMSteel Survey System',
      version: '1.0.0',
      environment: 'development',
      maintenanceMode: false
    },
    branding: {
      logo: {
        primary: '/logo-primary.png',
        alternative: '/logo-alt.png',
        favicon: '/favicon.ico'
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        accent: '#10B981',
        background: {
          light: '#FFFFFF',
          dark: '#111827'
        }
      }
    },
    internationalization: {
      defaultLanguage: 'ar',
      supportedLanguages: ['ar', 'en'],
      rtlLanguages: ['ar']
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        complexity: {
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialCharacters: false
        },
        maxAttempts: 5,
        lockoutDuration: 30
      },
      authentication: {
        twoFactorEnabled: false,
        allowedMethods: ['email', 'sms']
      },
      rateLimit: {
        apiRequestsPerMinute: 100,
        loginAttemptsPerHour: 10
      }
    },
    performance: {
      caching: {
        enabled: true,
        strategy: 'balanced',
        ttl: 3600
      },
      lazyLoading: {
        enabled: true,
        threshold: 100
      },
      compression: {
        level: 6,
        excludedRoutes: ['/api/upload']
      }
    }
  })

  const [hasChanges, setHasChanges] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [configHistory, setConfigHistory] = useState([
    {
      id: '1',
      timestamp: new Date().toISOString(),
      user: 'أحمد محمد',
      section: 'security',
      changes: 'تم تفعيل المصادقة الثنائية'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      user: 'سارة أحمد',
      section: 'branding',
      changes: 'تم تحديث ألوان النظام'
    }
  ])

  const updateConfig = (section: keyof SystemConfiguration, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log configuration change
      const newLogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        user: 'المدير الحالي',
        section: activeTab,
        changes: 'تم حفظ التغييرات'
      }
      
      setConfigHistory(prev => [newLogEntry, ...prev])
      setHasChanges(false)
      toast.success('تم حفظ إعدادات النظام بنجاح')
    } catch (error) {
      toast.error('حدث خطأ في حفظ الإعدادات')
    }
  }

  const handleReset = () => {
    if (confirm('هل أنت متأكد من إعادة تعيين الإعدادات إلى القيم الافتراضية؟')) {
      // Reset to default values
      setHasChanges(false)
      toast.success('تم إعادة تعيين الإعدادات')
    }
  }

  const handlePreview = () => {
    setPreviewMode(!previewMode)
    toast.success(previewMode ? 'تم إلغاء وضع المعاينة' : 'تم تفعيل وضع المعاينة')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إعدادات النظام المتقدمة</h1>
          <p className="text-muted-foreground">
            إدارة وتخصيص إعدادات النظام الشاملة
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              تغييرات غير محفوظة
            </Badge>
          )}
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            {previewMode ? 'إلغاء المعاينة' : 'معاينة'}
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {/* Preview Mode Alert */}
      {previewMode && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            وضع المعاينة مفعل. يمكنك رؤية التغييرات قبل حفظها.
          </AlertDescription>
        </Alert>
      )}

      {/* Maintenance Mode Alert */}
      {config.system.maintenanceMode && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            وضع الصيانة مفعل. النظام غير متاح للمستخدمين حالياً.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="system">النظام</TabsTrigger>
          <TabsTrigger value="branding">العلامة التجارية</TabsTrigger>
          <TabsTrigger value="i18n">اللغات</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="features">الميزات</TabsTrigger>
          <TabsTrigger value="history">السجل</TabsTrigger>
        </TabsList>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>إعدادات النظام الأساسية</span>
              </CardTitle>
              <CardDescription>
                تكوين المعلومات الأساسية للنظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="systemName">اسم النظام</Label>
                  <Input
                    id="systemName"
                    value={config.system.name}
                    onChange={(e) => updateConfig('system', { name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">إصدار النظام</Label>
                  <Input
                    id="version"
                    value={config.system.version}
                    onChange={(e) => updateConfig('system', { version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">البيئة</Label>
                  <Select 
                    value={config.system.environment} 
                    onValueChange={(value) => updateConfig('system', { environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">التطوير</SelectItem>
                      <SelectItem value="staging">الاختبار</SelectItem>
                      <SelectItem value="production">الإنتاج</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.system.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('system', { maintenanceMode: checked })}
                  />
                  <Label>وضع الصيانة</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Settings */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>إعدادات العلامة التجارية</span>
              </CardTitle>
              <CardDescription>
                تخصيص الشعار والألوان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">الشعارات</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>الشعار الأساسي</Label>
                    <Input
                      value={config.branding.logo.primary}
                      onChange={(e) => updateConfig('branding', { 
                        logo: { ...config.branding.logo, primary: e.target.value }
                      })}
                      placeholder="مسار الشعار الأساسي"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الشعار البديل</Label>
                    <Input
                      value={config.branding.logo.alternative}
                      onChange={(e) => updateConfig('branding', { 
                        logo: { ...config.branding.logo, alternative: e.target.value }
                      })}
                      placeholder="مسار الشعار البديل"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>أيقونة الموقع</Label>
                    <Input
                      value={config.branding.logo.favicon}
                      onChange={(e) => updateConfig('branding', { 
                        logo: { ...config.branding.logo, favicon: e.target.value }
                      })}
                      placeholder="مسار أيقونة الموقع"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">الألوان</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>اللون الأساسي</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: config.branding.colors.primary }}
                      />
                      <Input
                        value={config.branding.colors.primary}
                        onChange={(e) => updateConfig('branding', { 
                          colors: { ...config.branding.colors, primary: e.target.value }
                        })}
                        className="w-24"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>اللون الثانوي</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: config.branding.colors.secondary }}
                      />
                      <Input
                        value={config.branding.colors.secondary}
                        onChange={(e) => updateConfig('branding', { 
                          colors: { ...config.branding.colors, secondary: e.target.value }
                        })}
                        className="w-24"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>لون التمييز</Label>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: config.branding.colors.accent }}
                      />
                      <Input
                        value={config.branding.colors.accent}
                        onChange={(e) => updateConfig('branding', { 
                          colors: { ...config.branding.colors, accent: e.target.value }
                        })}
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internationalization Settings */}
        <TabsContent value="i18n" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>إعدادات اللغات</span>
              </CardTitle>
              <CardDescription>
                تكوين اللغات المدعومة والترجمة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>اللغة الافتراضية</Label>
                  <Select 
                    value={config.internationalization.defaultLanguage} 
                    onValueChange={(value) => updateConfig('internationalization', { defaultLanguage: value })}
                  >
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
                  <Label>اللغات المدعومة</Label>
                  <div className="flex flex-wrap gap-2">
                    {config.internationalization.supportedLanguages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang === 'ar' ? 'العربية' : 'English'}
                      </Badge>
                    ))}
                  </div>
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
                <Shield className="h-5 w-5" />
                <span>إعدادات الأمان</span>
              </CardTitle>
              <CardDescription>
                تكوين سياسات الأمان والمصادقة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">سياسة كلمة المرور</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الحد الأدنى لطول كلمة المرور</Label>
                    <Input
                      type="number"
                      value={config.security.passwordPolicy.minLength}
                      onChange={(e) => updateConfig('security', {
                        passwordPolicy: {
                          ...config.security.passwordPolicy,
                          minLength: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>عدد المحاولات المسموحة</Label>
                    <Input
                      type="number"
                      value={config.security.passwordPolicy.maxAttempts}
                      onChange={(e) => updateConfig('security', {
                        passwordPolicy: {
                          ...config.security.passwordPolicy,
                          maxAttempts: parseInt(e.target.value)
                        }
                      })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>متطلبات التعقيد</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.security.passwordPolicy.complexity.requireUppercase}
                        onCheckedChange={(checked) => updateConfig('security', {
                          passwordPolicy: {
                            ...config.security.passwordPolicy,
                            complexity: {
                              ...config.security.passwordPolicy.complexity,
                              requireUppercase: checked
                            }
                          }
                        })}
                      />
                      <Label>يتطلب أحرف كبيرة</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.security.passwordPolicy.complexity.requireNumbers}
                        onCheckedChange={(checked) => updateConfig('security', {
                          passwordPolicy: {
                            ...config.security.passwordPolicy,
                            complexity: {
                              ...config.security.passwordPolicy.complexity,
                              requireNumbers: checked
                            }
                          }
                        })}
                      />
                      <Label>يتطلب أرقام</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={config.security.passwordPolicy.complexity.requireSpecialCharacters}
                        onCheckedChange={(checked) => updateConfig('security', {
                          passwordPolicy: {
                            ...config.security.passwordPolicy,
                            complexity: {
                              ...config.security.passwordPolicy.complexity,
                              requireSpecialCharacters: checked
                            }
                          }
                        })}
                      />
                      <Label>يتطلب رموز خاصة</Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">المصادقة الثنائية</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.security.authentication.twoFactorEnabled}
                    onCheckedChange={(checked) => updateConfig('security', {
                      authentication: {
                        ...config.security.authentication,
                        twoFactorEnabled: checked
                      }
                    })}
                  />
                  <Label>تفعيل المصادقة الثنائية</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>إعدادات الأداء</span>
              </CardTitle>
              <CardDescription>
                تحسين أداء النظام والتخزين المؤقت
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">التخزين المؤقت</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={config.performance.caching.enabled}
                      onCheckedChange={(checked) => updateConfig('performance', {
                        caching: {
                          ...config.performance.caching,
                          enabled: checked
                        }
                      })}
                    />
                    <Label>تفعيل التخزين المؤقت</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>استراتيجية التخزين</Label>
                    <Select 
                      value={config.performance.caching.strategy} 
                      onValueChange={(value) => updateConfig('performance', {
                        caching: {
                          ...config.performance.caching,
                          strategy: value as any
                        }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">أدنى</SelectItem>
                        <SelectItem value="balanced">متوازن</SelectItem>
                        <SelectItem value="aggressive">قوي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">التحميل التدريجي</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.performance.lazyLoading.enabled}
                    onCheckedChange={(checked) => updateConfig('performance', {
                      lazyLoading: {
                        ...config.performance.lazyLoading,
                        enabled: checked
                      }
                    })}
                  />
                  <Label>تفعيل التحميل التدريجي</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags */}
        <TabsContent value="features" className="space-y-6">
          <FeatureFlagManager 
            onFlagUpdate={(flag) => {
              console.log('Feature flag updated:', flag)
              // In real app, this would sync with backend
            }}
          />
        </TabsContent>

        {/* Configuration History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>سجل التغييرات</span>
              </CardTitle>
              <CardDescription>
                تتبع جميع التغييرات في إعدادات النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {configHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{entry.changes}</p>
                        <p className="text-sm text-muted-foreground">
                          بواسطة {entry.user} • {formatDate(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{entry.section}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
