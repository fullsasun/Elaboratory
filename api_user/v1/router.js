const { list, setAdmin } = require("./controllers");

const router = require("express").Router();
router.route("/").get(list);
router.route("/set-admin/:id").patch(setAdmin);
module.exports = router;
