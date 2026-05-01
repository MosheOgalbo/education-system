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

export function initialAsyncState<T>(data: T): AsyncState<T> {
  return { data, state: 'idle', error: null };
}
