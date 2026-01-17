require("dotenv").config();

const express = require("express");
const uploadApp = require("./api/upload");
const healthApp = require("./api/health");

const app = express();
app.use("/upload", uploadApp);
app.use("/health", healthApp);

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
