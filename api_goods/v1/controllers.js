const prisma = require("../../prisma/client");
const bot = require("../../telegram/telegramClient");
const { resError, resSuccess } = require("../../util/responseHandler");
const ITEM_LIMIT = 2;

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

exports.listGoods = async (req, res) => {
    try {
        const { search, cursor } = req.query;
        let itemList;
        if (search) {
            if (!cursor) {
                itemList = await prisma.goods.findMany({
                    where: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                itemList = await prisma.goods.findMany({
                    where: {
                        name: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }
        if (!search) {
            if (!cursor) {
                itemList = await prisma.goods.findMany({
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                itemList = await prisma.goods.findMany({
                    orderBy: {
                        name: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                });
            }
        }
        return resSuccess({
            res,
            title: "Success list all item",
            data: itemList,
        });
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Failed to listed all item",
            code: 400,
        });
    }
};
