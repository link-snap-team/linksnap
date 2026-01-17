const cors = require("cors");

function createCorsMiddleware() {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw === "*") return cors({ origin: "*" });

  const allowed = raw.split(",").map(s => s.trim()).filter(Boolean);
  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: origin not allowed"));
    }
  });
}

module.exports = createCorsMiddleware;
