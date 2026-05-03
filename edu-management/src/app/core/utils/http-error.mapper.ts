/**
 * מיפוי שגיאות HTTP לשכבת ה-UI.
 *
 * - אם השרת מחזיר גוף מובנה (statusCode + message) — משתמשים בו (עקביות עם ה-API).
 * - אחרת — הודעות ידידותיות בעברית לפי קוד סטטוס, כולל 0 לרשת/שרת לא זמין (CORS/timeout וכו').
 *
 * הפרדה מ-error-handler: כאן רק לוגיקת מיפוי; הצגה (טוסט מול מסך מלא) נשארת ב-interceptor ובדפים.
 */
import { HttpErrorResponse } from '@angular/common/http';

import type { ApiError } from '../models/api-error.model';

/** הופך תשובת שגיאת HTTP להודעת ApiError אחידה לצג ולטוסטים. */
export function toApiError(error: HttpErrorResponse): ApiError {
  const structured = parseStructuredApiBody(error.error);
  if (structured) {
    return {
      statusCode: structured.statusCode,
      message: structured.message,
      timestamp: structured.timestamp ?? new Date().toISOString(),
    };
  }

  return {
    statusCode: error.status,
    message: friendlyHttpMessage(error),
    timestamp: new Date().toISOString(),
  };
}

/**
 * גוף שגיאה מה-API (GlobalExceptionMiddleware) — תומך ב-PascalCase מהשרת (.NET)
 * וב-camelCase, כדי שהמודל יציג את ה-message העסקי ולא הודעת 400 גנרית.
 */
function parseStructuredApiBody(
  body: unknown,
): Pick<ApiError, 'statusCode' | 'message'> & { timestamp?: string } | null {
  if (typeof body !== 'object' || body === null) return null;
  const o = body as Record<string, unknown>;
  const rawMessage = o['message'] ?? o['Message'];
  const rawStatus = o['statusCode'] ?? o['StatusCode'];
  const rawTimestamp = o['timestamp'] ?? o['Timestamp'];

  if (typeof rawMessage !== 'string' || rawMessage.length === 0) return null;
  if (typeof rawStatus !== 'number' && typeof rawStatus !== 'string') return null;

  const statusCode = typeof rawStatus === 'number' ? rawStatus : Number(rawStatus);
  if (!Number.isFinite(statusCode)) return null;

  return {
    statusCode,
    message: rawMessage,
    timestamp: typeof rawTimestamp === 'string' ? rawTimestamp : undefined,
  };
}

/** הודעה בעברית לפי קוד סטטוס כשאין גוף מובנה מה-API. */
function friendlyHttpMessage(error: HttpErrorResponse): string {
  const status = error.status;

  if (status === 0) {
    return 'לא הצלחנו להתחבר לשרת. בדקו את החיבור לאינטרנט, וודאו שהשירות פעיל, ונסו שוב בעוד רגע.';
  }

  const byStatus: Record<number, string> = {
    400: 'הבקשה אינה תקינה. נסו לרענן את הדף או לבדוק את הנתונים שהוזנו.',
    404: 'המידע המבוקש לא נמצא במערכת.',
    408: 'הבקשה ארכה יותר מדי זמן. נסו שוב.',
    409: 'הפעולה לא יכולה להתבצע — ייתכן שהנתונים כבר קיימים או שהמצב השתנה.',
    422: 'חלק מהשדות אינם תקינים. תקנו את הטופס ונסו שוב.',
    429: 'בוצעו יותר מדי בקשות בזמן קצר. המתינו רגע ונסו שוב.',
    500: 'השרת נתקל בתקלה בזמן עיבוד הבקשה. אם הבעיה נמשכת, פנו למנהל המערכת.',
    502: 'השרת לא הצליח לקבל תשובה מהשירות מאחורי הקלעים. נסו שוב מאוחר יותר.',
    503: 'השירות אינו זמין זמנית (עומס או תחזוקה). נסו שוב בעוד מספר דקות.',
    504: 'השרת לא השיב בזמן. נסו שוב בעוד רגע.',
  };

  if (byStatus[status]) {
    return byStatus[status];
  }

  if (status >= 500) {
    return 'אירעה תקלה בשרת. נסו שוב מאוחר יותר. אם השגיאה חוזרת, פנו לתמיכה.';
  }

  if (status >= 400) {
    return `הבקשה לא הושלמה בהצלחה (קוד ${status}). נסו שוב או פנו למנהל המערכת.`;
  }

  return `אירעה שגיאה בלתי צפויה (קוד ${status}).`;
}

/** סוג תצוגה לרכיב שגיאה (צבע/אייקון). */
export type ErrorPresentationVariant = 'generic' | 'network' | 'server' | 'notfound';

/** ממפה קוד סטטוס ל-variant לעיצוב מסך השגיאה. */
export function errorPresentationVariant(statusCode: number): ErrorPresentationVariant {
  if (statusCode === 0) return 'network';
  if (statusCode === 404) return 'notfound';
  if (statusCode >= 500) return 'server';
  return 'generic';
}

/** כותרת קצרה לרכיב מצב שגיאה (מעל ההודעה המפורטת). */
export function errorStateTitle(statusCode: number): string {
  if (statusCode === 0) return 'בעיית תקשורת';
  if (statusCode === 404) return 'לא נמצא';
  if (statusCode >= 500) return 'תקלה בשרת';
  return 'לא ניתן לטעון את הנתונים';
}

/** שורת עזר תחתונה לחוויית משתמש. */
export function errorStateHint(statusCode: number): string | null {
  if (statusCode === 0 || statusCode >= 500) {
    return 'אם הבעיה נמשכת לאחר ניסיון חוזר, ייתכן שהשרת למטה או שיש תקלת רשת בארגון.';
  }
  return null;
}
