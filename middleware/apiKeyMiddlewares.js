const prisma = require("../prisma/client");
const { resError } = require("../util/responseHandler");

const apiValidation = async (req, res, next) => {
    try {
        const apiID = req.headers["x-api-id"];
        const apiSecret = req.headers["x-api-secret"];

        if (!apiID) throw "API ID Not Define"; // throw error when api id not define
        if (!apiSecret) throw "API KEY Not Define"; // throw error when api key not define

        const apiData = await prisma.api_Key.findUnique({
            where: { id: apiID },
        });

        if (!apiData) throw "Cant find API Data"; // jika api id tidak ada di database maka throw error

        if (apiSecret !== apiData.secret) throw "Secret Payload not match"; // jika jwt tidak bisa di verifikasi maka throw error

        return next();
    } catch (error) {
        return resError({
            res,
            title: "API Authentication Failed",
            errors: error,
        });
    }
};

module.exports = { apiValidation };
