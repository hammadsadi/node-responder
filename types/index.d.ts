import { RequestHandler, Request, Response, NextFunction } from "express";

//  Options

export interface ResponderOptions {
  /**
   * When true, logs every request to stdout with method, URL, status, and response time.
   * @default false
   */
  logger?: boolean;
}

//  Pagination

export interface PaginationInput {
  page?: number | string;
  limit?: number | string;
  total?: number | string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

//  Response shapes

export interface ApiMeta {
  timestamp: string;
  statusCode: number;
  pagination?: PaginationMeta;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  errors: unknown | null;
  meta: ApiMeta;
}

//  Express augmentation

declare global {
  namespace Express {
    interface Response {
      // Generic
      /** Send a success response with optional data, message, and status code */
      success<T = unknown>(
        data?: T,
        message?: string,
        statusCode?: number,
      ): Response;
      /** Send an error response with optional message, status code, and errors */
      error(message?: string, statusCode?: number, errors?: unknown): Response;
      /** Send a paginated success response */
      paginate<T = unknown>(
        data?: T[],
        message?: string,
        pagination?: PaginationInput,
      ): Response;

      // 2xx
      /** 200 OK */
      ok<T = unknown>(data?: T, message?: string): Response;
      /** 201 Created */
      created<T = unknown>(data?: T, message?: string): Response;
      /** 204 No Content */
      noContent(): Response;

      // 4xx
      /** 400 Bad Request */
      badRequest(message?: string, errors?: unknown): Response;
      /** 401 Unauthorized */
      unauthorized(message?: string): Response;
      /** 403 Forbidden */
      forbidden(message?: string): Response;
      /** 404 Not Found */
      notFound(message?: string): Response;
      /** 409 Conflict */
      conflict(message?: string): Response;
      /** 422 Unprocessable Entity */
      unprocessable(message?: string, errors?: unknown): Response;
      /** 429 Too Many Requests — optionally sets Retry-After header */
      tooManyRequests(message?: string, retryAfter?: number | string): Response;

      // 5xx
      /** 500 Internal Server Error */
      serverError(message?: string): Response;
    }
  }
}

//  Exported functions

/** Express middleware — attaches all response helpers to res */
export declare function responder(options?: ResponderOptions): RequestHandler;

/** Wraps an async route handler and forwards errors to next() automatically */
export declare function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => Promise<unknown> | unknown,
): RequestHandler;

export declare function successResponse(
  res: Response,
  data?: unknown,
  message?: string,
  statusCode?: number,
): Response;

export declare function errorResponse(
  res: Response,
  message?: string,
  statusCode?: number,
  errors?: unknown,
): Response;

export declare function paginatedResponse(
  res: Response,
  data?: unknown[],
  message?: string,
  pagination?: PaginationInput,
): Response;

export default responder;
