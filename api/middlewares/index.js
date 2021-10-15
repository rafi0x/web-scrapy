const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const middlewares = [
  cors(),
  express.json(),
  express.urlencoded({ extended: true }),
  morgan("dev"),
];

module.exports = (app) => {
  middlewares.map((m) => app.use(m));
};
