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

## התקנת סכמת בסיס הנתונים

הרץ את הסקריפטים לפי הסדר:

1. `database/migrations/01_create_tables.sql`
2. `database/migrations/02_indexes.sql`
3. `database/migrations/03_stored_procedure.sql`

ניתן להריץ דרך SSMS / Azure Data Studio / sqlcmd.

## הרצת ה-Backend

```bash
cd backend
dotnet build EducationSystem.sln
dotnet run --project src/EducationSystem.API --launch-profile http
```

- API Base URL: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger/index.html`

## API Endpoints עיקריים

- `GET /api/EducationPlaces`  
  מחזיר רשימת פנימיות עם:
  - `ActiveStudentCount`
  - `AverageAge`

- `POST /api/Students/upsert`  
  יוצר או מעדכן תלמיד לפי `Id`.

דוגמת payload:

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
