/**
 * A single structured validation issue returned to the client
 * (used by ZodValidationError and the global error handler).
 */
export interface IValidationIssue {
  field: string;
  message: string;
}

/**
 * The shape of the `error` object nested inside every error API response.
 */
export interface IErrorDetail {
  statusCode: number;
  name: string;
  issues?: IValidationIssue[];
  stack?: string;
}

/**
 * The top-level shape of every error JSON response sent by the API.
 */
export interface IErrorResponse {
  success: false;
  message: string;
  error: IErrorDetail;
}

/**
 * Status string derived from the HTTP status code.
 * - `'fail'`  → 4xx client errors
 * - `'error'` → 5xx server errors
 */
export type TErrorStatus = 'fail' | 'error';
