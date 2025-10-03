/**
 * Language Toggle Component
 * Direct toggle between Arabic (RTL) and English (LTR)
 * Click once to switch immediately
 */

import { Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguageStore } from '@/store/languageStore'

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguageStore()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-2 font-medium"
    >
      <Languages className="h-4 w-4" />
      <span>{language === 'ar' ? 'English' : 'العربية'}</span>
    </Button>
  )
}
