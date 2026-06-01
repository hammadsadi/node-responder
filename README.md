# node-responder

> Modern, standardized API response middleware for Express.js

[![npm version](https://img.shields.io/npm/v/node-responder.svg)](https://www.npmjs.com/package/node-responder)
[![npm downloads](https://img.shields.io/npm/dm/node-responder.svg)](https://www.npmjs.com/package/node-responder)
[![license](https://img.shields.io/npm/l/node-responder.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue.svg)](types/index.d.ts)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()

Stop writing repetitive `res.status(200).json({ success: true, data: ... })` in every route.
`node-responder` adds clean, consistent response helpers directly to Express's `res` object.

---

## ✨ Features

- ✅ **Zero dependencies** — only Express as a peer dependency
- ✅ **TypeScript support** — full type definitions included
- ✅ **ESM + CommonJS** — works with both `require` and `import`
- ✅ **Request Logger** — logs method, URL, status, and response time to terminal
- ✅ **Pagination built-in** — `res.paginate()` with full meta
- ✅ **asyncHandler** — write async routes without try-catch boilerplate
- ✅ **Consistent format** — every response follows the same structure
- ✅ **Node.js 14+** supported

---

## 📦 Installation

```bash
npm install node-responder
```

---

## 🚀 Quick Start

```js
const express = require("express");
const responder = require("node-responder");

const app = express();
app.use(express.json());

// Apply middleware globally
app.use(responder());

app.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.notFound("User not found");
  return res.ok(user);
});

app.listen(3000);
```

---

## 📋 Response Format

Every response follows the same consistent structure:

### Success Response

```json
{
  "success": true,
  "message": "Success",
  "data": { "id": 1, "name": "John" },
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "statusCode": 200
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "errors": null,
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "statusCode": 404
  }
}
```

### Paginated Response

```json
{
  "success": true,
  "message": "Users fetched",
  "data": [{ "id": 1 }, { "id": 2 }],
  "meta": {
    "timestamp": "2025-01-15T10:30:00.000Z",
    "statusCode": 200,
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

## ⚙️ Middleware Setup

```js
const responder = require("node-responder");

// Apply to all routes
app.use(responder());

// With logger enabled
app.use(responder({ logger: true }));

// Apply to a specific router only
router.use(responder());
```

### Options

| Option   | Type      | Default | Description                                                               |
| -------- | --------- | ------- | ------------------------------------------------------------------------- |
| `logger` | `boolean` | `false` | Logs each request to terminal with method, URL, status, and response time |

---

## 📖 API Reference

### ✅ Success Methods

---

#### `res.ok(data?, message?)`

**Status: 200** — Use for standard successful GET requests.

```js
// With data only
res.ok({ id: 1, name: "John" });

// With data and custom message
res.ok({ id: 1, name: "John" }, "User fetched successfully");

// Response:
// { success: true, message: "User fetched successfully", data: { id: 1, name: "John" }, meta: { statusCode: 200, ... } }
```

---

#### `res.created(data?, message?)`

**Status: 201** — Use when a new resource has been successfully created.

```js
const user = await User.create({ name: "John", email: "john@example.com" });

res.created(user);

// With custom message
res.created(user, "Account created successfully");

// Response:
// { success: true, message: "Created successfully", data: { ...user }, meta: { statusCode: 201, ... } }
```

---

#### `res.noContent()`

**Status: 204** — Use after a successful delete or update when no data needs to be returned.

```js
await User.findByIdAndDelete(req.params.id);
res.noContent();

// Response: empty body (HTTP 204 No Content)
```

---

#### `res.success(data?, message?, statusCode?)`

**Status: custom** — Use when you need a custom success status code.

```js
res.success({ accepted: true }, "Request accepted", 202);

// Response:
// { success: true, message: "Request accepted", data: { accepted: true }, meta: { statusCode: 202, ... } }
```

---

### ❌ Error Methods

---

#### `res.badRequest(message?, errors?)`

**Status: 400** — Use when the request is malformed or validation fails.

```js
// Simple message
res.badRequest("Name is required");

// With validation errors object
res.badRequest("Validation failed", {
  name: "Name is required",
  email: "Invalid email format",
});

// Response:
// { success: false, message: "Validation failed", data: null, errors: { name: "...", email: "..." }, meta: { statusCode: 400, ... } }
```

---

#### `res.unauthorized(message?)`

**Status: 401** — Use when the user is not authenticated (no token or invalid token).

```js
// Default message
res.unauthorized();

// Custom message
res.unauthorized("Please login to continue");

// Response:
// { success: false, message: "Unauthorized", data: null, errors: null, meta: { statusCode: 401, ... } }
```

---

#### `res.forbidden(message?)`

**Status: 403** — Use when the user is authenticated but does not have permission.

```js
// Default message
res.forbidden();

// Custom message
res.forbidden("You do not have permission to access this resource");

// Response:
// { success: false, message: "Forbidden", data: null, errors: null, meta: { statusCode: 403, ... } }
```

---

#### `res.notFound(message?)`

**Status: 404** — Use when a requested resource does not exist.

```js
const user = await User.findById(req.params.id);

if (!user) {
  return res.notFound("User not found");
}

// Response:
// { success: false, message: "User not found", data: null, errors: null, meta: { statusCode: 404, ... } }
```

---

#### `res.conflict(message?)`

**Status: 409** — Use when the request conflicts with existing data (e.g. duplicate email).

```js
const exists = await User.findOne({ email: req.body.email });

if (exists) {
  return res.conflict("Email already registered");
}

// Response:
// { success: false, message: "Email already registered", data: null, errors: null, meta: { statusCode: 409, ... } }
```

---

#### `res.unprocessable(message?, errors?)`

**Status: 422** — Use when the data format is correct but business logic validation fails.

```js
res.unprocessable("Cannot process this request", {
  age: "Must be at least 18 years old",
});

// Response:
// { success: false, message: "Cannot process this request", data: null, errors: { age: "..." }, meta: { statusCode: 422, ... } }
```

---

#### `res.tooManyRequests(message?, retryAfter?)`

**Status: 429** — Use when a client exceeds the rate limit.

```js
// Basic usage
res.tooManyRequests("Too many requests, please slow down");

// With retryAfter in seconds — sets the Retry-After header automatically
res.tooManyRequests("Rate limit exceeded", 60);

// Response:
// Header: Retry-After: 60
// { success: false, message: "Rate limit exceeded", data: null, errors: null, meta: { statusCode: 429, ... } }
```

---

#### `res.serverError(message?)`

**Status: 500** — Use when an unexpected server-side error occurs.

```js
try {
  await someRiskyOperation();
} catch (err) {
  console.error(err);
  return res.serverError("Something went wrong, please try again later");
}

// Response:
// { success: false, message: "Something went wrong, please try again later", data: null, errors: null, meta: { statusCode: 500, ... } }
```

---

#### `res.error(message?, statusCode?, errors?)`

**Status: custom** — Use when you need a custom error status code.

```js
res.error("Gone", 410);
res.error("Validation failed", 400, { field: "required" });
```

---

### 📄 Pagination — `res.paginate(data, message?, pagination?)`

Use for returning paginated lists with full pagination metadata.

```js
router.get("/users", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  return res.paginate(users, "Users fetched", { page, limit, total });
});

// Response:
// {
//   success: true,
//   message: "Users fetched",
//   data: [...users],
//   meta: {
//     timestamp: "...",
//     statusCode: 200,
//     pagination: {
//       page: 1, limit: 10, total: 100,
//       totalPages: 10,
//       hasNextPage: true,
//       hasPrevPage: false
//     }
//   }
// }
```

| Pagination Field | Type     | Description               |
| ---------------- | -------- | ------------------------- |
| `page`           | `number` | Current page number       |
| `limit`          | `number` | Number of items per page  |
| `total`          | `number` | Total number of documents |

---

### ⚡ asyncHandler

Eliminates try-catch boilerplate from every async route.
Errors are automatically forwarded to Express's `next(err)`.

```js
const { asyncHandler } = require("node-responder");

// ❌ Before — repetitive try-catch in every route:
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.ok(users);
  } catch (err) {
    res.serverError(err.message);
  }
});

// ✅ After — clean and concise with asyncHandler:
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.find(); // errors automatically go to next(err)
    res.ok(users);
  }),
);

// Catch all errors in one global error handler:
app.use((err, req, res, next) => {
  console.error(err);
  res.serverError(err.message);
});
```

---

### 📝 Logger — `{ logger: true }`

Logs every incoming request to the terminal with method, URL, status code, and response time.

```js
app.use(responder({ logger: true }));
```

Terminal output:

```
GET     /api/users                          200  23ms  ✔
POST    /api/users                          201  45ms  ✔
GET     /api/users/abc123                   404  12ms  ✖
POST    /api/auth/login                     401  8ms   ✖
DELETE  /api/products/999                   500  5ms   ✖
```

**Tip:** Enable logger in development, disable in production:

```js
app.use(
  responder({
    logger: process.env.NODE_ENV !== "production",
  }),
);
```

---

## 🔧 Real-World MERN Example

```js
const express = require("express");
const responder = require("node-responder");
const { asyncHandler } = require("node-responder");

const router = express.Router();
router.use(responder({ logger: true }));

// GET /api/users?page=1&limit=10
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).select("-password"),
      User.countDocuments(),
    ]);

    return res.paginate(users, "Users fetched", { page, limit, total });
  }),
);

// GET /api/users/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.notFound("User not found");
    return res.ok(user, "User fetched");
  }),
);

// POST /api/users
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const errors = {};
    if (!name) errors.name = "Name is required";
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      return res.badRequest("Validation failed", errors);
    }

    const exists = await User.findOne({ email });
    if (exists) return res.conflict("Email already registered");

    const user = await User.create({ name, email, password });

    return res.created(
      { id: user._id, name: user.name, email: user.email },
      "Account created successfully",
    );
  }),
);

// PUT /api/users/:id
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!user) return res.notFound("User not found");
    return res.ok(user, "User updated successfully");
  }),
);

// DELETE /api/users/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.notFound("User not found");
    return res.noContent();
  }),
);

module.exports = router;
```

---

## TypeScript Usage

```ts
import express from "express";
import responder, { asyncHandler } from "node-responder";

const app = express();
app.use(express.json());
app.use(responder({ logger: true }));

app.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.find();
    res.ok(users, "Users fetched");
  }),
);

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.serverError(err.message);
  },
);

app.listen(3000);
```

---

## 🔗 Links

- [npm](https://www.npmjs.com/package/node-responder)
- [GitHub](https://github.com/hammadsadi/node-responder)
- [Report an Issue](https://github.com/hammadsadi/node-responder/issues)

---

## 📄 License

MIT © [Hammad Sadi](https://github.com/hammadsadi)
