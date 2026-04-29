# Education System

מערכת Full-Stack לניהול פנימיות ותלמידים, הבנויה בארכיטקטורת שכבות נקייה (Clean Architecture) עם הפרדה ברורה בין API, לוגיקה עסקית, דומיין ותשתיות נתונים.

## מטרת הפרויקט

המערכת מאפשרת:
- צפייה ברשימת פנימיות עם סטטיסטיקות תלמידים פעילים.
- יצירה/עדכון תלמידים (Upsert) עם ולידציות עסקיות.
- טיפול אחוד בשגיאות API כולל לוגים ותגובות JSON עקביות.

## Tech Stack

- **Backend:** .NET 10, ASP.NET Core Web API
- **Data Access:** Dapper, Microsoft SQL Server
- **Logging:** Serilog (Console + Rolling File)
- **API Docs:** Swagger / OpenAPI
- **Database:** SQL Server 2022 (Docker)
- **Frontend:** Angular (מיועד להתחבר ל-API, CORS מוגדר ל-`http://localhost:4200`)

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

## Frontend

תיקיית `frontend` שמורה ללקוח Angular.  
בשלב זה צד השרת מוכן לחיבור מהלקוח דרך CORS לפורט `4200`.

## הערות

- קובצי `.DS_Store` מנוהלים ב-`.gitignore` ולא נכנסים ל-repo.
- קיימים `.gitignore` ייעודיים לשורש הפרויקט, ל-`backend` ול-`frontend`.
