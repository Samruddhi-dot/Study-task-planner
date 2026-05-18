const express = require("express");
const serverless = require("serverless-http");

const taskRoutes = require("../routes/tasks");

const app = express();

app.use(express.json());

app.use("/tasks", taskRoutes);

module.exports = app;
module.exports.handler = serverless(app);
