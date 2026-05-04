# פריסה ל-Kubernetes

לזרימה מקצה לקצה (בנייה, ECR, גישה מהדפדפן) ראו **[מדריך העלאה לאוויר](../README.md)**.

## מבנה תיקיות

| נתיב | תפקיד |
|------|--------|
| `base/` | משאבים משותפים: Namespace, ConfigMap ל-Nginx, שירותי API/Web |
| `overlays/rds/` | פריסת **API + Web** מול **SQL מנוהל** (RDS וכו') — ברירת המחדל של `kustomization.yaml` בשורש |
| `overlays/full-stack/` | **SQL Server בקלאסטר** + Job אתחול DB + API + Web (כמו `docker-compose`) |
| `ingress.yaml` | דוגמת Ingress (לא נכלל אוטומטית — `kubectl apply -f ingress.yaml` לפי הצורך) |
| `secret-connection-string.yaml.example` | תבנית Secret רק ל-RDS (רק מפתח `connection-string`) |
| `sync-assets-from-database.sh` | מסנכרן את `overlays/full-stack/assets/` מ־`database/` אחרי שינוי מיגרציות |

---

## אופציה A — DB בענן (RDS), רק אפליקציה בקלאסטר

מתאים לפרודקשן. המיגרציות רצות מול RDS (ידנית / CI).

1. בנו תמונות:

   ```bash
   docker build -t education-api:latest ./backend
   docker build -t education-web:latest ./edu-management
   ```

2. צרו Secret (רק מחרוזת חיבור):

   ```bash
   cd deploy/kubernetes
   cp secret-connection-string.yaml.example secret-connection-string.yaml
   # ערכו — Server=ה-endpoint של RDS, משתמש וסיסמה
   kubectl apply -f secret-connection-string.yaml
   ```

3. פרוסו (משורש `deploy/kubernetes`):

   ```bash
   kubectl apply -k .
   ```

---

## אופציה B — DB + Backend + Frontend כולם בקלאסטר (full-stack)

כמו `docker-compose`: **SQL Server** (קונטיינר), **Job** שמריץ `database/init-db.sh` והמיגרציות, **API** עם init שמחכה לסכמה, **Web**.

### דרישות

- צמתים **amd64** ל-SQL Server, ל-Job ול-Pods של ה-API (תמונות Microsoft). על קלאסטר ARM בלבד הפריסה לא תתאים.
- לפחות ~4GB זיכרון פנוי לפוד SQL (בקשות/גבולות במניפסט).

### צעדים

1. סנכרון קבצי מיגרציה ל-overlay (אחרי כל שינוי ב־`database/migrations/`):

   ```bash
   ./deploy/kubernetes/sync-assets-from-database.sh
   ```

2. בנו תמונות API ו-Web (כמו למעלה).

3. Secret עם **אותה סיסמה** ב־`SA_PASSWORD` ובמחרוזת החיבור:

   ```bash
   cd deploy/kubernetes/overlays/full-stack
   cp secret-full-stack.yaml.example secret-full-stack.yaml
   # ערכו — חייב להתאים ל-sqlserver (ברירת מחדל בדוגמה כמו docker-compose)
   kubectl apply -f secret-full-stack.yaml
   ```

4. פריסה:

   ```bash
   cd deploy/kubernetes
   kubectl apply -k overlays/full-stack
   ```

5. מצב:

   ```bash
   kubectl -n education-system get pods
   kubectl -n education-system logs job/db-init
   ```

6. כניסה לממשק (בלי Ingress):

   ```bash
   kubectl -n education-system port-forward svc/education-web 8080:80
   ```

   דפדפן: `http://localhost:8080`.

### אם Job נכשל

לאחר תיקון:

```bash
kubectl -n education-system delete job db-init
kubectl apply -k deploy/kubernetes/overlays/full-stack
```

---

## Ingress

הוסיפו ל־`overlays/.../kustomization.yaml` משאב `../../ingress.yaml` או היפרדו:

```bash
kubectl apply -f deploy/kubernetes/ingress.yaml
```

## החלפת תמונות (ECR)

ערכו `images:` ב־`deploy/kubernetes/kustomization.yaml` או ב־overlay הספציפי, או:

```bash
kubectl -n education-system set image deployment/education-api api=...
kubectl -n education-system set image deployment/education-web web=...
```
