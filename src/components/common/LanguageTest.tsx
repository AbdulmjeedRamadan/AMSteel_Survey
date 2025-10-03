import { useTranslation } from '@/hooks/useTranslation'
import { useLanguageStore } from '@/store/languageStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LanguageTest() {
  const { t } = useTranslation()
  const { language, toggleLanguage } = useLanguageStore()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>اختبار التبديل بين اللغات / Language Switching Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">اللغة الحالية / Current Language:</span>
          <span className="font-medium">{language === 'ar' ? 'العربية' : 'English'}</span>
        </div>
        
        <Button onClick={toggleLanguage} className="w-full">
          تبديل اللغة / Switch Language
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <h3 className="font-semibold">العناصر الثابتة / Static Elements:</h3>
            <div className="space-y-1 text-sm">
              <div><strong>لوحة المدير:</strong> {t('ui.dashboard.adminDashboard')}</div>
              <div><strong>لوحة المطور:</strong> {t('ui.dashboard.developerDashboard')}</div>
              <div><strong>الملف الشخصي:</strong> {t('ui.profile.personalProfile')}</div>
              <div><strong>إدارة الموظفين:</strong> {t('ui.management.employeeManagement')}</div>
              <div><strong>إدارة الردود:</strong> {t('ui.management.responseManagement')}</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">الأزرار / Buttons:</h3>
            <div className="space-y-1 text-sm">
              <div><strong>إنشاء استطلاع:</strong> {t('ui.buttons.createSurvey')}</div>
              <div><strong>تعديل الملف:</strong> {t('ui.buttons.editProfile')}</div>
              <div><strong>حفظ التغييرات:</strong> {t('ui.buttons.saveChanges')}</div>
              <div><strong>تصدير:</strong> {t('ui.buttons.export')}</div>
              <div><strong>ترقية:</strong> {t('ui.buttons.promote')}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">ملاحظة / Note:</h4>
          <p className="text-sm text-muted-foreground">
            إذا كانت النصوص تظهر بالعربية في كلا الحالتين، فهذا يعني أن الترجمة تعمل بشكل صحيح.
            / If texts appear in Arabic in both cases, it means translation is working correctly.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

