const router = require("express").Router();
const DEVICE_V1 = require("./api_device/v1/router");

router.use("/api/v1/device", DEVICE_V1);

module.exports = router;
