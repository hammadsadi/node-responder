import { Request, Response, NextFunction, RequestHandler } from "express";

export interface Pagination {
  page?: number;
  limit?: number;
  total?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiMeta {
  timestamp: string;
  statusCode: number;
  pagination?: PaginationMeta;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data: null;
  errors: any | null;
  meta: ApiMeta;
}

declare global {
  namespace Express {
    interface Response {
      /** Send a success response */
      success<T = any>(
        data?: T,
        message?: string,
        statusCode?: number,
      ): Response;

      /** Send an error response */
      error(message?: string, statusCode?: number, errors?: any): Response;

      /** Send a paginated response */
      paginate<T = any>(
        data?: T[],
        message?: string,
        pagination?: Pagination,
      ): Response;

      // Shorthand methods
      /** 200 OK */
      ok<T = any>(data?: T, message?: string): Response;
      /** 201 Created */
      created<T = any>(data?: T, message?: string): Response;
      /** 204 No Content */
      noContent(): Response;

      /** 400 Bad Request */
      badRequest(message?: string, errors?: any): Response;
      /** 401 Unauthorized */
      unauthorized(message?: string): Response;
      /** 403 Forbidden */
      forbidden(message?: string): Response;
      /** 404 Not Found */
      notFound(message?: string): Response;
      /** 409 Conflict */
      conflict(message?: string): Response;
      /** 422 Unprocessable Entity */
      unprocessable(message?: string, errors?: any): Response;
      /** 500 Internal Server Error */
      serverError(message?: string): Response;
    }
  }
}

export declare function apiResponse(): RequestHandler;

export declare function successResponse(
  res: Response,
  data?: any,
  message?: string,
  statusCode?: number,
): Response;

export declare function errorResponse(
  res: Response,
  message?: string,
  statusCode?: number,
  errors?: any,
): Response;

export declare function paginatedResponse(
  res: Response,
  data?: any[],
  message?: string,
  pagination?: Pagination,
): Response;

export default apiResponse;
