const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const middlewares = [
  cors({
    origin: [
      "http://127.0.0.1:5000",
      "http://localhost:5000",
      "https://accounts.google.com",
    ],
    credentials: true,
  }),
  express.static("public"),
  cookieParser(),
  express.json(),
  express.urlencoded({ extended: true }),
  morgan("dev"),
];

module.exports = (app) => {
  middlewares.map((m) => app.use(m));
};
