import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings,
  Palette,
  Globe,
  Shield,
  Database,
  Bell,
  Mail,
  MessageSquare,
  Save,
  RotateCcw,
  Eye,
  History,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  Wrench,
  Monitor,
  Smartphone,
  Flag,
  Users,
  Lock,
  Key,
  Server,
  Cloud,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

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
    companyName: string
    tagline: string
  }
  localization: {
    defaultLanguage: 'ar' | 'en'
    supportedLanguages: string[]
    rtlSupport: boolean
    dateFormat: string
    timeFormat: '12h' | '24h'
    timezone: string
  }
  security: {
    sessionTimeout: number
    maxLoginAttempts: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
    }
    twoFactorAuth: boolean
    ipWhitelist: string[]
  }
  database: {
    connectionString: string
    maxConnections: number
    queryTimeout: number
    backupSchedule: string
    retentionPeriod: number
  }
  notifications: {
    email: {
      enabled: boolean
      smtpHost: string
      smtpPort: number
      username: string
      fromAddress: string
    }
    sms: {
      enabled: boolean
      provider: string
      apiKey: string
    }
    push: {
      enabled: boolean
      vapidKey: string
    }
  }
  features: {
    surveyTemplates: boolean
    advancedAnalytics: boolean
    exportOptions: boolean
    apiAccess: boolean
    customBranding: boolean
    multiLanguage: boolean
  }
}

interface FeatureFlag {
  id: string
  name: string
  description: string
  enabled: boolean
  environments: {
    development: boolean
    staging: boolean
    production: boolean
  }
  rolloutPercentage: number
  dependencies?: string[]
}

interface ConfigurationChangeLog {
  id: string
  timestamp: string
  user: string
  section: string
  field: string
  oldValue: any
  newValue: any
  reason?: string
}

interface SystemConfigurationProps {
  onSave: (config: SystemConfiguration) => void
  onReset: () => void
  onExport: (config: SystemConfiguration) => void
  onImport: (config: SystemConfiguration) => void
}

export default function SystemConfiguration({ 
  onSave, 
  onReset, 
  onExport, 
  onImport 
}: SystemConfigurationProps) {
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
        primary: '#1e40af',
        secondary: '#64748b',
        accent: '#f59e0b',
        background: {
          light: '#ffffff',
          dark: '#0f172a'
        }
      },
      companyName: 'AMSteel',
      tagline: 'نظام الاستطلاعات المتقدم'
    },
    localization: {
      defaultLanguage: 'ar',
      supportedLanguages: ['ar', 'en'],
      rtlSupport: true,
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      timezone: 'Asia/Riyadh'
    },
    security: {
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true
      },
      twoFactorAuth: false,
      ipWhitelist: []
    },
    database: {
      connectionString: 'postgresql://localhost:5432/amsteel_surveys',
      maxConnections: 100,
      queryTimeout: 30000,
      backupSchedule: '0 2 * * *',
      retentionPeriod: 90
    },
    notifications: {
      email: {
        enabled: true,
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        username: 'noreply@amsteel.com',
        fromAddress: 'AMSteel Survey System <noreply@amsteel.com>'
      },
      sms: {
        enabled: false,
        provider: 'twilio',
        apiKey: ''
      },
      push: {
        enabled: false,
        vapidKey: ''
      }
    },
    features: {
      surveyTemplates: true,
      advancedAnalytics: true,
      exportOptions: true,
      apiAccess: true,
      customBranding: true,
      multiLanguage: true
    }
  })

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description: 'Enable advanced analytics and reporting features',
      enabled: true,
      environments: {
        development: true,
        staging: true,
        production: false
      },
      rolloutPercentage: 50
    },
    {
      id: 'survey-templates',
      name: 'Survey Templates',
      description: 'Pre-built survey templates for quick creation',
      enabled: true,
      environments: {
        development: true,
        staging: true,
        production: true
      },
      rolloutPercentage: 100
    },
    {
      id: 'real-time-collaboration',
      name: 'Real-time Collaboration',
      description: 'Allow multiple users to edit surveys simultaneously',
      enabled: false,
      environments: {
        development: true,
        staging: false,
        production: false
      },
      rolloutPercentage: 0
    }
  ])

  const [changeLog, setChangeLog] = useState<ConfigurationChangeLog[]>([
    {
      id: '1',
      timestamp: '2024-01-20T10:30:00Z',
      user: 'المطور الرئيسي',
      section: 'security',
      field: 'twoFactorAuth',
      oldValue: false,
      newValue: true,
      reason: 'تحسين الأمان'
    },
    {
      id: '2',
      timestamp: '2024-01-19T15:45:00Z',
      user: 'المطور الرئيسي',
      section: 'branding',
      field: 'colors.primary',
      oldValue: '#3b82f6',
      newValue: '#1e40af',
      reason: 'تحديث الهوية البصرية'
    }
  ])

  const [showPreview, setShowPreview] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const updateConfig = (section: keyof SystemConfiguration, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const updateNestedConfig = (section: keyof SystemConfiguration, path: string[], value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev }
      let current: any = newConfig[section]
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      
      current[path[path.length - 1]] = value
      return newConfig
    })
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    // Log the change
    const newLogEntry: ConfigurationChangeLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user: 'المطور الرئيسي',
      section: 'multiple',
      field: 'configuration_update',
      oldValue: 'previous_config',
      newValue: 'updated_config',
      reason: 'تحديث شامل للإعدادات'
    }
    
    setChangeLog(prev => [newLogEntry, ...prev])
    onSave(config)
    setHasUnsavedChanges(false)
    toast.success('تم حفظ الإعدادات بنجاح!')
  }

  const handleReset = () => {
    onReset()
    setHasUnsavedChanges(false)
    toast.success('تم إعادة تعيين الإعدادات!')
  }

  const handleExport = () => {
    onExport(config)
    toast.success('تم تصدير الإعدادات!')
  }

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags(prev => 
      prev.map(flag => 
        flag.id === flagId 
          ? { ...flag, enabled: !flag.enabled }
          : flag
      )
    )
    toast.success('تم تحديث الميزة!')
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إعدادات النظام المتقدمة</h2>
          <p className="text-muted-foreground">
            إدارة شاملة لجميع إعدادات النظام والميزات
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              تغييرات غير محفوظة
            </Badge>
          )}
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Eye className="h-4 w-4 mr-2" />
            معاينة
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            إعادة تعيين
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="system">النظام</TabsTrigger>
          <TabsTrigger value="branding">الهوية</TabsTrigger>
          <TabsTrigger value="localization">اللغة</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
          <TabsTrigger value="database">قاعدة البيانات</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="features">الميزات</TabsTrigger>
          <TabsTrigger value="logs">السجلات</TabsTrigger>
        </TabsList>

        {/* System Configuration Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>إعدادات النظام الأساسية</span>
              </CardTitle>
              <CardDescription>
                الإعدادات الأساسية لتشغيل النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="system-name">اسم النظام</Label>
                  <Input
                    id="system-name"
                    value={config.system.name}
                    onChange={(e) => updateConfig('system', 'name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="system-version">الإصدار</Label>
                  <Input
                    id="system-version"
                    value={config.system.version}
                    onChange={(e) => updateConfig('system', 'version', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment">البيئة</Label>
                  <Select 
                    value={config.system.environment} 
                    onValueChange={(value) => updateConfig('system', 'environment', value)}
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
                    id="maintenance-mode"
                    checked={config.system.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('system', 'maintenanceMode', checked)}
                  />
                  <Label htmlFor="maintenance-mode">وضع الصيانة</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Configuration Tab */}
        <TabsContent value="branding" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>إعدادات الهوية البصرية</span>
              </CardTitle>
              <CardDescription>
                تخصيص الشعار والألوان والهوية البصرية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">الشعارات</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="logo-primary">الشعار الأساسي</Label>
                    <Input
                      id="logo-primary"
                      value={config.branding.logo.primary}
                      onChange={(e) => updateNestedConfig('branding', ['logo', 'primary'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logo-alt">الشعار البديل</Label>
                    <Input
                      id="logo-alt"
                      value={config.branding.logo.alternative}
                      onChange={(e) => updateNestedConfig('branding', ['logo', 'alternative'], e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="favicon">أيقونة الموقع</Label>
                    <Input
                      id="favicon"
                      value={config.branding.logo.favicon}
                      onChange={(e) => updateNestedConfig('branding', ['logo', 'favicon'], e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Color Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">الألوان</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color-primary">اللون الأساسي</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color-primary"
                        type="color"
                        value={config.branding.colors.primary}
                        onChange={(e) => updateNestedConfig('branding', ['colors', 'primary'], e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.branding.colors.primary}
                        onChange={(e) => updateNestedConfig('branding', ['colors', 'primary'], e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color-secondary">اللون الثانوي</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color-secondary"
                        type="color"
                        value={config.branding.colors.secondary}
                        onChange={(e) => updateNestedConfig('branding', ['colors', 'secondary'], e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.branding.colors.secondary}
                        onChange={(e) => updateNestedConfig('branding', ['colors', 'secondary'], e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color-accent">لون التمييز</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="color-accent"
                        type="color"
                        value={config.branding.colors.accent}
                        onChange={(e) => updateNestedConfig('branding', ['colors', 'accent'], e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.branding.colors.accent}
                        onChange={(e) => updateNestedConfig('branding', ['colors', 'accent'], e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">معلومات الشركة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">اسم الشركة</Label>
                    <Input
                      id="company-name"
                      value={config.branding.companyName}
                      onChange={(e) => updateConfig('branding', 'companyName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tagline">الشعار</Label>
                    <Input
                      id="tagline"
                      value={config.branding.tagline}
                      onChange={(e) => updateConfig('branding', 'tagline', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Flag className="h-5 w-5" />
                <span>إدارة الميزات</span>
              </CardTitle>
              <CardDescription>
                تفعيل وإلغاء تفعيل ميزات النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(config.features).map(([key, enabled]) => (
                  <Card key={key} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {key === 'surveyTemplates' && 'قوالب الاستطلاعات'}
                          {key === 'advancedAnalytics' && 'التحليلات المتقدمة'}
                          {key === 'exportOptions' && 'خيارات التصدير'}
                          {key === 'apiAccess' && 'الوصول للـ API'}
                          {key === 'customBranding' && 'الهوية المخصصة'}
                          {key === 'multiLanguage' && 'متعدد اللغات'}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {enabled ? 'مفعل' : 'غير مفعل'}
                        </p>
                      </div>
                      <Switch
                        checked={enabled}
                        onCheckedChange={(checked) => updateConfig('features', key, checked)}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Feature Flags المتقدمة</h3>
                <div className="space-y-4">
                  {featureFlags.map((flag) => (
                    <Card key={flag.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{flag.name}</h4>
                            <Badge variant={flag.enabled ? "default" : "secondary"}>
                              {flag.enabled ? 'مفعل' : 'غير مفعل'}
                            </Badge>
                            <Badge variant="outline">
                              {flag.rolloutPercentage}% Rollout
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {flag.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-2">
                              <Monitor className="h-3 w-3" />
                              <span>Dev: {flag.environments.development ? '✓' : '✗'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Server className="h-3 w-3" />
                              <span>Staging: {flag.environments.staging ? '✓' : '✗'}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Cloud className="h-3 w-3" />
                              <span>Prod: {flag.environments.production ? '✓' : '✗'}</span>
                            </div>
                          </div>
                        </div>
                        <Switch
                          checked={flag.enabled}
                          onCheckedChange={() => toggleFeatureFlag(flag.id)}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
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
                {changeLog.map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge variant="outline">{log.section}</Badge>
                          <span className="text-sm font-medium">{log.field}</span>
                        </div>
                        <div className="text-sm text-muted-foreground mb-2">
                          <span className="font-medium">من:</span> {JSON.stringify(log.oldValue)} 
                          <span className="mx-2">→</span>
                          <span className="font-medium">إلى:</span> {JSON.stringify(log.newValue)}
                        </div>
                        {log.reason && (
                          <div className="text-sm text-muted-foreground mb-2">
                            <span className="font-medium">السبب:</span> {log.reason}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>بواسطة: {log.user}</span>
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>معاينة الإعدادات</DialogTitle>
            <DialogDescription>
              معاينة كيف ستبدو الإعدادات الحالية
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">النظام</h3>
              <div className="text-sm space-y-1">
                <p><strong>الاسم:</strong> {config.system.name}</p>
                <p><strong>الإصدار:</strong> {config.system.version}</p>
                <p><strong>البيئة:</strong> {config.system.environment}</p>
                <p><strong>وضع الصيانة:</strong> {config.system.maintenanceMode ? 'مفعل' : 'غير مفعل'}</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">الهوية البصرية</h3>
              <div className="flex items-center space-x-4">
                <div 
                  className="w-8 h-8 rounded" 
                  style={{ backgroundColor: config.branding.colors.primary }}
                ></div>
                <div 
                  className="w-8 h-8 rounded" 
                  style={{ backgroundColor: config.branding.colors.secondary }}
                ></div>
                <div 
                  className="w-8 h-8 rounded" 
                  style={{ backgroundColor: config.branding.colors.accent }}
                ></div>
                <span className="text-sm">{config.branding.companyName}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
