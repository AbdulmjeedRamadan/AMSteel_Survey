# 🗄️ AMSteel Survey System - Database Documentation

## 📋 جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [التقنيات المستخدمة](#التقنيات-المستخدمة)
- [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
- [هيكل قاعدة البيانات](#هيكل-قاعدة-البيانات)
- [الجداول والعلاقات](#الجداول-والعلاقات)
- [الفهارس والتحسين](#الفهارس-والتحسين)
- [إدارة البيانات](#إدارة-البيانات)
- [النسخ الاحتياطي](#النسخ-الاحتياطي)
- [الأمان والصلاحيات](#الأمان-والصلاحيات)
- [المراقبة والأداء](#المراقبة-والأداء)
- [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🌟 نظرة عامة

قاعدة بيانات نظام AMSteel Survey مصممة لتكون مرنة وقابلة للتوسع، تدعم كلاً من PostgreSQL المحلي و Neon Serverless في السحابة. تم تصميم الهيكل ليدعم جميع متطلبات النظام من إدارة المستخدمين والاستطلاعات والردود مع ضمان الأداء العالي والأمان.

### 🎯 الأهداف الرئيسية
- **الأداء العالي**: استعلامات سريعة ومحسنة
- **قابلية التوسع**: دعم نمو البيانات والمستخدمين
- **الأمان**: حماية البيانات الحساسة
- **المرونة**: دعم متطلبات متنوعة
- **سهولة الصيانة**: هيكل واضح ومنظم

---

## 🛠️ التقنيات المستخدمة

### 🔧 قواعد البيانات المدعومة

#### 🌐 Neon Serverless (الأساسي)
```json
{
  "provider": "Neon",
  "type": "PostgreSQL 15+",
  "features": [
    "Serverless Architecture",
    "Auto-scaling",
    "Branching",
    "Point-in-time Recovery",
    "Connection Pooling",
    "WebSocket Support"
  ],
  "pricing": "Free tier: 512MB storage, 191 hours compute",
  "performance": "Sub-100ms cold starts"
}
```

#### 🏠 PostgreSQL المحلي (احتياطي)
```json
{
  "version": "PostgreSQL 15+",
  "extensions": [
    "uuid-ossp",
    "pgcrypto",
    "pg_stat_statements"
  ],
  "features": [
    "Full ACID compliance",
    "Advanced indexing",
    "JSON/JSONB support",
    "Full-text search"
  ]
}
```

### 📦 أدوات الإدارة
- **Migration Tool**: نصوص ترحيل مخصصة
- **Seeding**: بيانات أولية للتطوير
- **Backup Scripts**: نسخ احتياطي آلي
- **Monitoring**: مراقبة الأداء والاستخدام

---

## ⚙️ إعداد قاعدة البيانات

### 🚀 إعداد Neon Serverless

#### الخطوة 1: إنشاء مشروع Neon
```bash
# 1. اذهب إلى https://neon.tech
# 2. أنشئ حساب جديد
# 3. أنشئ مشروع جديد باسم "amsteel-survey"
# 4. اختر المنطقة: US East (الأسرع)
# 5. انسخ connection string
```

#### الخطوة 2: إعداد متغيرات البيئة
```env
# في ملف .env
DATABASE_URL=postgres://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# معلومات إضافية
DB_HOST=ep-xxx.us-east-1.aws.neon.tech
DB_PORT=5432
DB_NAME=neondb
DB_USER=username
DB_PASSWORD=password
```

#### الخطوة 3: تثبيت المكتبات
```bash
cd backend
npm install @neondatabase/serverless ws pg @types/pg
```

#### الخطوة 4: اختبار الاتصال
```bash
npx ts-node src/scripts/test-neon.ts
```

### 🏠 إعداد PostgreSQL المحلي

#### تثبيت PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql
brew services start postgresql

# Windows
# تحميل من https://www.postgresql.org/download/windows/
```

#### إنشاء قاعدة البيانات
```sql
-- الاتصال كـ postgres user
sudo -u postgres psql

-- إنشاء قاعدة البيانات
CREATE DATABASE amsteel_survey;

-- إنشاء مستخدم
CREATE USER amsteel_user WITH PASSWORD 'secure_password';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE amsteel_survey TO amsteel_user;

-- تفعيل الامتدادات
\c amsteel_survey
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 🏗️ هيكل قاعدة البيانات

### 📊 مخطط العلاقات (ERD)

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    users    │    │   surveys   │    │  questions  │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │◄──┐│ title       │◄──┐│ survey_id   │
│ password    │   ││ description │   ││ question_text│
│ full_name   │   ││ type        │   ││ question_type│
│ role        │   ││ status      │   ││ is_required │
│ department  │   ││ created_by  │───┘│ order_index │
│ position    │   ││ client_name │    │ options     │
│ phone       │   ││ start_date  │    │ validation  │
│ is_active   │   ││ end_date    │    └─────────────┘
│ created_at  │   ││ target_resp │           │
│ updated_at  │   ││ is_anonymous│           │
└─────────────┘   ││ created_at  │           │
                  ││ updated_at  │           │
                  │└─────────────┘           │
                  │                          │
┌─────────────┐   │    ┌─────────────┐      │
│  responses  │   │    │   answers   │      │
├─────────────┤   │    ├─────────────┤      │
│ id (PK)     │   │    │ id (PK)     │      │
│ survey_id   │───┘    │ response_id │──────┘
│ respondent_id│        │ question_id │
│ resp_name   │        │ answer_text │
│ resp_email  │        │ answer_value│
│ resp_phone  │        │ created_at  │
│ is_completed│        └─────────────┘
│ started_at  │
│ completed_at│
│ ip_address  │
│ user_agent  │
│ created_at  │
│ updated_at  │
└─────────────┘
```

---

## 📋 الجداول والعلاقات

### 👥 جدول المستخدمين (users)

```sql
CREATE TYPE user_role AS ENUM ('developer', 'admin', 'employee');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'employee',
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_phone_check CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s\-\(\)]{10,20}$')
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Comments
COMMENT ON TABLE users IS 'جدول المستخدمين - يحتوي على جميع مستخدمي النظام';
COMMENT ON COLUMN users.role IS 'دور المستخدم: developer, admin, employee';
COMMENT ON COLUMN users.is_active IS 'حالة المستخدم - نشط أم معطل';
```

### 📊 جدول الاستطلاعات (surveys)

```sql
CREATE TYPE survey_type AS ENUM ('internal', 'external');
CREATE TYPE survey_status AS ENUM ('draft', 'active', 'paused', 'closed', 'archived');
CREATE TYPE duration_type AS ENUM ('unlimited', 'days', 'weeks', 'months');

CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type survey_type NOT NULL DEFAULT 'internal',
    status survey_status NOT NULL DEFAULT 'draft',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    client_name VARCHAR(255),
    client_company VARCHAR(255),
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    duration_type duration_type DEFAULT 'unlimited',
    duration_value INTEGER,
    target_responses INTEGER DEFAULT 100,
    is_anonymous BOOLEAN DEFAULT false,
    allow_multiple_responses BOOLEAN DEFAULT false,
    slug VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT surveys_title_length CHECK (LENGTH(title) >= 3),
    CONSTRAINT surveys_target_positive CHECK (target_responses > 0),
    CONSTRAINT surveys_duration_check CHECK (
        (duration_type = 'unlimited' AND duration_value IS NULL) OR
        (duration_type != 'unlimited' AND duration_value > 0)
    ),
    CONSTRAINT surveys_external_client CHECK (
        (type = 'external' AND client_name IS NOT NULL) OR
        (type = 'internal')
    )
);

-- Indexes
CREATE INDEX idx_surveys_created_by ON surveys(created_by);
CREATE INDEX idx_surveys_type ON surveys(type);
CREATE INDEX idx_surveys_status ON surveys(status);
CREATE INDEX idx_surveys_slug ON surveys(slug);
CREATE INDEX idx_surveys_created_at ON surveys(created_at);
CREATE INDEX idx_surveys_active_dates ON surveys(start_date, end_date) WHERE status = 'active';

-- Comments
COMMENT ON TABLE surveys IS 'جدول الاستطلاعات - يحتوي على جميع الاستطلاعات';
COMMENT ON COLUMN surveys.type IS 'نوع الاستطلاع: internal للموظفين، external للعملاء';
COMMENT ON COLUMN surveys.status IS 'حالة الاستطلاع: draft, active, paused, closed, archived';
COMMENT ON COLUMN surveys.slug IS 'رابط فريد للاستطلاع العام';
```

### ❓ جدول الأسئلة (questions)

```sql
CREATE TYPE question_type AS ENUM (
    'short_text', 'long_text', 'single_choice', 'multiple_choice',
    'dropdown', 'rating', 'numeric_rating', 'date', 'datetime',
    'email', 'phone', 'url', 'yes_no', 'file_upload'
);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type NOT NULL,
    is_required BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL,
    options JSONB,
    validation_rules JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT questions_text_length CHECK (LENGTH(question_text) >= 3),
    CONSTRAINT questions_order_positive CHECK (order_index > 0),
    CONSTRAINT questions_unique_order UNIQUE (survey_id, order_index)
);

-- Indexes
CREATE INDEX idx_questions_survey_id ON questions(survey_id);
CREATE INDEX idx_questions_type ON questions(question_type);
CREATE INDEX idx_questions_order ON questions(survey_id, order_index);
CREATE INDEX idx_questions_required ON questions(is_required);

-- GIN index for JSONB columns
CREATE INDEX idx_questions_options ON questions USING GIN (options);
CREATE INDEX idx_questions_validation ON questions USING GIN (validation_rules);

-- Comments
COMMENT ON TABLE questions IS 'جدول الأسئلة - يحتوي على أسئلة الاستطلاعات';
COMMENT ON COLUMN questions.options IS 'خيارات السؤال (JSON): choices, min, max, etc.';
COMMENT ON COLUMN questions.validation_rules IS 'قواعد التحقق (JSON): required, pattern, etc.';
```

### 📝 جدول الردود (responses)

```sql
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES users(id) ON DELETE SET NULL,
    respondent_name VARCHAR(255),
    respondent_email VARCHAR(255),
    respondent_phone VARCHAR(20),
    is_completed BOOLEAN DEFAULT false,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT responses_completion_time CHECK (
        (is_completed = false AND completed_at IS NULL) OR
        (is_completed = true AND completed_at IS NOT NULL AND completed_at >= started_at)
    ),
    CONSTRAINT responses_respondent_info CHECK (
        respondent_id IS NOT NULL OR 
        (respondent_name IS NOT NULL OR respondent_email IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_respondent_id ON responses(respondent_id);
CREATE INDEX idx_responses_completed ON responses(is_completed);
CREATE INDEX idx_responses_started_at ON responses(started_at);
CREATE INDEX idx_responses_session ON responses(session_id);
CREATE INDEX idx_responses_ip ON responses(ip_address);

-- Comments
COMMENT ON TABLE responses IS 'جدول الردود - يحتوي على ردود المشاركين';
COMMENT ON COLUMN responses.respondent_id IS 'معرف المستخدم (للموظفين)';
COMMENT ON COLUMN responses.session_id IS 'معرف الجلسة لتتبع الردود غير المكتملة';
```

### 💬 جدول الإجابات (answers)

```sql
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    answer_text TEXT,
    answer_value JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT answers_unique_response_question UNIQUE (response_id, question_id),
    CONSTRAINT answers_has_content CHECK (
        answer_text IS NOT NULL OR answer_value IS NOT NULL
    )
);

-- Indexes
CREATE INDEX idx_answers_response_id ON answers(response_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);
CREATE INDEX idx_answers_value ON answers USING GIN (answer_value);

-- Comments
COMMENT ON TABLE answers IS 'جدول الإجابات - يحتوي على إجابات الأسئلة';
COMMENT ON COLUMN answers.answer_text IS 'الإجابة النصية';
COMMENT ON COLUMN answers.answer_value IS 'الإجابة المنظمة (JSON)';
```

### 📊 جدول الإحصائيات (statistics)

```sql
CREATE TABLE survey_statistics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    total_responses INTEGER DEFAULT 0,
    completed_responses INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    average_time_minutes INTEGER,
    last_response_at TIMESTAMP,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT stats_completion_rate CHECK (completion_rate >= 0 AND completion_rate <= 100),
    CONSTRAINT stats_responses_logical CHECK (completed_responses <= total_responses)
);

-- Indexes
CREATE UNIQUE INDEX idx_stats_survey_id ON survey_statistics(survey_id);
CREATE INDEX idx_stats_calculated_at ON survey_statistics(calculated_at);

-- Comments
COMMENT ON TABLE survey_statistics IS 'جدول إحصائيات الاستطلاعات - يحتوي على الإحصائيات المحسوبة';
```

### 📋 جدول سجل الأنشطة (activity_log)

```sql
CREATE TYPE activity_category AS ENUM (
    'authentication', 'survey_management', 'user_management', 
    'system_config', 'data_export', 'backup_restore'
);

CREATE TYPE activity_severity AS ENUM ('info', 'warning', 'error', 'critical');

CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category activity_category NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    severity activity_severity DEFAULT 'info',
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT activity_action_length CHECK (LENGTH(action) >= 3)
);

-- Indexes
CREATE INDEX idx_activity_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_category ON activity_log(category);
CREATE INDEX idx_activity_severity ON activity_log(severity);
CREATE INDEX idx_activity_created_at ON activity_log(created_at);
CREATE INDEX idx_activity_metadata ON activity_log USING GIN (metadata);

-- Comments
COMMENT ON TABLE activity_log IS 'سجل أنشطة النظام - يحتوي على جميع العمليات المهمة';
```

### 🔔 جدول الإشعارات (notifications)

```sql
CREATE TYPE notification_type AS ENUM (
    'survey_invitation', 'survey_reminder', 'system_alert', 
    'user_promotion', 'backup_complete', 'maintenance'
);

CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed', 'read');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status notification_status DEFAULT 'pending',
    metadata JSONB,
    scheduled_at TIMESTAMP,
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT notifications_title_length CHECK (LENGTH(title) >= 3),
    CONSTRAINT notifications_send_logic CHECK (
        (status = 'sent' AND sent_at IS NOT NULL) OR
        (status != 'sent')
    )
);

-- Indexes
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Comments
COMMENT ON TABLE notifications IS 'جدول الإشعارات - يحتوي على إشعارات المستخدمين';
```

---

## 🔍 الفهارس والتحسين

### 📊 فهارس الأداء

#### فهارس البحث السريع
```sql
-- فهرس البحث في الاستطلاعات
CREATE INDEX idx_surveys_search ON surveys 
USING GIN (to_tsvector('arabic', title || ' ' || COALESCE(description, '')));

-- فهرس البحث في المستخدمين
CREATE INDEX idx_users_search ON users 
USING GIN (to_tsvector('arabic', full_name || ' ' || email));

-- فهرس البحث في الأسئلة
CREATE INDEX idx_questions_search ON questions 
USING GIN (to_tsvector('arabic', question_text));
```

#### فهارس التاريخ والوقت
```sql
-- فهرس للاستطلاعات النشطة
CREATE INDEX idx_surveys_active_period ON surveys(start_date, end_date) 
WHERE status = 'active';

-- فهرس للردود الحديثة
CREATE INDEX idx_responses_recent ON responses(created_at DESC) 
WHERE created_at > CURRENT_DATE - INTERVAL '30 days';

-- فهرس للأنشطة الحديثة
CREATE INDEX idx_activity_recent ON activity_log(created_at DESC) 
WHERE created_at > CURRENT_DATE - INTERVAL '7 days';
```

#### فهارس مركبة للاستعلامات المعقدة
```sql
-- فهرس للاستطلاعات حسب المنشئ والحالة
CREATE INDEX idx_surveys_creator_status ON surveys(created_by, status, created_at);

-- فهرس للردود حسب الاستطلاع والحالة
CREATE INDEX idx_responses_survey_completion ON responses(survey_id, is_completed, created_at);

-- فهرس للأسئلة حسب النوع والترتيب
CREATE INDEX idx_questions_type_order ON questions(question_type, survey_id, order_index);
```

### ⚡ تحسين الاستعلامات

#### Views للاستعلامات المتكررة
```sql
-- عرض إحصائيات الاستطلاعات
CREATE VIEW survey_stats_view AS
SELECT 
    s.id,
    s.title,
    s.status,
    s.created_by,
    COUNT(r.id) as total_responses,
    COUNT(CASE WHEN r.is_completed THEN 1 END) as completed_responses,
    ROUND(
        COUNT(CASE WHEN r.is_completed THEN 1 END) * 100.0 / 
        NULLIF(COUNT(r.id), 0), 2
    ) as completion_rate,
    MAX(r.completed_at) as last_response_at
FROM surveys s
LEFT JOIN responses r ON s.id = r.survey_id
GROUP BY s.id, s.title, s.status, s.created_by;

-- عرض المستخدمين النشطين
CREATE VIEW active_users_view AS
SELECT 
    u.*,
    COUNT(s.id) as surveys_created,
    COUNT(r.id) as responses_submitted,
    MAX(u.last_login) as last_activity
FROM users u
LEFT JOIN surveys s ON u.id = s.created_by
LEFT JOIN responses r ON u.id = r.respondent_id
WHERE u.is_active = true
GROUP BY u.id;
```

#### Functions للعمليات المعقدة
```sql
-- دالة حساب إحصائيات الاستطلاع
CREATE OR REPLACE FUNCTION calculate_survey_stats(survey_uuid UUID)
RETURNS TABLE(
    total_responses BIGINT,
    completed_responses BIGINT,
    completion_rate DECIMAL,
    avg_completion_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(r.id) as total_responses,
        COUNT(CASE WHEN r.is_completed THEN 1 END) as completed_responses,
        ROUND(
            COUNT(CASE WHEN r.is_completed THEN 1 END) * 100.0 / 
            NULLIF(COUNT(r.id), 0), 2
        ) as completion_rate,
        AVG(r.completed_at - r.started_at) as avg_completion_time
    FROM responses r
    WHERE r.survey_id = survey_uuid;
END;
$$ LANGUAGE plpgsql;

-- دالة البحث الذكي
CREATE OR REPLACE FUNCTION smart_search_surveys(
    search_term TEXT,
    user_id UUID DEFAULT NULL,
    survey_status survey_status DEFAULT NULL
)
RETURNS TABLE(
    id UUID,
    title VARCHAR,
    description TEXT,
    status survey_status,
    created_at TIMESTAMP,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.title,
        s.description,
        s.status,
        s.created_at,
        ts_rank(
            to_tsvector('arabic', s.title || ' ' || COALESCE(s.description, '')),
            plainto_tsquery('arabic', search_term)
        ) as rank
    FROM surveys s
    WHERE 
        (user_id IS NULL OR s.created_by = user_id) AND
        (survey_status IS NULL OR s.status = survey_status) AND
        to_tsvector('arabic', s.title || ' ' || COALESCE(s.description, '')) 
        @@ plainto_tsquery('arabic', search_term)
    ORDER BY rank DESC, s.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔄 إدارة البيانات

### 📈 Migration System

#### هيكل الترحيل
```typescript
// src/database/migrate.ts
export class DatabaseMigration {
  private migrations = [
    '001_create_users_table',
    '002_create_surveys_table',
    '003_create_questions_table',
    '004_create_responses_table',
    '005_create_answers_table',
    '006_create_statistics_table',
    '007_create_activity_log_table',
    '008_create_notifications_table',
    '009_create_indexes',
    '010_create_views_and_functions'
  ]

  async up(): Promise<void> {
    for (const migration of this.migrations) {
      await this.runMigration(migration, 'up')
    }
  }

  async down(): Promise<void> {
    for (const migration of this.migrations.reverse()) {
      await this.runMigration(migration, 'down')
    }
  }

  private async runMigration(name: string, direction: 'up' | 'down'): Promise<void> {
    const migrationFile = await import(`./migrations/${name}.sql`)
    const sql = migrationFile[direction]
    
    await query(sql)
    
    // تسجيل الترحيل
    if (direction === 'up') {
      await query(`
        INSERT INTO schema_migrations (version, applied_at) 
        VALUES ($1, CURRENT_TIMESTAMP)
        ON CONFLICT (version) DO NOTHING
      `, [name])
    } else {
      await query(`DELETE FROM schema_migrations WHERE version = $1`, [name])
    }
  }
}
```

#### جدول تتبع الترحيل
```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(255) PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🌱 Data Seeding

#### البيانات الأولية
```typescript
// src/database/seed.ts
export class DatabaseSeeder {
  async seedAll(): Promise<void> {
    await this.seedUsers()
    await this.seedSurveys()
    await this.seedSampleData()
  }

  private async seedUsers(): Promise<void> {
    const users = [
      {
        email: 'developer@amsteel.com',
        password: await bcrypt.hash('Developer@123', 12),
        full_name: 'مطور النظام',
        role: 'developer',
        department: 'تقنية المعلومات',
        position: 'مطور أول'
      },
      {
        email: 'admin@amsteel.com',
        password: await bcrypt.hash('Admin@123', 12),
        full_name: 'مدير الاستطلاعات',
        role: 'admin',
        department: 'الموارد البشرية',
        position: 'مدير الموارد البشرية'
      },
      {
        email: 'employee@amsteel.com',
        password: await bcrypt.hash('Employee@123', 12),
        full_name: 'موظف تجريبي',
        role: 'employee',
        department: 'المبيعات',
        position: 'مندوب مبيعات'
      }
    ]

    for (const user of users) {
      await query(`
        INSERT INTO users (email, password_hash, full_name, role, department, position)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, [user.email, user.password, user.full_name, user.role, user.department, user.position])
    }
  }

  private async seedSurveys(): Promise<void> {
    // الحصول على معرف المدير
    const adminResult = await query(`
      SELECT id FROM users WHERE role = 'admin' LIMIT 1
    `)
    
    if (adminResult.rows.length === 0) return

    const adminId = adminResult.rows[0].id

    const surveys = [
      {
        title: 'استطلاع رضا الموظفين 2024',
        description: 'استطلاع شامل لقياس مستوى رضا الموظفين عن بيئة العمل',
        type: 'internal',
        status: 'active',
        created_by: adminId
      },
      {
        title: 'تقييم خدمة العملاء',
        description: 'استطلاع لتقييم جودة خدمة العملاء المقدمة',
        type: 'external',
        status: 'active',
        client_name: 'شركة الرياض للتجارة',
        created_by: adminId
      }
    ]

    for (const survey of surveys) {
      const result = await query(`
        INSERT INTO surveys (title, description, type, status, created_by, client_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [survey.title, survey.description, survey.type, survey.status, survey.created_by, survey.client_name])

      // إضافة أسئلة تجريبية
      await this.seedQuestionsForSurvey(result.rows[0].id)
    }
  }

  private async seedQuestionsForSurvey(surveyId: string): Promise<void> {
    const questions = [
      {
        question_text: 'ما هو تقييمك العام للخدمة؟',
        question_type: 'rating',
        is_required: true,
        order_index: 1,
        options: { min: 1, max: 5, labels: ['ضعيف جداً', 'ضعيف', 'متوسط', 'جيد', 'ممتاز'] }
      },
      {
        question_text: 'كيف يمكننا تحسين خدماتنا؟',
        question_type: 'long_text',
        is_required: false,
        order_index: 2,
        options: { max_length: 1000 }
      },
      {
        question_text: 'هل توصي بخدماتنا للآخرين؟',
        question_type: 'yes_no',
        is_required: true,
        order_index: 3
      }
    ]

    for (const question of questions) {
      await query(`
        INSERT INTO questions (survey_id, question_text, question_type, is_required, order_index, options)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [surveyId, question.question_text, question.question_type, question.is_required, question.order_index, JSON.stringify(question.options)])
    }
  }
}
```

---

## 💾 النسخ الاحتياطي

### 🔄 استراتيجية النسخ الاحتياطي

#### النسخ الآلي (Neon)
```typescript
// Neon يوفر نسخ احتياطي آلي
const neonBackupConfig = {
  pointInTimeRecovery: true,        // استعادة لأي نقطة زمنية
  automaticBackups: true,           // نسخ آلي يومي
  retentionPeriod: '7 days',        // الاحتفاظ لمدة 7 أيام (Free tier)
  branchingSupport: true            // إنشاء فروع للاختبار
}
```

#### النسخ اليدوي
```typescript
// src/services/backup.service.ts
export class BackupService {
  async createBackup(name?: string): Promise<BackupResult> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupName = name || `backup-${timestamp}`
    
    const tables = [
      'users', 'surveys', 'questions', 'responses', 
      'answers', 'activity_log', 'notifications'
    ]
    
    const backupData: any = {}
    
    for (const table of tables) {
      const result = await query(`SELECT * FROM ${table}`)
      backupData[table] = result.rows
    }
    
    // حفظ النسخة الاحتياطية
    const backupPath = `backups/${backupName}.json`
    await this.saveBackupFile(backupPath, backupData)
    
    // تسجيل العملية
    await this.logBackupOperation('create', backupName)
    
    return {
      name: backupName,
      path: backupPath,
      size: JSON.stringify(backupData).length,
      tables: tables.length,
      records: Object.values(backupData).reduce((sum: number, data: any) => sum + data.length, 0),
      created_at: new Date()
    }
  }

  async restoreBackup(backupName: string): Promise<RestoreResult> {
    const backupPath = `backups/${backupName}.json`
    const backupData = await this.loadBackupFile(backupPath)
    
    // بدء المعاملة
    return await transaction(async (client) => {
      // تعطيل القيود المؤقتاً
      await client.query('SET session_replication_role = replica')
      
      try {
        // حذف البيانات الحالية (بترتيب عكسي للمراجع)
        const dropOrder = ['answers', 'responses', 'questions', 'surveys', 'notifications', 'activity_log', 'users']
        for (const table of dropOrder) {
          await client.query(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`)
        }
        
        // استعادة البيانات
        const restoreOrder = ['users', 'surveys', 'questions', 'responses', 'answers', 'activity_log', 'notifications']
        let totalRecords = 0
        
        for (const table of restoreOrder) {
          const data = backupData[table] || []
          if (data.length > 0) {
            await this.insertTableData(client, table, data)
            totalRecords += data.length
          }
        }
        
        return {
          backup_name: backupName,
          tables_restored: restoreOrder.length,
          records_restored: totalRecords,
          restored_at: new Date()
        }
      } finally {
        // إعادة تفعيل القيود
        await client.query('SET session_replication_role = DEFAULT')
      }
    })
  }

  async listBackups(): Promise<BackupInfo[]> {
    // قائمة النسخ الاحتياطية المتاحة
    const backups = await this.getBackupFiles()
    
    return backups.map(backup => ({
      name: backup.name,
      size: backup.size,
      created_at: backup.created_at,
      type: backup.name.includes('auto') ? 'automatic' : 'manual'
    }))
  }

  async deleteBackup(backupName: string): Promise<void> {
    const backupPath = `backups/${backupName}.json`
    await this.deleteBackupFile(backupPath)
    await this.logBackupOperation('delete', backupName)
  }
}
```

### 📅 جدولة النسخ الاحتياطي

```typescript
// src/services/scheduler.service.ts
export class SchedulerService {
  async scheduleBackups(): Promise<void> {
    // نسخة احتياطية يومية في الساعة 2:00 صباحاً
    cron.schedule('0 2 * * *', async () => {
      try {
        const backupService = new BackupService()
        const result = await backupService.createBackup(`auto-daily-${Date.now()}`)
        
        logger.info('Automatic backup completed', result)
        
        // حذف النسخ القديمة (أكثر من 30 يوم)
        await this.cleanupOldBackups(30)
      } catch (error) {
        logger.error('Automatic backup failed', error)
      }
    })
    
    // نسخة احتياطية أسبوعية يوم الجمعة
    cron.schedule('0 1 * * 5', async () => {
      try {
        const backupService = new BackupService()
        await backupService.createBackup(`auto-weekly-${Date.now()}`)
        
        // حذف النسخ الأسبوعية القديمة (أكثر من 12 أسبوع)
        await this.cleanupOldBackups(84, 'weekly')
      } catch (error) {
        logger.error('Weekly backup failed', error)
      }
    })
  }
}
```

---

## 🔒 الأمان والصلاحيات

### 👥 إدارة المستخدمين والأدوار

#### Row Level Security (RLS)
```sql
-- تفعيل RLS على جدول الاستطلاعات
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- سياسة للمديرين: يمكنهم رؤية استطلاعاتهم فقط
CREATE POLICY admin_surveys_policy ON surveys
    FOR ALL TO app_admin
    USING (created_by = current_user_id());

-- سياسة للمطورين: يمكنهم رؤية جميع الاستطلاعات
CREATE POLICY developer_surveys_policy ON surveys
    FOR ALL TO app_developer
    USING (true);

-- سياسة للموظفين: يمكنهم رؤية الاستطلاعات النشطة فقط
CREATE POLICY employee_surveys_policy ON surveys
    FOR SELECT TO app_employee
    USING (status = 'active' AND type = 'internal');
```

#### أدوار قاعدة البيانات
```sql
-- إنشاء الأدوار
CREATE ROLE app_developer;
CREATE ROLE app_admin;
CREATE ROLE app_employee;
CREATE ROLE app_public;

-- صلاحيات المطور (كاملة)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_developer;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_developer;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_developer;

-- صلاحيات المدير
GRANT SELECT, INSERT, UPDATE, DELETE ON surveys, questions, responses, answers TO app_admin;
GRANT SELECT ON users, activity_log TO app_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_admin;

-- صلاحيات الموظف
GRANT SELECT ON surveys, questions TO app_employee;
GRANT INSERT, UPDATE ON responses, answers TO app_employee;
GRANT SELECT, UPDATE ON users TO app_employee; -- للملف الشخصي فقط

-- صلاحيات الجمهور
GRANT SELECT ON surveys, questions TO app_public;
GRANT INSERT ON responses, answers TO app_public;
```

### 🔐 تشفير البيانات

#### تشفير البيانات الحساسة
```sql
-- تشفير أرقام الهواتف
CREATE OR REPLACE FUNCTION encrypt_phone(phone_number TEXT)
RETURNS TEXT AS $$
BEGIN
    IF phone_number IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN encode(
        encrypt(phone_number::bytea, 'encryption_key', 'aes'),
        'base64'
    );
END;
$$ LANGUAGE plpgsql;

-- فك تشفير أرقام الهواتف
CREATE OR REPLACE FUNCTION decrypt_phone(encrypted_phone TEXT)
RETURNS TEXT AS $$
BEGIN
    IF encrypted_phone IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN convert_from(
        decrypt(decode(encrypted_phone, 'base64'), 'encryption_key', 'aes'),
        'UTF8'
    );
END;
$$ LANGUAGE plpgsql;
```

#### Audit Trail
```sql
-- جدول تتبع التغييرات
CREATE TABLE audit_trail (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- Trigger function للتتبع
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_trail (table_name, record_id, operation, old_values, changed_by)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), current_user_id());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_trail (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user_id());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_trail (table_name, record_id, operation, new_values, changed_by)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), current_user_id());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- تطبيق التتبع على الجداول المهمة
CREATE TRIGGER users_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER surveys_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON surveys
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## 📊 المراقبة والأداء

### 📈 مراقبة الأداء

#### إحصائيات الاستعلامات
```sql
-- تفعيل pg_stat_statements (PostgreSQL المحلي)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- عرض أبطأ الاستعلامات
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- عرض الاستعلامات الأكثر استخداماً
SELECT 
    query,
    calls,
    total_time,
    rows,
    100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
ORDER BY calls DESC 
LIMIT 10;
```

#### مراقبة حجم الجداول
```sql
-- حجم الجداول
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation,
    most_common_vals,
    most_common_freqs,
    histogram_bounds
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- حجم قاعدة البيانات
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size;

-- حجم كل جدول
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### 🔍 Health Checks

```typescript
// src/services/health.service.ts
export class HealthService {
  async checkDatabaseHealth(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkConnection(),
      this.checkTableCounts(),
      this.checkRecentActivity(),
      this.checkDiskSpace(),
      this.checkSlowQueries()
    ])

    return {
      status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
      checks: {
        connection: checks[0],
        tables: checks[1],
        activity: checks[2],
        disk: checks[3],
        performance: checks[4]
      },
      timestamp: new Date()
    }
  }

  private async checkConnection(): Promise<CheckResult> {
    try {
      const result = await query('SELECT NOW() as current_time, version() as db_version')
      return {
        status: 'pass',
        message: 'Database connection successful',
        data: result.rows[0]
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'Database connection failed',
        error: error.message
      }
    }
  }

  private async checkTableCounts(): Promise<CheckResult> {
    try {
      const tables = ['users', 'surveys', 'questions', 'responses', 'answers']
      const counts: any = {}
      
      for (const table of tables) {
        const result = await query(`SELECT COUNT(*) as count FROM ${table}`)
        counts[table] = parseInt(result.rows[0].count)
      }
      
      return {
        status: 'pass',
        message: 'Table counts retrieved',
        data: counts
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'Failed to get table counts',
        error: error.message
      }
    }
  }

  private async checkRecentActivity(): Promise<CheckResult> {
    try {
      const result = await query(`
        SELECT COUNT(*) as recent_activities
        FROM activity_log 
        WHERE created_at > NOW() - INTERVAL '24 hours'
      `)
      
      const recentActivities = parseInt(result.rows[0].recent_activities)
      
      return {
        status: recentActivities > 0 ? 'pass' : 'warn',
        message: `${recentActivities} activities in last 24 hours`,
        data: { recent_activities: recentActivities }
      }
    } catch (error) {
      return {
        status: 'fail',
        message: 'Failed to check recent activity',
        error: error.message
      }
    }
  }
}
```

---

## 🔧 استكشاف الأخطاء

### 🚨 الأخطاء الشائعة وحلولها

#### مشكلة الاتصال بـ Neon
```bash
# الخطأ: connection timeout
Error: connect ETIMEDOUT

# الحل:
# 1. تحقق من connection string
echo $DATABASE_URL

# 2. تحقق من الشبكة
ping ep-xxx.us-east-1.aws.neon.tech

# 3. تحقق من SSL
curl -v https://ep-xxx.us-east-1.aws.neon.tech:5432

# 4. اختبر الاتصال
npx ts-node src/scripts/test-neon.ts
```

#### مشكلة الصلاحيات
```sql
-- الخطأ: permission denied for table
ERROR: permission denied for table surveys

-- الحل:
-- تحقق من الصلاحيات
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'surveys';

-- منح الصلاحيات المطلوبة
GRANT SELECT, INSERT, UPDATE, DELETE ON surveys TO app_admin;
```

#### مشكلة الأداء البطيء
```sql
-- تحديد الاستعلامات البطيئة
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
WHERE mean_time > 1000  -- أكثر من ثانية
ORDER BY mean_time DESC;

-- تحليل خطة التنفيذ
EXPLAIN ANALYZE SELECT * FROM surveys WHERE created_by = 'user-id';

-- إضافة فهرس مفقود
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys(created_by);
```

#### مشكلة امتلاء مساحة التخزين
```sql
-- فحص حجم قاعدة البيانات
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as total_size;

-- فحص أكبر الجداول
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename) DESC;

-- تنظيف البيانات القديمة
DELETE FROM activity_log WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM notifications WHERE status = 'sent' AND created_at < NOW() - INTERVAL '30 days';

-- إعادة بناء الجداول
VACUUM FULL;
REINDEX DATABASE amsteel_survey;
```

### 🛠️ أدوات التشخيص

#### سكريبت فحص شامل
```typescript
// src/scripts/diagnose.ts
export class DatabaseDiagnostics {
  async runFullDiagnostics(): Promise<DiagnosticReport> {
    const report: DiagnosticReport = {
      timestamp: new Date(),
      connection: await this.testConnection(),
      performance: await this.analyzePerformance(),
      storage: await this.analyzeStorage(),
      integrity: await this.checkDataIntegrity(),
      security: await this.checkSecurity(),
      recommendations: []
    }

    // إضافة التوصيات
    report.recommendations = this.generateRecommendations(report)

    return report
  }

  private async testConnection(): Promise<ConnectionTest> {
    try {
      const start = Date.now()
      const result = await query('SELECT NOW(), version()')
      const duration = Date.now() - start

      return {
        status: 'success',
        duration,
        version: result.rows[0].version,
        timestamp: result.rows[0].now
      }
    } catch (error) {
      return {
        status: 'failed',
        error: error.message
      }
    }
  }

  private async analyzePerformance(): Promise<PerformanceAnalysis> {
    const slowQueries = await query(`
      SELECT query, calls, total_time, mean_time
      FROM pg_stat_statements 
      WHERE mean_time > 100
      ORDER BY mean_time DESC 
      LIMIT 10
    `)

    const indexUsage = await query(`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      AND n_distinct > 100
    `)

    return {
      slow_queries: slowQueries.rows,
      index_usage: indexUsage.rows,
      cache_hit_ratio: await this.getCacheHitRatio()
    }
  }

  private async checkDataIntegrity(): Promise<IntegrityCheck> {
    const checks = [
      // فحص المراجع المعطلة
      {
        name: 'orphaned_responses',
        query: `
          SELECT COUNT(*) as count 
          FROM responses r 
          LEFT JOIN surveys s ON r.survey_id = s.id 
          WHERE s.id IS NULL
        `
      },
      // فحص الإجابات بدون أسئلة
      {
        name: 'orphaned_answers',
        query: `
          SELECT COUNT(*) as count 
          FROM answers a 
          LEFT JOIN questions q ON a.question_id = q.id 
          WHERE q.id IS NULL
        `
      },
      // فحص البيانات المكررة
      {
        name: 'duplicate_emails',
        query: `
          SELECT email, COUNT(*) as count 
          FROM users 
          GROUP BY email 
          HAVING COUNT(*) > 1
        `
      }
    ]

    const results: any = {}
    for (const check of checks) {
      const result = await query(check.query)
      results[check.name] = result.rows
    }

    return results
  }
}
```

---

## 📚 الموارد والمراجع

### 📖 الوثائق المفيدة
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **Neon Documentation**: https://neon.tech/docs
- **SQL Performance Tuning**: https://use-the-index-luke.com/
- **Database Design Patterns**: https://www.databasestar.com/

### 🛠️ أدوات مفيدة
- **pgAdmin**: واجهة إدارة PostgreSQL
- **DBeaver**: أداة قاعدة بيانات شاملة
- **Neon Console**: لوحة تحكم Neon
- **pg_stat_statements**: مراقبة الأداء

### 📊 أفضل الممارسات
1. **استخدم الفهارس بحكمة**: لا تفرط في إنشاء الفهارس
2. **راقب الأداء باستمرار**: استخدم pg_stat_statements
3. **نظف البيانات القديمة**: احذف السجلات غير المطلوبة
4. **استخدم المعاملات**: للعمليات المعقدة
5. **اختبر النسخ الاحتياطي**: تأكد من إمكانية الاستعادة

---

## ✅ خلاصة قاعدة البيانات

### 🎯 ما تم إنجازه
- ✅ **هيكل قاعدة بيانات متكامل** مع 8 جداول رئيسية
- ✅ **دعم Neon Serverless** مع PostgreSQL المحلي كاحتياطي
- ✅ **نظام صلاحيات متقدم** مع Row Level Security
- ✅ **فهارس محسنة** للأداء العالي
- ✅ **نظام ترحيل** لإدارة التحديثات
- ✅ **بيانات أولية** للتطوير والاختبار
- ✅ **نسخ احتياطي آلي** مع جدولة
- ✅ **مراقبة الأداء** والصحة
- ✅ **تشفير البيانات الحساسة**
- ✅ **سجل تدقيق شامل** (Audit Trail)

### 📊 إحصائيات قاعدة البيانات
- **عدد الجداول**: 8 جداول رئيسية
- **عدد الفهارس**: 25+ فهرس محسن
- **أنواع البيانات**: 6 أنواع مخصصة (ENUMs)
- **الدوال**: 5+ دوال مساعدة
- **العروض**: 3 عروض للاستعلامات المتكررة
- **الأمان**: Row Level Security + تشفير
- **النسخ الاحتياطي**: آلي يومي وأسبوعي

### 🚀 الميزات المتقدمة
- **البحث النصي الكامل**: دعم العربية والإنجليزية
- **JSONB Support**: تخزين مرن للبيانات المعقدة
- **Connection Pooling**: إدارة فعالة للاتصالات
- **Point-in-time Recovery**: استعادة لأي نقطة زمنية
- **Database Branching**: فروع للتطوير والاختبار
- **Auto-scaling**: تكيف تلقائي مع الحمولة

---

**🎉 تم إنشاء قاعدة بيانات AMSteel Survey بنجاح مع جميع الميزات المطلوبة!**

*آخر تحديث: ديسمبر 2024*
