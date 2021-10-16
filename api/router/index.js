const router = require("express").Router();
const { getRequest, exportXls } = require("../controller/index");

router.route("/api/v1/get-data/").post(getRequest);
router.route("/api/v1/export-data/").post(exportXls);

module.exports = router;
