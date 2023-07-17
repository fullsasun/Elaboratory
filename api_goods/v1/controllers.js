const prisma = require("../../prisma/client");
const bot = require("../../telegram/telegramClient");
const { resError, resSuccess } = require("../../util/responseHandler");

exports.createGoods = async (req, res) => {
    try {
        const { name } = req.body;
        const data = await prisma.goods.create({
            data: {
                name,
            },
        });
        return resSuccess({ res, title: "Success create new item", data });
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Failed to add new item",
            code: 400,
        });
    }
};
