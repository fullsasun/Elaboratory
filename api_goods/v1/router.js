const { createGoods } = require("./controllers");
const router = require("express").Router();

router.route("/").post(createGoods);

module.exports = router;
