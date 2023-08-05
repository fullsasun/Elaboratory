const router = require("express").Router();
const api = require("./controllers_key");
// const { body, query, param } = require("express-validator");
// const {
//     loginRequired,
//     allowedRole,
// } = require("../../middlewares/authMiddlewares");
// const { formChacker } = require("../../middlewares/formMiddleware");
// const { apiIDIsExist } = require("../../middlewares/apiKeyMiddlewares");

router
    .route("/")
    .post(
        // loginRequired,
        // allowedRole("ADMIN", "ADMIN TEKNIS"),
        api.createApiKey
    )
    .get(
        // loginRequired,
        // allowedRole("ADMIN", "ADMIN TEKNIS"),
        api.apiKeyList
    );

router.route("/:id").delete(
    // loginRequired,
    // allowedRole("ADMIN", "ADMIN TEKNIS"),
    // param("id").notEmpty(),
    // formChacker,
    // apiIDIsExist,
    // formChacker,
    api.delete
);

module.exports = router;
