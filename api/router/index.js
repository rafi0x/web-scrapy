const router = require("express").Router();
const { getRequest } = require("../controller/index");

router.route("/api/v1/get-data/").post(getRequest);
router.route("/api/v1/google-sheets/");

module.exports = router;
