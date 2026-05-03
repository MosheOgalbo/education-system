# מסמך API — Education System Backend

מדריך מרוכז לכל הקריאות שהשרת חושף, כולל **פורמט בקשה**, **פורמט תשובה** ודוגמאות JSON.

תיעוד חי ואינטראקטיבי: כשהשרת רץ, פתחו **Swagger UI** ב־`/swagger` (למשל `http://localhost:5000/swagger/index.html`).

---

## קונבנציות כלליות

| נושא | ערך |
|------|-----|
| בסיס נתיב | `{host}/api` — למשל `GET {host}/api/Students` |
| `Content-Type` (גוף) | `application/json` |
| שמות שדות ב־JSON | **camelCase** (ברירת מחדל ASP.NET Core) |
| הצלחה ללא גוף | `204 No Content` — גוף ריק |

---

## סכמות JSON (מבנים)

### `educationPlaceStats` — פנימייה עם סטטיסטיקה

מוחזר מ־`GET /api/EducationPlaces` ומ־`GET /api/EducationPlaces/{id}`.

| שדה | טיפוס | תיאור |
|-----|--------|--------|
| `id` | number | מזהה פנימייה |
| `name` | string | שם |
| `city` | string | עיר |
| `isActive` | boolean | פעילה / לא פעילה (שיבוץ תלמידים חדשים רק לפעילה) |
| `activeStudentCount` | number | מספר תלמידים **פעילים** (`isActive: true`) |
| `averageAge` | number | גיל ממוצע לתלמידים הפעילים בלבד |

**דוגמה:**

```json
{
  "id": 1,
  "name": "פנימיית ההר",
  "city": "ירושלים",
  "isActive": true,
  "activeStudentCount": 12,
  "averageAge": 16.5
}
```

---

### `educationPlace` — פנימייה ללא סטטיסטיקה

מוחזר מ־`POST /api/EducationPlaces`, `PUT /api/EducationPlaces/{id}`, `PATCH /api/EducationPlaces/{id}/active`.

| שדה | טיפוס | תיאור |
|-----|--------|--------|
| `id` | number | מזהה |
| `name` | string | שם |
| `city` | string | עיר |
| `isActive` | boolean | סטטוס פעילות |

**דוגמה:**

```json
{
  "id": 2,
  "name": "פנימיית הגליל",
  "city": "צפת",
  "isActive": true
}
```

---

### גוף בקשה: יצירת פנימייה (`POST`)

| שדה | טיפוס | חובה |
|-----|--------|------|
| `name` | string | כן |
| `city` | string | כן |

```json
{
  "name": "פנימיית החוף",
  "city": "חיפה"
}
```

---

### גוף בקשה: עדכון פנימייה (`PUT`)

אותם שדות כמו ביצירה (ללא `id` — המזהה בנתיב).

```json
{
  "name": "פנימיית החוף — מעודכן",
  "city": "חיפה"
}
```

---

### גוף בקשה: עדכון פעילות (`PATCH .../active`)

| שדה | טיפוס | חובה |
|-----|--------|------|
| `isActive` | boolean | כן |

```json
{
  "isActive": false
}
```

---

### `student` — תלמיד

מוחזר מכל פעולות התלמידים שמחזירות אובייקט או מערך.

| שדה | טיפוס | תיאור |
|-----|--------|--------|
| `id` | number | מזהה תלמיד |
| `name` | string | שם מלא |
| `identityNumber` | string | תעודת זהות — **ייחודית** במערכת |
| `age` | number | גיל (בשרת: טווח מותר בדרך כלל 5–25) |
| `educationPlaceId` | number | מזהה פנימייה משויכת |
| `isActive` | boolean | תלמיד פעיל |

**דוגמה:**

```json
{
  "id": 10,
  "name": "ישראל ישראלי",
  "identityNumber": "123456789",
  "age": 17,
  "educationPlaceId": 1,
  "isActive": true
}
```

---

### גוף בקשה: יצירת תלמיד (`POST`)

ללא `id`.

```json
{
  "name": "רחל כהן",
  "identityNumber": "987654321",
  "age": 15,
  "educationPlaceId": 1,
  "isActive": true
}
```

---

### גוף בקשה: עדכון תלמיד (`PUT`)

אותם שדות כמו ביצירה; `id` מגיע **רק** מהנתיב `/api/Students/{id}`.

---

### גוף בקשה: Upsert (`POST .../upsert`)

| שדה | טיפוס | הערה |
|-----|--------|------|
| `id` | number \| null | `null` או חסר או `0` ⇒ **יצירה**; אחרת ⇒ **עדכון** לפי מזהה |
| `name` | string | |
| `identityNumber` | string | |
| `age` | number | |
| `educationPlaceId` | number | |
| `isActive` | boolean | |

**יצירה:**

```json
{
  "id": null,
  "name": "דוד לוי",
  "identityNumber": "111222333",
  "age": 14,
  "educationPlaceId": 1,
  "isActive": true
}
```

**עדכון:**

```json
{
  "id": 10,
  "name": "דוד לוי",
  "identityNumber": "111222333",
  "age": 15,
  "educationPlaceId": 1,
  "isActive": false
}
```

**תשובה:** תמיד `200 OK` + אובייקט `student` (גם אחרי יצירה — לא מוחזר `201`).

---

## פנימיות — `EducationPlaces`

### `GET /api/EducationPlaces`

| | |
|--|--|
| **תיאור** | רשימת כל הפנימיות עם סטטיסטיקה (תלמידים פעילים, גיל ממוצע לפעילים). |
| **פרמטרים** | אין גוף. אין שאילתה. |
| **תשובה מוצלחת** | `200 OK` — מערך של אובייקטים במבנה `educationPlaceStats`. |

```json
[
  {
    "id": 1,
    "name": "פנימיית ההר",
    "city": "ירושלים",
    "isActive": true,
    "activeStudentCount": 12,
    "averageAge": 16.5
  }
]
```

---

### `GET /api/EducationPlaces/{id}`

| | |
|--|--|
| **תיאור** | פנימייה אחת לפי מזהה, עם אותן סטטיסטיקות. |
| **תשובה מוצלחת** | `200 OK` — אובייקט `educationPlaceStats`. |
| **שגיאות** | `404` — הפנימייה לא קיימת. |

---

### `POST /api/EducationPlaces`

| | |
|--|--|
| **גוף** | אובייקט יצירת פנימייה (`name`, `city`). |
| **תשובה מוצלחת** | `201 Created` — גוף: `educationPlace`. כותרת **`Location`** מצביעה על `GET` לפי המזהה החדש. |
| **שגיאות** | `400` — ולידציה. |

---

### `PUT /api/EducationPlaces/{id}`

| | |
|--|--|
| **גוף** | עדכון שם ועיר (ללא `id` בגוף). |
| **תשובה מוצלחת** | `200 OK` — `educationPlace` (ללא שדות סטטיסטיקה). |
| **שגיאות** | `400`, `404`. |

---

### `PATCH /api/EducationPlaces/{id}/active`

| | |
|--|--|
| **גוף** | `{ "isActive": true \| false }` |
| **תשובה מוצלחת** | `200 OK` — `educationPlace`. |
| **שגיאות** | `404` — לא קיימת. |

---

### `DELETE /api/EducationPlaces/{id}`

| | |
|--|--|
| **תשובה מוצלחת** | `204 No Content` — ללא גוף. |
| **שגיאות** | `400` — קיימים תלמידים משויכים; `404` — לא קיימת. |

---

## תלמידים — `Students`

### `GET /api/Students`

| | |
|--|--|
| **תיאור** | רשימת תלמידים, ממוינת לפי שם. |
| **שאילתה (אופציונלי)** | `educationPlaceId` — מספר; מסנן לפי פנימייה. |
| **דוגמה** | `GET /api/Students?educationPlaceId=1` |
| **תשובה מוצלחת** | `200 OK` — מערך `student`. |

---

### `GET /api/Students/{id}`

| | |
|--|--|
| **תשובה מוצלחת** | `200 OK` — אובייקט `student`. |
| **שגיאות** | `404`. |

---

### `POST /api/Students`

| | |
|--|--|
| **גוף** | יצירת תלמיד (ללא `id`). |
| **תשובה מוצלחת** | `201 Created` — `student` + כותרת **`Location`**. |
| **שגיאות** | `400` — ולידציה (גיל, ת״ז כפול, פנימייה לא פעילה וכו'); `404` — פנימייה לא קיימת. |

---

### `PUT /api/Students/{id}`

| | |
|--|--|
| **גוף** | עדכון תלמיד (אותם שדות כמו ביצירה). |
| **תשובה מוצלחת** | `200 OK` — `student`. |
| **שגיאות** | `400`, `404`. |

---

### `DELETE /api/Students/{id}`

| | |
|--|--|
| **תשובה מוצלחת** | `204 No Content`. |
| **שגיאות** | `404`. |

---

### `POST /api/Students/upsert`

| | |
|--|--|
| **גוף** | ראו סכמת Upsert למעלה. |
| **תשובה מוצלחת** | `200 OK` — `student` (תמיד). |
| **שגיאות** | `400`, `404`. |

---

## פורמט תשובת שגיאה

במקרים רבים השרת מחזיר JSON אחיד (מ־`GlobalExceptionMiddleware`):

```json
{
  "statusCode": 400,
  "message": "טקסט ההודעה",
  "timestamp": "2026-05-03T12:00:00.0000000Z"
}
```

| קוד HTTP | משמעות טיפוסית |
|----------|----------------|
| `400` | ולידציה / כלל עסקי (למשל ת״ז קיימת, פנימייה לא פעילה, מחיקת פנימייה עם תלמידים) |
| `404` | משאב לא נמצא |
| `500` | שגיאת שרת; הודעה כללית למשתמש |

---

## סיכום מהיר — טבלת כל הנקודות

| מתודה | נתיב | תשובה בהצלחה (גוף) |
|--------|------|---------------------|
| GET | `/api/EducationPlaces` | `educationPlaceStats[]` |
| GET | `/api/EducationPlaces/{id}` | `educationPlaceStats` |
| POST | `/api/EducationPlaces` | `educationPlace` (201) |
| PUT | `/api/EducationPlaces/{id}` | `educationPlace` |
| PATCH | `/api/EducationPlaces/{id}/active` | `educationPlace` |
| DELETE | `/api/EducationPlaces/{id}` | ריק (204) |
| GET | `/api/Students` | `student[]` |
| GET | `/api/Students/{id}` | `student` |
| POST | `/api/Students` | `student` (201) |
| PUT | `/api/Students/{id}` | `student` |
| DELETE | `/api/Students/{id}` | ריק (204) |
| POST | `/api/Students/upsert` | `student` (200) |

---

למבנה הפרויקט והסבר ארכיטקטורה ראו את [README.md](./README.md).
