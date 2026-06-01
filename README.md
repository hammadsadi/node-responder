# node-responder

> Modern, standardized API response middleware for Express.js

[![npm version](https://img.shields.io/npm/v/node-responder.svg)](https://www.npmjs.com/package/node-responder)
[![license](https://img.shields.io/npm/l/node-responder.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-supported-blue.svg)](types/index.d.ts)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-green.svg)]()
[![npm downloads](https://img.shields.io/npm/dm/node-responder.svg)](https://www.npmjs.com/package/node-responder)

Stop writing repetitive `res.status(200).json({ success: true, data: ... })` in every route. `node-responder` adds clean, consistent response helpers directly to Express's `res` object.

---

## ✨ Features

- ✅ **Zero dependencies** — only Express as a peer dependency
- ✅ **TypeScript support** — full type definitions included
- ✅ **ESM + CommonJS** — works with both `require` and `import`
- ✅ **Pagination built-in** — `res.paginate()` with full meta
- ✅ **Consistent format** — every response follows the same structure
- ✅ **Shorthand methods** — `res.ok()`, `res.notFound()`, `res.unauthorized()` and more
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

All responses follow this consistent structure:

**Success:**

```json
{
  "success": true,
  "message": "Success",
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "statusCode": 200
  }
}
```

**Error:**

```json
{
  "success": false,
  "message": "User not found",
  "data": null,
  "errors": null,
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "statusCode": 404
  }
}
```

**Paginated:**

```json
{
  "success": true,
  "message": "Users fetched",
  "data": [ ... ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
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

## 📖 API Reference

### Middleware Setup

```js
const responder = require("node-responder");

app.use(responder()); // attach to all routes
// or
router.use(responder()); // attach to specific router
```

---

### ✅ Success Methods

| Method                                   | Status | Description      |
| ---------------------------------------- | ------ | ---------------- |
| `res.success(data, message, statusCode)` | custom | Generic success  |
| `res.ok(data, message)`                  | 200    | Standard OK      |
| `res.created(data, message)`             | 201    | Resource created |
| `res.noContent()`                        | 204    | No content       |

```js
res.ok({ id: 1, name: "Rahim" });
res.created({ id: 5 }, "User created successfully");
res.success(data, "Custom message", 200);
```

---

### ❌ Error Methods

| Method                                   | Status | Description          |
| ---------------------------------------- | ------ | -------------------- |
| `res.error(message, statusCode, errors)` | custom | Generic error        |
| `res.badRequest(message, errors)`        | 400    | Validation failed    |
| `res.unauthorized(message)`              | 401    | Not authenticated    |
| `res.forbidden(message)`                 | 403    | Not authorized       |
| `res.notFound(message)`                  | 404    | Resource not found   |
| `res.conflict(message)`                  | 409    | Conflict             |
| `res.unprocessable(message, errors)`     | 422    | Unprocessable entity |
| `res.serverError(message)`               | 500    | Server error         |

```js
res.notFound("Product not found");
res.unauthorized("Please login first");
res.badRequest("Validation failed", { email: "Email is required" });
```

---

### 📄 Pagination

```js
const users = await User.find().skip(skip).limit(limit);
const total = await User.countDocuments();

res.paginate(users, "Users fetched", {
  page: 1,
  limit: 10,
  total: total,
});
```

---

## 🔧 Real-World Example (MERN)

```js
const express = require("express");
const responder = require("node-responder");
const router = express.Router();

router.use(responder());

// GET all users with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    return res.paginate(users, "Users fetched", { page, limit, total });
  } catch (err) {
    return res.serverError("Failed to fetch users");
  }
});

// POST create user
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.badRequest("Validation failed", {
        name: !name ? "Name is required" : null,
        email: !email ? "Email is required" : null,
      });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.conflict("Email already registered");

    const user = await User.create({ name, email });
    return res.created(user, "User registered successfully");
  } catch (err) {
    return res.serverError();
  }
});
```

---

## TypeScript Usage

```ts
import express from "express";
import responder from "node-responder";

const app = express();
app.use(responder());

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.ok(users, "Users fetched");
});
```

## 🔗 Links

- [npm](https://www.npmjs.com/package/node-responder)
- [GitHub](https://github.com/hammadsadi/node-responder)

---

## 📄 License

MIT © [Hammad Sadi](https://github.com/hammadsadi)
