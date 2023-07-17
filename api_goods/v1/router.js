const { createGoods, listGoods } = require("./controllers");
const router = require("express").Router();

router.route("/").post(createGoods).get(listGoods);

module.exports = router;
