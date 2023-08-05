const router = require("express").Router();
const { apiValidation } = require("../../middleware/apiKeyMiddlewares");
const controllers = require("./controllers");

router.post("/rent/start", apiValidation, controllers.startRent);
router.post("/rent/finish", apiValidation, controllers.finishRent);

module.exports = router;
