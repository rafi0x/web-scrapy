require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const router = require("./router/index");
const middlewares = require("./middlewares/index");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cookieParser());
app.set("view engine", "ejs");
middlewares(app);
app.use(router);

app.listen(process.env.PORT || 5000, () => {
  console.log(`server on http://127.0.0.1:${process.env.PORT || 5000}`);
});
