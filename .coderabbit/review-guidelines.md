# CodeRabbit Review Guidelines for AMSteel Survey System

## 🎯 أهداف المراجعة

### 1. جودة الكود (Code Quality)
- **TypeScript**: استخدام الأنواع الصحيحة وتجنب `any`
- **React**: استخدام Hooks بشكل صحيح وتجنب re-renders غير الضرورية
- **Performance**: استخدام `React.memo`, `useMemo`, `useCallback` عند الحاجة
- **Clean Code**: أسماء متغيرات واضحة، دوال قصيرة، تعليقات مفيدة

### 2. الأمان (Security)
- **Input Validation**: التحقق من جميع المدخلات
- **Authentication**: التحقق من صحة الجلسات والأذونات
- **SQL Injection**: استخدام prepared statements
- **XSS Protection**: تنظيف البيانات قبل العرض
- **CSRF Protection**: استخدام tokens مناسبة

### 3. إمكانية الوصول (Accessibility)
- **ARIA Labels**: إضافة labels مناسبة
- **Keyboard Navigation**: دعم التنقل بلوحة المفاتيح
- **Screen Readers**: دعم قارئات الشاشة
- **Color Contrast**: تباين ألوان مناسب
- **Focus Management**: إدارة التركيز بشكل صحيح

### 4. الأداء (Performance)
- **Bundle Size**: مراقبة حجم الحزمة
- **Lazy Loading**: تحميل المكونات عند الحاجة
- **Image Optimization**: تحسين الصور
- **Database Queries**: تحسين استعلامات قاعدة البيانات
- **Caching**: استخدام التخزين المؤقت بشكل مناسب

### 5. الترجمة (Internationalization)
- **RTL Support**: دعم اللغة العربية من اليمين لليسار
- **Translation Keys**: استخدام مفاتيح الترجمة الصحيحة
- **Date/Time Formatting**: تنسيق التواريخ حسب المنطقة
- **Number Formatting**: تنسيق الأرقام حسب المنطقة

## 🔍 نقاط المراجعة المحددة

### Frontend (React/TypeScript)
```typescript
// ✅ جيد
const [user, setUser] = useState<User | null>(null);
const handleSubmit = useCallback((data: FormData) => {
  // logic
}, [dependencies]);

// ❌ سيء
const [user, setUser] = useState(null);
const handleSubmit = (data) => {
  // logic
};
```

### Backend (Node.js/Express)
```typescript
// ✅ جيد
app.post('/api/surveys', authenticateToken, validateSurvey, async (req: Request, res: Response) => {
  try {
    const survey = await createSurvey(req.body);
    res.status(201).json(survey);
  } catch (error) {
    logger.error('Survey creation failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ❌ سيء
app.post('/api/surveys', (req, res) => {
  // No validation, no error handling
  createSurvey(req.body);
  res.json({ success: true });
});
```

### Database
```sql
-- ✅ جيد
SELECT s.*, u.name as creator_name 
FROM surveys s 
JOIN users u ON s.created_by = u.id 
WHERE s.status = 'active' 
AND s.created_at > NOW() - INTERVAL '30 days';

-- ❌ سيء
SELECT * FROM surveys;
```

## 📋 قائمة التحقق

### قبل الـ Pull Request
- [ ] جميع الاختبارات تمر
- [ ] لا توجد أخطاء TypeScript
- [ ] الكود يتبع معايير ESLint
- [ ] تم اختبار الوظائف الجديدة
- [ ] تم تحديث الوثائق إذا لزم الأمر

### أثناء المراجعة
- [ ] الأمان: لا توجد ثغرات أمنية
- [ ] الأداء: لا توجد مشاكل أداء
- [ ] إمكانية الوصول: يدعم جميع المستخدمين
- [ ] الترجمة: يعمل باللغتين العربية والإنجليزية
- [ ] التوافق: يعمل على جميع المتصفحات

## 🚨 أولويات المراجعة

### عالية الأولوية (High Priority)
- ثغرات أمنية
- أخطاء تسبب crash
- مشاكل أداء خطيرة
- مشاكل إمكانية الوصول حرجة

### متوسطة الأولوية (Medium Priority)
- تحسينات الأداء
- تحسين جودة الكود
- تحسين إمكانية الوصول
- تحسين تجربة المستخدم

### منخفضة الأولوية (Low Priority)
- تحسينات التصميم
- تحسينات الوثائق
- تحسينات الكود الثانوية

## 💡 نصائح للاستفادة القصوى

1. **اقرأ التعليقات بعناية**: CodeRabbit يقدم اقتراحات ذكية
2. **تفاعل مع الاقتراحات**: يمكنك طلب توضيحات إضافية
3. **تعلم من الأخطاء**: استخدم المراجعات لتحسين مهاراتك
4. **شارك المعرفة**: ناقش الاقتراحات مع الفريق
5. **استخدم الإعدادات**: خصص CodeRabbit حسب احتياجاتك
