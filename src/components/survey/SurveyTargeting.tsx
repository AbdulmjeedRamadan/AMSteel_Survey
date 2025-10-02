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
  Users, 
  Building, 
  MapPin, 
  Calendar, 
  Clock, 
  Target, 
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface TargetingRule {
  id: string
  type: 'department' | 'position' | 'location' | 'age' | 'experience' | 'custom'
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between'
  value: string | number
  value2?: string | number
  label: string
}

interface SurveyTargetingProps {
  survey: any
  onUpdate: (targeting: any) => void
  onSave: () => void
}

export default function SurveyTargeting({ survey, onUpdate, onSave }: SurveyTargetingProps) {
  const [activeTab, setActiveTab] = useState('rules')
  const [targetingRules, setTargetingRules] = useState<TargetingRule[]>([])
  const [isAddingRule, setIsAddingRule] = useState(false)
  const [newRule, setNewRule] = useState<Partial<TargetingRule>>({
    type: 'department',
    operator: 'equals',
    value: '',
    label: ''
  })

  // Mock data
  const departments = [
    { id: 'it', name: 'تكنولوجيا المعلومات', count: 25 },
    { id: 'hr', name: 'الموارد البشرية', count: 15 },
    { id: 'finance', name: 'المحاسبة', count: 12 },
    { id: 'marketing', name: 'التسويق', count: 8 },
    { id: 'sales', name: 'المبيعات', count: 20 },
    { id: 'operations', name: 'العمليات', count: 18 }
  ]

  const positions = [
    { id: 'manager', name: 'مدير', count: 8 },
    { id: 'senior', name: 'أخصائي أول', count: 15 },
    { id: 'specialist', name: 'أخصائي', count: 25 },
    { id: 'coordinator', name: 'منسق', count: 12 },
    { id: 'assistant', name: 'مساعد', count: 10 }
  ]

  const locations = [
    { id: 'riyadh', name: 'الرياض', count: 45 },
    { id: 'jeddah', name: 'جدة', count: 20 },
    { id: 'dammam', name: 'الدمام', count: 15 },
    { id: 'remote', name: 'العمل عن بُعد', count: 8 }
  ]

  const handleAddRule = () => {
    if (!newRule.type || !newRule.operator || !newRule.value || !newRule.label) {
      return
    }

    const rule: TargetingRule = {
      id: Date.now().toString(),
      type: newRule.type as any,
      operator: newRule.operator as any,
      value: newRule.value,
      value2: newRule.value2,
      label: newRule.label
    }

    setTargetingRules([...targetingRules, rule])
    setNewRule({
      type: 'department',
      operator: 'equals',
      value: '',
      label: ''
    })
    setIsAddingRule(false)
  }

  const handleRemoveRule = (id: string) => {
    setTargetingRules(targetingRules.filter(rule => rule.id !== id))
  }

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'department': return <Building className="h-4 w-4" />
      case 'position': return <Users className="h-4 w-4" />
      case 'location': return <MapPin className="h-4 w-4" />
      case 'age': return <Calendar className="h-4 w-4" />
      case 'experience': return <Clock className="h-4 w-4" />
      default: return <Target className="h-4 w-4" />
    }
  }

  const getOperatorText = (operator: string) => {
    switch (operator) {
      case 'equals': return 'يساوي'
      case 'not_equals': return 'لا يساوي'
      case 'contains': return 'يحتوي على'
      case 'not_contains': return 'لا يحتوي على'
      case 'greater_than': return 'أكبر من'
      case 'less_than': return 'أصغر من'
      case 'between': return 'بين'
      default: return operator
    }
  }

  const getEstimatedReach = () => {
    // Mock calculation - in real app, this would be calculated based on actual data
    const baseReach = 100
    const reductionFactor = targetingRules.length * 0.1
    return Math.max(10, Math.floor(baseReach * (1 - reductionFactor)))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تحديد الاستطلاع</h2>
          <p className="text-muted-foreground">
            تحديد الفئات المستهدفة للاستطلاع
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            {getEstimatedReach()} مستهدف
          </Badge>
          <Button onClick={onSave}>
            <CheckCircle className="h-4 w-4 mr-2" />
            حفظ التحديد
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules">قواعد التحديد</TabsTrigger>
          <TabsTrigger value="preview">معاينة المستهدفين</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Targeting Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>قواعد التحديد</CardTitle>
                  <CardDescription>
                    إضافة قواعد لتحديد الفئات المستهدفة
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddingRule(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة قاعدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add New Rule Form */}
              {isAddingRule && (
                <Card className="mb-6 border-dashed">
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>نوع التحديد</Label>
                        <Select
                          value={newRule.type}
                          onValueChange={(value) => setNewRule({ ...newRule, type: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="department">القسم</SelectItem>
                            <SelectItem value="position">المنصب</SelectItem>
                            <SelectItem value="location">الموقع</SelectItem>
                            <SelectItem value="age">العمر</SelectItem>
                            <SelectItem value="experience">الخبرة</SelectItem>
                            <SelectItem value="custom">مخصص</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>المشغل</Label>
                        <Select
                          value={newRule.operator}
                          onValueChange={(value) => setNewRule({ ...newRule, operator: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">يساوي</SelectItem>
                            <SelectItem value="not_equals">لا يساوي</SelectItem>
                            <SelectItem value="contains">يحتوي على</SelectItem>
                            <SelectItem value="not_contains">لا يحتوي على</SelectItem>
                            <SelectItem value="greater_than">أكبر من</SelectItem>
                            <SelectItem value="less_than">أصغر من</SelectItem>
                            <SelectItem value="between">بين</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>القيمة</Label>
                        {newRule.type === 'department' ? (
                          <Select
                            value={newRule.value as string}
                            onValueChange={(value) => setNewRule({ ...newRule, value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر القسم" />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.count})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : newRule.type === 'position' ? (
                          <Select
                            value={newRule.value as string}
                            onValueChange={(value) => setNewRule({ ...newRule, value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المنصب" />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map((pos) => (
                                <SelectItem key={pos.id} value={pos.id}>
                                  {pos.name} ({pos.count})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : newRule.type === 'location' ? (
                          <Select
                            value={newRule.value as string}
                            onValueChange={(value) => setNewRule({ ...newRule, value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الموقع" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name} ({loc.count})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            value={newRule.value as string}
                            onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                            placeholder="أدخل القيمة"
                            type={newRule.type === 'age' || newRule.type === 'experience' ? 'number' : 'text'}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>وصف القاعدة</Label>
                        <Input
                          value={newRule.label}
                          onChange={(e) => setNewRule({ ...newRule, label: e.target.value })}
                          placeholder="وصف القاعدة"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-end space-x-2 mt-4">
                      <Button variant="outline" onClick={() => setIsAddingRule(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleAddRule}>
                        إضافة القاعدة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Existing Rules */}
              <div className="space-y-3">
                {targetingRules.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد قواعد تحديد</h3>
                    <p className="text-muted-foreground mb-4">
                      ابدأ بإضافة قاعدة تحديد للفئات المستهدفة
                    </p>
                    <Button onClick={() => setIsAddingRule(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      إضافة أول قاعدة
                    </Button>
                  </div>
                ) : (
                  targetingRules.map((rule) => (
                    <Card key={rule.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              {getRuleIcon(rule.type)}
                              <span className="font-medium">{rule.label}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getOperatorText(rule.operator)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {rule.value}
                              {rule.value2 && ` - ${rule.value2}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(rule.id)}>
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

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معاينة المستهدفين</CardTitle>
              <CardDescription>
                عرض الفئات المستهدفة بناءً على القواعد المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">{getEstimatedReach()}</div>
                  <div className="text-sm text-muted-foreground">إجمالي المستهدفين</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Building className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{departments.length}</div>
                  <div className="text-sm text-muted-foreground">الأقسام</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{locations.length}</div>
                  <div className="text-sm text-muted-foreground">المواقع</div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-4">تفاصيل المستهدفين</h3>
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{dept.count} موظف</Badge>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات التحديد</CardTitle>
              <CardDescription>
                إحصائيات وتوقعات حول الاستطلاع المستهدف
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">التحليلات قيد التطوير</h3>
                <p className="text-muted-foreground">
                  ستتوفر التحليلات المتقدمة قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
