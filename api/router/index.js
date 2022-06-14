const router = require("express").Router();
const {
  getScraperPage,
  getSheetPage,
  startScraper,
  googleApi,
  tokenController,
  sheetController,
} = require("../controller/index");

router.route('/').get(getScraperPage)
router.route('/sheets').get(getSheetPage)
router.route("/api/v1/get-data/").post(startScraper);
router.route("/api/v1/google-api/").get(googleApi);
router.route("/api/v1/get-token/").get(tokenController);
router.route("/api/v1/sheet-api/").post(sheetController);

module.exports = router;
