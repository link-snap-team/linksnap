const express = require("express");
const createCorsMiddleware = require("../src/createCorsMiddleware");
const createUploadRouter = require("../src/createUploadRouter");
const errorHandler = require("../src/errorHandler");

const app = express();

const corsMw = createCorsMiddleware();
app.use(corsMw);
app.options("*", corsMw);

// Supporte les 2 cas : la fonction reçoit "/" ou "/upload"
app.use("/", createUploadRouter());
app.use("/upload", createUploadRouter());

app.use(errorHandler);

module.exports = (req, res) => app(req, res);
