const express = require("express");
const createCorsMiddleware = require("../src/createCorsMiddleware");

const app = express();
app.use(createCorsMiddleware());
app.get("/", (req, res) => res.status(200).json({ ok: true }));

module.exports = app;
