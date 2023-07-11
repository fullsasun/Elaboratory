const cron = require("node-cron");
const { checkRentExpired } = require("./rentChecker");

cron.schedule("0 9 * * *", () => {
    checkRentExpired();
});
