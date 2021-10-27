require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./router/index");
const middlewares = require("./middlewares/index");

const app = express();

app.set("view engine", "ejs");
middlewares(app);
app.use(router);

app.listen(process.env.PORT || 5000, () => {
  console.log(`server on ${process.env.PORT || 5000}`);
});
