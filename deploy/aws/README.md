# פריסה ל-AWS (EKS + RDS)

לצינור המלא בעברית (מה קורה קודם ומה אחרי) השתמשו ב-[**מדריך העלאה לאוויר**](../README.md). כאן פירוט טכני ל-RDS, ECR ו-EKS.

סקיצת זרימה למערכת החינוך בענן AWS. הנחות: חשבון AWS, `aws cli`, `kubectl`, ו-Docker לבניית תמונות.

## 1. מסד נתונים — RDS for SQL Server

1. בקונסולת RDS צרו מופע **SQL Server** (גרסה תואמת לפרויקט; פורט 1433).
2. צרו משתמש/סיסמה לאפליקציה (לא SA).
3. פתחו גישה מה-VPC שבו ירוץ EKS (Security Group — ingress מה-node או מה-Pods לפי ארכיטקטורה).
4. הריצו את סקריפטי [`database/migrations/`](../../database/migrations/) בסדר מול ה-endpoint (SSMS, `sqlcmd`, או Job ב-CI).

שמרו את מחרוזת החיבור בפורמט:

`Server=HOST,1433;Database=EducationSystem;User Id=...;Password=...;TrustServerCertificate=True;`

## 2. רגיסטרי תמונות — ECR

```bash
export AWS_REGION=eu-west-1
export ACCOUNT_ID=$(aws sts get-caller-account --query Account --output text)

aws ecr create-repository --repository-name education-api --region $AWS_REGION 2>/dev/null || true
aws ecr create-repository --repository-name education-web --region $AWS_REGION 2>/dev/null || true

aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker build -t education-api:latest ../../backend
docker build -t education-web:latest ../../edu-management

docker tag education-api:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-api:latest
docker tag education-web:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-web:latest

docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-api:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/education-web:latest
```

## 3. קלאסטר — EKS

צרו קלאסטר (למשל `eksctl create cluster` או CloudFormation). חברו `kubectl`:

```bash
aws eks update-kubeconfig --name YOUR_CLUSTER --region $AWS_REGION
```

הגדירו את nodes/worker nodes למשוך מ-ECR באותו חשבון (בדרך כלל IAM ל-worker כבר מאפשר `ecr:GetAuthorizationToken`).

## 4. Ingress (אופציונלי)

להפצת HTTP/HTTPS חיצונית דרך ALB התקינו [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/) על הקלאסטר.

ב־`deploy/kubernetes/ingress.yaml`:

- החליפו `ingressClassName: nginx` ב־`alb` אם יצרתם IngressClass בשם כזה.
- הוסיפו annotations לפי התיעוד (למשל `alb.ingress.kubernetes.io/scheme: internet-facing`, תת-דומיין ACM וכו').
- עדכנו את `host` לדומיין אמיתי.

הפעילו את `ingress.yaml` ב־`kustomization.yaml` והחילו מחדש.

## 5. Secrets והפעלת המניפסטים

```bash
cd ../kubernetes
cp secret-connection-string.yaml.example secret-connection-string.yaml
# ערכו secret-connection-string.yaml — endpoint של RDS

# עדכנו kustomization.yaml עם בלוק images ל-ECR (ראו הערות בקובץ)
kubectl apply -f secret-connection-string.yaml
kubectl apply -k .
```

אימות:

```bash
kubectl -n education-system get pods
kubectl -n education-system get svc
```

## אלטרנטיבות

- **ECS Fargate** במקום EKS: הגדירו Task Definitions עם אותן תמונות מ-ECR, שירות עם ALB, ו-RDS כמו לעיל; ללא קבצי Kubernetes.
- **Elastic Beanstalk** או **App Runner** יכולים לארח את ה-API או מיכל בודד — פחות מתאים למונולית דו-שכבתית (API+SPA) בלי התאמות.

## אבטחה ופרודקשן

- אל תשמרו סיסמאות ב-git; השתמשו ב-AWS Secrets Manager + External Secrets Operator או בהזרקה מ-CI.
- הגבילו את RDS ל-VPC בלבד; השתמשו ב-TLS במפורש כשהתשתית תומכת בזה.
- עדכנו CORS ב-backend אם לקוחות ניגשים ל-API מדומיין שונה מהווי (ראו `Program.cs`).
