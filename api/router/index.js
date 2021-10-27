const router = require("express").Router();
const {
  getScraper,
  startScraper,
  googleApi,
  tokenController,
  getSheets,
  sheetController,
} = require("../controller/index");

router.route("/scraper/").get(getScraper).post(startScraper);

router.route("/auth-google/").get(googleApi);

router.route("/token/").get(tokenController);

router.route("/sheets/").get(getSheets).post(sheetController);

module.exports = router;
