const multer = require("multer");

function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ error: { message: err.message, code: err.code } });
  }

  const status = err?.message?.includes("CORS blocked") ? 403 : 500;
  return res.status(status).json({ error: { message: err.message || "Internal server error" } });
}

module.exports = errorHandler;
