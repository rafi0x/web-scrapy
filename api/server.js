const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./router/index");

const app = express();
const middlewares = [
  cors(),
  express.json(),
  express.urlencoded({ extended: true }),
  morgan("dev"),
];

app.use(middlewares);
app.use(router);

app.listen(5000, () => {
  console.log("server on 5000");
});
