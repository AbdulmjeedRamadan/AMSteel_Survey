import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Database,
  Download,
  Upload,
  RefreshCw,
  Calendar,
  Clock,
  HardDrive,
  Shield,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Play,
  Pause,
  RotateCcw,
  FileText,
  Archive,
  Trash2,
  Eye,
  Copy,
  Server,
  Cloud,
  Lock,
  Unlock
} from 'lucide-react'
import toast from 'react-hot-toast'

interface BackupRecord {
  id: string
  name: string
  type: 'full' | 'incremental' | 'differential'
  status: 'completed' | 'in_progress' | 'failed' | 'scheduled'
  size: string
  createdAt: string
  completedAt?: string
  duration?: number
  location: string
  encrypted: boolean
  description?: string
  tables: string[]
  recordCount: number
  compressionRatio: number
  checksum: string
}

interface BackupSchedule {
  id: string
  name: string
  type: 'full' | 'incremental' | 'differential'
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  enabled: boolean
  retentionDays: number
  location: string
  encrypted: boolean
  lastRun?: string
  nextRun: string
}

interface BackupRestoreProps {
  onCreateBackup: (config: BackupConfig) => void
  onRestoreBackup: (backupId: string, options: RestoreOptions) => void
  onDeleteBackup: (backupId: string) => void
  onScheduleBackup: (schedule: BackupSchedule) => void
}

interface BackupConfig {
  name: string
  type: 'full' | 'incremental' | 'differential'
  description?: string
  encrypted: boolean
  location: string
  tables: string[]
}

interface RestoreOptions {
  overwriteExisting: boolean
  restoreData: boolean
  restoreStructure: boolean
  targetDatabase?: string
}

export default function BackupRestore({
  onCreateBackup,
  onRestoreBackup,
  onDeleteBackup,
  onScheduleBackup
}: BackupRestoreProps) {
  const [activeTab, setActiveTab] = useState('backups')
  const [backups, setBackups] = useState<BackupRecord[]>([])
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showRestoreDialog, setShowRestoreDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null)
  const [backupProgress, setBackupProgress] = useState(0)
  const [isBackupInProgress, setIsBackupInProgress] = useState(false)

  // Backup configuration state
  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    name: '',
    type: 'full',
    description: '',
    encrypted: true,
    location: 'local',
    tables: []
  })

  // Restore options state
  const [restoreOptions, setRestoreOptions] = useState<RestoreOptions>({
    overwriteExisting: false,
    restoreData: true,
    restoreStructure: true,
    targetDatabase: ''
  })

  // Mock data
  useEffect(() => {
    const mockBackups: BackupRecord[] = [
      {
        id: '1',
        name: 'نسخة احتياطية كاملة - يناير 2024',
        type: 'full',
        status: 'completed',
        size: '2.3 GB',
        createdAt: '2024-01-20T02:00:00Z',
        completedAt: '2024-01-20T02:45:00Z',
        duration: 2700,
        location: 'AWS S3',
        encrypted: true,
        description: 'نسخة احتياطية شاملة لجميع البيانات',
        tables: ['users', 'surveys', 'responses', 'questions', 'answers'],
        recordCount: 125000,
        compressionRatio: 0.65,
        checksum: 'sha256:a1b2c3d4e5f6...'
      },
      {
        id: '2',
        name: 'نسخة تزايدية - 19 يناير',
        type: 'incremental',
        status: 'completed',
        size: '450 MB',
        createdAt: '2024-01-19T02:00:00Z',
        completedAt: '2024-01-19T02:15:00Z',
        duration: 900,
        location: 'Local Storage',
        encrypted: true,
        description: 'نسخة تزايدية للتغييرات الأخيرة',
        tables: ['responses', 'answers', 'activity_logs'],
        recordCount: 15000,
        compressionRatio: 0.72,
        checksum: 'sha256:b2c3d4e5f6g7...'
      },
      {
        id: '3',
        name: 'نسخة طوارئ - 18 يناير',
        type: 'full',
        status: 'failed',
        size: '0 MB',
        createdAt: '2024-01-18T14:30:00Z',
        location: 'AWS S3',
        encrypted: true,
        description: 'نسخة احتياطية طارئة قبل التحديث',
        tables: [],
        recordCount: 0,
        compressionRatio: 0,
        checksum: ''
      }
    ]

    const mockSchedules: BackupSchedule[] = [
      {
        id: '1',
        name: 'نسخة يومية تلقائية',
        type: 'incremental',
        frequency: 'daily',
        time: '02:00',
        enabled: true,
        retentionDays: 30,
        location: 'AWS S3',
        encrypted: true,
        lastRun: '2024-01-20T02:00:00Z',
        nextRun: '2024-01-21T02:00:00Z'
      },
      {
        id: '2',
        name: 'نسخة أسبوعية كاملة',
        type: 'full',
        frequency: 'weekly',
        time: '01:00',
        enabled: true,
        retentionDays: 90,
        location: 'Local Storage',
        encrypted: true,
        lastRun: '2024-01-14T01:00:00Z',
        nextRun: '2024-01-21T01:00:00Z'
      }
    ]

    setBackups(mockBackups)
    setSchedules(mockSchedules)
  }, [])

  const handleCreateBackup = () => {
    if (!backupConfig.name.trim()) {
      toast.error('يرجى إدخال اسم النسخة الاحتياطية')
      return
    }

    setIsBackupInProgress(true)
    setBackupProgress(0)

    // Simulate backup progress
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsBackupInProgress(false)
          onCreateBackup(backupConfig)
          setShowCreateDialog(false)
          toast.success('تم إنشاء النسخة الاحتياطية بنجاح!')
          
          // Add new backup to list
          const newBackup: BackupRecord = {
            id: Date.now().toString(),
            name: backupConfig.name,
            type: backupConfig.type,
            status: 'completed',
            size: '1.8 GB',
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            duration: 1800,
            location: backupConfig.location,
            encrypted: backupConfig.encrypted,
            description: backupConfig.description,
            tables: backupConfig.tables,
            recordCount: 98000,
            compressionRatio: 0.68,
            checksum: 'sha256:' + Math.random().toString(36).substring(7)
          }
          
          setBackups(prev => [newBackup, ...prev])
          
          // Reset form
          setBackupConfig({
            name: '',
            type: 'full',
            description: '',
            encrypted: true,
            location: 'local',
            tables: []
          })
          
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 500)
  }

  const handleRestoreBackup = () => {
    if (!selectedBackup) return

    onRestoreBackup(selectedBackup.id, restoreOptions)
    setShowRestoreDialog(false)
    toast.success('تم بدء عملية الاستعادة!')
  }

  const handleDeleteBackup = (backup: BackupRecord) => {
    onDeleteBackup(backup.id)
    setBackups(prev => prev.filter(b => b.id !== backup.id))
    toast.success('تم حذف النسخة الاحتياطية!')
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

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتمل'
      case 'in_progress': return 'قيد التقدم'
      case 'failed': return 'فشل'
      case 'scheduled': return 'مجدول'
      default: return 'غير محدد'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'full': return 'bg-blue-100 text-blue-800'
      case 'incremental': return 'bg-green-100 text-green-800'
      case 'differential': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'full': return 'كاملة'
      case 'incremental': return 'تزايدية'
      case 'differential': return 'تفاضلية'
      default: return 'غير محدد'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">النسخ الاحتياطية والاستعادة</h2>
          <p className="text-muted-foreground">
            إدارة النسخ الاحتياطية واستعادة البيانات
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowCreateDialog(true)}>
            <Database className="h-4 w-4 mr-2" />
            إنشاء نسخة احتياطية
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">إجمالي النسخ</p>
                <p className="text-2xl font-bold">{backups.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">النسخ المكتملة</p>
                <p className="text-2xl font-bold">
                  {backups.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">المجدولة</p>
                <p className="text-2xl font-bold">{schedules.filter(s => s.enabled).length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">المساحة المستخدمة</p>
                <p className="text-2xl font-bold">2.8 GB</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <HardDrive className="h-4 w-4 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="backups">النسخ الاحتياطية</TabsTrigger>
          <TabsTrigger value="schedules">الجدولة</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>النسخ الاحتياطية</CardTitle>
              <CardDescription>
                جميع النسخ الاحتياطية المتاحة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <Card key={backup.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{backup.name}</h3>
                            <Badge className={getStatusColor(backup.status)}>
                              {getStatusText(backup.status)}
                            </Badge>
                            <Badge className={getTypeColor(backup.type)}>
                              {getTypeText(backup.type)}
                            </Badge>
                            {backup.encrypted && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Lock className="h-3 w-3 mr-1" />
                                مشفر
                              </Badge>
                            )}
                          </div>
                          
                          {backup.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {backup.description}
                            </p>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <HardDrive className="h-4 w-4" />
                              <span>{backup.size}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(backup.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Server className="h-4 w-4" />
                              <span>{backup.location}</span>
                            </div>
                            {backup.duration && (
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(backup.duration)}</span>
                              </div>
                            )}
                          </div>

                          {backup.status === 'completed' && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span>السجلات: {backup.recordCount.toLocaleString()}</span>
                              <span className="mx-2">•</span>
                              <span>نسبة الضغط: {Math.round(backup.compressionRatio * 100)}%</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => console.log('View backup details:', backup.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {backup.status === 'completed' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => {
                                  setSelectedBackup(backup)
                                  setShowRestoreDialog(true)
                                }}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => console.log('Download backup:', backup.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteBackup(backup)}
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

        {/* Schedules Tab */}
        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الجدولة التلقائية</CardTitle>
                  <CardDescription>
                    إعداد النسخ الاحتياطية التلقائية
                  </CardDescription>
                </div>
                <Button onClick={() => setShowScheduleDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة جدولة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{schedule.name}</h3>
                            <Badge className={getTypeColor(schedule.type)}>
                              {getTypeText(schedule.type)}
                            </Badge>
                            <Badge variant={schedule.enabled ? "default" : "secondary"}>
                              {schedule.enabled ? 'مفعل' : 'معطل'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{schedule.frequency} في {schedule.time}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>التشغيل التالي: {formatDate(schedule.nextRun)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Archive className="h-4 w-4" />
                              <span>الاحتفاظ: {schedule.retentionDays} يوم</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => console.log('Edit schedule:', schedule.id)}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => console.log('Toggle schedule:', schedule.id)}
                          >
                            {schedule.enabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => console.log('Delete schedule:', schedule.id)}
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

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النسخ الاحتياطية</CardTitle>
              <CardDescription>
                تكوين الإعدادات العامة للنسخ الاحتياطية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الموقع الافتراضي</Label>
                  <Select defaultValue="aws-s3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">التخزين المحلي</SelectItem>
                      <SelectItem value="aws-s3">AWS S3</SelectItem>
                      <SelectItem value="google-cloud">Google Cloud</SelectItem>
                      <SelectItem value="azure">Azure Storage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>فترة الاحتفاظ الافتراضية</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 يوم</SelectItem>
                      <SelectItem value="60">60 يوم</SelectItem>
                      <SelectItem value="90">90 يوم</SelectItem>
                      <SelectItem value="180">180 يوم</SelectItem>
                      <SelectItem value="365">سنة واحدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-encrypt" defaultChecked />
                <Label htmlFor="auto-encrypt">تشفير النسخ الاحتياطية تلقائياً</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="compress" defaultChecked />
                <Label htmlFor="compress">ضغط النسخ الاحتياطية</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="verify" defaultChecked />
                <Label htmlFor="verify">التحقق من سلامة النسخ الاحتياطية</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl mobile-popup">
          <DialogHeader>
            <DialogTitle>إنشاء نسخة احتياطية جديدة</DialogTitle>
            <DialogDescription>
              تكوين النسخة الاحتياطية الجديدة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isBackupInProgress && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">جاري إنشاء النسخة الاحتياطية...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(backupProgress)}%</span>
                </div>
                <Progress value={backupProgress} className="w-full" />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backup-name">اسم النسخة الاحتياطية *</Label>
                <Input
                  id="backup-name"
                  value={backupConfig.name}
                  onChange={(e) => setBackupConfig(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="نسخة احتياطية - يناير 2024"
                  disabled={isBackupInProgress}
                />
              </div>
              
              <div className="space-y-2">
                <Label>نوع النسخة الاحتياطية</Label>
                <Select 
                  value={backupConfig.type} 
                  onValueChange={(value) => setBackupConfig(prev => ({ ...prev, type: value as any }))}
                  disabled={isBackupInProgress}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">كاملة</SelectItem>
                    <SelectItem value="incremental">تزايدية</SelectItem>
                    <SelectItem value="differential">تفاضلية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-description">الوصف</Label>
              <Textarea
                id="backup-description"
                value={backupConfig.description}
                onChange={(e) => setBackupConfig(prev => ({ ...prev, description: e.target.value }))}
                placeholder="وصف النسخة الاحتياطية..."
                disabled={isBackupInProgress}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>موقع التخزين</Label>
                <Select 
                  value={backupConfig.location} 
                  onValueChange={(value) => setBackupConfig(prev => ({ ...prev, location: value }))}
                  disabled={isBackupInProgress}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">التخزين المحلي</SelectItem>
                    <SelectItem value="aws-s3">AWS S3</SelectItem>
                    <SelectItem value="google-cloud">Google Cloud</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-6">
                <input 
                  type="checkbox" 
                  id="encrypt-backup" 
                  checked={backupConfig.encrypted}
                  onChange={(e) => setBackupConfig(prev => ({ ...prev, encrypted: e.target.checked }))}
                  disabled={isBackupInProgress}
                />
                <Label htmlFor="encrypt-backup">تشفير النسخة الاحتياطية</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                disabled={isBackupInProgress}
              >
                إلغاء
              </Button>
              <Button 
                onClick={handleCreateBackup}
                disabled={!backupConfig.name.trim() || isBackupInProgress}
              >
                <Database className="h-4 w-4 mr-2" />
                {isBackupInProgress ? 'جاري الإنشاء...' : 'إنشاء النسخة الاحتياطية'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Restore Backup Dialog */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent className="mobile-popup">
          <DialogHeader>
            <DialogTitle>استعادة النسخة الاحتياطية</DialogTitle>
            <DialogDescription>
              تكوين خيارات الاستعادة
            </DialogDescription>
          </DialogHeader>
          
          {selectedBackup && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  تحذير: عملية الاستعادة ستؤثر على البيانات الحالية. يرجى التأكد من إنشاء نسخة احتياطية قبل المتابعة.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <Label>النسخة الاحتياطية المحددة</Label>
                  <Input value={selectedBackup.name} disabled />
                </div>

                <div className="space-y-2">
                  <Label>خيارات الاستعادة</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="restore-data" 
                        checked={restoreOptions.restoreData}
                        onChange={(e) => setRestoreOptions(prev => ({ ...prev, restoreData: e.target.checked }))}
                      />
                      <Label htmlFor="restore-data">استعادة البيانات</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="restore-structure" 
                        checked={restoreOptions.restoreStructure}
                        onChange={(e) => setRestoreOptions(prev => ({ ...prev, restoreStructure: e.target.checked }))}
                      />
                      <Label htmlFor="restore-structure">استعادة هيكل قاعدة البيانات</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        id="overwrite-existing" 
                        checked={restoreOptions.overwriteExisting}
                        onChange={(e) => setRestoreOptions(prev => ({ ...prev, overwriteExisting: e.target.checked }))}
                      />
                      <Label htmlFor="overwrite-existing">استبدال البيانات الموجودة</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                    إلغاء
                  </Button>
                  <Button onClick={handleRestoreBackup}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    بدء الاستعادة
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
