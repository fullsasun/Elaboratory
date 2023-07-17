const {
    create,
    list,
    update,
    detail,
    deleteItem,
    addTagToItem,
} = require("./controllers");
const router = require("express").Router();

router.route("/link-tag").patch(addTagToItem);
router.route("/").post(create).get(list);
router.route("/:id").patch(update).get(detail).delete(deleteItem);

module.exports = router;
