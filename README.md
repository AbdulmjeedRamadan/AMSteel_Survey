# 🏢 AMSteel Survey System

<!-- Test change for CodeRabbit review -->
نظام إدارة الاستطلاعات المتقدم لشركة AMSteel - حل شامل لإنشاء وإدارة الاستطلاعات مع واجهات متعددة الأدوار.

## 📚 الوثائق الشاملة

تم تجميع جميع الوثائق في ثلاثة ملفات شاملة:

### 🎨 [Frontend Documentation](./FRONTEND_DOCUMENTATION.md)
**الوثائق الكاملة للواجهة الأمامية**
- التقنيات المستخدمة (React, TypeScript, Tailwind CSS)
- هيكل المشروع والمكونات
- نظام الصلاحيات وواجهات المستخدم
- التصميم المتجاوب والميزات المتقدمة
- إدارة الحالة والتوجيه
- التحسينات والأداء

### 🔧 [Backend Documentation](./BACKEND_DOCUMENTATION.md)
**الوثائق الكاملة للخادم الخلفي**
- التقنيات المستخدمة (Node.js, TypeScript, Express)
- هيكل المشروع وإعداد البيئة
- المصادقة والأمان
- API Endpoints والخدمات
- معالجة الأخطاء والأداء
- الاختبار والنشر

### 🗄️ [Database Documentation](./DATABASE_DOCUMENTATION.md)
**الوثائق الكاملة لقاعدة البيانات**
- دعم Neon Serverless و PostgreSQL
- هيكل قاعدة البيانات والجداول
- الفهارس والتحسين
- إدارة البيانات والنسخ الاحتياطي
- الأمان والصلاحيات
- المراقبة واستكشاف الأخطاء

---

## 🚀 البدء السريع

### 1️⃣ إعداد قاعدة البيانات
```bash
# إعداد Neon Serverless (الموصى به)
# 1. إنشاء حساب في https://neon.tech
# 2. إنشاء مشروع جديد
# 3. نسخ connection string
# 4. إضافته في ملف .env

DATABASE_URL=postgres://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2️⃣ تشغيل Backend
```bash
cd backend
npm install
npm run migrate:up
npm run seed:initial
npm run dev
```

### 3️⃣ تشغيل Frontend
```bash
npm install
npm run dev
```

### 4️⃣ الوصول للنظام
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 👥 بيانات الدخول الافتراضية

### 🔧 المطور
- **الإيميل**: developer@amsteel.com
- **كلمة المرور**: Developer@123
- **الصلاحيات**: إدارة كاملة للنظام

### 👨‍💼 المدير
- **الإيميل**: admin@amsteel.com
- **كلمة المرور**: Admin@123
- **الصلاحيات**: إدارة الاستطلاعات والعملاء

### 👤 الموظف
- **الإيميل**: employee@amsteel.com
- **كلمة المرور**: Employee@123
- **الصلاحيات**: المشاركة في الاستطلاعات

---

## 🎯 الميزات الرئيسية

### ✨ للمديرين
- إنشاء وإدارة الاستطلاعات
- تتبع الردود والتحليلات
- تصدير البيانات (CSV, PDF)
- مشاركة الاستطلاعات مع QR codes
- إدارة العملاء والمشاريع

### 🔧 للمطورين
- إدارة المستخدمين والصلاحيات
- مراقبة النظام والإحصائيات
- سجل الأنشطة والإشعارات
- النسخ الاحتياطي والاستعادة
- إعدادات النظام المتقدمة

### 👥 للموظفين
- المشاركة في الاستطلاعات
- تتبع التقدم الشخصي
- إدارة الملف الشخصي

### 🌐 للجمهور
- الوصول للاستطلاعات العامة
- واجهة سهلة ومتجاوبة
- دعم جميع أنواع الأسئلة

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18** مع TypeScript
- **Tailwind CSS** للتصميم
- **Radix UI** للمكونات
- **Zustand** لإدارة الحالة
- **React Router** للتوجيه

### Backend
- **Node.js** مع TypeScript
- **Express.js** للـ API
- **JWT** للمصادقة
- **Winston** للسجلات
- **Jest** للاختبارات

### Database
- **Neon Serverless** (الأساسي)
- **PostgreSQL 15+** (احتياطي)
- **Connection Pooling**
- **Auto-scaling**

---

## 📊 إحصائيات المشروع

- **📁 عدد الملفات**: 100+ ملف
- **🧩 عدد المكونات**: 50+ مكون React
- **🛣️ عدد الـ API Routes**: 40+ endpoint
- **🗄️ عدد الجداول**: 8 جداول رئيسية
- **❓ أنواع الأسئلة**: 14 نوع مختلف
- **👥 الأدوار المدعومة**: 3 أدوار (مطور، مدير، موظف)
- **🌍 اللغات**: العربية والإنجليزية
- **📱 التوافق**: جميع الأجهزة والمتصفحات

---

## 🔒 الأمان والحماية

- **🔐 JWT Authentication**: مصادقة آمنة
- **🛡️ Role-based Access**: صلاحيات حسب الدور
- **🔒 Password Hashing**: تشفير كلمات المرور
- **🚫 Rate Limiting**: حماية من الهجمات
- **📝 Audit Trail**: تتبع جميع العمليات
- **🔍 Input Validation**: التحقق من البيانات

---

## 🚀 النشر والإنتاج

### Frontend
- **Vercel** (الموصى به)
- **Netlify**
- **AWS S3 + CloudFront**

### Backend
- **Railway** (الموصى به)
- **Heroku**
- **AWS EC2**
- **DigitalOcean**

### Database
- **Neon Serverless** (مدمج)
- **AWS RDS**
- **Google Cloud SQL**

---

## 📞 الدعم والمساعدة

### 📚 الوثائق
- [Frontend Documentation](./FRONTEND_DOCUMENTATION.md) - وثائق الواجهة الأمامية
- [Backend Documentation](./BACKEND_DOCUMENTATION.md) - وثائق الخادم الخلفي
- [Database Documentation](./DATABASE_DOCUMENTATION.md) - وثائق قاعدة البيانات

### 🔧 استكشاف الأخطاء
- تحقق من ملفات السجلات في `logs/`
- استخدم `npm run test` لتشغيل الاختبارات
- راجع الوثائق المفصلة لكل قسم

### 🌐 الموارد الخارجية
- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs)
- [PostgreSQL Manual](https://www.postgresql.org/docs)
- [Neon Documentation](https://neon.tech/docs)

---

## 📈 التطوير المستقبلي

### 🔮 الميزات المخططة
- **PWA Support**: تطبيق ويب تقدمي
- **Real-time Updates**: تحديثات فورية
- **Advanced Analytics**: تحليلات بالذكاء الاصطناعي
- **Multi-language**: دعم لغات متعددة
- **Mobile Apps**: تطبيقات الهاتف المحمول

### 🛡️ تحسينات الأمان
- **OAuth 2.0**: مصادقة متقدمة
- **2FA Support**: مصادقة ثنائية
- **Data Encryption**: تشفير البيانات
- **GDPR Compliance**: توافق مع قوانين الخصوصية

---

## 🏆 الإنجازات

✅ **نظام متكامل** مع جميع الميزات المطلوبة  
✅ **أداء عالي** مع تحميل سريع  
✅ **تصميم متجاوب** يعمل على جميع الأجهزة  
✅ **أمان متقدم** مع حماية البيانات  
✅ **سهولة الاستخدام** مع واجهات بديهية  
✅ **قابلية التوسع** لدعم النمو المستقبلي  

---

**🎉 نظام AMSteel Survey جاهز للاستخدام!**

*تم التطوير بواسطة فريق AMSteel التقني - ديسمبر 2024*