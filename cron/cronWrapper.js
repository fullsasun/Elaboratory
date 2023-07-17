const nodeCron = require("node-cron");
const { checkTime } = require("./tempratureChecker");

// Set job to working on every 9 am
nodeCron.schedule("18 10 * * *", () => {
    checkTime();
});

module.exports = nodeCron;
