"use strict";

/**
 * node-responder
 * Standardized, modern API response middleware for Express.js
 * @version 1.1.0
 * @license MIT
 */

//  ANSI Colors

const COLORS = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

const isTTY = () => process.stdout && process.stdout.isTTY === true;

const colorize = (str, color) =>
  isTTY() ? `${color}${str}${COLORS.reset}` : str;

const colorStatus = (code) => {
  if (code >= 500) return colorize(code, COLORS.red);
  if (code >= 400) return colorize(code, COLORS.yellow);
  if (code >= 300) return colorize(code, COLORS.cyan);
  return colorize(code, COLORS.green);
};

const colorMethod = (method) => {
  const m = (method || "UNKNOWN").toUpperCase().padEnd(7);
  return colorize(m, COLORS.cyan);
};

const logRequest = (req, statusCode, startTime) => {
  try {
    const ms = Date.now() - startTime;
    const method = colorMethod(req.method);
    const url = (req.originalUrl || req.url || "/").padEnd(35);
    const status = colorStatus(statusCode);
    const time = colorize(`${ms}ms`, COLORS.dim);
    const icon =
      statusCode >= 400
        ? colorize("✖", COLORS.red)
        : colorize("✔", COLORS.green);
    process.stdout.write(`  ${method} ${url} ${status}  ${time}  ${icon}\n`);
  } catch (_) {}
};

//  Validation helpers

const safeMessage = (val, fallback) => {
  if (val === undefined || val === null) return fallback;
  return String(val);
};

const safeStatus = (val, fallback) => {
  const n = Number(val);
  return Number.isFinite(n) && n >= 100 && n <= 599 ? n : fallback;
};

//  Core response builders

const successResponse = (res, data, message, statusCode) => {
  const code = safeStatus(statusCode, 200);
  const msg = safeMessage(message, "Success");
  const body = data === undefined ? null : data;

  return res.status(code).json({
    success: true,
    message: msg,
    data: body,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode: code,
    },
  });
};

const errorResponse = (res, message, statusCode, errors) => {
  const code = safeStatus(statusCode, 500);
  const msg = safeMessage(message, "Something went wrong");
  const errs = errors === undefined || errors === null ? null : errors;

  return res.status(code).json({
    success: false,
    message: msg,
    data: null,
    errors: errs,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode: code,
    },
  });
};

const paginatedResponse = (res, data, message, pagination) => {
  const arr = Array.isArray(data) ? data : [];
  const msg = safeMessage(message, "Success");
  const p = pagination && typeof pagination === "object" ? pagination : {};

  const page = Math.max(1, parseInt(p.page, 10) || 1);
  const limit = Math.max(1, parseInt(p.limit, 10) || 10);
  const total = Math.max(0, parseInt(p.total, 10) || 0);
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return res.status(200).json({
    success: true,
    message: msg,
    data: arr,
    meta: {
      timestamp: new Date().toISOString(),
      statusCode: 200,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
};

//  asyncHandler

const asyncHandler = (fn) => {
  if (typeof fn !== "function") {
    throw new TypeError(
      `[node-responder] asyncHandler expects a function, got "${typeof fn}"`,
    );
  }
  return (req, res, next) => {
    try {
      const result = fn(req, res, next);
      if (result && typeof result.catch === "function") {
        result.catch(next);
      }
    } catch (err) {
      next(err);
    }
  };
};

//  Middleware factory

const responder = (options) => {
  const opts = options && typeof options === "object" ? options : {};
  const logger = opts.logger === true;

  if (process.env.NODE_ENV !== "production") {
    const known = ["logger"];
    for (const key of Object.keys(opts)) {
      if (!known.includes(key)) {
        process.stderr.write(
          `[node-responder] Unknown option "${key}" — valid options: ${known.join(", ")}\n`,
        );
      }
    }
  }

  return (req, res, next) => {
    const startTime = Date.now();

    const log = (code) => {
      if (logger) logRequest(req, code, startTime);
    };

    //  2xx Success

    res.success = (data, message, statusCode) => {
      const code = safeStatus(statusCode, 200);
      log(code);
      return successResponse(res, data, message, code);
    };

    res.ok = (data, message) => {
      log(200);
      return successResponse(res, data, safeMessage(message, "Success"), 200);
    };

    res.created = (data, message) => {
      log(201);
      return successResponse(
        res,
        data,
        safeMessage(message, "Created successfully"),
        201,
      );
    };

    res.noContent = () => {
      log(204);
      return res.status(204).send();
    };

    //  4xx / 5xx Error

    res.error = (message, statusCode, errors) => {
      const code = safeStatus(statusCode, 500);
      log(code);
      return errorResponse(res, message, code, errors);
    };

    res.badRequest = (message, errors) => {
      log(400);
      return errorResponse(
        res,
        safeMessage(message, "Bad request"),
        400,
        errors ?? null,
      );
    };

    res.unauthorized = (message) => {
      log(401);
      return errorResponse(res, safeMessage(message, "Unauthorized"), 401);
    };

    res.forbidden = (message) => {
      log(403);
      return errorResponse(res, safeMessage(message, "Forbidden"), 403);
    };

    res.notFound = (message) => {
      log(404);
      return errorResponse(res, safeMessage(message, "Not found"), 404);
    };

    res.conflict = (message) => {
      log(409);
      return errorResponse(res, safeMessage(message, "Conflict"), 409);
    };

    res.unprocessable = (message, errors) => {
      log(422);
      return errorResponse(
        res,
        safeMessage(message, "Unprocessable entity"),
        422,
        errors ?? null,
      );
    };

    res.tooManyRequests = (message, retryAfter) => {
      if (retryAfter != null) res.set("Retry-After", String(retryAfter));
      log(429);
      return errorResponse(res, safeMessage(message, "Too many requests"), 429);
    };

    res.serverError = (message) => {
      log(500);
      return errorResponse(
        res,
        safeMessage(message, "Internal server error"),
        500,
      );
    };

    //  Pagination

    res.paginate = (data, message, pagination) => {
      log(200);
      return paginatedResponse(res, data, message, pagination);
    };

    next();
  };
};

//  Exports

module.exports = responder;
module.exports.default = responder;
module.exports.responder = responder;
module.exports.asyncHandler = asyncHandler;
module.exports.successResponse = successResponse;
module.exports.errorResponse = errorResponse;
module.exports.paginatedResponse = paginatedResponse;
