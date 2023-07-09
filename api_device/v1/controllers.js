const prisma = require("../../prisma/client");
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
        });

        if (rentData.length == 0) {
            throw "Cant find order request";
        }

        const updateRentData = await prisma.rent.update({
            where: { id: rentData[0].id },
            data: {
                loanStatus: "USED",
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

        return resSuccess({
            res,
            title: "Success finish rent",
            data: { updateRentData, updateTagData },
        });
    } catch (error) {
        return resError({ res, title: "Failed to finish rent", errors: error });
    }
};
