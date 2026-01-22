const express = require("express");
const createCorsMiddleware = require("../src/createCorsMiddleware");

const app = express();

const corsMw = createCorsMiddleware();
app.use(corsMw);
app.options("*", corsMw);

// Supporte les 2 cas : "/" ou "/health"
app.get("/", (req, res) => res.status(200).json({ ok: true }));
app.get("/health", (req, res) => res.status(200).json({ ok: true }));

module.exports = (req, res) => app(req, res);
