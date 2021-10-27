const router = require("express").Router();
const {
  getRequest,
  googleApi,
  tokenController,
  sheetController,
} = require("../controller/index");

router.route("/api/v1/get-data/").post(getRequest);
router.route("/api/v1/google-api/").get(googleApi);
router.route("/api/v1/get-token/").get(tokenController);
router.route("/api/v1/sheet-api/").post(sheetController);

module.exports = router;
