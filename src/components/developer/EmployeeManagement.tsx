import { useState } from 'react'
import { formatDate } from '@/lib/utils'
import { searchEmployees } from '@/lib/smartSearch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  Mail,
  Calendar,
  Building,
  Briefcase,
  Crown,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Employee {
  id: string
  fullName: string
  email: string
  role: 'developer' | 'admin' | 'employee'
  department: string
  position: string
  registrationDate: string
  lastLogin: string
  isNew: boolean
  status: 'active' | 'inactive' | 'suspended'
  surveysCreated: number
  surveysResponded: number
  promotionHistory: PromotionRecord[]
}

interface PromotionRecord {
  id: string
  fromRole: string
  toRole: string
  date: string
  note?: string
  promotedBy: string
}

interface EmployeeManagementProps {
  onPromote: (employeeId: string, note?: string) => void
  onDemote: (employeeId: string, note?: string) => void
  onExport: (employees: Employee[]) => void
}

export default function EmployeeManagement({ onPromote, onDemote, onExport }: EmployeeManagementProps) {
  const [activeTab, setActiveTab] = useState('employees')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [showPromotionDialog, setShowPromotionDialog] = useState(false)
  const [showDemotionDialog, setShowDemotionDialog] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [promotionNote, setPromotionNote] = useState('')
  const [demotionNote, setDemotionNote] = useState('')
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      fullName: 'أحمد محمد علي',
      email: 'ahmed@company.com',
      role: 'employee',
      department: 'تكنولوجيا المعلومات',
      position: 'مطور',
      registrationDate: '2024-01-15',
      lastLogin: '2024-01-20',
      isNew: true,
      status: 'active',
      surveysCreated: 0,
      surveysResponded: 5,
      promotionHistory: []
    },
    {
      id: '2',
      fullName: 'فاطمة أحمد',
      email: 'fatima@company.com',
      role: 'admin',
      department: 'الموارد البشرية',
      position: 'مدير',
      registrationDate: '2024-01-10',
      lastLogin: '2024-01-19',
      isNew: false,
      status: 'active',
      surveysCreated: 3,
      surveysResponded: 2,
      promotionHistory: [
        {
          id: '1',
          fromRole: 'employee',
          toRole: 'admin',
          date: '2024-01-12',
          note: 'ترقية لمساهماتها المتميزة',
          promotedBy: 'المطور الرئيسي'
        }
      ]
    },
    {
      id: '3',
      fullName: 'محمد السعيد',
      email: 'mohammed@company.com',
      role: 'employee',
      department: 'المحاسبة',
      position: 'محاسب',
      registrationDate: '2024-01-08',
      lastLogin: '2024-01-18',
      isNew: false,
      status: 'active',
      surveysCreated: 0,
      surveysResponded: 3,
      promotionHistory: []
    }
  ])

  const filteredEmployees = searchEmployees(employees.map(emp => ({
    ...emp,
    full_name: emp.fullName,
    phone: emp.phone || ''
  })), searchTerm).map(emp => ({
    ...emp,
    fullName: emp.full_name
  })).filter(employee => {
    const matchesRole = roleFilter === 'all' || employee.role === roleFilter
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter
    return matchesRole && matchesDepartment && matchesStatus
  })

  const handleSelectEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    )
  }

  const handleSelectAll = () => {
    setSelectedEmployees(
      selectedEmployees.length === filteredEmployees.length 
        ? [] 
        : filteredEmployees.map(e => e.id)
    )
  }

  const handlePromote = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowPromotionDialog(true)
  }

  const handleDemote = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowDemotionDialog(true)
  }

  const confirmPromotion = () => {
    if (selectedEmployee) {
      // Update employee role in local state
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, role: 'admin' as const }
          : emp
      ))
      
      // Add promotion record
      const promotionRecord: PromotionRecord = {
        id: Date.now().toString(),
        fromRole: selectedEmployee.role,
        toRole: 'admin',
        date: new Date().toISOString(),
        note: promotionNote,
        promotedBy: 'المطور الرئيسي'
      }
      
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { 
              ...emp, 
              role: 'admin' as const,
              promotionHistory: [...emp.promotionHistory, promotionRecord]
            }
          : emp
      ))
      
      onPromote(selectedEmployee.id, promotionNote)
      toast.success(`تم ترقية ${selectedEmployee.fullName} إلى مدير بنجاح!`)
      setShowPromotionDialog(false)
      setPromotionNote('')
      setSelectedEmployee(null)
    }
  }

  const confirmDemotion = () => {
    if (selectedEmployee) {
      // Update employee role in local state
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { ...emp, role: 'employee' as const }
          : emp
      ))
      
      // Add demotion record
      const demotionRecord: PromotionRecord = {
        id: Date.now().toString(),
        fromRole: selectedEmployee.role,
        toRole: 'employee',
        date: new Date().toISOString(),
        note: demotionNote,
        promotedBy: 'المطور الرئيسي'
      }
      
      setEmployees(prev => prev.map(emp => 
        emp.id === selectedEmployee.id 
          ? { 
              ...emp, 
              role: 'employee' as const,
              promotionHistory: [...emp.promotionHistory, demotionRecord]
            }
          : emp
      ))
      
      onDemote(selectedEmployee.id, demotionNote)
      toast.success(`تم تراجع ترقية ${selectedEmployee.fullName} إلى موظف بنجاح!`)
      setShowDemotionDialog(false)
      setDemotionNote('')
      setSelectedEmployee(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'developer': return 'bg-purple-100 text-purple-800'
      case 'admin': return 'bg-blue-100 text-blue-800'
      case 'employee': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'developer': return 'مطور'
      case 'admin': return 'مدير'
      case 'employee': return 'موظف'
      default: return 'غير محدد'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط'
      case 'inactive': return 'غير نشط'
      case 'suspended': return 'معلق'
      default: return 'غير محدد'
    }
  }


  const getOverallStats = () => {
    const totalEmployees = employees.length
    const newEmployees = employees.filter(e => e.isNew).length
    const activeEmployees = employees.filter(e => e.status === 'active').length
    const admins = employees.filter(e => e.role === 'admin').length
    
    return {
      totalEmployees,
      newEmployees,
      activeEmployees,
      admins
    }
  }

  const stats = getOverallStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الموظفين</h2>
          <p className="text-muted-foreground">
            إدارة الموظفين والترقيات والصلاحيات
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => onExport(filteredEmployees)}>
            <Download className="h-4 w-4 mr-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-2xl font-bold">{stats.totalEmployees}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">موظفون جدد</p>
                <p className="text-2xl font-bold">{stats.newEmployees}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نشطون</p>
                <p className="text-2xl font-bold">{stats.activeEmployees}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المديرون</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Crown className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="بحث ذكي: اسم الشخص، الإيميل، رقم الجوال، القسم، المنصب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="developer">مطور</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="employee">موظف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                <SelectItem value="تكنولوجيا المعلومات">تكنولوجيا المعلومات</SelectItem>
                <SelectItem value="الموارد البشرية">الموارد البشرية</SelectItem>
                <SelectItem value="المحاسبة">المحاسبة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="suspended">معلق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">الموظفون</TabsTrigger>
          <TabsTrigger value="promotions">الترقيات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Employees Tab */}
        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>قائمة الموظفين</CardTitle>
                  <CardDescription>
                    إدارة الموظفين والترقيات
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">تحديد الكل</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEmployees.map((employee) => (
                  <Card key={employee.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={() => handleSelectEmployee(employee.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div>
                                <h3 className="font-medium">{employee.fullName}</h3>
                                <p className="text-sm text-muted-foreground">{employee.email}</p>
                              </div>
                              <Badge className={getRoleColor(employee.role)}>
                                {getRoleText(employee.role)}
                              </Badge>
                              <Badge className={getStatusColor(employee.status)}>
                                {getStatusText(employee.status)}
                              </Badge>
                              {employee.isNew && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  جديد
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4" />
                                <span>{employee.department}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Briefcase className="h-4 w-4" />
                                <span>{employee.position}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>انضم: {formatDate(employee.registrationDate)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>آخر دخول: {formatDate(employee.lastLogin)}</span>
                              </div>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-primary">{employee.surveysCreated}</div>
                                <div className="text-xs text-muted-foreground">استطلاعات منشأة</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-600">{employee.surveysResponded}</div>
                                <div className="text-xs text-muted-foreground">استطلاعات مجاب عليها</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-blue-600">
                                  {employee.promotionHistory.length}
                                </div>
                                <div className="text-xs text-muted-foreground">ترقيات</div>
                              </div>
                            </div>
                            
                            {employee.role === 'admin' && (
                              <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center space-x-2 text-green-700">
                                  <Crown className="h-4 w-4" />
                                  <span className="text-sm font-medium">يمكنه إنشاء وإدارة الاستطلاعات</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {employee.role === 'employee' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handlePromote(employee)}
                              title="ترقية إلى مدير"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {employee.role === 'admin' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => window.open('/admin/survey-builder', '_blank')}
                                title="إنشاء استطلاع جديد"
                                className="text-green-600 hover:text-green-700"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDemote(employee)}
                                title="تراجع عن الترقية"
                              >
                                <UserX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>سجل الترقيات</CardTitle>
              <CardDescription>
                تاريخ الترقيات والتراجعات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.flatMap(employee => 
                  employee.promotionHistory.map(record => (
                    <Card key={record.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{employee.fullName}</h3>
                              <Badge variant="outline">
                                {getRoleText(record.fromRole)} → {getRoleText(record.toRole)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(record.date)}
                              </span>
                            </div>
                            {record.note && (
                              <p className="text-sm text-muted-foreground mb-2">{record.note}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              تمت الترقية بواسطة: {record.promotedBy}
                            </p>
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

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات الموظفين</CardTitle>
              <CardDescription>
                إحصائيات مفصلة عن الموظفين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">التحليلات قيد التطوير</h3>
                <p className="text-muted-foreground">
                  ستتوفر التحليلات المتقدمة قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Promotion Dialog */}
      <Dialog open={showPromotionDialog} onOpenChange={setShowPromotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ترقية الموظف</DialogTitle>
            <DialogDescription>
              ترقية {selectedEmployee?.fullName} إلى مدير
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                سيحصل الموظف على صلاحيات إنشاء وإدارة الاستطلاعات
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="promotion-note">ملاحظة الترقية (اختياري)</Label>
              <Textarea
                id="promotion-note"
                value={promotionNote}
                onChange={(e) => setPromotionNote(e.target.value)}
                placeholder="اكتب ملاحظة عن سبب الترقية..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowPromotionDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={confirmPromotion}>
                <UserCheck className="h-4 w-4 mr-2" />
                ترقية
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Demotion Dialog */}
      <Dialog open={showDemotionDialog} onOpenChange={setShowDemotionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تراجع عن الترقية</DialogTitle>
            <DialogDescription>
              تراجع عن ترقية {selectedEmployee?.fullName} إلى موظف
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                سيتم إلغاء صلاحيات إنشاء الاستطلاعات، لكن الاستطلاعات السابقة ستبقى محفوظة
              </AlertDescription>
            </Alert>
            <div className="space-y-2">
              <Label htmlFor="demotion-note">ملاحظة التراجع (اختياري)</Label>
              <Textarea
                id="demotion-note"
                value={demotionNote}
                onChange={(e) => setDemotionNote(e.target.value)}
                placeholder="اكتب ملاحظة عن سبب التراجع..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowDemotionDialog(false)}>
                إلغاء
              </Button>
              <Button variant="destructive" onClick={confirmDemotion}>
                <UserX className="h-4 w-4 mr-2" />
                تراجع
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
