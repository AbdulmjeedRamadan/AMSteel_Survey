import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Settings } from 'lucide-react'
import SystemConfiguration from '@/components/developer/SystemConfiguration'
import toast from 'react-hot-toast'

export default function SystemConfigurationPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/developer')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">{t('ui.systemConfig.advancedSystemSettings')}</h1>
                  <p className="text-muted-foreground">
                    {t('ui.systemConfig.comprehensiveManagement')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <SystemConfiguration 
          onSave={(config) => {
            console.log('Save configuration:', config)
            toast.success('تم حفظ الإعدادات بنجاح!')
          }}
          onReset={() => {
            console.log('Reset configuration')
            toast.success('تم إعادة تعيين الإعدادات!')
          }}
          onExport={(config) => {
            console.log('Export configuration:', config)
            const dataStr = JSON.stringify(config, null, 2)
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
            const exportFileDefaultName = 'amsteel-system-config.json'
            const linkElement = document.createElement('a')
            linkElement.setAttribute('href', dataUri)
            linkElement.setAttribute('download', exportFileDefaultName)
            linkElement.click()
            toast.success('تم تصدير الإعدادات!')
          }}
          onImport={(config) => {
            console.log('Import configuration:', config)
            toast.success('تم استيراد الإعدادات!')
          }}
        />
      </div>
    </div>
  )
}
