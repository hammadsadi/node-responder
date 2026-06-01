"use strict";

var responder = require("../src/index");
var asyncHandler = require("../src/index").asyncHandler;

//  Test helpers

var passed = 0;
var failed = 0;
var suites = [];
var current = null;

function suite(name, fn) {
  current = { name, tests: [] };
  suites.push(current);
  fn();
}

function test(name, fn) {
  current.tests.push({ name, fn });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

function assertEqual(a, b, msg) {
  if (a !== b)
    throw new Error(
      msg || "Expected " + JSON.stringify(b) + " but got " + JSON.stringify(a),
    );
}

function mockRes() {
  var res = {
    _status: null,
    _body: null,
    _headers: {},
    status: function (code) {
      this._status = code;
      return this;
    },
    json: function (body) {
      this._body = body;
      return this;
    },
    send: function () {
      return this;
    },
    set: function (k, v) {
      this._headers[k] = v;
      return this;
    },
  };
  return res;
}

function mockReq(method, url) {
  return {
    method: method || "GET",
    originalUrl: url || "/test",
    url: url || "/test",
  };
}

function applyMiddleware(opts) {
  var req = mockReq();
  var res = mockRes();
  var nextCalled = false;
  responder(opts)(req, res, function () {
    nextCalled = true;
  });
  return { req, res, nextCalled };
}

//  Suites

suite("Middleware setup", function () {
  test("calls next()", function () {
    var r = applyMiddleware();
    assert(r.nextCalled, "next() should be called");
  });

  test("attaches all expected methods to res", function () {
    var r = applyMiddleware();
    var methods = [
      "success",
      "ok",
      "created",
      "noContent",
      "error",
      "badRequest",
      "unauthorized",
      "forbidden",
      "notFound",
      "conflict",
      "unprocessable",
      "tooManyRequests",
      "serverError",
      "paginate",
    ];
    methods.forEach(function (m) {
      assert(
        typeof r.res[m] === "function",
        "res." + m + " should be a function",
      );
    });
  });

  test("accepts empty options object", function () {
    var req = mockReq();
    var res = mockRes();
    responder({})(req, res, function () {});
    assert(typeof res.ok === "function");
  });

  test("accepts no arguments", function () {
    var req = mockReq();
    var res = mockRes();
    responder()(req, res, function () {});
    assert(typeof res.ok === "function");
  });

  test("ignores non-object options gracefully", function () {
    var req = mockReq();
    var res = mockRes();
    responder("bad")(req, res, function () {});
    assert(typeof res.ok === "function");
  });
});

suite("res.ok — 200", function () {
  test("status 200", function () {
    var r = applyMiddleware();
    r.res.ok({ id: 1 });
    assertEqual(r.res._status, 200);
  });

  test("success: true", function () {
    var r = applyMiddleware();
    r.res.ok();
    assert(r.res._body.success === true);
  });

  test('default message "Success"', function () {
    var r = applyMiddleware();
    r.res.ok();
    assertEqual(r.res._body.message, "Success");
  });

  test("custom message", function () {
    var r = applyMiddleware();
    r.res.ok(null, "All good");
    assertEqual(r.res._body.message, "All good");
  });

  test("data passed through", function () {
    var r = applyMiddleware();
    r.res.ok({ name: "Sadi" });
    assertEqual(r.res._body.data.name, "Sadi");
  });

  test("null data when no argument", function () {
    var r = applyMiddleware();
    r.res.ok();
    assert(r.res._body.data === null);
  });

  test("meta.statusCode is 200", function () {
    var r = applyMiddleware();
    r.res.ok();
    assertEqual(r.res._body.meta.statusCode, 200);
  });

  test("meta.timestamp is ISO string", function () {
    var r = applyMiddleware();
    r.res.ok();
    assert(typeof r.res._body.meta.timestamp === "string");
    assert(!isNaN(Date.parse(r.res._body.meta.timestamp)));
  });
});

suite("res.created — 201", function () {
  test("status 201", function () {
    var r = applyMiddleware();
    r.res.created({ id: 5 });
    assertEqual(r.res._status, 201);
  });

  test('default message "Created successfully"', function () {
    var r = applyMiddleware();
    r.res.created();
    assertEqual(r.res._body.message, "Created successfully");
  });

  test("custom message", function () {
    var r = applyMiddleware();
    r.res.created({}, "User registered");
    assertEqual(r.res._body.message, "User registered");
  });
});

suite("res.noContent — 204", function () {
  test("status 204", function () {
    var r = applyMiddleware();
    r.res.noContent();
    assertEqual(r.res._status, 204);
  });
});

suite("res.success — generic", function () {
  test("custom status code", function () {
    var r = applyMiddleware();
    r.res.success({ x: 1 }, "Done", 202);
    assertEqual(r.res._status, 202);
  });

  test("falls back to 200 for invalid status", function () {
    var r = applyMiddleware();
    r.res.success(null, "ok", 9999);
    assertEqual(r.res._status, 200);
  });
});

suite("res.badRequest — 400", function () {
  test("status 400", function () {
    var r = applyMiddleware();
    r.res.badRequest();
    assertEqual(r.res._status, 400);
  });

  test("success: false", function () {
    var r = applyMiddleware();
    r.res.badRequest();
    assert(r.res._body.success === false);
  });

  test("errors field passed through", function () {
    var r = applyMiddleware();
    r.res.badRequest("Validation failed", { email: "required" });
    assertEqual(r.res._body.errors.email, "required");
  });

  test("errors null when not provided", function () {
    var r = applyMiddleware();
    r.res.badRequest("Bad");
    assert(r.res._body.errors === null);
  });
});

suite("res.unauthorized — 401", function () {
  test("status 401", function () {
    var r = applyMiddleware();
    r.res.unauthorized();
    assertEqual(r.res._status, 401);
  });

  test("default message", function () {
    var r = applyMiddleware();
    r.res.unauthorized();
    assertEqual(r.res._body.message, "Unauthorized");
  });
});

suite("res.forbidden — 403", function () {
  test("status 403", function () {
    var r = applyMiddleware();
    r.res.forbidden();
    assertEqual(r.res._status, 403);
  });
});

suite("res.notFound — 404", function () {
  test("status 404", function () {
    var r = applyMiddleware();
    r.res.notFound();
    assertEqual(r.res._status, 404);
  });

  test("custom message", function () {
    var r = applyMiddleware();
    r.res.notFound("User not found");
    assertEqual(r.res._body.message, "User not found");
  });
});

suite("res.conflict — 409", function () {
  test("status 409", function () {
    var r = applyMiddleware();
    r.res.conflict();
    assertEqual(r.res._status, 409);
  });
});

suite("res.unprocessable — 422", function () {
  test("status 422", function () {
    var r = applyMiddleware();
    r.res.unprocessable();
    assertEqual(r.res._status, 422);
  });

  test("errors passed through", function () {
    var r = applyMiddleware();
    r.res.unprocessable("Error", ["field required"]);
    assert(Array.isArray(r.res._body.errors));
  });
});

suite("res.tooManyRequests — 429", function () {
  test("status 429", function () {
    var r = applyMiddleware();
    r.res.tooManyRequests();
    assertEqual(r.res._status, 429);
  });

  test("sets Retry-After header when provided", function () {
    var r = applyMiddleware();
    r.res.tooManyRequests("Slow down", 60);
    assertEqual(r.res._headers["Retry-After"], "60");
  });

  test("does not set Retry-After when not provided", function () {
    var r = applyMiddleware();
    r.res.tooManyRequests();
    assert(r.res._headers["Retry-After"] === undefined);
  });
});

suite("res.serverError — 500", function () {
  test("status 500", function () {
    var r = applyMiddleware();
    r.res.serverError();
    assertEqual(r.res._status, 500);
  });

  test("default message", function () {
    var r = applyMiddleware();
    r.res.serverError();
    assertEqual(r.res._body.message, "Internal server error");
  });
});

suite("res.error — generic", function () {
  test("custom status", function () {
    var r = applyMiddleware();
    r.res.error("gone", 410);
    assertEqual(r.res._status, 410);
  });

  test("falls back to 500 for invalid status", function () {
    var r = applyMiddleware();
    r.res.error("bad", -1);
    assertEqual(r.res._status, 500);
  });
});

suite("res.paginate", function () {
  test("status 200", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: 1, limit: 10, total: 0 });
    assertEqual(r.res._status, 200);
  });

  test("correct totalPages", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: 1, limit: 10, total: 50 });
    assertEqual(r.res._body.meta.pagination.totalPages, 5);
  });

  test("hasNextPage true when more pages exist", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: 1, limit: 10, total: 50 });
    assert(r.res._body.meta.pagination.hasNextPage === true);
  });

  test("hasPrevPage false on first page", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: 1, limit: 10, total: 50 });
    assert(r.res._body.meta.pagination.hasPrevPage === false);
  });

  test("hasPrevPage true on page 2", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: 2, limit: 10, total: 50 });
    assert(r.res._body.meta.pagination.hasPrevPage === true);
  });

  test("hasNextPage false on last page", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: 5, limit: 10, total: 50 });
    assert(r.res._body.meta.pagination.hasNextPage === false);
  });

  test("non-array data becomes empty array", function () {
    var r = applyMiddleware();
    r.res.paginate(null, "ok", {});
    assert(Array.isArray(r.res._body.data));
    assertEqual(r.res._body.data.length, 0);
  });

  test("string page/limit parsed correctly", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: "2", limit: "5", total: "20" });
    assertEqual(r.res._body.meta.pagination.page, 2);
    assertEqual(r.res._body.meta.pagination.limit, 5);
    assertEqual(r.res._body.meta.pagination.totalPages, 4);
  });

  test("data passed through", function () {
    var items = [{ id: 1 }, { id: 2 }];
    var r = applyMiddleware();
    r.res.paginate(items, "ok", { page: 1, limit: 10, total: 2 });
    assertEqual(r.res._body.data.length, 2);
  });
});

suite("asyncHandler", function () {
  test("throws TypeError for non-function", function () {
    var threw = false;
    try {
      asyncHandler("bad");
    } catch (e) {
      threw = e instanceof TypeError;
    }
    assert(threw, "should throw TypeError");
  });

  test("calls next(err) when async fn rejects", function (done) {
    var err = new Error("async fail");
    var handler = asyncHandler(function () {
      return Promise.reject(err);
    });
    var nextErr = null;
    handler({}, {}, function (e) {
      nextErr = e;
    });
    setTimeout(function () {
      assert(nextErr === err, "next should receive the error");
    }, 10);
  });

  test("calls next(err) when sync fn throws", function () {
    var err = new Error("sync fail");
    var handler = asyncHandler(function () {
      throw err;
    });
    var nextErr = null;
    handler({}, {}, function (e) {
      nextErr = e;
    });
    assert(nextErr === err);
  });

  test("does not call next when fn resolves normally", function (done) {
    var nextCalled = false;
    var handler = asyncHandler(function () {
      return Promise.resolve();
    });
    handler({}, {}, function (e) {
      if (e) nextCalled = true;
    });
    setTimeout(function () {
      assert(!nextCalled);
    }, 10);
  });
});

suite("Logger option", function () {
  test("logger:true does not break responses", function () {
    var r = applyMiddleware({ logger: true });
    r.res.ok({ test: true });
    assertEqual(r.res._status, 200);
    assert(r.res._body.success === true);
  });

  test("logger:false behaves same as default", function () {
    var r = applyMiddleware({ logger: false });
    r.res.notFound("gone");
    assertEqual(r.res._status, 404);
  });
});

suite("Response structure integrity", function () {
  test("success response always has success/message/data/meta", function () {
    var r = applyMiddleware();
    r.res.ok({ x: 1 });
    var b = r.res._body;
    assert("success" in b && "message" in b && "data" in b && "meta" in b);
  });

  test("error response always has success/message/data/errors/meta", function () {
    var r = applyMiddleware();
    r.res.notFound();
    var b = r.res._body;
    assert(
      "success" in b &&
        "message" in b &&
        "data" in b &&
        "errors" in b &&
        "meta" in b,
    );
  });

  test("error response data is always null", function () {
    var r = applyMiddleware();
    r.res.serverError();
    assert(r.res._body.data === null);
  });

  test("paginate response has pagination in meta", function () {
    var r = applyMiddleware();
    r.res.paginate([], "ok", { page: 1, limit: 5, total: 10 });
    assert(r.res._body.meta.pagination !== undefined);
  });
});

//  Runner

console.log("\n\x1b[1m🧪 node-responder — Test Suite\x1b[0m\n");

suites.forEach(function (s) {
  console.log("\x1b[36m" + s.name + "\x1b[0m");
  s.tests.forEach(function (t) {
    try {
      t.fn();
      console.log("  \x1b[32m✔\x1b[0m " + t.name);
      passed++;
    } catch (e) {
      console.log("  \x1b[31m✖\x1b[0m " + t.name);
      console.log("    \x1b[2m" + e.message + "\x1b[0m");
      failed++;
    }
  });
  console.log("");
});

var total = passed + failed;
console.log("─".repeat(45));
console.log(
  "Total: " +
    total +
    "  \x1b[32mPassed: " +
    passed +
    "\x1b[0m  \x1b[31mFailed: " +
    failed +
    "\x1b[0m",
);

if (failed === 0) {
  console.log("\n\x1b[32m\x1b[1m🎉 All tests passed!\x1b[0m\n");
} else {
  console.log("\n\x1b[31m⚠️  " + failed + " test(s) failed.\x1b[0m\n");
  process.exit(1);
}
