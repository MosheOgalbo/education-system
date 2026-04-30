export interface ApiErrorBody {
  statusCode: number;
  message: string;
  timestamp: string;
}

export function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof (value as ApiErrorBody).message === 'string'
  );
}
