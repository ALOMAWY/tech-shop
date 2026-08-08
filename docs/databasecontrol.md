# دليل التحكم بقاعدة البيانات — TechShop Database Control

> دليل عملي للوصول إلى قاعدة بيانات المتجر والتحكم بها يدويًا أو عبر الطرفية (PowerShell / Windows).
> المرجع التقني: PostgreSQL 16 هي القاعدة الوحيدة المعتمدة في المشروع (انظر `AGENTS.md` §2 و§5).

---

## 1. أولًا: هل القاعدة شغّالة عندك الآن؟

**تحقّق سريع** من مجلد المشروع:

```powershell
docker --version                       # هل Docker مثبّت؟
Get-NetTCPConnection -LocalPort 5432   # هل هناك من يستمع على منفذ القاعدة؟
Get-Service -Name "*postgres*"         # هل توجد خدمة PostgreSQL على النظام؟
Get-Command psql                       # هل يوجد عميل psql في المسار؟
```

إذا عادت الأوامر فارغة أو "غير معروفة" → القاعدة **ليست شغّالة** في هذا الجهاز،
ومراحل M0–M2 تعمل حاليًا على بيانات وهمية (`src/features/products/mock.ts`).
بمجرد تشغيل Postgres (القسم 2) تبدأ القاعدة الحقيقية بالعمل مع طبقة Prisma.

---

## 2. تشغيل القاعدة عبر Docker (الطريقة المعتمدة في المشروع)

ملف `compose.yaml` جاهز في جذر المشروع:

```powershell
# 1) شغّل حاوية PostgreSQL 16 (من مجلد المشروع)
docker compose up -d postgres

# 2) تأكّد أن الحاوية حيّة
docker ps --filter "name=techshop-postgres"

# 3) تحقّق من الاتصال عبر Prisma وأنشئ الجداول إن كانت جديدة
pnpm prisma validate
pnpm prisma migrate dev
```

إعدادات الحاوية (من `compose.yaml`):

| العنصر | القيمة |
|---|---|
| Container | `techshop-postgres` |
| User | `techshop` |
| Password | `techshop` |
| Database | `techshop` |
| Port | `5432` |
| Volume | `techshop_pgdata` (البيانات تبقى بين عمليات إعادة التشغيل) |

اتصال التطبيق في `.env` (لا يُرفع إلى Git):

```
DATABASE_URL="postgresql://techshop:techshop@localhost:5432/techshop"
```

> ⚠️ حاليًا لا يوجد Docker على هذا الجهاز (الأمر `docker` غير متوفّر).
> عند تثبيت **Docker Desktop** وتشغيله، تكرّر خطوة `docker compose up -d postgres` فقط.

---

## 3. الوصول المباشر عبر psql (الطرفية)

### 3.1 داخل حاوية Docker (الأسهل — لا حاجة لتثبيت عميل)

```powershell
docker exec -it techshop-postgres psql -U techshop -d techshop
```

تفتح جلسة SQL تفاعلية. جرّب أول الأوامر:

```sql
\conninfo          -- معلومات الاتصال
\l                 -- قائمة القواعد
\dt                -- قائمة الجداول
\d "User"          -- بنية جدول محدد (Prisma يسمّي الجداول باسم النموذج)
\q                 -- خروج
```

### 3.2 بدون Docker — عبر psql مثبّت على Windows

```powershell
psql "postgresql://techshop:techshop@localhost:5432/techshop"
```

> لا يوجد `psql` مثبّت حاليًا. لتثبيته على Windows: ثبّت PostgreSQL الرسمية،
> أو استخدم `winget install local.PostgreSQL` ثم أضف مجلد `bin` إلى PATH،
> أو اكتفِ بالطريقة 3.1 عبر Docker.

### 3.3 تنفيذ استعلام واحد بدون جلسة تفاعلية

```powershell
psql "postgresql://techshop:techshop@localhost:5432/techshop" -c "SELECT count(*) FROM \"User\";"
```

---

## 4. الوصول عبر Prisma CLI (الجسر بين التطبيق وSQL)

| المهمة | الأمر |
|---|---|
| التحقق من صحة schema | `pnpm prisma validate` |
| إنشاء الترحيلات (بعد كل تغيير في schema) | `pnpm prisma migrate dev --name <وصف>` |
| حالة الترحيلات | `pnpm prisma migrate status` |
| زرع البيانات الأولية (owner + 4 أصناف) | `pnpm prisma db seed` |
| واجهة تصوّر قاعدة البيانات (GUI) | `pnpm prisma studio` |

`prisma studio` تفتح لوحة في المتصفح (`http://localhost:5555`):
- تصفّح كل الجداول والعلاقات.
- إنشاء/تعديل/حذف صفوف مباشرة بدون كتابة SQL.
- مثالية عندما لا تريد التعامل مع الطرفية.

---

## 5. استعلامات SQL شائعة لمتجر الإلكترونيات

كل الاستعلامات تعمل داخل psql (القسم 3) أو أي أداة SQL.

### قائمة الجداول
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

### المستخدمون والأدوار
```sql
SELECT id, email, role, rating, "trustScore", "isBlocked" FROM "User";
```

### الأصناف (تأتي من قاعدة البيانات — ليست مرمّزة في الكود)
```sql
SELECT name, slug, color, "order" FROM "Category" ORDER BY "order";
```

### المنتجات مع أصنافها
```sql
SELECT p.name, c.name AS category, p.quantity, p.price
FROM "Product" p
JOIN "Category" c ON c.id = p."categoryId";
```

### المنتجات منخفضة المخزون (أقل من 50)
```sql
SELECT name, quantity FROM "Product" WHERE quantity < 50 ORDER BY quantity;
```

### الطلبات وحالة السداد
```sql
SELECT o.id, u.email, o.status, o."paymentMethod", o."createdAt"
FROM "Order" o
JOIN "User" u ON u.id = o."customerId"
ORDER BY o."createdAt" DESC;
```

### العملاء المحظورون
```sql
SELECT email, "isBlocked" FROM "User" WHERE "isBlocked" = true;
```

> ⚠️ الأعمدة المركّبة تُكتب بعلامات اقتباس مزدوجة لأن Prisma يخرّجها بهذا الشكل
> (مثل `"trustScore"` و`"isBlocked"`) — لأن أسماءها PascalCase.

---

## 6. بذرة البيانات الأولية (seed)

قاعدة فارغة بعد أول `migrate dev` لا تقبل أي تسجيل دخول. نفّذ البذرة:

```powershell
pnpm prisma db seed
```

تنشئ:
- مالك واحد: `owner@techshop.iq` / `Owner-Admin-123` (كلمة مرور مشفّرة bcrypt cost 12).
  - يمكن تخصيصها عبر متغيرات البيئة `OWNER_EMAIL` / `OWNER_PASSWORD`.
- 4 أصناف أساسية بألوان LED: accessories (copper) وessential-tools (mint) وsmall-parts (blue) وaudio-kb-mice (purple).
- 4 منتجات نموذجية.

> التسجيل مفتوح فقط من قِبل المالك (لا يوجد "تسجيل ذاتي") — لا تحذف حساب المالك.

---

## 7. إجراء تغيير في schema بعد اليوم

```powershell
# 1) عدّل prisma/schema.prisma
# 2) أنشئ ترحيلًا (لا تستخدم prisma db push على migrations مرمّزة)
pnpm prisma migrate dev --name add-something
# 3) بعد أي ترحيل يغيّر البيانات، حدّث البذرة وشغّلها
pnpm prisma db seed
```

القاعدة الذهبية من `AGENTS.md §6`: استخدم `migrate dev`، ولا تستخدم `db push` على الترحيلات المرمّزة في Git.

---

## 8. مشاكل متكررة وحلولها

| العرض | السبب | الحل |
|---|---|---|
| `ECONNREFUSED` عند الاتصال | Postgres غير عامل | `docker compose up -d postgres` ثم انتظر ثوانٍ |
| `PrismaClientInitializationError` | عميل Prisma قديم بعد تغيير schema | `pnpm prisma generate` |
| `P1003` قاعدة غير موجودة | قاعدة `techshop` لم تُنشأ | أعد تشغيل الحاوية بحجم جديد أو أنشئها يدويًا |
| `P1012` خطأ في validate | schema غير سليم (مثلًا بقيت `sqlite`) | تأكّد أن أعلى `schema.prisma` هو `postgresql` + `env("DATABASE_URL")` |
| `authentication failed` | المستخدم/كلمة السر غير متطابقين | تأكّد أن `.env` يساوي `techshop`/`techshop` كما في `compose.yaml` |

---

## 9. ما لا تفعله أبدًا بالقاعدة

- ❌ لا تحذف جدول `"User"` أو تعدّل `trustScore` بلا سبب حقيقي — ثقة العملاء تخصّ المالك.
- ❌ لا تستخدم `trustScore` في استعلام أو واجهة موجّهة للزبون.
- ❌ لا تخزّن كلمات مرور نصية — دائمًا bcrypt cost 12.
- ❌ لا ترسل `passwordHash` أو `trustScore` في أي استجابة API موجّهة للزبون.
- ✅ الخلاصة: القاعدة ليست شغّالة في هذا الجهاز الآن؛ شغّلها أولًا بـ Docker (القسم 2) ثم استخدم أي أداة من هذا الدليل.