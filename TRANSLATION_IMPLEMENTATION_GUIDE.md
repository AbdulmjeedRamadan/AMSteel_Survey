# 🌐 Translation System Implementation Guide

## ✅ What Has Been Fixed

### 1. **Root Cause Identified**
The language toggle was changing direction (RTL ↔ LTR) but **not translating text** because:
- Pages had **hardcoded Arabic strings** instead of using the translation system
- The `useTranslation` hook was not imported/used in most pages
- Text was directly written in Arabic instead of using `t('translation.key')`

### 2. **Translation System Overview**

#### **How It Works:**
```tsx
// 1. Import the hook
import { useTranslation } from '@/hooks/useTranslation'

// 2. Use in component
export default function MyPage() {
  const { t } = useTranslation()

  return <h1>{t('dashboard.title')}</h1>
}
```

#### **Key Files:**
- **Translation Hook:** `src/hooks/useTranslation.ts`
- **Translation Data:** `src/i18n/translations.ts`
- **Language Store:** `src/store/languageStore.ts`
- **Language Toggle:** `src/components/common/LanguageToggle.tsx`

### 3. **Files Successfully Updated** ✅

#### **SurveyBuilder.tsx** - FULLY TRANSLATED ✅
- ✅ Added `useTranslation` hook
- ✅ Replaced ALL hardcoded strings with translation keys
- ✅ Added 20+ new translation keys
- ✅ Updated alerts, labels, placeholders, buttons

**Example Changes:**
```tsx
// Before:
<h1>منشئ الاستطلاعات</h1>
<Button>حفظ</Button>
alert('تم حفظ الاستطلاع بنجاح!')

// After:
<h1>{t('surveys.surveyBuilder')}</h1>
<Button>{t('common.save')}</Button>
alert(t('surveys.savedAsDraft'))
```

#### **LoginPage.tsx** - ALREADY USING TRANSLATIONS ✅
- Already implemented with `useTranslation` hook

#### **translations.ts** - EXTENDED ✅
Added comprehensive translations for:
- Survey Builder (20+ keys)
- Dashboard (10+ keys)
- Common UI elements
- Validation messages
- Alert messages

### 4. **Utility Script Created** 🔧

Created `scripts/find-hardcoded-strings.js` to identify all hardcoded Arabic strings.

**Usage:**
```bash
node scripts/find-hardcoded-strings.js
```

**Results:**
- Found **1,576 hardcoded strings** in **35 files**
- Generated detailed JSON report
- Helps prioritize which files need updating

## 📊 Current Status by File

### ✅ Fully Translated
- [x] `LoginPage.tsx` - Already done
- [x] `SurveyBuilder.tsx` - Just completed

### 🔄 Partially Translated
- [ ] `AdminDashboard.tsx` - Header translated, needs full update (104 strings)
- [ ] `DeveloperDashboard.tsx` - Not started (77 strings)
- [ ] `EmployeeDashboard.tsx` - Not started (42 strings)
- [ ] `PublicSurvey.tsx` - Not started (44 strings)
- [ ] `SurveyViewer.tsx` - Not started (40 strings)
- [ ] `SettingsPage.tsx` - Not started (81 strings)
- [ ] `ProfilePage.tsx` - Not started (38 strings)
- [ ] `RegisterPage.tsx` - Not started (43 strings)
- [ ] `SystemConfigPage.tsx` - Not started (78 strings)
- [ ] `SystemConfigurationPage.tsx` - Not started (6 strings)

## 🚀 How to Complete the Translation

### Step 1: Test Current Implementation
The dev server is running on `http://localhost:5178`

**Test Steps:**
1. Navigate to `/admin/survey-builder`
2. Click the language toggle (EN/AR button in header)
3. Verify:
   - ✅ Direction changes (RTL ↔ LTR)
   - ✅ Text translates (Arabic ↔ English)

### Step 2: Update Remaining Pages

For each page, follow this pattern:

#### A. Add Import
```tsx
import { useTranslation } from '@/hooks/useTranslation'
```

#### B. Use Hook
```tsx
export default function MyPage() {
  const { t } = useTranslation()
  // ... rest of code
}
```

#### C. Replace Hardcoded Text
```tsx
// Before:
<h1>لوحة التحكم</h1>

// After:
<h1>{t('dashboard.title')}</h1>
```

#### D. Add Missing Translation Keys
If a key doesn't exist, add it to `src/i18n/translations.ts`:

```tsx
// Arabic (ar)
dashboard: {
  myNewKey: 'النص بالعربية',
}

// English (en)
dashboard: {
  myNewKey: 'Text in English',
}
```

### Step 3: Priority Order

**High Priority (User-facing):**
1. ✅ LoginPage - Done
2. ✅ SurveyBuilder - Done
3. 🔄 PublicSurvey
4. 🔄 EmployeeDashboard
5. 🔄 AdminDashboard

**Medium Priority:**
6. 🔄 SettingsPage
7. 🔄 ProfilePage
8. 🔄 DeveloperDashboard

**Lower Priority:**
9. 🔄 RegisterPage
10. 🔄 SystemConfigPage
11. 🔄 SystemConfigurationPage

## 📋 Translation Keys Organization

### Common (`common.*`)
- `appName`, `welcome`, `loading`
- `save`, `cancel`, `delete`, `edit`, `create`
- `search`, `filter`, `export`, `print`
- `yes`, `no`, `confirm`, `close`

### Navigation (`nav.*`)
- `dashboard`, `surveys`, `responses`
- `analytics`, `employees`, `settings`
- `profile`, `logout`

### Dashboard (`dashboard.*`)
- `title`, `overview`, `statistics`
- `totalSurveys`, `activeSurveys`
- `recentSurveys`, `performance`

### Surveys (`surveys.*`)
- `title`, `createSurvey`, `editSurvey`
- `surveyTitle`, `surveyDescription`
- `questions`, `addQuestion`
- `draft`, `active`, `closed`

### Auth (`auth.*`)
- `login`, `email`, `password`
- `loginButton`, `loginSuccess`
- `invalidCredentials`

### Validation (`validation.*`)
- `required`, `invalidEmail`
- `minLength`, `maxLength`
- `passwordMismatch`

### Messages (`messages.*`)
- `success`, `error`
- `savedSuccessfully`, `deletedSuccessfully`
- `operationFailed`, `noData`

## 🛠️ Tools & Resources

### Find Hardcoded Strings
```bash
node scripts/find-hardcoded-strings.js
```

### Check Specific File
```bash
grep -n "[\u0600-\u06FF]" src/pages/MyPage.tsx
```

### Test Translation in Browser
1. Open DevTools Console
2. Run: `localStorage.getItem('amsteel-language')`
3. Should show: `{"state":{"language":"ar","direction":"rtl"},...}`

## 🐛 Common Issues & Solutions

### Issue 1: Text Not Translating
**Cause:** Using hardcoded string instead of `t()`
```tsx
// ❌ Wrong:
<div>عنوان الصفحة</div>

// ✅ Correct:
<div>{t('page.title')}</div>
```

### Issue 2: Translation Key Not Found
**Cause:** Key doesn't exist in translations.ts
**Solution:** Add the key to both `ar` and `en` sections

### Issue 3: Direction Changes But Text Doesn't
**Cause:** Page not using `useTranslation` hook
**Solution:** Import and use the hook as shown above

## 📝 Quick Reference

### Most Common Translation Patterns

**Buttons:**
```tsx
<Button>{t('common.save')}</Button>
<Button>{t('common.cancel')}</Button>
<Button>{t('common.delete')}</Button>
```

**Titles:**
```tsx
<h1>{t('dashboard.title')}</h1>
<CardTitle>{t('surveys.title')}</CardTitle>
```

**Alerts:**
```tsx
alert(t('messages.savedSuccessfully'))
toast.success(t('messages.success'))
```

**Placeholders:**
```tsx
<Input placeholder={t('common.search')} />
<Textarea placeholder={t('surveys.enterSurveyDescription')} />
```

## 🎯 Next Steps

1. **Test the Survey Builder** at http://localhost:5178/admin/survey-builder
   - Toggle language and verify all text translates

2. **Update High Priority Pages**
   - PublicSurvey.tsx
   - EmployeeDashboard.tsx
   - Complete AdminDashboard.tsx

3. **Add Missing Translation Keys**
   - Review the hardcoded-strings-report.json
   - Add frequently used phrases to translations.ts

4. **Test End-to-End**
   - Create a survey in Arabic
   - Switch to English
   - Verify all UI elements translate

## 📚 Additional Notes

### Mock Data vs UI Text
- **Mock data** (test surveys, sample users) can stay in Arabic
- **UI text** (labels, buttons, messages) must use translations

### Component Props
Some components receive text as props. Translate at the parent:
```tsx
<MyComponent title={t('dashboard.title')} />
```

### String Interpolation
For dynamic text:
```tsx
// In translations.ts:
userGreeting: 'مرحباً {{name}}'

// In component:
t('common.userGreeting', { name: user.name })
```

---

**Created:** 2025-10-03
**Status:** In Progress
**Progress:** 2/12 pages fully translated (17%)
**Dev Server:** http://localhost:5178
