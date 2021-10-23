const router = require("express").Router();
const { getRequest, googleApi, gotoSheet } = require("../controller/index");

router.route("/api/v1/get-data/").post(getRequest);
router.route("/api/v1/google-api").get(googleApi);
router.route("/api/v1/goto-sheets/").get(gotoSheet);

module.exports = router;
