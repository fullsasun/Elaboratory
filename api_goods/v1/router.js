const {
    createGoods,
    listGoods,
    updateGoods,
    detailGoods,
    deleteGoods,
} = require("./controllers");
const router = require("express").Router();

router.route("/").post(createGoods).get(listGoods);
router.route("/:id").patch(updateGoods).get(detailGoods).delete(deleteGoods);

module.exports = router;
