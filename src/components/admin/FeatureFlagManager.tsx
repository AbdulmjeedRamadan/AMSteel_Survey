import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Flag, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'

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
  createdAt: string
  updatedAt: string
}

interface FeatureFlagManagerProps {
  onFlagUpdate?: (flag: FeatureFlag) => void
}

export default function FeatureFlagManager({ onFlagUpdate }: FeatureFlagManagerProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>([
    {
      id: '1',
      name: 'advanced_analytics',
      description: 'تفعيل التحليلات المتقدمة مع الرسوم البيانية التفاعلية',
      enabled: true,
      environments: {
        development: true,
        staging: true,
        production: false
      },
      rolloutPercentage: 25,
      dependencies: ['basic_analytics'],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-20T14:20:00Z'
    },
    {
      id: '2',
      name: 'survey_templates',
      description: 'قوالب الاستطلاعات الجاهزة للاستخدام السريع',
      enabled: false,
      environments: {
        development: true,
        staging: false,
        production: false
      },
      rolloutPercentage: 0,
      createdAt: '2024-01-10T09:15:00Z',
      updatedAt: '2024-01-10T09:15:00Z'
    },
    {
      id: '3',
      name: 'real_time_notifications',
      description: 'الإشعارات الفورية للردود الجديدة',
      enabled: true,
      environments: {
        development: true,
        staging: true,
        production: true
      },
      rolloutPercentage: 100,
      createdAt: '2024-01-05T16:45:00Z',
      updatedAt: '2024-01-18T11:30:00Z'
    },
    {
      id: '4',
      name: 'ai_insights',
      description: 'تحليل الردود باستخدام الذكاء الاصطناعي',
      enabled: false,
      environments: {
        development: false,
        staging: false,
        production: false
      },
      rolloutPercentage: 0,
      dependencies: ['advanced_analytics'],
      createdAt: '2024-01-25T13:20:00Z',
      updatedAt: '2024-01-25T13:20:00Z'
    }
  ])

  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const toggleFlag = (flagId: string) => {
    setFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { ...flag, enabled: !flag.enabled, updatedAt: new Date().toISOString() }
        : flag
    ))
    
    const flag = flags.find(f => f.id === flagId)
    if (flag) {
      toast.success(`تم ${flag.enabled ? 'إيقاف' : 'تفعيل'} الميزة: ${flag.description}`)
      onFlagUpdate?.(flag)
    }
  }

  const updateRolloutPercentage = (flagId: string, percentage: number) => {
    setFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { ...flag, rolloutPercentage: percentage, updatedAt: new Date().toISOString() }
        : flag
    ))
    
    toast.success(`تم تحديث نسبة التفعيل إلى ${percentage}%`)
  }

  const toggleEnvironment = (flagId: string, env: keyof FeatureFlag['environments']) => {
    setFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { 
            ...flag, 
            environments: { 
              ...flag.environments, 
              [env]: !flag.environments[env] 
            },
            updatedAt: new Date().toISOString()
          }
        : flag
    ))
    
    toast.success(`تم تحديث إعدادات البيئة`)
  }

  const deleteFlag = (flagId: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الميزة؟')) {
      setFlags(prev => prev.filter(flag => flag.id !== flagId))
      toast.success('تم حذف الميزة')
    }
  }

  const getStatusColor = (flag: FeatureFlag) => {
    if (!flag.enabled) return 'bg-gray-100 text-gray-800'
    if (flag.rolloutPercentage === 100) return 'bg-green-100 text-green-800'
    if (flag.rolloutPercentage > 0) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getStatusText = (flag: FeatureFlag) => {
    if (!flag.enabled) return 'معطل'
    if (flag.rolloutPercentage === 100) return 'مفعل بالكامل'
    if (flag.rolloutPercentage > 0) return `تفعيل جزئي ${flag.rolloutPercentage}%`
    return 'جاهز للتفعيل'
  }

  const getEnvironmentBadges = (environments: FeatureFlag['environments']) => {
    return Object.entries(environments).map(([env, enabled]) => (
      <Badge 
        key={env} 
        variant={enabled ? 'default' : 'secondary'}
        className={enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
      >
        {env === 'development' ? 'تطوير' : env === 'staging' ? 'اختبار' : 'إنتاج'}
      </Badge>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الميزات</h2>
          <p className="text-muted-foreground">
            التحكم في تفعيل وإيقاف ميزات النظام
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة ميزة جديدة
        </Button>
      </div>

      {/* Feature Flags List */}
      <div className="grid gap-6">
        {flags.map((flag) => (
          <Card key={flag.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Flag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{flag.description}</CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {flag.name}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(flag)}>
                    {getStatusText(flag)}
                  </Badge>
                  <Switch
                    checked={flag.enabled}
                    onCheckedChange={() => toggleFlag(flag.id)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Environments */}
              <div>
                <Label className="text-sm font-medium mb-2 block">البيئات</Label>
                <div className="flex flex-wrap gap-2">
                  {getEnvironmentBadges(flag.environments)}
                </div>
              </div>

              {/* Rollout Percentage */}
              {flag.enabled && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium">نسبة التفعيل</Label>
                    <span className="text-sm text-muted-foreground">
                      {flag.rolloutPercentage}%
                    </span>
                  </div>
                  <Progress value={flag.rolloutPercentage} className="mb-2" />
                  <div className="flex items-center space-x-2">
                    <Input
                      type="range"
                      min="0"
                      max="100"
                      value={flag.rolloutPercentage}
                      onChange={(e) => updateRolloutPercentage(flag.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {flag.dependencies && flag.dependencies.length > 0 && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">التبعيات</Label>
                  <div className="flex flex-wrap gap-2">
                    {flag.dependencies.map((dep) => (
                      <Badge key={dep} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Environment Controls */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                {Object.entries(flag.environments).map(([env, enabled]) => (
                  <div key={env} className="flex items-center justify-between">
                    <Label className="text-sm">
                      {env === 'development' ? 'تطوير' : env === 'staging' ? 'اختبار' : 'إنتاج'}
                    </Label>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => toggleEnvironment(flag.id, env as keyof FeatureFlag['environments'])}
                      disabled={!flag.enabled}
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  آخر تحديث: {formatDate(flag.updatedAt)}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingFlag(flag)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFlag(flag.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الميزات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {flags.filter(f => f.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">مفعلة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {flags.filter(f => !f.enabled).length}
              </div>
              <div className="text-sm text-muted-foreground">معطلة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {flags.filter(f => f.enabled && f.rolloutPercentage < 100).length}
              </div>
              <div className="text-sm text-muted-foreground">تفعيل جزئي</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {flags.filter(f => f.dependencies && f.dependencies.length > 0).length}
              </div>
              <div className="text-sm text-muted-foreground">لها تبعيات</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
