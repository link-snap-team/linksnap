const cors = require("cors");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toWildcardRegExp(pattern) {
  const escaped = escapeRegExp(pattern).replace(/\\\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

function parseAllowedOrigins(raw) {
  const tokens = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const exact = new Set();
  const wildcards = [];

  for (const token of tokens) {
    if (token.includes("*")) {
      wildcards.push(toWildcardRegExp(token));
    } else {
      exact.add(token);
    }
  }

  return {
    exact,
    wildcards
  };
}

function createCorsMiddleware() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw === "*") {
    return cors({
      origin: "*",
      methods: ["GET", "POST", "OPTIONS"],
      allowedHeaders: ["Content-Type"],
      maxAge: 86400,
      optionsSuccessStatus: 204
    });
  }

  const allowed = parseAllowedOrigins(raw);
  const isAllowed = (origin) => {
    if (!origin) return true;
    if (allowed.exact.has(origin)) return true;
    return allowed.wildcards.some((re) => re.test(origin));
  };

  return cors({
    origin(origin, cb) {
      // IMPORTANT: do not throw from here; it can result in responses without CORS headers.
      return cb(null, isAllowed(origin));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400,
    optionsSuccessStatus: 204
  });
}

module.exports = createCorsMiddleware;
