const prisma = require("../../prisma/client");
const bot = require("../../telegram/telegramClient");
const { resError, resSuccess } = require("../../util/responseHandler");
const ITEM_LIMIT = 20;

exports.list = async (req, res) => {
    try {
        const { search, cursor } = req.query;
        let userList;
        if (search) {
            if (!cursor) {
                userList = await prisma.user.findMany({
                    where: {
                        username: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        username: "asc",
                    },
                    take: ITEM_LIMIT,
                    select: {
                        id: true,
                        username: true,
                        user_chat_id: true,
                        nim: true,
                        first_name: true,
                        last_name: true,
                        rentId: true,
                        roleId: true,
                        createdAt: true,
                        updatedAt: true,
                        Role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            }

            if (cursor) {
                userList = await prisma.user.findMany({
                    where: {
                        username: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    orderBy: {
                        username: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    select: {
                        id: true,
                        username: true,
                        user_chat_id: true,
                        nim: true,
                        first_name: true,
                        last_name: true,
                        rentId: true,
                        roleId: true,
                        createdAt: true,
                        updatedAt: true,
                        Role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            }
        }
        if (!search) {
            if (!cursor) {
                userList = await prisma.user.findMany({
                    orderBy: {
                        username: "asc",
                    },
                    take: ITEM_LIMIT,
                    select: {
                        id: true,
                        username: true,
                        user_chat_id: true,
                        nim: true,
                        first_name: true,
                        last_name: true,
                        rentId: true,
                        roleId: true,
                        createdAt: true,
                        updatedAt: true,
                        Role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            }
            if (cursor) {
                userList = await prisma.user.findMany({
                    orderBy: {
                        username: "asc",
                    },
                    take: ITEM_LIMIT,
                    skip: 1,
                    cursor: {
                        id: cursor,
                    },
                    select: {
                        id: true,
                        username: true,
                        user_chat_id: true,
                        nim: true,
                        first_name: true,
                        last_name: true,
                        rentId: true,
                        roleId: true,
                        createdAt: true,
                        updatedAt: true,
                        Role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });
            }
        }
        return resSuccess({
            res,
            title: "Success list all user",
            data: userList,
        });
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Failed to listed all user",
            code: 400,
        });
    }
};

exports.setAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const data = await prisma.user.update({
            where: { id },
            data: {
                Role: {
                    connect: {
                        name: role,
                    },
                },
            },
            select: {
                id: true,
                username: true,
                user_chat_id: true,
                nim: true,
                first_name: true,
                last_name: true,
                rentId: true,
                roleId: true,
                createdAt: true,
                updatedAt: true,
                Role: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        return resSuccess({
            res,
            title: "Success to user role to admin",
            data,
        });
    } catch (error) {
        resError({
            res,
            errors: error,
            title: "Failed to set user role to ADMIN",
            code: 400,
        });
    }
};
