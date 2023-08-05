const router = require("express").Router();
const DEVICE_V1 = require("./api_device/v1/router");
const GOODS_V1 = require("./api_goods/v1/router");
const TAG_V1 = require("./api_tag/v1/router");
const USER_V1 = require("./api_user/v1/router");
const API_KEY_V1 = require("./api_key/v1/router");

router.use("/api/v1/device", DEVICE_V1);
router.use("/api/v1/goods", GOODS_V1);
router.use("/api/v1/tag", TAG_V1);
router.use("/api/v1/user", USER_V1);
router.use("/api/v1/secret", API_KEY_V1);

module.exports = router;
