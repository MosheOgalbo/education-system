# EduManagement — פרונטאנד (Angular)

אפליקציית **Angular 21** (standalone components) לניהול פנימיות ותלמידים מול ה-API. ממשק בעברית, Material Design, ומצב גלובלי מבוסס **Signals** (ללא NgRx).

---

## עץ הפרויקט — כל הקבצים

```
edu-management/
├── .dockerignore              # קבצים/תיקיות שלא נכנסים להקשר Docker build
├── .editorconfig              # כללי קידוד אחידים (indent, charset) לעורכים
├── .gitignore                 # מה לא נשמר ב-Git (node_modules, dist, וכו')
├── .prettierrc                # עיצוב קוד אוטומטי (Prettier)
├── angular.json               # הגדרות Angular CLI: פרויקט, build, serve, proxyConfig
├── Dockerfile                 # בניית אפליקציה סטטית + שרת nginx לפרודקשן
├── package.json               # תלויות npm וסקריפטים (ng serve, build, test)
├── package-lock.json          # נעילת גרסאות תלויות מדויקות
├── proxy.conf.cjs             # בפיתוח: מפנה בקשות `/api` לכתובת הבקאנד
├── README.md                  # תיעוד זה
├── tsconfig.json              # הגדרות TypeScript בסיסיות לכל ה-workspace
├── tsconfig.app.json          # TS רק לאפליקציה (src) — נכלל ב-build
├── tsconfig.spec.json         # TS לבדיקות (Vitest / spec)
│
├── nginx/
│   └── default.conf           # קונפיגורציית nginx: קבצים סטטיים + proxy ל־`/api`
│
├── public/
│   └── favicon.ico            # אייקון לשונית הדפדפן
│
└── src/
    ├── index.html             # HTML ראשי — טעינת האפליקציה, base href
    ├── main.ts                # נקודת כניסה: bootstrapApplication(AppComponent, appConfig)
    ├── styles.scss            # ייבוא גלובלי של תמה, טוקנים וטיפוגרפיה
    │
    ├── styles/                # שכבת עיצוב מפורקת (partial SCSS)
    │   ├── _gov-tokens.scss   # משתני צבע/ריווח/טיפוגרפיה בסגנון «ממשל» (design tokens)
    │   ├── _theme.scss        # חיבור ל-Material / משתני תמה
    │   ├── _typography.scss   # כללי גופנים וגדלים
    │   └── _utilities.scss    # עזרי layout / utility classes
    │
    └── app/
        ├── app.component.ts       # רכיב שורש: סרגל עליון, ניווט, router-outlet
        ├── app.component.scss     # סגנונות סרגל ומעטפת הדף
        ├── app.config.ts          # רישום providers: Router, HttpClient, locale עברית, Material
        ├── app.routes.ts          # נתיבי האפליקציה + lazy loading לפיצ'רים
        ├── app.spec.ts            # בדיקת יחידה בסיסית ל-AppComponent
        │
        ├── core/                  # תשתית אפליקציה — לא תלוי בפיצ'ר ספציפי
        │   ├── config/
        │   │   └── api.config.ts           # InjectionToken: baseUrl `/api`, timeout
        │   ├── interceptors/
        │   │   ├── api-base-url.interceptor.ts   # קידומת כתובת לכל בקשה יחסית
        │   │   └── error-handler.interceptor.ts  # מיפוי שגיאות + טוסט (לא על GET)
        │   ├── models/
        │   │   ├── api-error.model.ts        # ApiError, AsyncState, מצבי טעינה
        │   │   ├── education-place.model.ts  # ממשקי DTO לפנימיות (מול ה-API)
        │   │   └── student.model.ts          # ממשקי DTO לתלמידים
        │   ├── services/
        │   │   └── toast.service.ts          # עטיפה ל-MatSnackBar (הצלחה/שגיאה/מידע)
        │   └── utils/
        │       └── http-error.mapper.ts      # toApiError, הודעות ידידותיות, כותרות מסך שגיאה
        │
        ├── features/
        │   │
        │   ├── education-places/             # פיצ'ר: רשימת פנימיות, סינון, יצירה, מחיקה, פעילות
        │   │   ├── education-places.routes.ts
        │   │   ├── services/
        │   │   │   └── education-places.service.ts   # HttpClient ל-EducationPlaces + *Async
        │   │   ├── store/
        │   │   │   └── education-places.store.ts     # Signals: טעינה, סינון, פעולות CRUD
        │   │   └── components/
        │   │       ├── education-places-page/
        │   │       │   ├── education-places-page.component.ts    # לוגיקת דף: טבלה/כרטיסים, דיאלוגים
        │   │       │   ├── education-places-page.component.html  # תבנית: מצבי טעינה/שגיאה/ריק
        │   │       │   └── education-places-page.component.scss  # עיצוב דף פנימיות
        │   │       ├── education-place-form-dialog/
        │   │       │   └── education-place-form-dialog.component.ts  # דיאלוג: טופס יצירת פנימייה (inline template)
        │   │       └── education-place-stats-card/
        │   │           └── education-place-stats-card.component.ts   # כרטיס סטטיסטיקה (מובייל)
        │   │
        │   └── students/                     # פיצ'ר: תלמידים לפי פנימייה
        │       ├── students.routes.ts        # נתיב ריק → StudentsPageComponent
        │       ├── services/
        │       │   └── students.service.ts   # HttpClient ל-Students (כולל upsert) + *Async
        │       ├── store/
        │       │   └── students.store.ts     # Signals: טעינה לפי placeId, סינון פעיל, CRUD
        │       └── components/
        │           ├── students-page/
        │           │   ├── students-page.component.ts     # דף: route param, טבלה, דיאלוגים
        │           │   ├── students-page.component.html
        │           │   └── students-page.component.scss
        │           └── student-form-dialog/
        │               └── student-form-dialog.component.ts  # דיאלוג יצירה/עריכת תלמיד
        │
        └── shared/                    # קומפוננטות וצינורות לשימוש חוזר
            ├── components/
            │   ├── generic-table/
            │   │   ├── generic-table.component.ts   # טבלת Material גנרית: מיון, פעולות, OnPush
            │   │   └── generic-table.types.ts       # ColumnDef, TableAction, SortState
            │   ├── autocomplete-input/
            │   │   └── autocomplete-input.component.ts  # חיפוש/סינון עם autocomplete + CVA
            │   ├── empty-state/
            │   │   └── empty-state.component.ts     # מסך «אין נתונים» עם אייקון וכפתור
            │   ├── error-state/
            │   │   └── error-state.component.ts     # מסך שגיאה + ניסיון חוזר
            │   └── loading-skeleton/
            │       └── loading-skeleton.component.ts  # שלד טעינה (placeholder)
            └── pipes/
                └── default-value.pipe.ts        # הצגת ערך ברירת מחדל (למשל «—») ל-null/rיק
```

---

## חלוקת תיקיות — למה כך?

| תיקייה | מטרה |
|--------|------|
| **`core/`** | דברים שטעינת האפליקציה צריכה פעם אחת: HTTP, interceptors, מודלים גולמיים, טוסטים. **לא** לייבא `core` מתוך `shared` בצורה שיוצרת תלות מעגלית — `core` הוא השכבה הפנימית ביותר מבחינת «תשתית אפליקציה». |
| **`features/`** | כל יכולת מוצר (פנימיות / תלמידים) עם routes, service, store וקומפוננטות משלה. קל למצוא ולמחוק פיצ'ר שלם. |
| **`shared/`** | UI גנרי בלי לוגיקת דומיין ספציפית (טבלה, מצבי ריק/שגיאה/טעינה). |
| **`styles/`** | הפרדת עיצוב: טוקנים, תמה, טיפוגרפיה — קל לשנות מראה מרוכז. |

---

## זרימת נתונים (ארכיטקטורה קצרה)

1. **Router** טוען lazy את מודול הנתיב (`loadChildren` / `loadComponent`).
2. **דף** מזריק **Store** (signal-based).
3. **Store** קורא ל-**Service** (`*Async` + `HttpClient`).
4. **Interceptors**: מקדימים כתובת מלאה ל־`/api`; במקרה שגיאה — מיפוי ל־`ApiError`, טוסט לפעולות שינוי (לא ל-GET כדי לא לכפול עם מסך שגיאה).
5. **תבנית הדף** קוראת ל־`computed`/`signal` מה-store ומציגה טבלה / כרטיסיות / דיאלוגים.

---

## פירוט קבצים לפי נושא (סיכום)

### קונפיגורציה וסביבת פיתוח

| קובץ | תפקיד |
|------|--------|
| `angular.json` | הגדרת `projects.edu-management`: `build`, `serve` (כולל `proxyConfig`), `test`. |
| `tsconfig*.json` | שרשרת היררכית: בסיס → אפליקציה → בדיקות. |
| `proxy.conf.cjs` | מנותב `/api` לשרת Backend בפיתוח (פורט לפי הקומפוז). |
| `.editorconfig` / `.prettierrc` | אחידות קוד בצוות. |
| `.dockerignore` | מצמצם הקשר build (ללא `node_modules` מיותרים וכו'). |

### פריסה (Docker / nginx)

| קובץ | תפקיד |
|------|--------|
| `Dockerfile` | שלב build (`ng build`) + שלב nginx שמגיש `dist`. |
| `nginx/default.conf` | `location /api` → proxy לשירות ה-API; שאר הבקשות → קבצים סטטיים. |

### כניסה ומעטפת האפליקציה

| קובץ | תפקיד |
|------|--------|
| `src/main.ts` | אתחול Angular. |
| `src/index.html` | דף HTML יחיד (SPA). |
| `src/styles.scss` + `src/styles/_*.scss` | עיצוב גלובלי וטוקנים. |
| `app.component.*` | מעטפת UI עם כותרת וניווט. |
| `app.config.ts` | כל ה-providers הגלובליים. |
| `app.routes.ts` | טבלת נתיבים ו-redirects. |
| `app.spec.ts` | בדיקה בסיסית שהאפליקציה נוצרת. |

### Core

| קובץ | תפקיד |
|------|--------|
| `api.config.ts` | `InjectionToken` לכתובת ה-API. |
| `api-base-url.interceptor.ts` | צירוף `baseUrl` לנתיבים יחסיים. |
| `error-handler.interceptor.ts` | טיפול בשגיאות HTTP + טוסטים סלקטיביים. |
| `http-error.mapper.ts` | המרת `HttpErrorResponse` ל־`ApiError` + טקסטים בעברית. |
| `api-error.model.ts` | טיפוסים למצב אסינכרוני ושגיאות. |
| `education-place.model.ts` / `student.model.ts` | התאמה ל-DTOs של השרת. |
| `toast.service.ts` | הודעות קצרות למשתמש. |

### פיצ'ר פנימיות

| קובץ | תפקיד |
|------|--------|
| `education-places.routes.ts` | `loadComponent` לדף הפנימיות. |
| `education-places.service.ts` | קריאות REST ל-`EducationPlaces`. |
| `education-places.store.ts` | מצב רשימה, סינון, יצירה, מחיקה, שינוי פעילות. |
| `education-places-page.*` | UI מלא: טבלה/מובייל, פילטרים, דיאלוג. |
| `education-place-form-dialog.component.ts` | טופס הוספת פנימייה. |
| `education-place-stats-card.component.ts` | תצוגת כרטיס לנתוני סטטיסטיקה. |

### פיצ'ר תלמידים

| קובץ | תפקיד |
|------|--------|
| `students.routes.ts` | ניתוב לרכיב דף התלמידים. |
| `students.service.ts` | REST ל-`Students` כולל `upsert` אם נדרש. |
| `students.store.ts` | טעינה לפי `educationPlaceId`, סינון פעיל, CRUD. |
| `students-page.*` | רשימת תלמידים, כותרת עם שם פנימייה, דיאלוגים. |
| `student-form-dialog.component.ts` | טופס תלמיד (יצירה/עריכה). |

### Shared

| קובץ | תפקיד |
|------|--------|
| `generic-table.*` | טבלה גנרית עם מיון ופעולות. |
| `autocomplete-input.component.ts` | שדה חיפוש/בחירה עם השהיה. |
| `loading-skeleton` / `empty-state` / `error-state` | מצבי UI סטנדרטיים. |
| `default-value.pipe.ts` | תצוגה נקייה של ערכים חסרים. |

---

## הרצה מקומית

```bash
cd edu-management
npm install
ng serve
```

דפדפן: `http://localhost:4200/`. ה-proxy ב־`angular.json` מפנה `/api` לבקאנד (ראו `proxy.conf.cjs`).

בנייה:

```bash
ng build
```

בדיקות:

```bash
ng test
```

---

## פונקציות חשובות (לראיון)

### Stores

- **`performLoad`** — מונה `loadSeq` למניעת race בין טעינות.
- **`filteredItems` / `filteredStudents`** — סינון מקומי בלי קריאת רשת.

### Generic table

- **`sortedData`** — `localeCompare('he', { numeric: true })`.
- **`getNestedValue`** — מפתחות מקוננים.
- **`onSort`** — עדכון `sortState`.

### Autocomplete

- **`filterOptions`** — סינון case-insensitive.
- **CVA** — `writeValue` / `registerOnChange` לשילוב בטפסים.

---

## שאלות ראיון אפשריות ותשובות קצרות

1. **למה Signals ולא NgRx?** — פחות boilerplate לפרויקט בגודל זה; ריאקטיביות נשמרת.
2. **למה לא טוסט על GET?** — `ErrorState` מלא; מניעת כפילות.
3. **למה `firstValueFrom`?** — async/await נקי לטעינות חד-פעמיות.
4. **למה `dir="ltr"` בטבלה?** — תיקון יישור/מיון Material ב-RTL.
5. **Lazy routes?** — פיצול חבילות וטעינה לפי צורך.
6. **CORS בפיתוח?** — proxy; בפרודקשן nginx.
7. **סטטיסטיקה 0 אחרי יצירת פנימייה?** — ה-API מחזיר DTO בלי אגרגציה; ה-UI משלים עד רענון.

---

## קישורים

- [Angular CLI](https://angular.dev/tools/cli)
- [Angular Documentation](https://angular.dev)
