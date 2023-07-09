const router = require("express").Router();
const controllers = require("./controllers");

router.post("/rent/start", controllers.startRent);
router.post("/rent/finish", controllers.finishRent);

module.exports = router;
