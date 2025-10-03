# 🌐 Complete Translation Checklist - AMSteel Survey System

**Generated:** 2025-10-03
**Total Files:** 35 files
**Total Strings:** 1,547 hardcoded Arabic strings
**Current Progress:** ~300/1547 (19%)

---

## 📊 Translation Status Summary

| Category | Files | Strings | Status | Priority |
|----------|-------|---------|--------|----------|
| **Pages** | 12 | 493 | 🔄 In Progress | 🔴 High |
| **Admin Components** | 6 | 381 | ❌ Not Started | 🔴 High |
| **Developer Components** | 7 | 484 | ❌ Not Started | 🟡 Medium |
| **Common Components** | 7 | 15 | ❌ Not Started | 🟢 Low |
| **Survey Components** | 3 | 174 | ❌ Not Started | 🔴 High |

---

## 🔴 HIGH PRIORITY - User-Facing Pages

### ✅ **COMPLETED**
- [x] **LoginPage.tsx** (9 strings) - ✅ DONE
- [x] **SurveyBuilder.tsx** (9 strings remaining) - 🔄 90% DONE
- [x] **AdminDashboard.tsx** (75 strings) - 🔄 70% DONE

### ❌ **PENDING - CRITICAL**

#### 1. **EmployeeDashboard.tsx** (42 strings) 🔴
**User Role:** Employee (موظف)
**Priority:** HIGH - Main dashboard for employees

**Hardcoded Strings:**
- Survey titles and descriptions (mock data)
- UI labels: "استطلاعاتي", "الاستطلاعات المخصصة"
- Status labels: "جديد", "قيد التقدم", "مكتمل"
- Time estimates: "10 دقائق"
- Empty states: "لا توجد استطلاعات"

**Translation Keys Needed:**
```typescript
employee: {
  mySurveys: 'استطلاعاتي',
  assignedSurveys: 'الاستطلاعات المخصصة',
  newSurvey: 'جديد',
  inProgress: 'قيد التقدم',
  completed: 'مكتمل',
  estimatedTime: 'الوقت المتوقع',
  minutes: 'دقائق',
  noSurveys: 'لا توجد استطلاعات',
  startSurvey: 'بدء الاستطلاع',
  continueSurvey: 'متابعة الاستطلاع',
  viewResults: 'عرض النتائج'
}
```

---

#### 2. **DeveloperDashboard.tsx** (77 strings) 🔴
**User Role:** Developer (مطور) - Full System Access
**Priority:** HIGH - System admin dashboard

**Hardcoded Strings:**
- Activity log messages
- System statistics labels
- User management UI
- Configuration settings
- Alert messages

**Translation Keys Needed:**
```typescript
developer: {
  systemOverview: 'نظرة عامة على النظام',
  activityLog: 'سجل النشاطات',
  userManagement: 'إدارة المستخدمين',
  systemConfig: 'إعدادات النظام',
  database: 'قاعدة البيانات',
  backup: 'نسخ احتياطي',
  restore: 'استعادة',
  monitoring: 'المراقبة'
}
```

---

#### 3. **PublicSurvey.tsx** (44 strings) 🔴
**User Role:** Public (عام) - External survey respondents
**Priority:** HIGH - Public-facing page

**Hardcoded Strings:**
- Welcome messages
- Thank you messages
- Survey instructions
- Error messages
- Submit buttons

**Translation Keys Needed:**
```typescript
publicSurvey: {
  welcomeMessage: 'مرحباً بك في الاستطلاع',
  thankYouMessage: 'شكراً لك على وقتك',
  instructions: 'التعليمات',
  required: 'مطلوب',
  optional: 'اختياري',
  submitSurvey: 'إرسال الاستطلاع',
  previousQuestion: 'السؤال السابق',
  nextQuestion: 'السؤال التالي'
}
```

---

#### 4. **SurveyViewer.tsx** (40 strings) 🔴
**User Role:** All users
**Priority:** HIGH - Survey viewing interface

**Hardcoded Strings:**
- Survey navigation
- Progress indicators
- Question displays
- Answer validation messages

---

#### 5. **ProfilePage.tsx** (38 strings) 🟡
**User Role:** All users
**Priority:** MEDIUM

**Hardcoded Strings:**
- Profile form labels
- Toast messages: 'تم حفظ التغييرات', 'ليس لديك صلاحية'
- Role translations: 'مطور', 'مدير', 'موظف'
- Validation errors

---

#### 6. **SettingsPage.tsx** (81 strings) 🟡
**User Role:** All users
**Priority:** MEDIUM

**Hardcoded Strings:**
- Settings sections
- Password change form
- Toast notifications
- Preference options

---

#### 7. **RegisterPage.tsx** (43 strings) 🟡
**User Role:** Public
**Priority:** MEDIUM

**Hardcoded Strings:**
- Form validation errors
- Input labels
- Terms and conditions text
- Success/error messages

---

#### 8. **SystemConfigPage.tsx** (78 strings) 🟢
**User Role:** Developer
**Priority:** LOW - Admin-only

---

#### 9. **SystemConfigurationPage.tsx** (6 strings) 🟢
**User Role:** Developer
**Priority:** LOW

---

## 🔴 HIGH PRIORITY - Admin Components

### 1. **AdvancedAnalytics.tsx** (44 strings) 🔴
**Features:**
- Date range selectors
- Chart labels
- Export options
- Statistics displays

**Key Strings:**
- "التحليلات المتقدمة"
- "آخر 7 أيام", "آخر 30 يوم"
- "معدل الاستجابة", "متوسط الوقت"

---

### 2. **ClientTracking.tsx** (60 strings) 🔴
**Features:**
- Client list
- Company information
- Location data
- Activity tracking

**Mock Data:** Contains hardcoded client names and companies (can keep in Arabic for demo)

---

### 3. **ResponseManagement.tsx** (56 strings) 🔴
**Features:**
- Response filtering
- Detailed view
- Export functions
- Status indicators

**Key Strings:**
- "إدارة الردود"
- "تصدير الردود"
- "فلترة حسب التاريخ"

---

### 4. **SurveySettings.tsx** (40 strings) 🔴
**Features:**
- Survey configuration
- Status management
- Targeting options

**Key Strings:**
- Status labels: "نشط", "مسودة", "متوقف", "مغلق"

---

### 5. **SurveySharing.tsx** (54 strings) 🔴
**Features:**
- Share links
- QR code generation
- Social media sharing
- Email templates

**Key Strings:**
- "مشاركة الاستطلاع"
- "نسخ الرابط"
- "رمز QR"

---

### 6. **FeatureFlagManager.tsx** (27 strings) 🟡
**Features:**
- Feature toggles
- Configuration options

---

## 🟡 MEDIUM PRIORITY - Developer Components

### 1. **EmployeeManagement.tsx** (80 strings)
- Employee CRUD operations
- Department management
- Role assignments

### 2. **BackupRestore.tsx** (82 strings)
- Backup creation
- Restore operations
- Backup history

### 3. **ActivityLog.tsx** (74 strings)
- System activity tracking
- User actions log
- Filter options

### 4. **AdvancedResponseManagement.tsx** (71 strings)
- Detailed response analysis
- Bulk operations
- Advanced filters

### 5. **NotificationSystem.tsx** (44 strings)
- Notification templates
- Alert configuration

### 6. **SystemConfiguration.tsx** (34 strings)
- System settings
- Feature flags

### 7. **SystemStatistics.tsx** (29 strings)
- Performance metrics
- Usage statistics

---

## 🟢 LOW PRIORITY - Common Components

### 1. **DataTable.tsx** (7 strings)
- "البحث...", "تصدير", "فلترة"
- "جاري التحميل", "لا توجد بيانات"

### 2. **ConfirmDialog.tsx** (3 strings)
- "تأكيد", "إلغاء", "جاري المعالجة"

### 3. **ErrorBoundary.tsx** (3 strings)
- "حدث خطأ غير متوقع"
- "إعادة تحميل الصفحة"

### 4. **MobileMenu.tsx** (1 string)
- "القائمة"

### 5. **LanguageToggle.tsx** (1 string) ✅
- Already implemented!

### 6. **Other UI Components** (0 strings)
- EmptyState, LoadingSpinner, etc. - No hardcoded text

---

## 🔴 HIGH PRIORITY - Survey Components

### 1. **QuestionEditor.tsx** (82 strings) 🔴
**Features:**
- Question creation interface
- Question type selector
- Validation rules
- Preview mode

**Key Strings:**
- Question type labels
- Validation messages
- Add/remove buttons
- Option editors

---

### 2. **QuestionTypeSelector.tsx** (31 strings) 🔴
**Features:**
- Question type grid
- Type descriptions
- Icons and labels

**Question Types:**
- "نص قصير", "نص طويل"
- "اختيار من متعدد", "خانات اختيار"
- "تقييم", "مقياس"
- "تاريخ", "وقت", "ملف"

---

### 3. **SurveySettings.tsx** (40 strings) 🔴
(Duplicate of admin component)

---

### 4. **SurveyExport.tsx** (11 strings) 🟡
**Features:**
- Export format selection
- Export options
- Download buttons

---

### 5. **SurveyTargeting.tsx** (10 strings) 🟡
**Features:**
- Target audience selection
- Department filters
- Employee selection

---

## 📋 Translation Implementation Plan

### Phase 1: Critical User-Facing Pages (Week 1) 🔴
**Order of Priority:**
1. ✅ ~~LoginPage~~ - DONE
2. 🔄 EmployeeDashboard (Employee interface)
3. 🔄 PublicSurvey (External users)
4. 🔄 Complete AdminDashboard
5. 🔄 Complete SurveyBuilder
6. SurveyViewer

**Goal:** All main user dashboards fully translated

---

### Phase 2: Survey Components (Week 2) 🔴
**Order of Priority:**
1. QuestionEditor
2. QuestionTypeSelector
3. SurveySettings
4. SurveyExport
5. SurveyTargeting

**Goal:** Complete survey creation/viewing workflow

---

### Phase 3: Admin Features (Week 3) 🔴
**Order of Priority:**
1. ResponseManagement
2. AdvancedAnalytics
3. ClientTracking
4. SurveySharing
5. FeatureFlagManager

**Goal:** Admin tools fully functional in both languages

---

### Phase 4: Developer Tools (Week 4) 🟡
**Order of Priority:**
1. EmployeeManagement
2. BackupRestore
3. ActivityLog
4. SystemStatistics
5. NotificationSystem

**Goal:** System administration tools translated

---

### Phase 5: Supporting Pages (Week 5) 🟡
**Order of Priority:**
1. ProfilePage
2. SettingsPage
3. RegisterPage
4. SystemConfigPage

**Goal:** User account management complete

---

### Phase 6: Common Components (Final) 🟢
**Order of Priority:**
1. DataTable
2. ConfirmDialog
3. ErrorBoundary
4. MobileMenu
5. Other utilities

**Goal:** 100% translation coverage

---

## 🎯 Quick Start Guides

### For Each Page:

#### Step 1: Add Import
```typescript
import { useTranslation } from '@/hooks/useTranslation'
```

#### Step 2: Use Hook
```typescript
export default function MyPage() {
  const { t } = useTranslation()
  // ... rest
}
```

#### Step 3: Replace Strings
```typescript
// Before:
<h1>لوحة التحكم</h1>

// After:
<h1>{t('dashboard.title')}</h1>
```

#### Step 4: Add Translation Keys
Add to `src/i18n/translations.ts`:
```typescript
// Arabic
dashboard: {
  title: 'لوحة التحكم'
}

// English
dashboard: {
  title: 'Dashboard'
}
```

---

## 📊 Progress Tracking

### Current Status (2025-10-03):
- ✅ **Completed:** 3/35 files (9%)
- 🔄 **In Progress:** 2/35 files (6%)
- ❌ **Not Started:** 30/35 files (85%)

### String Translation Progress:
- ✅ **Translated:** ~300/1547 strings (19%)
- 🔄 **In Progress:** ~50/1547 strings (3%)
- ❌ **Remaining:** ~1197/1547 strings (77%)

---

## 🛠️ Tools & Resources

### 1. Find Hardcoded Strings
```bash
node scripts/find-hardcoded-strings.js
```

### 2. Check Specific File
```bash
grep -n "[\u0600-\u06FF]" src/pages/MyPage.tsx
```

### 3. Translation Files
- **Main File:** `src/i18n/translations.ts`
- **Hook:** `src/hooks/useTranslation.ts`
- **Store:** `src/store/languageStore.ts`

---

## 📝 Notes

### Mock Data vs UI Text
- **Mock Data** (survey titles, user names): Can stay in Arabic for demo
- **UI Labels** (buttons, headings, messages): MUST be translated

### Priority Logic
- 🔴 **HIGH:** User-facing pages, main workflows
- 🟡 **MEDIUM:** Settings, configuration, admin tools
- 🟢 **LOW:** Developer tools, system internals

---

**Next Action:** Start with Phase 1 - EmployeeDashboard.tsx

**Dev Server:** http://localhost:5178
**Test Page:** http://localhost:5178/admin/dashboard
