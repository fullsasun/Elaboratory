const { create, list, update, detail, deleteItem } = require("./controllers");
const router = require("express").Router();

router.route("/").post(create).get(list);
router.route("/:id").patch(update).get(detail).delete(deleteItem);

module.exports = router;
