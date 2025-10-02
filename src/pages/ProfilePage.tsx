import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Edit,
  Save,
  X,
  Shield,
  Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  // Only developers can edit profile information
  const canEdit = user?.role === 'developer'
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
    bio: user?.bio || ''
  })

  const handleSave = () => {
    if (!canEdit) {
      toast.error('ليس لديك صلاحية لتعديل المعلومات الشخصية')
      return
    }

    if (!formData.full_name || !formData.email) {
      toast.error('الاسم والبريد الإلكتروني مطلوبان')
      return
    }

    updateUser({
      ...user,
      ...formData
    })
    
    setIsEditing(false)
    toast.success('تم حفظ التغييرات بنجاح')
  }

  const handleCancel = () => {
    setFormData({
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      position: user?.position || '',
      bio: user?.bio || ''
    })
    setIsEditing(false)
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'developer':
        return 'bg-purple-100 text-purple-800'
      case 'admin':
        return 'bg-blue-100 text-blue-800'
      case 'employee':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'developer':
        return 'مطور'
      case 'admin':
        return 'مدير'
      case 'employee':
        return 'موظف'
      default:
        return 'غير محدد'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الملف الشخصي</h1>
          <p className="text-muted-foreground">
            إدارة معلوماتك الشخصية
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {canEdit && (
            <>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  تعديل الملف
                </Button>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    إلغاء
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    حفظ
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-2xl">
                    {user?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{user?.full_name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <Badge className={getRoleBadgeColor(user?.role || '')} style={{ marginTop: '8px' }}>
                    {getRoleText(user?.role || '')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">عضو منذ يناير 2024</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">آخر نشاط: اليوم</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>معلومات شخصية</CardTitle>
              <CardDescription>
                تحديث معلوماتك الشخصية والمهنية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">الاسم الكامل *</Label>
                  {isEditing && canEdit ? (
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.full_name || 'غير محدد'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني *</Label>
                  {isEditing && canEdit ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="أدخل بريدك الإلكتروني"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.email || 'غير محدد'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  {isEditing && canEdit ? (
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="أدخل رقم هاتفك"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.phone || 'غير محدد'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">القسم</Label>
                  {isEditing && canEdit ? (
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="أدخل قسمك"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.department || 'غير محدد'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">المنصب</Label>
                  {isEditing && canEdit ? (
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      placeholder="أدخل منصبك"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.position || 'غير محدد'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">نبذة شخصية</Label>
                  {isEditing && canEdit ? (
                    <textarea
                      id="bio"
                      className="w-full p-3 border rounded-md resize-none"
                      rows={3}
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="أدخل نبذة شخصية عنك"
                    />
                  ) : (
                    <div className="p-3 border rounded-md bg-muted/50 min-h-[80px]">
                      <span className="text-sm">{user?.bio || 'لا توجد نبذة شخصية'}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">معلومات الحساب</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع الحساب</Label>
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>{getRoleText(user?.role || '')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الانضمام</Label>
                    <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{user?.created_at ? formatDate(user.created_at) : 'غير محدد'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
