const apiResponse = require("../src/index");

// Mock Express res object
function mockRes() {
  const res = {
    _status: null,
    _json: null,
    status(code) {
      this._status = code;
      return this;
    },
    json(body) {
      this._json = body;
      return this;
    },
    send() {
      return this;
    },
  };
  return res;
}

function mockNext() {
  return () => {};
}

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

console.log("\n🧪 node-responder — Test Suite\n");

//  Middleware tests 
console.log("Middleware:");

test("attaches res.success method", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  assert(typeof res.success === "function");
});

test("attaches res.error method", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  assert(typeof res.error === "function");
});

test("attaches res.paginate method", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  assert(typeof res.paginate === "function");
});

//  Success response tests 
console.log("\nSuccess Responses:");

test("res.success returns correct shape", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.success({ id: 1 }, "Done", 200);
  assert(res._status === 200, "status should be 200");
  assert(res._json.success === true, "success should be true");
  assert(res._json.data.id === 1, "data should match");
  assert(res._json.message === "Done");
});

test("res.created returns 201", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.created({ id: 5 });
  assert(res._status === 201);
  assert(res._json.success === true);
});

test("res.ok returns 200", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.ok({ name: "test" });
  assert(res._status === 200);
});

//  Error response tests 
console.log("\nError Responses:");

test("res.notFound returns 404", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.notFound("User not found");
  assert(res._status === 404);
  assert(res._json.success === false);
  assert(res._json.message === "User not found");
});

test("res.unauthorized returns 401", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.unauthorized();
  assert(res._status === 401);
});

test("res.badRequest returns 400 with errors", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.badRequest("Validation failed", ["email is required"]);
  assert(res._status === 400);
  assert(Array.isArray(res._json.errors));
});

test("res.serverError returns 500", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.serverError();
  assert(res._status === 500);
});

//  Pagination tests 
console.log("\nPagination:");

test("res.paginate includes pagination meta", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.paginate([{ id: 1 }, { id: 2 }], "Users fetched", {
    page: 1,
    limit: 10,
    total: 50,
  });
  assert(res._status === 200);
  assert(res._json.success === true);
  assert(res._json.meta.pagination.totalPages === 5);
  assert(res._json.meta.pagination.hasNextPage === true);
  assert(res._json.meta.pagination.hasPrevPage === false);
});

test("meta always includes timestamp", () => {
  const req = {};
  const res = mockRes();
  apiResponse()(req, res, mockNext());
  res.ok({ test: true });
  assert(typeof res._json.meta.timestamp === "string");
});

//  Summary 
console.log(`\n${"─".repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log("🎉 All tests passed!\n");
} else {
  console.log("⚠️  Some tests failed.\n");
  process.exit(1);
}
