const router = require("express").Router();
const { getRequest } = require("../controller/index");

router.route("/api/v1/get-data/").post(getRequest);

module.exports = router;
