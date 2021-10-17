const router = require("express").Router();
const { getRequest, googleApi } = require("../controller/index");

router.route("/api/v1/get-data/").post(getRequest);
// router.route("/api/v1/google-api/").post(googleApi);

module.exports = router;
