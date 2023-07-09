const prisma = require("../../prisma/client");
const bot = require("../../telegram/telegramClient");
const { resError, resSuccess } = require("../../util/responseHandler");

exports.startRent = async (req, res) => {
    try {
        const { tagUid } = req.body;

        // Check request exist
        const rentData = await prisma.rent.findMany({
            where: {
                itemTag: {
                    tagId: tagUid,
                },
                rentApprovalStatus: "ALLOWED",
                loanStatus: "NOT_STARTED",
            },
            select: {
                id: true,
                user: {
                    select: {
                        user_chat_id: true,
                        username: true,
                    },
                },
            },
        });

        if (rentData.length == 0) {
            throw "Cant find order request";
        }

        const updateRentData = await prisma.rent.update({
            where: { id: rentData[0].id },
            data: {
                loanStatus: "START_CONFIRMATION",
            },
        });

        const updateTagData = await prisma.tagId.update({
            where: {
                tagId: tagUid,
            },
            data: {
                status: "TAKEN_BY_USER",
            },
        });

        // KIRIM PESAN KONFIRMASI PADA USER
        const opts = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {
                            text: `✅`,
                            callback_data: `confirm-start#${rentData[0].id}`,
                        },
                        {
                            text: `❌`,
                            callback_data: `reject-start#${rentData[0].id}`,
                        },
                    ],
                ],
            }),
        };
        bot.sendMessage(
            rentData[0].user[0].user_chat_id,
            "We need your confirmation ⚠️\n\n We need to make sure that you have taken the items you ordered?\n\nPress the check icon to confirm, if you feel it's not you press the cross button!",
            opts
        );

        return resSuccess({
            res,
            title: "Success start rent",
            data: { updateRentData, updateTagData },
        });
    } catch (error) {
        return resError({ res, title: "Failed to start rent", errors: error });
    }
};

exports.finishRent = async (req, res) => {
    try {
        const { tagUid } = req.body;

        // Check request exist
        const rentData = await prisma.rent.findMany({
            where: {
                itemTag: {
                    tagId: tagUid,
                },
                rentApprovalStatus: "ALLOWED",
                loanStatus: "USED",
            },
            select: {
                id: true,
                user: {
                    select: {
                        user_chat_id: true,
                        username: true,
                    },
                },
            },
        });

        if (rentData.length == 0) {
            throw "Cant find rent data";
        }

        const updateRentData = await prisma.rent.update({
            where: { id: rentData[0].id },
            data: {
                loanStatus: "FINISH",
            },
        });

        const updateTagData = await prisma.tagId.update({
            where: {
                tagId: tagUid,
            },
            data: {
                status: "READY_IN_INVENTORY",
            },
        });

        // KIRIM PESAN KONFIRMASI PADA USER
        const opts = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        {
                            text: `✅`,
                            callback_data: `confirm-finish#${rentData[0].id}`,
                        },
                        {
                            text: `❌`,
                            callback_data: `reject-finish#${rentData[0].id}`,
                        },
                    ],
                ],
            }),
        };
        bot.sendMessage(
            rentData[0].user[0].user_chat_id,
            "We need your confirmation ⚠️\n\nWe need confirmation that you really return the item you borrowed!\n\nPress the check icon to confirm, if you feel it's not you press the cross button!",
            opts
        );

        return resSuccess({
            res,
            title: "Success finish rent",
            data: { updateRentData, updateTagData },
        });
    } catch (error) {
        return resError({ res, title: "Failed to finish rent", errors: error });
    }
};
