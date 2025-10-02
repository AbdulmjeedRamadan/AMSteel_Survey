import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Bell,
  BellRing,
  Check,
  X,
  Mail,
  MessageSquare,
  Users,
  UserCheck,
  UserX,
  FileText,
  Shield,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Send,
  Eye,
  Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: 'promotion' | 'demotion' | 'survey_created' | 'system_alert' | 'security_alert' | 'info'
  title: string
  message: string
  recipient: string
  recipientId: string
  sender: string
  senderId: string
  timestamp: string
  read: boolean
  sent: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  channels: ('in_app' | 'email' | 'sms')[]
  metadata?: Record<string, any>
}

interface NotificationSystemProps {
  onSendNotification: (notification: Notification) => void
  onMarkAsRead: (notificationId: string) => void
  onDeleteNotification: (notificationId: string) => void
}

export default function NotificationSystem({ 
  onSendNotification, 
  onMarkAsRead, 
  onDeleteNotification 
}: NotificationSystemProps) {
  const [activeTab, setActiveTab] = useState('pending')
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Mock notifications data
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'promotion',
        title: 'تم ترقيتك إلى مدير',
        message: 'مبروك! تم ترقيتك من موظف إلى مدير. يمكنك الآن إنشاء وإدارة الاستطلاعات.',
        recipient: 'أحمد محمد علي',
        recipientId: 'emp-001',
        sender: 'المطور الرئيسي',
        senderId: 'dev-001',
        timestamp: '2024-01-20T10:30:00Z',
        read: false,
        sent: true,
        priority: 'high',
        channels: ['in_app', 'email'],
        metadata: {
          fromRole: 'employee',
          toRole: 'admin',
          note: 'ترقية لمساهماته المتميزة'
        }
      },
      {
        id: '2',
        type: 'demotion',
        title: 'تغيير في الدور الوظيفي',
        message: 'تم تغيير دورك من مدير إلى موظف. للاستفسار، يرجى التواصل مع الإدارة.',
        recipient: 'سارة علي',
        recipientId: 'emp-004',
        sender: 'المطور الرئيسي',
        senderId: 'dev-001',
        timestamp: '2024-01-18T14:20:00Z',
        read: true,
        sent: true,
        priority: 'medium',
        channels: ['in_app', 'email'],
        metadata: {
          fromRole: 'admin',
          toRole: 'employee',
          note: 'إعادة هيكلة الأدوار'
        }
      },
      {
        id: '3',
        type: 'survey_created',
        title: 'استطلاع جديد متاح',
        message: 'تم إنشاء استطلاع جديد "رضا الموظفين Q1 2024". يرجى المشاركة في أقرب وقت.',
        recipient: 'جميع الموظفين',
        recipientId: 'all-employees',
        sender: 'فاطمة أحمد',
        senderId: 'admin-002',
        timestamp: '2024-01-20T09:15:00Z',
        read: false,
        sent: false,
        priority: 'medium',
        channels: ['in_app', 'email'],
        metadata: {
          surveyId: 'survey-001',
          surveyTitle: 'رضا الموظفين Q1 2024'
        }
      },
      {
        id: '4',
        type: 'system_alert',
        title: 'صيانة مجدولة للنظام',
        message: 'سيتم إجراء صيانة للنظام يوم الجمعة من الساعة 2:00 إلى 4:00 صباحاً.',
        recipient: 'جميع المستخدمين',
        recipientId: 'all-users',
        sender: 'النظام',
        senderId: 'system',
        timestamp: '2024-01-19T16:00:00Z',
        read: false,
        sent: false,
        priority: 'low',
        channels: ['in_app'],
        metadata: {
          maintenanceStart: '2024-01-26T02:00:00Z',
          maintenanceEnd: '2024-01-26T04:00:00Z'
        }
      }
    ]
    setNotifications(mockNotifications)
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'promotion': return <UserCheck className="h-4 w-4 text-green-600" />
      case 'demotion': return <UserX className="h-4 w-4 text-orange-600" />
      case 'survey_created': return <FileText className="h-4 w-4 text-blue-600" />
      case 'system_alert': return <Shield className="h-4 w-4 text-purple-600" />
      case 'security_alert': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'info': return <Info className="h-4 w-4 text-blue-600" />
      default: return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفض'
      case 'medium': return 'متوسط'
      case 'high': return 'عالي'
      case 'urgent': return 'عاجل'
      default: return 'غير محدد'
    }
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

  const handleSendNotification = (notification: Notification) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notification.id 
          ? { ...n, sent: true }
          : n
      )
    )
    onSendNotification(notification)
    toast.success('تم إرسال الإشعار بنجاح!')
  }

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, read: true }
          : n
      )
    )
    onMarkAsRead(notificationId)
  }

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    onDeleteNotification(notificationId)
    toast.success('تم حذف الإشعار!')
  }

  const pendingNotifications = notifications.filter(n => !n.sent)
  const sentNotifications = notifications.filter(n => n.sent)
  const unreadNotifications = notifications.filter(n => n.sent && !n.read)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">نظام الإشعارات</h2>
          <p className="text-muted-foreground">
            إدارة وإرسال الإشعارات للمستخدمين
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-sm">
            <BellRing className="h-3 w-3 mr-1" />
            {unreadNotifications.length} غير مقروء
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي الإشعارات</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">في الانتظار</p>
                <p className="text-2xl font-bold">{pendingNotifications.length}</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تم الإرسال</p>
                <p className="text-2xl font-bold">{sentNotifications.length}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Send className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">غير مقروء</p>
                <p className="text-2xl font-bold">{unreadNotifications.length}</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <BellRing className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">في الانتظار</TabsTrigger>
          <TabsTrigger value="sent">تم الإرسال</TabsTrigger>
          <TabsTrigger value="all">جميع الإشعارات</TabsTrigger>
        </TabsList>

        {/* Pending Notifications Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإشعارات في الانتظار</CardTitle>
              <CardDescription>
                الإشعارات التي لم يتم إرسالها بعد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingNotifications.map((notification) => (
                  <Card key={notification.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{notification.title}</h3>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {getPriorityText(notification.priority)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>إلى: {notification.recipient}</span>
                              <span>من: {notification.sender}</span>
                              <span>{formatDate(notification.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              {notification.channels.map((channel) => (
                                <Badge key={channel} variant="outline" className="text-xs">
                                  {channel === 'in_app' && <Bell className="h-3 w-3 mr-1" />}
                                  {channel === 'email' && <Mail className="h-3 w-3 mr-1" />}
                                  {channel === 'sms' && <MessageSquare className="h-3 w-3 mr-1" />}
                                  {channel === 'in_app' ? 'في التطبيق' : 
                                   channel === 'email' ? 'بريد إلكتروني' : 'رسالة نصية'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleSendNotification(notification)}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {pendingNotifications.length === 0 && (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد إشعارات في الانتظار</h3>
                    <p className="text-muted-foreground">
                      جميع الإشعارات تم إرسالها
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sent Notifications Tab */}
        <TabsContent value="sent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>الإشعارات المرسلة</CardTitle>
              <CardDescription>
                الإشعارات التي تم إرسالها للمستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentNotifications.map((notification) => (
                  <Card key={notification.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{notification.title}</h3>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {getPriorityText(notification.priority)}
                              </Badge>
                              {notification.read ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <Check className="h-3 w-3 mr-1" />
                                  مقروء
                                </Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">
                                  <BellRing className="h-3 w-3 mr-1" />
                                  غير مقروء
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>إلى: {notification.recipient}</span>
                              <span>من: {notification.sender}</span>
                              <span>{formatDate(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="تعليم كمقروء"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* All Notifications Tab */}
        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>جميع الإشعارات</CardTitle>
              <CardDescription>
                سجل شامل لجميع الإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card key={notification.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{notification.title}</h3>
                              <Badge className={getPriorityColor(notification.priority)}>
                                {getPriorityText(notification.priority)}
                              </Badge>
                              {notification.sent ? (
                                notification.read ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    <Check className="h-3 w-3 mr-1" />
                                    مقروء
                                  </Badge>
                                ) : (
                                  <Badge className="bg-red-100 text-red-800">
                                    <BellRing className="h-3 w-3 mr-1" />
                                    غير مقروء
                                  </Badge>
                                )
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  <Clock className="h-3 w-3 mr-1" />
                                  في الانتظار
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>إلى: {notification.recipient}</span>
                              <span>من: {notification.sender}</span>
                              <span>{formatDate(notification.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {!notification.sent && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleSendNotification(notification)}
                              title="إرسال"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {notification.sent && !notification.read && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleMarkAsRead(notification.id)}
                              title="تعليم كمقروء"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
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
      </Tabs>
    </div>
  )
}
