const router = require("express").Router();
const DEVICE_V1 = require("./api_device/v1/router");
const GOODS_V1 = require("./api_goods/v1/router");

router.use("/api/v1/device", DEVICE_V1);
router.use("/api/v1/goods", GOODS_V1);

module.exports = router;
