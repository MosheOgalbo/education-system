# Education System — Backend API

תיעוד מרוכז ל־**EducationSystem.API** (.NET 10). תיעוד אינטראקטיבי: `Swagger UI` בנתיב `/swagger` כשהשרת רץ.

**מסמך API נפרד (כל הקריאות, פורמטי בקשה/תשובה ודוגמאות JSON):** [API-README.md](./API-README.md)

## בסיס וקונבנציות

| נושא | ערך |
|------|-----|
| Base path | `/api` |
| פורמט גוף | `application/json` |
| שמות שדות ב־JSON | **camelCase** (ברירת מחדל של ASP.NET Core), למשל `educationPlaceId`, `identityNumber` |

---

## עץ הפרויקט (קבצים ותיקיות)

```
backend/
├── Dockerfile                          # בניית אימג' רב-שלבי: SDK → publish → runtime aspnet על פורט 8080
├── EducationSystem.sln                 # פתרון Visual Studio / `dotnet build`
├── EducationSystem.slnx                # פורמט פתרון חלופי (XML מודרני)
├── .gitignore
├── README.md
├── API-README.md                  # מדריך REST: נתיבים, סכמות JSON, דוגמאות
└── src/
    ├── EducationSystem.API/            # שכבת ה-HTTP — נקודת הכניסה לאפליקציה
    │   ├── EducationSystem.API.csproj
    │   ├── EducationSystem.API.http    # דוגמאות בקשות ל-REST Client ב-VS Code
    │   ├── Program.cs                  # רישום שירותים, Serilog, CORS, Swagger, pipeline
    │   ├── appsettings.json            # הגדרות כלליות (חיבור DB, Serilog)
    │   ├── appsettings.Development.json
    │   ├── Properties/
    │   │   └── launchSettings.json     # פרופילי הרצה (URLs, משתני סביבה)
    │   ├── Controllers/
    │   │   ├── EducationPlacesController.cs
    │   │   └── StudentsController.cs
    │   └── Middleware/
    │       └── GlobalExceptionMiddleware.cs
    │
    ├── EducationSystem.Application/    # לוגיקה עסקית, חוזים (ממשקים), DTOs, חריגות מותאמות
    │   ├── EducationSystem.Application.csproj
    │   ├── DTOs/                       # אובייקטי העברה — records קטנים וברורים
    │   │   ├── CreateEducationPlaceDto.cs
    │   │   ├── CreateStudentDto.cs
    │   │   ├── EducationPlaceDto.cs
    │   │   ├── EducationPlaceStatsDto.cs
    │   │   ├── SetEducationPlaceActiveDto.cs
    │   │   ├── StudentDto.cs
    │   │   ├── UpdateEducationPlaceDto.cs
    │   │   ├── UpdateStudentDto.cs
    │   │   └── UpsertStudentDto.cs
    │   ├── Exceptions/
    │   │   └── AppExceptions.cs        # ValidationException, NotFoundException
    │   ├── Interfaces/
    │   │   ├── IEducationPlaceRepository.cs
    │   │   ├── IEducationPlaceService.cs
    │   │   ├── IStudentRepository.cs
    │   │   └── IStudentService.cs
    │   └── Services/
    │       ├── EducationPlaceService.cs
    │       └── StudentService.cs
    │
    ├── EducationSystem.Domain/         # ישויות דומיין (מודל מסד — ללא תלות ב-API)
    │   ├── EducationSystem.Domain.csproj
    │   └── Entities/
    │       ├── EducationPlace.cs
    │       └── Student.cs
    │
    └── EducationSystem.Infrastructure/ # גישה לנתונים — Dapper + SQL Server
        ├── EducationSystem.Infrastructure.csproj
        └── Repositories/
            ├── EducationPlaceRepository.cs
            └── StudentRepository.cs
```

**הערה:** אין כרגע תיקיית `tests/` בפתרון — אפשר להוסיף יחידות בדיקה לשירותים ולאינטגרציה לרפוזיטורי.

---

## למה מחולקים לשכבות (Clean Architecture קלה)?

| שכבה | תפקיד | למה זה נכון לראיון |
|------|--------|---------------------|
| **API** | HTTP בלבד: נתיבים, קודי סטטוס, אין SQL | הפרדת אחריות — קל לבדוק ולשנות פרוטוקול |
| **Application** | כללי עסק, ולידציה, תיאום | אותו לוגיקה בלי תלות איך מאחסנים נתונים |
| **Domain** | מודל טהור | ישויות יכולות לגדול בלי לגרור תלות ב-Framework |
| **Infrastructure** | Dapper, חיבורים, פרוצדורות | אפשר להחליף DB או ORM בלי לגעת בלוגיקה העסקית |

זרימה טיפוסית: **Controller → Service → Repository → SQL Server** (כולל Stored Procedure לרשימת פנימיות עם סטטיסטיקה).

---

## מה כל קובץ עושה (תמצית בעברית)

### EducationSystem.API

- **`Program.cs`** — יוצר את האפליקציה: Serilog (קונסול + קבצים מתגלגלים), רישום `IDbConnection` כ־Scoped עם `SqlConnection`, רישום רפוזיטורי ושירותים, מדיניות CORS (`AllowAngular` — בפיתוח כל localhost), Swagger, `GlobalExceptionMiddleware` לפני שאר ה-pipeline, הפניה מ־`/` ל־Swagger, `MapControllers`.
- **`GlobalExceptionMiddleware.cs`** — תופס `ValidationException` → 400, `NotFoundException` → 404, כל השאר → 500 עם הודעה גנרית בעברית; לוגים; `NotifyCriticalAsync` כ־stub להתראות עתידיות.
- **`EducationPlacesController.cs`** — REST לפנימיות: רשימה/יחיד עם סטטיסטיקה, יצירה, עדכון שם/עיר, **PATCH** לסטטוס פעילות, מחיקה (עם כלל עסקי אם יש תלמידים).
- **`StudentsController.cs`** — רשימה (אופציונלי לפי `educationPlaceId`), לפי מזהה, CRUD, ו־`POST .../upsert` לאיחוד יצירה/עדכון בקריאה אחת.
- **`appsettings*.json`** — מחרוזות חיבור, לוגים.
- **`launchSettings.json`** — URL להרצה מקומית.
- **`EducationSystem.API.http`** — דוגמאות HTTP לבדיקה ידנית.

### EducationSystem.Application

- **DTOs** — חוזה ה-API מול הלקוח: `EducationPlaceStatsDto` כולל `activeStudentCount`, `averageAge`, `isActive`; `EducationPlaceDto` לתשובות POST/PUT/PATCH ללא סטטיסטיקה מחושבת; DTOs לתלמיד עם ייחודיות `identityNumber`.
- **`AppExceptions.cs`** — חריגות מסוגים כדי שהמידלוור ימפה לקוד HTTP נכון.
- **ממשקים `I*Service` / `I*Repository`** — Dependency Inversion: השירות תלוי בממשק, לא במימוש SQL.
- **`StudentService`** — ולידציית גיל (5–25); בדיקת פנימייה קיימת **ופעילה** (404 אם לא קיימת, 400 אם לא פעילה); ייחודיות תעודת זהות; Upsert עם בדיקת מזהה.
- **`EducationPlaceService`** — שליפה עם סטטיסטיקה, CRUD, עדכון פעילות, מחיקה רק אם אין תלמידים משויכים.

### EducationSystem.Domain

- **`Student` / `EducationPlace`** — תכונות המודל כפי שבמסד (כולל חותמות זמן במידת הצורך) — שכבה דקה לייצוג דומיין.

### EducationSystem.Infrastructure

- **`StudentRepository`** — שאילתות Dapper: סינון לפי פנימייה, INSERT/UPDATE/DELETE עם `OUTPUT INSERTED...`, `UpsertSql` עם `IF @Id IS NULL OR @Id = 0`, בדיקת כפילות תעודת זהות.
- **`EducationPlaceRepository`** — `sp_GetEducationPlacesWithStats` לרשימה; שאילתת GROUP BY ליחיד; `GetIsActiveIfExistsAsync` לתמיכה בכללי שיבוץ; ספירת תלמידים לפני מחיקה.

### שורש ה-backend

- **`Dockerfile`** — multi-stage build, פרסום Release, הרצה על פורט 8080.

---

## טבלת כל הקריאות

### פנימיות — `EducationPlaces`

| מתודה | נתיב | גוף בקשה | תשובה מוצלחת | קודים נפוצים נוספים |
|--------|------|-----------|----------------|----------------------|
| `GET` | `/api/EducationPlaces` | — | `200` — מערך `EducationPlaceStatsDto` | — |
| `GET` | `/api/EducationPlaces/{id}` | — | `200` — אובייקט `EducationPlaceStatsDto` | `404` |
| `POST` | `/api/EducationPlaces` | `CreateEducationPlaceDto` | `201` — `EducationPlaceDto` + כותרת `Location` | `400` |
| `PUT` | `/api/EducationPlaces/{id}` | `UpdateEducationPlaceDto` | `200` — `EducationPlaceDto` | `400`, `404` |
| `PATCH` | `/api/EducationPlaces/{id}/active` | `SetEducationPlaceActiveDto` (`isActive`) | `200` — `EducationPlaceDto` | `404` |
| `DELETE` | `/api/EducationPlaces/{id}` | — | `204` — ללא גוף | `400` (יש תלמידים משויכים), `404` |

### תלמידים — `Students`

| מתודה | נתיב | גוף / שאילתה | תשובה מוצלחת | קודים נפוצים נוספים |
|--------|------|----------------|----------------|----------------------|
| `GET` | `/api/Students` | אופציונלי: `?educationPlaceId={int}` | `200` — מערך `StudentDto` | — |
| `GET` | `/api/Students/{id}` | — | `200` — `StudentDto` | `404` |
| `POST` | `/api/Students` | `CreateStudentDto` | `201` — `StudentDto` + `Location` | `400`, `404` |
| `PUT` | `/api/Students/{id}` | `UpdateStudentDto` | `200` — `StudentDto` | `400`, `404` |
| `DELETE` | `/api/Students/{id}` | — | `204` — ללא גוף | `404` |
| `POST` | `/api/Students/upsert` | `UpsertStudentDto` | `200` — `StudentDto` (תמיד; גם אחרי יצירה) | `400`, `404` |

---

## מבנה ה-DTOs (שדות ב-JSON)

### `EducationPlaceStatsDto` (סטטיסטיקה + פנימייה)

מוחזר מ־`GET /api/EducationPlaces` ומ־`GET /api/EducationPlaces/{id}`.

| שדה (JSON) | טיפוס | משמעות |
|-------------|--------|--------|
| `id` | מספר | מזהה פנימייה |
| `name` | מחרוזת | שם הפנימייה |
| `city` | מחרוזת | עיר |
| `isActive` | בוליאני | האם הפנימייה פעילה לשיבוץ |
| `activeStudentCount` | מספר שלם | כמה תלמידים מסומנים כפעילים בפנימייה |
| `averageAge` | מספר עשרוני | גיל ממוצע לתלמידים **הפעילים** בלבד |

### `EducationPlaceDto` (פנימייה ללא סטטיסטיקה)

מוחזר מ־`POST` / `PUT` / `PATCH` על פנימיות.

| שדה (JSON) | טיפוס | משמעות |
|-------------|--------|--------|
| `id` | מספר | מזהה |
| `name` | מחרוזת | שם |
| `city` | מחרוזת | עיר |
| `isActive` | בוליאני | סטטוס פעילות |

### `CreateEducationPlaceDto` / `UpdateEducationPlaceDto`

גוף ל־`POST /api/EducationPlaces` ו־`PUT /api/EducationPlaces/{id}`.

| שדה (JSON) | טיפוס | משמעות |
|-------------|--------|--------|
| `name` | מחרוזת | שם הפנימייה |
| `city` | מחרוזת | עיר |

### `StudentDto`

מוחזר מכל קריאות התלמידים המחזירות רשומה או מערך.

| שדה (JSON) | טיפוס | משמעות |
|-------------|--------|--------|
| `id` | מספר | מזהה תלמיד |
| `name` | מחרוזת | שם מלא |
| `identityNumber` | מחרוזת | תעודת זהות (ייחודית במערכת) |
| `age` | מספר שלם | גיל (בשרת: בדרך כלל בין 5 ל־25) |
| `educationPlaceId` | מספר | מזהה הפנימייה המשויכת |
| `isActive` | בוליאני | פעיל / לא פעיל |

### `CreateStudentDto` / `UpdateStudentDto`

אותם שדות כמו `StudentDto` **ללא** `id` (ב־`Update` המזהה מגיע מהנתיב).

| שדה (JSON) | טיפוס |
|-------------|--------|
| `name` | מחרוזת |
| `identityNumber` | מחרוזת |
| `age` | מספר שלם |
| `educationPlaceId` | מספר |
| `isActive` | בוליאני |

### `UpsertStudentDto`

גוף ל־`POST /api/Students/upsert`.

| שדה (JSON) | טיפוס | הערה |
|-------------|--------|------|
| `id` | מספר או `null` | `null` או `0` ⇒ יצירה; אחרת ⇒ עדכון לפי מזהה |
| `name` | מחרוזת | |
| `identityNumber` | מחרוזת | |
| `age` | מספר שלם | |
| `educationPlaceId` | מספר | |
| `isActive` | בוליאני | |

---

## מבנה תשובת שגיאה (JSON)

טיפול גלובלי ב־`GlobalExceptionMiddleware`. גוף טיפוסי:

```json
{
  "statusCode": 400,
  "message": "טקסט ההודעה מהשרת",
  "timestamp": "2026-04-30T12:00:00.0000000Z"
}
```

| `statusCode` | מצב |
|--------------|-----|
| `400` | ולידציה / `ValidationException` |
| `404` | לא נמצא / `NotFoundException` |
| `500` | שגיאת מערכת לא צפויה |

---

## פירוט מתודות עיקריות (למענה בראיון)

### StudentService

- **`GetAllAsync`** — מעביר לרפוזיטורי עם מסנן אופציונלי.
- **`GetByIdAsync`** — זורק `NotFoundException` אם אין רשומה.
- **`CreateAsync` / `UpdateAsync`** — ולידציה מלאה לפני כתיבה.
- **`DeleteAsync`** — 404 אם לא נמחק שורה.
- **`UpsertStudentAsync`** — ולידציה + אם יש `id` חיובי אבל לא קיים — 404; אחרת `UpsertAsync` במסד.
- **`EnsurePlaceExistsAndActive`** — הפרדה סמנטית: לא קיים ≠ לא פעיל (404 לעומת 400).
- **`EnsureIdentityUnique`** — מונע כפילות תעודת זהות עם `excludeId` בעדכון.

### EducationPlaceService

- **`GetAllWithStatsAsync`** — תלוי ב-SP לביצועים/עקביות אגרגציה.
- **`DeleteAsync`** — בודק קיום, אז ספירת תלמידים, אז מחיקה.

### Repositories

- שימוש ב־**פרמטרים מקושרים** (Dapper) מונע SQL Injection.
- **`OUTPUT INSERTED`** מחזיר את השורה אחרי כתיבה בלי `SELECT` נוסף.

---

## שאלות ראיון אפשריות על הבקאנד ותשובות קצרות

1. **למה Controller דק והלוגיקה ב-Service?**  
   כדי לעמוד ב-Single Responsibility ולהקל על בדיקות יחידה של לוגיקה עסקית בלי HTTP.

2. **למה PATCH נפרד מ-PUT לפנימייה?**  
   עדכון `isActive` הוא partial update סמנטי; לא מחייב שליחת שם/עיר מחדש ומקל על הרשאות וגרסאות API עתידיות.

3. **למה Upsert מחזיר תמיד 200 ולא 201?**  
   סמנטיקה אחידה ללקוח שמבצע «שמור» אידמפוטנטי בלי להבדיל בקוד בין יצירה לעדכון (מוסבר ב-XML של הבקר).

4. **למה Stored Procedure לרשימת כל הפנימיות עם סטטיסטיקה?**  
   אגרגציה ב-SQL יכולה להיות יעילה יותר ויציבה כשיש הרבה נתונים; מאפשר אופטימיזציה במקום אחד.

5. **למה `Scoped` ל־`IDbConnection`?**  
   חיבור אחד לבקשה (request), לא משותף בין threads; מתאים למודל של ASP.NET Core.

6. **איך מטפלים בשגיאות לא צפויות?**  
   מידלוור גלובלי, לוג Critical, תשובת 500 בלי חשיפת פנימיות למשתמש.

7. **למה לא EF Core כאן?**  
   Dapper קל ומהיר לשאילתות מפורשות ו-SP; בחירה פרגמטית — בראיון אפשר לומר שאפשר להוסיף EF בהדרגה.

---

## הרצה מקומית

```bash
cd backend
dotnet build EducationSystem.sln
dotnet run --project src/EducationSystem.API --launch-profile http
```

ברירת מחדל: `http://localhost:5000` — Swagger: `http://localhost:5000/swagger/index.html`.

חיבור למסד נתונים: מחרוזת `ConnectionStrings:DefaultConnection` ב־`appsettings.json` / משתני סביבה.
