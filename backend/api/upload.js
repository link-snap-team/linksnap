const express = require("express");
const createCorsMiddleware = require("../src/createCorsMiddleware");
const createUploadRouter = require("../src/createUploadRouter");
const errorHandler = require("../src/errorHandler");

const app = express();
app.use(createCorsMiddleware());
app.use("/", createUploadRouter());
app.use(errorHandler);

module.exports = app;
