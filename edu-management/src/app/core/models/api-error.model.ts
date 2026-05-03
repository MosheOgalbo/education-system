/**
 * טיפוסים למצב טעינה אסינכרוני ולשגיאות API אחידות (מסונכרן עם גוף השגיאה מהשרת).
 */
export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T;
  state: LoadingState;
  error: ApiError | null;
}

/** מצב התחלתי לפני טעינה ראשונה. */
export function initialAsyncState<T>(data: T): AsyncState<T> {
  return { data, state: 'idle', error: null };
}
