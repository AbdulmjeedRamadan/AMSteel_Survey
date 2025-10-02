/**
 * دالة البحث الذكي المتقدم
 * تدعم البحث في النصوص العربية والإنجليزية وأرقام الجوال السعودية
 */

export interface SearchableItem {
  [key: string]: any
}

export interface SearchConfig {
  // الحقول التي يجب البحث فيها
  searchFields: string[]
  // حقول أرقام الجوال (تحتاج معالجة خاصة)
  phoneFields?: string[]
  // حقول النصوص العربية (تحتاج تطبيع)
  arabicFields?: string[]
}

/**
 * تطبيع النص العربي للبحث
 */
export const normalizeArabicText = (text: string): string => {
  if (!text) return ''
  
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // إزالة المسافات
    .replace(/[أإآ]/g, 'ا') // توحيد الهمزات
    .replace(/[ة]/g, 'ه') // تاء مربوطة
    .replace(/[ى]/g, 'ي') // ألف مقصورة
    .replace(/[\u064B-\u0652]/g, '') // إزالة التشكيل
}

/**
 * البحث الذكي في أرقام الجوال السعودية
 */
export const searchSaudiPhone = (phone: string, query: string): boolean => {
  if (!phone || !query) return false
  
  const phoneClean = phone.replace(/\D/g, '') // أرقام فقط من الهاتف
  const queryClean = query.replace(/\D/g, '') // أرقام فقط من البحث
  
  // البحث العادي في النص أولاً
  if (phone.toLowerCase().includes(query.toLowerCase())) {
    return true
  }
  
  if (!queryClean) return false
  
  // البحث المباشر في الأرقام
  if (phoneClean.includes(queryClean)) {
    return true
  }
  
  // معالجة خاصة للأرقام السعودية
  
  // إذا كان البحث "05" أو يبدأ بـ "05"
  if (queryClean === '05' || queryClean.startsWith('05')) {
    // ابحث في الأرقام التي تحتوي على 96605
    const saudiFormat = '966' + queryClean
    if (phoneClean.includes(saudiFormat)) {
      return true
    }
  }
  
  // إذا كان البحث "05" تحديداً، ابحث أيضاً في جميع الأرقام التي تبدأ بـ 96605
  if (queryClean === '05') {
    // ابحث في الأرقام التي تبدأ بـ 96605 (أي رقم سعودي)
    if (phoneClean.startsWith('96605')) {
      return true
    }
  }
  
  // إذا كان البحث "5" أو يبدأ بـ "5" (بدون صفر)
  if (queryClean.startsWith('5') && !queryClean.startsWith('966')) {
    // جرب مع إضافة 0 في البداية
    const withZero = '0' + queryClean
    if (phoneClean.includes(withZero)) return true
    
    // جرب مع إضافة 966 + 0
    const withCountryCode = '966' + withZero
    if (phoneClean.includes(withCountryCode)) return true
  }
  
  // إذا كان البحث يبدأ بـ "966"
  if (queryClean.startsWith('966')) {
    // استخرج الجزء بعد 966
    const afterCountryCode = queryClean.substring(3)
    
    // إذا كان يبدأ بـ 5، جرب مع إضافة 0
    if (afterCountryCode.startsWith('5')) {
      const localFormat = '0' + afterCountryCode
      if (phoneClean.includes(localFormat)) return true
    }
    
    // جرب البحث في الجزء بعد 966 مباشرة
    if (afterCountryCode && phoneClean.includes(afterCountryCode)) return true
  }
  
  return false
}

/**
 * البحث الذكي الرئيسي
 */
export const smartSearch = <T extends SearchableItem>(
  items: T[],
  searchQuery: string,
  config: SearchConfig
): T[] => {
  if (!searchQuery.trim()) return items
  
  const query = searchQuery.toLowerCase().trim()
  
  return items.filter(item => {
    // البحث في الحقول العادية
    for (const field of config.searchFields) {
      const value = item[field]
      if (value && typeof value === 'string') {
        if (value.toLowerCase().includes(query)) {
          return true
        }
        
        // إذا كان حقل عربي، استخدم التطبيع
        if (config.arabicFields?.includes(field)) {
          const normalizedValue = normalizeArabicText(value)
          const normalizedQuery = normalizeArabicText(query)
          if (normalizedValue.includes(normalizedQuery)) {
            return true
          }
        }
      }
    }
    
    // البحث في حقول أرقام الجوال
    if (config.phoneFields) {
      for (const field of config.phoneFields) {
        const phone = item[field]
        if (phone && searchSaudiPhone(phone, query)) {
          return true
        }
      }
    }
    
    return false
  })
}

/**
 * البحث في الردود
 * معايير البحث: اسم الشخص، الإيميل، رقم الجوال، اسم الاستطلاع
 */
export const searchResponses = (responses: any[], searchQuery: string) => {
  return smartSearch(responses, searchQuery, {
    searchFields: ['respondentName', 'respondentEmail', 'respondentPhone', 'surveyTitle'],
    phoneFields: ['respondentPhone'],
    arabicFields: ['respondentName', 'surveyTitle']
  })
}

/**
 * البحث في الموظفين
 * معايير البحث: اسم الشخص، الإيميل، رقم الجوال، القسم، المنصب
 */
export const searchEmployees = (employees: any[], searchQuery: string) => {
  return smartSearch(employees, searchQuery, {
    searchFields: ['full_name', 'email', 'phone', 'department', 'position'],
    phoneFields: ['phone'],
    arabicFields: ['full_name', 'department', 'position']
  })
}

/**
 * البحث في العملاء
 * معايير البحث: اسم الشخص، اسم الشركة، الإيميل، رقم الجوال
 */
export const searchClients = (clients: any[], searchQuery: string) => {
  return smartSearch(clients, searchQuery, {
    searchFields: ['name', 'email', 'phone', 'company'],
    phoneFields: ['phone'],
    arabicFields: ['name', 'company']
  })
}

/**
 * البحث في الاستطلاعات
 * معايير البحث: عنوان الاستطلاع، الوصف، اسم العميل
 */
export const searchSurveys = (surveys: any[], searchQuery: string) => {
  return smartSearch(surveys, searchQuery, {
    searchFields: ['title', 'description', 'client_name'],
    phoneFields: [],
    arabicFields: ['title', 'description', 'client_name']
  })
}

/**
 * البحث في سجل الأنشطة
 * معايير البحث: العنوان، الوصف، اسم المستخدم
 */
export const searchActivityLogs = (logs: any[], searchQuery: string) => {
  return smartSearch(logs, searchQuery, {
    searchFields: ['title', 'description', 'user'],
    phoneFields: [],
    arabicFields: ['title', 'description', 'user']
  })
}

/**
 * البحث في الإشعارات
 * معايير البحث: العنوان، الرسالة، اسم المستخدم
 */
export const searchNotifications = (notifications: any[], searchQuery: string) => {
  return smartSearch(notifications, searchQuery, {
    searchFields: ['title', 'message', 'user'],
    phoneFields: [],
    arabicFields: ['title', 'message', 'user']
  })
}
