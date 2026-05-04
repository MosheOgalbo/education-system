# EduManagement — פרונטאנד (Angular)

אפליקציית **Angular 21** (standalone components) לניהול פנימיות ותלמידים מול ה-API. ממשק בעברית, Material Design, ומצב גלובלי מבוסס **Signals** (ללא NgRx).

---

## עץ הפרויקט — מבנה תיקיות וקבצים (מעודכן)

הסבר קצר בעברית ליד כל פריט: **מה התפקיד בפרויקט**.

```
edu-management/
├── .dockerignore                    # קבצים שלא נכללים בהקשר build של Docker (מקצר זמן וגודל אימג').
├── .editorconfig                    # כללי עורך משותפים: ריווח, סוף שורה, charset — עקביות בין מפתחים.
├── .gitignore                       # רשימת קבצים/תיקיות שלא נדחפים ל-Git (build, node_modules).
├── .prettierrc                      # הגדרות Prettier לפורמט קוד אוטומטי.
├── .vscode/                         # הגדרות IDE לצוות: הרצה, משימות, הרחבות מומלצות.
│   ├── extensions.json              # רשימת הרחבות מומלצות לפרויקט Angular.
│   ├── launch.json                  # פרופילי דיבוג (Chrome וכו').
│   ├── mcp.json                     # הגדרות MCP לכלי עזר ב-Cursor/VS Code (אופציונלי).
│   └── tasks.json                   # משימות מוכנות (build, serve).
├── angular.json                     # לב Angular CLI: שם פרויקט, build, serve, קובץ proxy, נכסים.
├── Dockerfile                       # בניית האפליקציה ל-static + שלב nginx להגשת קבצים ו-proxy ל-API.
├── package.json                     # תלויות npm וסקריפטים (ng serve, build, test, lint).
├── package-lock.json                # נעילת גרסאות מדויקת ל-reproducible installs.
├── proxy.conf.cjs                   # בפיתוח: ניתוב `/api` מהדפדפן לשרת הבקאנד (עוקף CORS מקומית).
├── README.md                        # תיעוד זה — מבנה, הרצה, ארכיטקטורה.
├── tsconfig.json                    # בסיס TypeScript לכל ה-workspace (paths, strict וכו').
├── tsconfig.app.json                # הגדרות TS רק לקוד האפליקציה תחת `src/` (נכלל ב-build).
├── tsconfig.spec.json               # הגדרות TS לבדיקות יחידה.
│
├── nginx/
│   └── default.conf                 # nginx: הגשת `dist`, proxy ל-`/api` לקונטיינר ה-API בפריסה.
│
├── public/
│   └── favicon.ico                  # אייקון כרטיסייה בדפדפן.
│
└── src/
    ├── index.html                   # דף HTML יחיד של ה-SPA — טעינת הסקריפטים וה-base href.
    ├── main.ts                      # נקודת כניסה: `bootstrapApplication` עם AppComponent ו-appConfig.
    ├── styles.scss                  # ייבוא גלובלי של partials — נקודת כניסה לסגנון כל האפליקציה.
    │
    ├── styles/                      # עיצוב מפוצל — שינוי תמה/טוקנים מרוכז.
    │   ├── _gov-tokens.scss         # משתני עיצוב (צבעים, ריווח, טיפוגרפיה) בסגנון «ממשלי».
    │   ├── _theme.scss              # חיבור ל-Material theme ומשתני תמה.
    │   ├── _typography.scss         # כללי גופנים וגדלי טקסט.
    │   └── _utilities.scss          # מחלקות עזר ל-layout וכיווניות.
    │
    └── app/
        ├── app.component.ts         # רכיב שורש: סרגל עליון, ניווט, `<router-outlet>` ושכבת פידבק גלובלית.
        ├── app.component.scss       # סגנונות המעטפת והסרגל.
        ├── app.config.ts            # רישום גלובלי: עברית, Router, HttpClient+interceptors, Material, אנימציות.
        ├── app.routes.ts            # טבלת נתיבים + lazy loading לפיצ'רים + הפניות ברירת מחדל.
        ├── app.spec.ts              # בדיקת עשן: האפליקציה נטענת.
        │
        ├── core/                    # תשתית «חיוּת האפליקציה» — חד-פעמי, לא דומיין ספציפי.
        │   ├── config/
        │   │   └── api.config.ts              # InjectionToken: בסיס URL ל-API ו-timeout.
        │   ├── interceptors/
        │   │   ├── api-base-url.interceptor.ts    # מצרף baseUrl לכל בקשה יחסית ל-API.
        │   │   └── error-handler.interceptor.ts   # מיפוי שגיאות HTTP + טוסטים (לא על GET כדי לא לכפול UI).
        │   ├── models/
        │   │   ├── api-error.model.ts           # טיפוסי שגיאה ומצבי async משותפים.
        │   │   ├── education-place.model.ts      # ממשקים התואמים ל-DTO של פנימיות מהשרת.
        │   │   └── student.model.ts              # ממשקים התואמים ל-DTO של תלמידים מהשרת.
        │   ├── services/
        │   │   ├── toast.service.ts              # עטיפה ל-MatSnackBar — הודעות קצרות (שגיאה בפעולות שינוי).
        │   │   └── operation-feedback.service.ts # פידבק מלא-מסך אחרי פעולה (הצלחה/שגיאה) דרך overlay.
        │   ├── validators/
        │   │   └── business-input.validators.ts # ולידטורים לטפסים — התאמה לכללי הבקאנד (שם, ת״ז).
        │   └── utils/
        │       └── http-error.mapper.ts          # המרת HttpErrorResponse ל-ApiError והודעות בעברית.
        │
        ├── features/                # פיצ'רים לפי דומיין — כל אחד עם routes, store, רכיבים.
        │   │
        │   ├── education-places/    # ניהול רשימת פנימיות: טעינה, סינון, CRUD, סטטוס פעילות.
        │   │   ├── education-places.routes.ts     # הגדרת נתיב ה-feature ו-load של רכיב הדף.
        │   │   ├── models/
        │   │   │   └── education-places-filter.model.ts  # מודל מצב סינון (עיר, טקסט חופשי וכו').
        │   │   ├── services/
        │   │   │   └── education-places.service.ts       # קריאות HTTP ל-endpoints של EducationPlaces.
        │   │   ├── store/
        │   │   │   └── education-places.store.ts         # Signals: רשימה, סינון לקוח, פעולות ומצבי טעינה.
        │   │   └── components/
        │   │       ├── education-places-page/            # דף ראשי: טבלה/כרטיסים, מצבי ריק/שגיאה.
        │   │       │   ├── education-places-page.component.ts
        │   │       │   ├── education-places-page.component.html
        │   │       │   └── education-places-page.component.scss
        │   │       ├── education-place-form-dialog/        # דיאלוג יצירת פנימייה חדשה.
        │   │       ├── education-places-filter-dialog/     # דיאלוג סינון מתקדם לרשימת הפנימיות.
        │   │       └── education-place-stats-card/       # כרטיס סטטיסטיקה (בעיקר תצוגת מובייל).
        │   │
        │   └── students/          # תלמידים במסגרת פנימייה נבחרת (מזהה מה-route).
        │       ├── students.routes.ts                      # ניתוב לדף התלמידים תחת `education-places/:id/students`.
        │       ├── models/
        │       │   └── students-list-filter.model.ts     # פרמטרי סינון לרשימת התלמידים בדף.
        │       ├── services/
        │       │   └── students.service.ts               # HTTP ל-Students כולל upsert לפי הצורך.
        │       ├── store/
        │       │   └── students.store.ts                 # Signals: טעינה לפי placeId, פילטרים, CRUD.
        │       └── components/
        │           ├── students-page/                    # דף רשימת תלמידים + כותרת פנימייה.
        │           ├── student-form-dialog/               # טופס יצירה/עריכת תלמיד.
        │           ├── students-filter-dialog/           # דיאלוג סינון תלמידים (פעילות וכו').
        │           └── student-transfer-dialog/          # דיאלוג להעברת תלמיד לפנימייה אחרת מהדף.
        │
        └── shared/                # רכיבים גנריים ללא לוגיקת דומיין — שימוש חוזר בין פיצ'רים.
            ├── components/
            │   ├── generic-table/           # טבלה גנרית עם מיון ופעולות שורה.
            │   ├── autocomplete-input/      # שדה עם השלמה והשהיה — סינון טקסט.
            │   ├── confirm-dialog/          # דיאלוג אישור מחיקה/פעולה הרסנית.
            │   ├── empty-state/             # מצב «אין נתונים».
            │   ├── error-state/             # מצב שגיאה עם «נסה שוב».
            │   ├── loading-skeleton/        # שלד טעינה.
            │   └── operation-feedback-overlay/  # Overlay גלובלי לפידבק פעולה (מחובר ל-operation-feedback.service).
            └── pipes/
                └── default-value.pipe.ts    # תצוגת placeholder לערכים ריקים (למשל «—»).
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

| קובץ / תיקייה | תפקיד |
|---------------|--------|
| `config/api.config.ts` | `InjectionToken` לכתובת בסיס ה-API ו-timeout — מקור אחד לכל השירותים. |
| `interceptors/api-base-url.interceptor.ts` | מצרף `baseUrl` לכל בקשה יחסית; כתובות מוחלטות נשמרות. |
| `interceptors/error-handler.interceptor.ts` | מיפוי שגיאות ל-`ApiError`, טוסט על פעולות שינוי בלבד (לא GET). |
| `utils/http-error.mapper.ts` | תרגום `HttpErrorResponse` להודעות בעברית ומבנה אחיד לרכיבים. |
| `models/api-error.model.ts` | טיפוסים למצבי טעינה/שגיאה ושגיאות API. |
| `models/education-place.model.ts` / `student.model.ts` | התאמה ל-DTO של הבקאנד בצד הלקוח. |
| `services/toast.service.ts` | הודעות קצרות (SnackBar) לשגיאות ופידבק מהיר. |
| `services/operation-feedback.service.ts` | מצב גלובלי להודעות הצלחה/כישלון ארוכות יותר ב-overlay. |
| `validators/business-input.validators.ts` | ולידציה בטפסים שמיושרת עם חוקי הבקאנד (שם, ת״ז ישראלית). |

### פיצ'ר פנימיות

| קובץ / תיקייה | תפקיד |
|---------------|--------|
| `education-places.routes.ts` | רישום הנתיב והטעינה העצלה של דף הפנימיות. |
| `models/education-places-filter.model.ts` | מבנה נתונים למצב הסינון (שדות בדיאלוג / שורת חיפוש). |
| `services/education-places.service.ts` | קריאות REST ל-`/api/EducationPlaces`. |
| `store/education-places.store.ts` | Signals: רשימה, סינון לקוח, יצירה/מחיקה/שינוי פעילות, מניעת race בטעינה. |
| `education-places-page.*` | דף ראשי: טבלה וכרטיסים, חיבור ל-store ולדיאלוגים. |
| `education-place-form-dialog` | דיאלוג יצירת פנימייה חדשה. |
| `education-places-filter-dialog` | דיאלוג סינון מתקדם (עיר ופרמטרים נוספים לפי המימוש). |
| `education-place-stats-card` | תצוגת סיכום סטטיסטיקה לפריט (למשל במובייל). |

### פיצ'ר תלמידים

| קובץ / תיקייה | תפקיד |
|---------------|--------|
| `students.routes.ts` | ניתוב תחת `education-places/:id/students`. |
| `models/students-list-filter.model.ts` | פרמטרים לסינון רשימת התלמידים בדף. |
| `services/students.service.ts` | REST ל-`/api/Students` כולל upsert כשנדרש. |
| `store/students.store.ts` | Signals: טעינה לפי מזהה פנימייה, פילטרים, CRUD. |
| `students-page.*` | דף רשימת תלמידים, כותרת עם שם הפנימייה, חיבור לטבלה ודיאלוגים. |
| `student-form-dialog` | טופס יצירה או עריכת תלמיד. |
| `students-filter-dialog` | דיאלוג לסינון תלמידים (למשל לפי פעילות). |
| `student-transfer-dialog` | דיאלוג להעברת תלמיד בין פנימיות (שימוש בזרימת UI הרלוונטית). |

### Shared

| קובץ / תיקייה | תפקיד |
|---------------|--------|
| `generic-table.*` | טבלה גנרית: עמודות, מיון, פעולות שורה — ללא ידע ספציפי על פנימיות/תלמידים. |
| `autocomplete-input` | קלט עם השלמה והשהיה — מתאים לסינון טקסט חופשי. |
| `confirm-dialog` | אישור פעולות הרסניות לפני קריאה לשרת. |
| `loading-skeleton` / `empty-state` / `error-state` | מצבי UX עקביים לטעינה, ריק ושגיאה. |
| `operation-feedback-overlay` | תצוגת overlay גלובלית המחוברת ל-`OperationFeedbackService`. |
| `default-value.pipe.ts` | הצגת טקסט חלופי לערכי null/ריק בטבלאות וכרטיסים. |

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
