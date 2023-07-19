//UNTUK CREATE BARANG PEMINJAMAN DI POSTMAN
const prisma = require("../../prisma/client");
const bot = require("../../telegram/telegramClient");
const { resError, resSuccess } = require("../../util/responseHandler");
const ITEM_LIMIT = 2;

exports.create = async (req, res) => {
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

exports.list = async (req, res) => {
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

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const data = await prisma.goods.update({
            where: { id },
            data: {
                name,
            },
        });
        return resSuccess({ res, title: "Success update item", data });
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Failed to update item",
            code: 400,
        });
    }
};

exports.detail = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await prisma.goods.findFirstOrThrow({
            where: { id },
            select: {
                id: true,
                name: true,
                createdAt: true,

                tag: {
                    select: {
                        id: true,
                        tagId: true,
                        status: true,
                    },
                },
            },
        });
        return resSuccess({ res, title: "Success get item detail", data });
    } catch (error) {
        let errorTitle = "";
        if (error.code === "P2025" && error.name === "NotFoundError") {
            errorTitle = "Cant find the item";
        }
        resError({
            res,
            errors: error,
            title: errorTitle,
            code: 400,
        });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await prisma.goods.delete({
            where: { id },
        });
        return resSuccess({ res, title: "Success delete item", data });
    } catch (error) {
        let errorTitle = "";
        if (error.meta.cause === "Record to delete does not exist.") {
            errorTitle = "Record to delete does not exist.";
        }
        resError({
            res,
            errors: error,
            title: errorTitle,
            code: 400,
        });
    }
};

exports.addTagToItem = async (req, res) => {
    try {
        const { tagId, goodsId } = req.body;
        console.log(tagId);
        const data = await prisma.goods.update({
            where: {
                id: goodsId,
            },
            data: {
                tag: {
                    connect: tagId.map((tag) => ({ tagId: tag })),
                },
            },
        });
        return resSuccess({ res, title: "Success link tag id to item", data });
    } catch (error) {
        console.log(error);
        let errorTitle = "Failed to link tag to item";
        if (error?.meta?.cause === "Record to delete does not exist.") {
            errorTitle = "Record to link does not exist.";
        }
        resError({
            res,
            errors: error,
            title: errorTitle,
            code: 400,
        });
    }
};
