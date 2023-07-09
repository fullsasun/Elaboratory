const prisma = require("../prisma/client");
const { setUserActivity, getUserActivity } = require("../prisma/util");
const { Keyboard } = require("../util/defaultInlineKeyboardLayout");
const bot = require("./telegramClient");
const Calendar = require("telegram-inline-calendar");
const moment = require("moment");
const { days } = require("../util/timeFormater");

const calendar = new Calendar(bot, {
    date_format: "DD-MM-YYYY",
    language: "en",
});

bot.on("callback_query", async (query) => {
    console.log("---------------- ⬇NEW CALLBACK⬇ ----------------");
    console.log(query);

    const userChatId = query.message.chat.id;
    const strUserChatId = String(query.message.chat.id);
    const userMessageId = query.message.message_id;
    const msg = query.message;
    const userActivity = query.data;

    const opts = {
        chat_id: userChatId,
        message_id: userMessageId,
    };

    // INFO: Jika User Ingin Melihat Detail Profil Mereka
    if (userActivity == "profil") {
        let text = "";
        const user = await prisma.user.findUnique({
            where: {
                user_chat_id: strUserChatId,
            },
        });
        if (user) {
            text = ` ⭐This Your Profile Detail⭐\nUsername:\t${user.username}\nName:\t${user.first_name} ${user.last_name}\nNIM:\t${user.nim}`;
        }

        if (!user) {
            text =
                "Sorry, we not recognize you. Are you new here? please fill up your profil first";
        }

        bot.editMessageText(text, opts);
    }

    // INFO: JIKA USER INGIN MELENGKAPI PROFIL MEREKA
    if (userActivity == "fillprofil") {
        setUserActivity(msg, "FILL_UP_PROFIL"); //Update aktifitas terakhir user, digunakan untuk menentukan respon berikutnya jika user mengirim pesan
        bot.editMessageText(
            "Please provide your NIM/NIP (ex: 1907421001)\n*just type your NIM",
            opts
        );
    }

    // INFO: JIKA USER MENAKAN MENU INVENTORY LIST
    if (userActivity === "inventorylist") {
        const data = await prisma.goods.findMany({
            orderBy: {
                name: "asc",
            },
        });

        const dataPlaceholder = [];
        data.forEach((item) => {
            dataPlaceholder.push([
                { text: item.name, callback_data: `order#${item.id}` },
            ]);
        });

        opts["reply_markup"] = JSON.stringify({
            inline_keyboard: dataPlaceholder,
        });
        bot.editMessageText("This Is the Item list", opts);
    }

    // INFO: JIKA USER MEMESAN BARANG
    if (userActivity.startsWith("order")) {
        const [_, id] = userActivity.split("#");
        const data = await prisma.goods.findUnique({
            where: {
                id,
            },
        });
        // Check good available in db
        const goodsInStock = await prisma.tagId.count({
            where: {
                goodsId: id,
                status: "READY_IN_INVENTORY",
            },
        });
        if (goodsInStock == 0) {
            bot.editMessageText(
                `📦 You Are Select ${data.name} not availble for now. All itens are on rent. Please try again in few day.`,
                {
                    chat_id: userChatId,
                    message_id: userMessageId,
                }
            );
            return;
        }

        const rent = await prisma.rent.create({
            data: {
                user: {
                    connect: {
                        user_chat_id: String(query.message.chat.id),
                    },
                },
                good: {
                    connect: {
                        id: data.id,
                    },
                },
            },
        });
        await setUserActivity(
            query.message,
            `ORDER#SELECT_START_DATE#${rent.id}`
        );
        const now = new Date();
        now.setDate(1);
        now.setHours(0);
        now.setMinutes(0);
        now.setSeconds(0);
        const text = `This The Goods Detail 📦\nName: ${data.name}\nQuantity:${data.quantity}`;
        const opts = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
        };
        opts["reply_markup"] = calendar.createNavigationKeyboard(now);
        bot.editMessageText(
            `You Are Select ${data.name}📦\nPlease select the start date of the rent 🗓️`,
            opts
        );
    }

    const lastUserActivity = await getUserActivity(query.message);
    res = calendar.clickButtonCalendar(query);
    if (res !== -1) {
        // JIKA AKTIVITAS USER BERKAITAN ORDER BARANG
        if (lastUserActivity?.startsWith("ORDER")) {
            // JIKA USER BARU MEMULAI ORDER DAN MEMILIH TANGGAL AWAL PEMINJAMAN
            if (lastUserActivity.startsWith("ORDER#SELECT_START_DATE")) {
                const [type, date, id] = lastUserActivity.split("#");

                console.log(res);
                // Memasukan Tanggal Awal Peminjaman Ke DB
                await prisma.rent.update({
                    where: {
                        id: String(id),
                    },
                    data: {
                        startRent: new Date(moment(res, "DD-MM-YYYY")),
                    },
                });

                const rent = await prisma.rent.findUnique({ where: { id } });
                // Mengubah Status Aktifitas User
                await setUserActivity(
                    query.message,
                    `ORDER#SELECT_FINISH_DATE#${rent.id}`
                );

                // Memberi balasan, agar user memilih tanggal akhir peminjamannya
                const now = new Date();
                now.setDate(1);
                now.setHours(0);
                now.setMinutes(0);
                now.setSeconds(0);
                const opts = {
                    chat_id: query.message.chat.id,
                    message_id: query.message.message_id,
                    inline_message_id: query.id,
                };
                opts["reply_markup"] = calendar.createNavigationKeyboard(now);
                bot.sendMessage(
                    query.message.chat.id,
                    `Please select the date on which you want to end the rent 🗓️`,
                    opts
                );
            }

            // JIKA USER MEMILIH TANGGAL AKHIR PEMINJAMAN
            if (lastUserActivity.startsWith("ORDER#SELECT_FINISH_DATE")) {
                const [type, date, id] = lastUserActivity.split("#");

                // Memasukan Tanggal Awal Peminjaman Ke DB
                const updatedData = await prisma.rent.update({
                    where: {
                        id: String(id),
                    },
                    data: {
                        finishRent: new Date(moment(res, "DD-MM-YYYY")),
                    },
                    select: {
                        id: true,
                        startRent: true,
                        finishRent: true,
                        rentApprovalStatus: true,
                        loanStatus: true,
                        good: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

                // Mengubah Status Aktifitas User
                await setUserActivity(
                    query.message,
                    `ORDER#FINISH_FILL_ORDER_FORM#${updatedData.id}`
                );
                // Memberi balasan, berupa summary peminjaman
                const summary = `The is a summary of your Rent\n🆔Your Order ID: ${
                    updatedData.id
                }\n📦 Goods Name: ${
                    updatedData.good[0].name
                }\n📅 Start Rent: ${days(
                    updatedData.startRent
                )}\n⏳ Finish Rent: ${days(
                    updatedData.finishRent
                )}\n📔 Approval Status: ${updatedData.rentApprovalStatus}`;

                bot.sendMessage(query.message.chat.id, summary);
            }
        }
    }

    // INFO: JIKA USER MELIHAT ORDER
    if (userActivity === "myorder") {
        const listOrder = await prisma.rent.findMany({
            where: {
                user: {
                    every: {
                        user_chat_id: String(query.message.chat.id),
                    },
                },
            },
            select: {
                id: true,
                startRent: true,
                finishRent: true,
                rentApprovalStatus: true,
                loanStatus: true,
                good: {
                    select: {
                        name: true,
                    },
                },
            },
        });
        let summary = "The is list of your Rent\n";
        listOrder.forEach((order) => {
            summary += `---------------------------------------------------------
            \n🆔Your Order ID: ${order.id}\n📦 Goods Name: ${
                order.good[0].name
            }\n📅 Start Rent: ${days(order.startRent)}\n⏳ Finish Rent: ${days(
                order.finishRent
            )}\n📔 Approval Status: ${order.rentApprovalStatus}\n`;
        });
        bot.sendMessage(query.message.chat.id, summary);
    }
});

module.exports = bot;
