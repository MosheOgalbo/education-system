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

מפת תיקיות עם הסבר קצר בעברית — **מה כל פריט עושה בפרויקט**.

```
backend/
├── Dockerfile                       # Multi-stage: SDK לבנייה ופרסום → אימג' aspnet קטן; האזנה על פורט 8080.
├── EducationSystem.sln              # קובץ פתרון קלאסי — רשימת כל הפרויקטים; `dotnet build` מהשורש.
├── EducationSystem.slnx             # פורמט פתרון מודרני (Visual Studio / dotnet — אלטרנטיבה ל-.sln).
├── .gitignore                       # לא לדחוף bin/obj, לוגים וקבצי משתמש מקומיים.
├── README.md                        # תיעוד זה — מבנה, DTOs, הרצה.
├── API-README.md                    # מדריך REST מפורט: נתיבים, גופים, דוגמאות JSON.
└── src/
    ├── EducationSystem.API/                      # שכבת HTTP בלבד — נקודת הכניסה של התהליך.
    │   ├── EducationSystem.API.csproj            # הפניות לפרויקטים Application/Infrastructure; הגדרות Swagger/XML.
    │   ├── EducationSystem.API.http              # דוגמאות REST לבדיקה ידנית ב-VS Code REST Client.
    │   ├── Program.cs                            # הרכבת האפליקציה: Serilog, DI, CORS, Swagger, middleware, מיפוי controllers.
    │   ├── appsettings.json                      # חיבור למסד, Serilog — ברירות מחדל לכל הסביבות.
    │   ├── appsettings.Development.json          # עקיפות לפיתוח (למשל רמת לוג).
    │   ├── Properties/
    │   │   └── launchSettings.json               # פרופילי `dotnet run`: URLs, משתני סביבה.
    │   ├── Controllers/
    │   │   ├── EducationPlacesController.cs      # REST לפנימיות: רשימה/יחידה, CRUD, PATCH פעילות, מחיקה.
    │   │   └── StudentsController.cs             # REST לתלמידים: רשימה מסוננת, CRUD, upsert.
    │   ├── Middleware/
    │   │   └── GlobalExceptionMiddleware.cs      # לכידת חריגות גלובלית ותשובת JSON אחידה + לוגים.
    │   └── Notifications/
    │       └── LoggingCriticalErrorNotifier.cs   # מימוש `ICriticalErrorNotifier` — לוג לשגיאות קריטיות (נקודת הרחבה ל-Sentry וכו').
    │
    ├── EducationSystem.Application/              # לוגיקה עסקית, חוזים, DTOs — ללא תלות ב־ASP.NET או ב-SQL.
    │   ├── EducationSystem.Application.csproj
    │   ├── DTOs/                                 # חוזה נתונים עם הלקוח — records קלים לקריאה ולסריאליזציה JSON.
    │   │   ├── CreateEducationPlaceDto.cs        # גוף POST ליצירת פנימייה.
    │   │   ├── CreateStudentDto.cs               # גוף POST ליצירת תלמיד.
    │   │   ├── EducationPlaceDto.cs              # תגובת פנימייה בלי אגרגציות סטטיסטיקה.
    │   │   ├── EducationPlaceStatsDto.cs          # פנימייה + ספירת תלמידים פעילים + גיל ממוצע.
    │   │   ├── SetEducationPlaceActiveDto.cs    # גוף PATCH לסטטוס פעילות.
    │   │   ├── StudentDto.cs                     # תגובת תלמיד מלאה.
    │   │   ├── UpdateEducationPlaceDto.cs       # גוף PUT לעדכון שם ועיר.
    │   │   ├── UpdateStudentDto.cs                # גוף PUT לעדכון תלמיד.
    │   │   └── UpsertStudentDto.cs               # גוף POST ל-upsert לפי מזהה בגוף.
    │   ├── Enums/
    │   │   └── EducationPlaceStatus.cs           # מצבי פנימייה (פעילה / לא פעילה / מושהית) ללוגיקת שירות.
    │   ├── Exceptions/
    │   │   └── AppExceptions.cs                  # ValidationException, NotFoundException — ממופות במידלוור ל-HTTP.
    │   ├── Interfaces/
    │   │   ├── ICriticalErrorNotifier.cs        # חוזה להתראה על שגיאות 500 (הפרדת תשתית מהדומיין).
    │   │   ├── IEducationPlaceRepository.cs     # גישה לנתוני פנימיות — מימוש ב-Infrastructure.
    │   │   ├── IEducationPlaceService.cs        # פעולות עסקיות על פנימיות.
    │   │   ├── IStudentRepository.cs             # גישה לנתוני תלמידים.
    │   │   └── IStudentService.cs               # פעולות עסקיות על תלמידים.
    │   ├── Models/
    │   │   └── CriticalErrorContext.cs           # הקשר בקשה (מזהה מעקב, נתיב) להעברה למערכת התראות.
    │   ├── Services/
    │   │   ├── EducationPlaceService.cs          # כללי עסק לפנימיות: ולידציה, סטטוס, מחיקה מותנית.
    │   │   └── StudentService.cs                 # כללי עסק לתלמידים: גיל, ייחודיות ת״ז, upsert, שיבוץ לפנימייה.
    │   └── Validation/
    │       └── BusinessInputValidators.cs        # ולידציות קלט משותפות (שם, עיר) בשירותים.
    │
    ├── EducationSystem.Domain/                   # ישויות טהורות — מודל דומיין ללא תלות במסגרות.
    │   ├── EducationSystem.Domain.csproj
    │   └── Entities/
    │       ├── EducationPlace.cs                 # ייצוג פנימייה במסד (שדות וסטטוס).
    │       └── Student.cs                        # ייצוג תלמיד במסד.
    │
    └── EducationSystem.Infrastructure/           # גישה לנתונים: Dapper, פקודות SQL, פרוצדורות.
        ├── EducationSystem.Infrastructure.csproj # הפניה ל-Dapper ול-SQL Client; תלות ב-Domain/Application.
        └── Repositories/
            ├── EducationPlaceRepository.cs       # שאילתות ו-SP לפנימיות וסטטיסטיקה.
            └── StudentRepository.cs              # CRUD ו-upsert לתלמידים עם פרמטרים מקושחים.
```

**הערה:** אין כרגע פרויקט `tests/` בפתרון — ניתן להוסיף xUnit לאפליקציה ולאינטגרציה למסד.

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

| קובץ / תיקייה | תפקיד |
|---------------|--------|
| **`Program.cs`** | אתחול Serilog; רישום `IDbConnection` כ-Scoped; רישום repositories, services, `ICriticalErrorNotifier`; CORS; Swagger; מידלוור שגיאות; מיפוי `/` ל-Swagger ו-`MapControllers`. |
| **`GlobalExceptionMiddleware.cs`** | מיפוי `ValidationException`→400, `NotFoundException`→404, אחרת→500; לוגים עם Scope; קריאה ל-notifier על שגיאות קריטיות. |
| **`Controllers/EducationPlacesController.cs`** | נקודות קצה לפנימיות: GET רשימה/יחידה עם סטטיסטיקה, POST/PUT/PATCH/DELETE תואמי ה-DTOs. |
| **`Controllers/StudentsController.cs`** | נקודות קצה לתלמידים: GET עם `educationPlaceId` אופציונלי, GET לפי id, POST/PUT/DELETE, POST upsert. |
| **`Middleware/`** | רק middleware גלובלי לשגיאות — הפרדה מקוד הקונטרולרים. |
| **`Notifications/LoggingCriticalErrorNotifier.cs`** | מימוש התראות קריטיות כלוג מובנה (ניתן להחליף בשירות חיצוני בלי לשנות מידלוור). |
| **`appsettings.json` / `appsettings.Development.json`** | מחרוזות חיבור, Serilog, עקיפות סביבה. |
| **`Properties/launchSettings.json`** | פרופילי הרצה מקומית (פורטים, `ASPNETCORE_ENVIRONMENT`). |
| **`EducationSystem.API.http`** | אוסף בקשות לבדיקה ידנית ולהדגמה בראיון. |
| **`EducationSystem.API.csproj`** | הפניות לפרויקטים, הפקת XML לתיעוד Swagger, גרסת Target Framework. |

### EducationSystem.Application

| קובץ / תיקייה | תפקיד |
|---------------|--------|
| **`DTOs/*`** | חוזה JSON עם הלקוח — שדות camelCase בצד HTTP; הפרדה בין «עם סטטיסטיקה» (`EducationPlaceStatsDto`) לבין תגובות POST/PUT רגילות. |
| **`Enums/EducationPlaceStatus.cs`** | מצבי פנימייה לעסק — לא כפילות מחרוזות בכל השירות. |
| **`Exceptions/AppExceptions.cs`** | טיפוסי חריגה ייעודיים כדי שהמידלוור יזהה וימפה ל-HTTP בלי `if` על מחרוזות. |
| **`Interfaces/`** | חוזים לשירותים ולרפוזיטורי + `ICriticalErrorNotifier` — DI נקי והחלפת מימושים בבדיקות. |
| **`Models/CriticalErrorContext.cs`** | נתוני הקשר לשגיאה קריטית (מסלול, מזהה מעקב) להעברה למערכת ניטור. |
| **`Services/StudentService.cs`** | כללי עסק: גיל, ת״ז ייחודית, פנימייה קיימת ופעילה, upsert. |
| **`Services/EducationPlaceService.cs`** | כללי עסק: CRUD, מעבר סטטוס, מחיקה רק כשאין תלמידים וכו'. |
| **`Validation/BusinessInputValidators.cs`** | ולידציית שם/עיר משותפת — DRY בין שירותי פנימיות. |

### EducationSystem.Domain

| קובץ | תפקיד |
|------|--------|
| **`Entities/EducationPlace.cs`** | מודל ישות פנימייה — נטען ונשמר דרך Infrastructure בלי תלות ב-Controllers. |
| **`Entities/Student.cs`** | מודל ישות תלמיד — אותו עיקרון הפרדה. |

### EducationSystem.Infrastructure

| קובץ | תפקיד |
|------|--------|
| **`EducationPlaceRepository.cs`** | Dapper + SP/שאילתות לפנימיות: אגרגציות, ספירות, עדכון סטטוס. |
| **`StudentRepository.cs`** | Dapper: פילטרים, CRUD, upsert, בדיקות ייחודיות ברמת SQL. |

### שורש ה-backend

| קובץ | תפקיד |
|------|--------|
| **`Dockerfile`** | שלב build עם SDK, שלב ריצה עם aspnet בלבד; חשיפת 8080 ל-Docker Compose. |
| **`EducationSystem.sln` / `.slnx`** | איחוד פרויקטים לפתרון אחד ל-build ול-IDE. |
| **`API-README.md`** | רפרנס REST מפורט נפרד מהמסמך הזה (נוח לצוות ולמגייסים). |
| **`README.md`** | מסמך זה — עץ תיקיות והסבר תפקידים. |
| **`.gitignore`** | מונע דחיפת bin/obj וקבצי build ל-repository. |

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
