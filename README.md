# Education System

מערכת **Full-Stack** לניהול **פנימיות חינוך** ו**תלמידים** משויכים — דמו / פרויקט לימודי עם API מסודר, מסד נתונים ב-SQL Server, ולקוחות ווב.

---

## מה הפרויקט עושה? (תמונה למשתמש ולמגייס)

בשפה פשוטה, המערכת עונה על הצורך לנהל **מוסדות (פנימיות)** ואת **התלמידים** בכל מוסד:

| יכולת | תיאור |
|--------|--------|
| **פנימיות** | רשימת מוסדות עם שם, עיר, סטטוס פעיל/לא פעיל, מספר תלמידים **פעילים**, וגיל ממוצע (לפעילים בלבד). אפשר להוסיף פנימייה, לעדכן שם ועיר, להפעיל או להשבית מוסד, ולמחוק (אם אין תלמידים משויכים). |
| **תלמידים** | לכל פנימייה — רשימת תלמידים (שם, תעודת זהות, גיל, פעיל/לא פעיל). אפשר להוסיף, לערוך ולמחוק. ה-API תומך גם ב-**Upsert** (יצירה או עדכון בקריאה אחת לפי מזהה בגוף הבקשה). |
| **כללי עסק** | גיל תלמיד בטווח מוגדר, תעודת זהות ייחודית, שיבוץ רק לפנימייה **קיימת ופעילה**, מחיקת פנימייה רק כשאין תלמידים. |
| **ממשקים** | לקוח **Angular מודרני** (`edu-management`) — ממשק בעברית עם טבלאות ודיאלוגים; לקוח **AngularJS** (`angularjs-client`) למטלות Hands-On; תיעוד API ב-**Swagger** ובקבצי README בבקאנד. |

**למי זה מתאים בפרויקט:** מנהל מערכת / אחראי רישום שרוצה תמונת מצב על פנימיות ועל תלמידים, בלי להיכנס ל-SQL ידנית.

**מה זה *לא*:** מערכת מלאה לחשבונאות, ציונים או נוכחות — הדגש כאן על **יישות פנימייה**, **יישות תלמיד**, ו-**API עקבי** עם הפרדת שכבות.

## להצגה בראיון עבודה

תזכיר החלטות ארכיטקטורה (למה Stack כזה, למה Dapper, למה interceptors ב-Angular וכו'): [`docs/RAIYON-AVODA.md`](docs/RAIYON-AVODA.md).

---

## מבנה המונוריפו (איפה מה נמצא)

| תיקייה / קובץ | תפקיד |
|----------------|--------|
| **`backend/`** | Web API ב-.NET 10 — שכבות API, Application, Domain, Infrastructure; תיעוד ב-`README.md` ו-`API-README.md`. |
| **`database/migrations/`** | סקריפטי SQL: טבלאות, אינדקסים, פרוצדורה לאגרגציית סטטיסטיקה, seed. |
| **`edu-management/`** | אפליקציית **Angular 21** — UI מודרני; `README.md` עם עץ קבצים מלא. |
| **`angularjs-client/`** | לקוח **AngularJS 1.8** — דוגמה למטלה עם async/await וטיפול בשגיאות. |
| **`docker-compose.yml`** | הרצה מקומית: SQL Server, אתחול סכמה, API. |

---

## מטרת הפרויקט (טכני-מוצרי)

המערכת מאפשרת:
- צפייה ברשימת פנימיות עם סטטיסטיקות תלמידים פעילים.
- ניהול תלמידים (כולל Upsert ב-API) עם ולידציות עסקיות בשרת.
- טיפול אחוד בשגיאות API כולל לוגים ותגובות JSON עקביות.

## Tech Stack

- **Backend:** .NET 10, ASP.NET Core Web API
- **Data Access:** Dapper, Microsoft SQL Server
- **Logging:** Serilog (Console + Rolling File)
- **API Docs:** Swagger / OpenAPI
- **Database:** SQL Server 2022 (Docker)
- **Frontend (מטלה / מודרני):** `angularjs-client` — **AngularJS 1.8** (טבלה, AutoComplete עיר, async/await, טיפול בשגיאות).
- **Frontend (מוצר):** `edu-management` — **Angular 21** (אותו API; שירותים עם `firstValueFrom` ל־async/await).

## ארכיטקטורה

מבנה הפרויקט ב-Backend:

- `backend/src/EducationSystem.API`  
  שכבת API: Controllers, Middleware, Program configuration.
- `backend/src/EducationSystem.Application`  
  חוזים (Interfaces), DTOs, Services, Exceptions.
- `backend/src/EducationSystem.Domain`  
  ישויות ליבה של הדומיין.
- `backend/src/EducationSystem.Infrastructure`  
  Repositories ומימוש גישה ל-SQL באמצעות Dapper.

## Database Migrations

סקריפטים מוכנים תחת `database/migrations`:

1. `01_create_tables.sql` - יצירת DB וטבלאות `EducationPlace`, `Student`.
2. `02_indexes.sql` - יצירת אינדקסים לשיפור ביצועים.
3. `03_stored_procedure.sql` - יצירת `sp_GetEducationPlacesWithStats`.

## דרישות מקדימות

- .NET SDK 10.x
- Node.js 20+
- Docker Desktop פעיל
- SQL Server image: `mcr.microsoft.com/mssql/server:2022-latest`

## הרצת SQL Server עם Docker

```bash
docker pull mcr.microsoft.com/mssql/server:2022-latest

docker run \
  -e "ACCEPT_EULA=Y" \
  -e "SA_PASSWORD=Education@123!" \
  -p 1433:1433 \
  --name education-sql \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

## הרצה מלאה עם Docker Compose

הפרויקט כולל `docker-compose.yml` להרצת:
- `sqlserver` (SQL Server 2022)
- `db-init` (הרצת מיגרציות אוטומטית פעם ראשונה)
- `api` (ASP.NET Core API)

```bash
docker compose up --build -d
```

כתובות (Docker — המיפוי החוצה הוא **5001** כברירת מחדל, כדי להימנע מפורט 5000 שתפוס לעיתים ב-macOS):
- API: `http://localhost:5001`
- `http://localhost:5001/` מפנה אוטומטית ל-Swagger
- Swagger: `http://localhost:5001/swagger/index.html`

לפורט אחר על המחשב המארח:

```bash
API_PUBLISH_PORT=8080 docker compose up --build -d
```

עצירה:

```bash
docker compose down
```

איפוס מלא כולל נתוני DB (volume):

```bash
docker compose down -v
```

## התקנת סכמת בסיס הנתונים

הרץ את הסקריפטים לפי הסדר:

1. `database/migrations/01_create_tables.sql`
2. `database/migrations/02_indexes.sql`
3. `database/migrations/03_stored_procedure.sql`
4. `database/migrations/04_seed_data.sql` (נתוני דמו אידמפוטנטיים)

ניתן להריץ דרך SSMS / Azure Data Studio / sqlcmd.  
ב-Docker Compose, `db-init` מריץ את 01–03 בעת יצירת סכמה חדשה, ואת 04 בכל עלייה (רק אם הטבלאות ריקות).

## הרצת ה-Backend

```bash
cd backend
dotnet build EducationSystem.sln
dotnet run --project src/EducationSystem.API --launch-profile http
```

- API Base URL: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger/index.html` — **Summary** בעברית (מה הפעולה ומה חוזר בגוף); **Remarks** באנגלית טכני (HTTP, DTOs, מקור נתונים).

## API reference — `EducationPlaces`

| Endpoint | בעברית: מה עושה / מה מחזיר | Technical (EN) |
|----------|---------------------------|----------------|
| `GET /api/EducationPlaces` | שולפת את כל הפנימיות. מחזירה מערך: לכל שורה מזהה, שם, עיר, מספר תלמידים **פעילים**, וגיל ממוצע לתלמידים הפעילים. | `200` → `EducationPlaceStatsDto[]`. Sourced from `sp_GetEducationPlacesWithStats`. No body. |
| `GET /api/EducationPlaces/{id}` | שולפת פנימייה אחת לפי מזהה. מחזירה אובייקט אחד עם אותם שדות סטטיסטיקה כמו ברשימה. | `200` → `EducationPlaceStatsDto`. `404` if id missing. |
| `POST /api/EducationPlaces` | יוצרת פנימייה חדשה. מחזירה את הרשומה שנוצרה כולל `id` חדש. | `201` + `Location` + `EducationPlaceDto` (`name`, `city`, `id`). |
| `PUT /api/EducationPlaces/{id}` | מעדכנת שם ועיר. מחזירה את הרשומה אחרי עדכון (בלי שדות סטטיסטיקה). | `200` → `EducationPlaceDto`. `404` if not found. |
| `PATCH /api/EducationPlaces/{id}/active` | מעדכנת האם הפנימייה פעילה (`isActive`). שיבוץ תלמידים חדשים רק לפנימייה פעילה. | `200` → `EducationPlaceDto`. `404` if not found. |
| `DELETE /api/EducationPlaces/{id}` | מוחקת פנימייה. אין גוף תשובה כשהצליח. | `204` success. `400` if students still linked. `404` if not found. |

## API reference — `Students`

| Endpoint | בעברית: מה עושה / מה מחזיר | Technical (EN) |
|----------|---------------------------|----------------|
| `GET /api/Students` | שולפת רשימת תלמידים. מחזירה מערך: מזהה, שם, תעודת זהות, גיל, פנימייה, פעיל. | `200` → `StudentDto[]`. Optional query: `educationPlaceId`. No body. |
| `GET /api/Students/{id}` | שולפת תלמיד אחד. מחזירה אובייקט מלא. | `200` → `StudentDto`. `404` if not found. |
| `POST /api/Students` | יוצרת תלמיד. מחזירה את התלמיד שנוצר. | `201` → `StudentDto`. Validates age `5–25`, unique `identityNumber`, place exists. `400` / `404`. |
| `PUT /api/Students/{id}` | מעדכנת תלמיד קיים. מחזירה את התלמיד אחרי עדכון. | `200` → `StudentDto`. Same rules as POST. `404` if student or place missing. |
| `DELETE /api/Students/{id}` | מוחקת תלמיד. אין גוף כשהצליח. | `204` or `404`. |
| `POST /api/Students/upsert` | יוצרת או מעדכנת לפי `id` בגוף (`null`/`0` = יצירה). מחזירה תמיד את מצב התלמיד אחרי הפעולה. | `200` → `StudentDto` (always; not `201` on create). `400` / `404`. |

דוגמת payload ל-upsert:

```json
{
  "id": null,
  "name": "ישראל ישראלי",
  "identityNumber": "123456789",
  "age": 16,
  "educationPlaceId": 1,
  "isActive": true
}
```

## חוקים עסקיים מרכזיים

- גיל תלמיד חייב להיות בין `5` ל-`25`.
- פנימייה חייבת להתקיים לפני שיוך תלמיד.
- `IdentityNumber` חייב להיות ייחודי במערכת.

## טיפול בשגיאות ולוגים

- Middleware גלובלי מטפל בחריגות:
  - `ValidationException` → `400 Bad Request`
  - `NotFoundException` → `404 Not Found`
  - חריגה לא צפויה → `500 Internal Server Error`
- לוגים נכתבים ל:
  - Console
  - `backend/src/EducationSystem.API/logs/education-*.log`

## לקוח AngularJS 1.x (מטלת Hands-On)

תיקייה: `angularjs-client/`.

- מציג טבלת פנימיות עם **מזהה, שם, עיר, תלמידים פעילים, גיל ממוצע** מ־`GET /api/EducationPlaces`.
- **סינון לפי עיר בצד הלקוח**: שדה עם `datalist` (השלמה אוטומטית) + debounce 150ms; אין קריאת HTTP נוספת בעת הסינון.
- **async/await** בטעינת הנתונים מול `$http`.
- **UX בשגיאה**: הודעה ידידותית, פירוט כשיש גוף JSON מהשרת, כפתור «נסה שוב».

הרצה (אחרי שה־API זמין, למשל `docker compose up -d`):

```bash
cd angularjs-client
npm install
npm start
```

נפתח דפדפן על **http://localhost:4300** (CORS מותר גם בסביבת Production ב־API לפורט זה).

כתובת API ניתנת לעקיפה לפני טעינת Angular:

```html
<script>
  window.EDUCATION_API_BASE = 'http://127.0.0.1:5001/api';
</script>
```

## לקוח Angular (מודרני)

תיקייה: `edu-management/`.

```bash
cd edu-management
npm install
ng serve
```

פרוקסי ל־API: ראו `edu-management/proxy.conf.cjs` ו־`angular.json`.

## Design Patterns (סיכום למטלה)

| דפוס / עקרון | היכן |
|--------------|------|
| **שכבות (Layered / Clean-ish)** | API → Application (Services, DTOs, Exceptions) → Infrastructure (Repositories) → SQL |
| **Repository** | ממשקים ב־Application, מימוש Dapper ב־Infrastructure — בידוד גישה לנתונים |
| **Dependency Injection** | רישום שירותים ב־`Program.cs`, הזרקה לקונטרולרים ולשירותים |
| **DTO** | הפרדה בין מודל API לישויות דומיין / תוצאות SP |
| **Middleware / Cross-cutting** | `GlobalExceptionMiddleware` — טיפול אחיד בשגיאות, לוג, נקודת הרחבה להתראות קריטיות |
| **Signal / computed (Angular)** | חנות פנימיות עם סינון לקוח ללא round-trip |

## שימוש ב-AI ותהליכי עבודה בצוות

**במטלה הנוכחית:** נעזרתי בכלי AI לייצור מבנה פרויקט, סקריפטי SQL, שכבות Backend, לקוח Angular, ותיעוד — תוך **אימות ידני** מול Swagger, `docker compose`, ובדיקות דפדפן.

**כמוביל צוות (המלצות לשגרה):**

1. **Spec קצר לפני קוד** — משימה ב־PR אחד: API contract, שדות DTO, קודי שגיאה.
2. **Copilot / סוכן AI** — טיוטת CRUD, טסטים יחידה, טקסטי Swagger; מפתח אנושי מאשר security ו־business rules.
3. **QA** — רשימת smoke אוטומטית (Playwright) + בדיקת רגרסיה ידנית לזרימות קריטיות; AI מסייע בכתיבת תרחישים, לא מחליף החלטת שחרור.
4. **Code review** — דגש על ולידציה בשרת, SQL injection (פרמטרים), ושאיננו סומכים על לקוח לבדיקות בטיחות.

## חניכה — מודול «מורים» (Code Review לג׳וניור)

אם מוסיפים מודול **מורים** (Teachers), הייתי דורש ב־review:

1. **דומיין ו־DB** — טבלה `Teacher` עם FK לפנימייה (אם המורה משויך למוסד), אינדקסים על שדות חיפוש; מיגרציה בספריית `database/migrations` עם מספור עקבי.
2. **API** — אותה שכבה כמו `Students`: Controller דק, `TeacherService` עם ולידציות (שם, ת״ז/מזהה ייחודי, פנימייה קיימת), `NotFoundException` / `ValidationException` מתאימים.
3. **אל תכפה לוגיקה על הלקוח** — כל כללי העסק בשרת; הלקוח רק משקף שגיאות.
4. **DTOs + Swagger** — תיעוד בעברית ב־Summary כמו בשאר ה־endpoints.
5. **Frontend** — שימוש חוזר ב־`generic-table` / דפוס חנות כמו `students` או `education-places`; routing lazy אם המודול גדול.
6. **בדיקות** — לפחות בדיקות שירות או אינטגרציה ל־Upsert ול־404 על מזהה לא קיים.

## הערות

- קובצי `.DS_Store` מנוהלים ב-`.gitignore` ולא נכנסים ל-repo.
- קיימים `.gitignore` ייעודיים לשורש הפרויקט, ל־`backend` ול־`edu-management`.
