"use strict";

/**
 * node-responder
 * Standardized, modern API response middleware for Express.js
 * @author Hammad Sadi
 * @license MIT
 */

/**
 * Creates a success response
 */
function successResponse(
  res,
  data = null,
  message = "Success",
  statusCode = 200,
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode,
    },
  });
}

/**
 * Creates an error response
 */
function errorResponse(
  res,
  message = "Something went wrong",
  statusCode = 500,
  errors = null,
) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode,
    },
  });
}

/**
 * Creates a paginated response
 */
function paginatedResponse(
  res,
  data = [],
  message = "Success",
  pagination = {},
) {
  const { page = 1, limit = 10, total = 0 } = pagination;

  const totalPages = Math.ceil(total / limit);

  return res.status(200).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode: 200,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
}

/**
 * Express middleware — attaches helper methods to res object
 */
function apiResponse() {
  return function (req, res, next) {
    // res.success(data, message, statusCode)
    res.success = function (
      data = null,
      message = "Success",
      statusCode = 200,
    ) {
      return successResponse(res, data, message, statusCode);
    };

    // res.error(message, statusCode, errors)
    res.error = function (
      message = "Something went wrong",
      statusCode = 500,
      errors = null,
    ) {
      return errorResponse(res, message, statusCode, errors);
    };

    // res.paginate(data, message, pagination)
    res.paginate = function (data = [], message = "Success", pagination = {}) {
      return paginatedResponse(res, data, message, pagination);
    };

    // Shorthand methods
    res.ok = (data, message = "Success") =>
      successResponse(res, data, message, 200);
    res.created = (data, message = "Created successfully") =>
      successResponse(res, data, message, 201);
    res.noContent = () => res.status(204).send();

    res.badRequest = (message = "Bad request", errors = null) =>
      errorResponse(res, message, 400, errors);
    res.unauthorized = (message = "Unauthorized") =>
      errorResponse(res, message, 401);
    res.forbidden = (message = "Forbidden") => errorResponse(res, message, 403);
    res.notFound = (message = "Not found") => errorResponse(res, message, 404);
    res.conflict = (message = "Conflict") => errorResponse(res, message, 409);
    res.unprocessable = (message = "Unprocessable entity", errors = null) =>
      errorResponse(res, message, 422, errors);
    res.serverError = (message = "Internal server error") =>
      errorResponse(res, message, 500);

    next();
  };
}

// Named exports
module.exports = apiResponse;
module.exports.apiResponse = apiResponse;
module.exports.successResponse = successResponse;
module.exports.errorResponse = errorResponse;
module.exports.paginatedResponse = paginatedResponse;

// ESM default export support
module.exports.default = apiResponse;
