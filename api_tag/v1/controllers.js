const prisma = require("../../prisma/client");
const bot = require("../../telegram/telegramClient");
const { resError, resSuccess } = require("../../util/responseHandler");
const ITEM_LIMIT = 20;

exports.create = async (req, res) => {
    try {
        const { tagId } = req.body;
        const data = await prisma.tagId.create({
            data: {
                tagId,
            },
        });
        return resSuccess({ res, title: "Success create new item", data });
    } catch (error) {
        let errorTitle = "Failed to add new item";
        if (error.meta.target[0] === "tagId") {
            errorTitle = "Tag ID Already Exist";
        }
        resError({
            res,
            errors: error,
            title: errorTitle,
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
                itemList = await prisma.tagId.findMany({
                    where: {
                        tagId: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        tagId: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }

            if (cursor) {
                itemList = await prisma.tagId.findMany({
                    where: {
                        tagId: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        tagId: "asc",
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
                itemList = await prisma.tagId.findMany({
                    orderBy: {
                        tagId: "asc",
                    },
                    take: ITEM_LIMIT,
                });
            }
            if (cursor) {
                itemList = await prisma.tagId.findMany({
                    orderBy: {
                        tagId: "asc",
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
            title: "Success list all tag id",
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
        const { tagId } = req.body;
        const data = await prisma.tagId.update({
            where: { id },
            data: {
                tagId,
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
        const data = await prisma.tagId.findFirstOrThrow({
            where: { id },
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
        const data = await prisma.tagId.delete({
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
