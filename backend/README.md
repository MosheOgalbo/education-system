# Education System — Backend API

תיעוד מרוכז ל־**EducationSystem.API** (.NET 10). תיעוד אינטראקטיבי: `Swagger UI` בנתיב `/swagger` כשהשרת רץ.

## בסיס וקונבנציות

| נושא | ערך |
|------|-----|
| Base path | `/api` |
| פורמט גוף | `application/json` |
| שמות שדות ב־JSON | **camelCase** (ברירת מחדל של ASP.NET Core), למשל `educationPlaceId`, `identityNumber` |

---

## מבנה הפרויקט (שכבות)

```
backend/
├── EducationSystem.sln
├── src/
│   ├── EducationSystem.API/          # Controllers, Middleware, Program.cs
│   ├── EducationSystem.Application/  # DTOs, Services, Interfaces, Exceptions
│   ├── EducationSystem.Domain/       # ישויות דומיין
│   └── EducationSystem.Infrastructure/ # Repositories (Dapper + SQL Server)
└── tests/
```

זרימה טיפוסית: **Controller → Service → Repository → SQL Server** (כולל Stored Procedures במקומות הרלוונטיים).

---

## טבלת כל הקריאות

### פנימיות — `EducationPlaces`

| מתודה | נתיב | גוף בקשה | תשובה מוצלחת | קודים נפוצים נוספים |
|--------|------|-----------|----------------|----------------------|
| `GET` | `/api/EducationPlaces` | — | `200` — מערך `EducationPlaceStatsDto` | — |
| `GET` | `/api/EducationPlaces/{id}` | — | `200` — אובייקט `EducationPlaceStatsDto` | `404` |
| `POST` | `/api/EducationPlaces` | `CreateEducationPlaceDto` | `201` — `EducationPlaceDto` + כותרת `Location` | `400` |
| `PUT` | `/api/EducationPlaces/{id}` | `UpdateEducationPlaceDto` | `200` — `EducationPlaceDto` | `400`, `404` |
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
| `activeStudentCount` | מספר שלם | כמה תלמידים מסומנים כפעילים בפנימייה |
| `averageAge` | מספר עשרוני | גיל ממוצע לתלמידים **הפעילים** בלבד |

### `EducationPlaceDto` (פנימייה ללא סטטיסטיקה)

מוחזר מ־`POST` / `PUT` על פנימיות.

| שדה (JSON) | טיפוס | משמעות |
|-------------|--------|--------|
| `id` | מספר | מזהה |
| `name` | מחרוזת | שם |
| `city` | מחרוזת | עיר |

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

## הרצה מקומית

```bash
cd backend
dotnet build EducationSystem.sln
dotnet run --project src/EducationSystem.API --launch-profile http
```

ברירת מחדל: `http://localhost:5000` — Swagger: `http://localhost:5000/swagger/index.html`.

חיבור למסד נתונים: מחרוזת `ConnectionStrings:DefaultConnection` ב־`appsettings.json` / משתני סביבה.
