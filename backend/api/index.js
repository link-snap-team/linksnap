const express = require("express");
const createCorsMiddleware = require("../src/createCorsMiddleware");

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(createCorsMiddleware());

app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Backend is running",
    endpoints: {
      health: "GET /health",
      upload: "POST /upload (multipart/form-data, field name: file)"
    },
    corsOrigin: process.env.CORS_ORIGIN || "*"
  });
});

app.all("*", (req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});

module.exports = (req, res) => app(req, res);
