const prisma = require("../prisma/client");
const bot = require("../telegram/telegramClient");
// const bot = require("../telegram/telegramClient");
const { days } = require("../util/timeFormater");

const checkTime = async () => {
    const now = new Date();

    // SELECT ALL RENT ORDER WHEN FINISH ORDER IS PAST AND STATUS IS USED
    const allRent = await prisma.rent.findMany({
        where: {
            OR: [
                {
                    finishRent: {
                        lt: now,
                    },
                    loanStatus: "USED",
                },
                {
                    finishRent: {
                        lt: now,
                    },
                    loanStatus: "LATE",
                },
            ],
        },
        select: {
            id: true,
            startRent: true,
            finishRent: true,
            loanStatus: true,
            rentApprovalStatus: true,
            user: {
                select: {
                    username: true,
                    user_chat_id: true,
                },
            },
            good: {
                select: {
                    name: true,
                },
            },
            itemTag: {
                select: {
                    tagId: true,
                },
            },
        },
    });

    allRent.forEach(async (rent) => {
        const timeDifference =
            now.getTime() - new Date(rent.finishRent).getTime();
        const daysDifference = Math.ceil(
            timeDifference / (1000 * 60 * 60 * 24)
        );
        const msgTitle = `Dear ${rent.user[0].username},\n\nThis is a notification to inform you that you are ${daysDifference} day(s) late in returning the rented item. Please return it as soon as possible to avoid any additional fees or penalties. The data below is the details of rent items that you have not returned yet:`;
        const rentDetail = `🆔 Your Order ID: ${rent.id}\n📦 Goods Name: ${
            rent.good[0]?.name
        }\n📅 Start Rent: ${days(rent.startRent)}\n⏳ Finish Rent: ${days(
            rent.finishRent
        )}\n📇 Tag ID: ${rent?.itemTag?.tagId}\n📔 Approval Status: ${
            rent.rentApprovalStatus
        }\n🔃 Rent Status: LATE`;
        const msgFinal = `${msgTitle}\n\n${rentDetail}`;

        await prisma.rent.update({
            where: { id: rent.id },
            data: {
                loanStatus: "LATE",
            },
        });

        bot.sendMessage(rent.user[0].user_chat_id, msgFinal);
    });
};

module.exports = { checkTime };
