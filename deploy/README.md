# איך מעלים לאוויר (מהמחשב ועד דפדפן)

מדריך קצר ופרקטי. **במילים פשוטות:** צריך שלושה דברים בענן — **מסד נתונים**, **תמונות Docker של האפליקציה**, ו**מקום שמריץ קונטיינרים** (למשל קלאסטר Kubernetes). אחרי זה מגדירים חיבור ומשחררים כתובת חיצונית.

---

## מה הצינור המלא?

```
קוד ב-repo  →  docker build (API + Web)  →  דחיפה לרגיסטרי (למשל ECR)
                    ↓
מיגרציות SQL מול RDS / SQL מנוהל  →  Secret עם מחרוזת חיבור ב-Kubernetes
                    ↓
kubectl apply  →  Pods רצים  →  Service / Ingress / LoadBalancer  →  משתמש פותח URL
```

בלי מסד מוכן ובלי סקריפטי `database/migrations/` — ה-API ייכשל בזמן ריצה.

**לא רוצים RDS?** אפשר להריץ **גם את SQL Server בקלאסטר** (דמו / למידה), עם Job שמריץ את המיגרציות — overlay **`kubernetes/overlays/full-stack`**. ראו **[`kubernetes/README.md`](kubernetes/README.md)** (אופציה B).

---

## דרישות מצידך

| כלי | למה |
|-----|-----|
| Docker | לבנות את התמונות |
| `kubectl` | להפעיל את הקבצים תחת `kubernetes/` |
| חשבון ענן (כאן: AWS) | RDS + ECR + EKS (או חלופה) |

---

## מסלול מומלץ: AWS (EKS + ECR + RDS)

זה המסלול שמתאים ישירות למניפסטים שב-repo. עקבו בסדר:

### שלב 1 — קלאסטר Kubernetes (EKS)

צרו קלאסטר ב-AWS (למשל עם [`eksctl`](https://eksctl.io/) או הקונסולה). חברו את `kubectl`:

```bash
aws eks update-kubeconfig --name שם-הקלאסטר --region אזור-לדוגמה
kubectl get nodes   # לוודא שיש חיבור
```

### שלב 2 — מסד SQL (RDS for SQL Server)

- צרו מופע **SQL Server** ב-RDS, באותו **VPC** (או עם routing) שאליו ה-Pods ב-EKS מגיעים.
- ב-**Security Group** של RDS: אפשרו **TCP 1433** מקבוצת האבטחה של ה-nodes / ה-Pods (או מצריך בדיקה לפי איך ה-EKS אצלכם מחובר ל-VPC).
- הריצו את הקבצים [`database/migrations/`](../database/migrations/) **בסדר** מול ה-endpoint (SSMS, Azure Data Studio, `sqlcmd`).
- רשמו **מחרוזת חיבור** מלאה (שרת, משתמש אפליקציה, סיסמה, `TrustServerCertificate` לפי הצורך).

### שלב 3 — בניית תמונות ודחיפה ל-ECR

מהשורש של הפרויקט (`education-system/`):

```bash
export AWS_REGION=eu-west-1
export ACCOUNT_ID=$(aws sts get-caller-account --query Account --output text)

aws ecr create-repository --repository-name education-api --region $AWS_REGION 2>/dev/null || true
aws ecr create-repository --repository-name education-web --region $AWS_REGION 2>/dev/null || true

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t education-api:latest ./backend
docker build -t education-web:latest ./edu-management

docker tag education-api:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-api:latest
docker tag education-web:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-web:latest

docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-api:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-web:latest
```

### שלב 4 — Secret למסד ו-EKS יודע את התמונות

```bash
cd deploy/kubernetes
cp secret-connection-string.yaml.example secret-connection-string.yaml
# ערכו את secret-connection-string.yaml — Server=..., User Id, Password
```

בקובץ [`kustomization.yaml`](kubernetes/kustomization.yaml) **בטלו הערה** מבלוק `images` ומלאו את כתובות ה-ECR והתגים (או השתמשו בפקודות `kubectl set image` אחרי ה-apply — ראו [`kubernetes/README.md`](kubernetes/README.md)).

### שלב 5 — פריסה לקלאסטר

```bash
kubectl apply -f secret-connection-string.yaml
kubectl apply -k .
```

בדיקה שהכל עלה:

```bash
kubectl -n education-system get pods
kubectl -n education-system get svc
```

### שלב 6 — איך משתמש פותח את האתר?

יש שתי דרכים נפוצות:

| דרך | מתאים ל |
|-----|---------|
| **Port-forward** (מחשבכם) | בדיקה בלבד: `kubectl -n education-system port-forward svc/education-web 8080:80` ואז `http://localhost:8080` |
| **LoadBalancer** על `education-web` | כתובת ציבורית מהירה בלי Ingress (עדכון ה-Service ל-`type: LoadBalancer` ב-EKS יקנה בדרך כלל NLB) |
| **Ingress + ALB** | כתובת יציבה, TLS, דומיין — דורש [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) והפעלת `ingress.yaml` — פירוט ב-[`aws/README.md`](aws/README.md) |

אם תרצו **NLB פשוט**, אפשר לערוך זמנית את `web-service.yaml`:

```yaml
spec:
  type: LoadBalancer   # במקום ClusterIP
```

לאחר `kubectl apply`, הריצו `kubectl -n education-system get svc education-web` וחפשו **EXTERNAL-IP** או **hostname** של ה-load balancer.

---

## לא רוצים Kubernetes?

- **ECS Fargate** + ALB + אותן תמונות מ-ECR + RDS — אותו רעיון, בלי קבצי `kubernetes/`.
- **מכונה אחת (EC2)** עם Docker והרצת `docker compose` — אפשרי לדמו, פחות “קלאוד נייטיב”.

פירוט נוסף: [`aws/README.md`](aws/README.md).

---

## קבצים בתיקייה

| נתיב | תוכן |
|------|------|
| [`kubernetes/`](kubernetes/) | מניפסטים: `base/`, `overlays/rds` (ברירת מחדל), `overlays/full-stack` (SQL+API+Web) |
| [`aws/README.md`](aws/README.md) | RDS, ECR, EKS, Ingress/ALB |

**לפני פרודקשן:** אל תעלו סיסמאות ל-git; השתמשו ב-Secrets Manager / External Secrets; הגבילו RDS לרשת פרטית.
