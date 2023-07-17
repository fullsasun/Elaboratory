const prisma = require("../prisma/client");
const {
    setUserActivity,
    getUserActivity,
    isUserExist,
} = require("../prisma/util");
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
    const userIsExist = await isUserExist(query.message);

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
        if (userIsExist == false) {
            setUserActivity(msg, "FILL_UP_PROFIL"); //Update aktifitas terakhir user, digunakan untuk menentukan respon berikutnya jika user mengirim pesan
            bot.editMessageText(
                "Please provide your NIM/NIP (ex: 1907421001)\n*just type your NIM",
                opts
            );
        }

        if (userIsExist == true) {
            bot.editMessageText("Dont wory we already save your data 🔥", opts);
        }
    }

    // INFO: JIKA USER MENAKAN MENU INVENTORY LIST
    if (userActivity == "inventorylist") {
        const datas = await prisma.goods.findMany({
            orderBy: {
                name: "asc",
            },
            take: 10,
        });

        var summary = "Here is a list of items that you can borrow \n";
        const dataPlaceholder = [];
        datas.forEach(async (data, i) => {
            const allGoods = await prisma.tagId.count({
                where: {
                    goodsId: data.id,
                },
            });

            // Check good available in db
            const goodsInStock = await prisma.tagId.count({
                where: {
                    goodsId: data.id,
                    status: "READY_IN_INVENTORY",
                },
            });

            summary += `---------------------------------------------------------\n📦 Goods Name: ${data.name}\n📅 Total Stock: ${allGoods}\n⏳ Avaiable: ${goodsInStock}\n\n`;

            if (i == datas.length - 1) {
                bot.sendMessage(query.message.chat.id, summary);
            }
        });
    }

    // INFO: JIKA USER MENAKAN MENU ORDER ITEM
    if (userActivity === "startorder") {
        // ONLY USER ALREADY REGISTER CAN ACCESS THIS MENU
        if (userIsExist == false) {
            bot.editMessageText(
                "Sory we cant show this menu for unregister user 😔. Please fillup your profil first 🙂",
                opts
            );
            return;
        }

        const data = await prisma.goods.findMany({
            orderBy: {
                name: "asc",
            },
            take: 10,
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
        // ONLY USER ALREADY REGISTER CAN ACCESS THIS MENU
        if (userIsExist == false) {
            bot.editMessageText(
                "Sory we cant show this menu for unregister user 😔. Please fillup your profil first 🙂",
                opts
            );
            return;
        }

        const [_, id] = userActivity.split("#");
        const data = await prisma.goods.findUnique({
            where: {
                id,
            },
        });
        const allGoods = await prisma.tagId.count({
            where: {
                goodsId: id,
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
        const opts = {
            chat_id: query.message.chat.id,
            message_id: query.message.message_id,
        };
        opts["reply_markup"] = calendar.createNavigationKeyboard(now);
        bot.editMessageText(
            `This The Goods Detail 📦\nName: ${data.name}\n Quantity:${allGoods}\n Available:${goodsInStock}\nPlease select the start date of the rent 🗓️`,
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
                        user: {
                            select: {
                                username: true,
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
                const summary = `\n\n🆔Order ID: ${
                    updatedData.id
                }\n\n📦Goods Name: ${
                    updatedData.good[0].name
                }\n\n📅Start Rent: ${days(
                    updatedData.startRent
                )}\n\n⏳Finish Rent: ${days(
                    updatedData.finishRent
                )}\n\n📔Approval Status: ${updatedData.rentApprovalStatus}`;

                // KIRIM PESAN KE USER
                bot.sendMessage(
                    query.message.chat.id,
                    `The is a summary of your Rent${summary}`
                );

                // KIRIM PESAN KE ADMINISTRATOR
                const admins = await prisma.user.findMany({
                    where: {
                        Role: {
                            name: "ADMIN",
                        },
                    },
                    select: {
                        username: true,
                        user_chat_id: true,
                    },
                });

                admins.forEach((admin) => {
                    const opts = {
                        reply_markup: JSON.stringify({
                            inline_keyboard: [
                                [
                                    {
                                        text: `✅`,
                                        callback_data: `confirm-order#${updatedData.id}`,
                                    },
                                    {
                                        text: `❌`,
                                        callback_data: `reject-order#${updatedData.id}`,
                                    },
                                ],
                            ],
                        }),
                    };

                    bot.sendMessage(
                        admin.user_chat_id,
                        `Hello ${admin.username}, ${updatedData.user[0].username} submits a loan of goods with the details below.${summary}`,
                        opts
                    );
                });
            }
        }
    }

    // INFO: JIKA USER MELIHAT ORDER
    if (userActivity === "myorder") {
        // ONLY USER ALREADY REGISTER CAN ACCESS THIS MENU
        if (userIsExist == false) {
            bot.editMessageText(
                "Sory we cant show this menu for unregister user 😔. Please fillup your profil first 🙂",
                opts
            );
            return;
        }

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
                itemTag: {
                    select: {
                        tagId: true,
                    },
                },
                good: {
                    select: {
                        name: true,
                    },
                },
            },
            take: 15,
            orderBy: {
                createdAt: "desc",
            },
        });
        let summary = "The is list of your Rent\n";
        listOrder.forEach((order) => {
            summary += `\n\n---------------------------------------------------------
            \n🆔 Your Order ID: ${order.id}\n📦 Goods Name: ${
                order.good[0].name
            }\n📅 Start Rent: ${days(order.startRent)}\n⏳ Finish Rent: ${days(
                order.finishRent
            )}\n📇 Tag ID: ${order?.itemTag?.tagId}\n📔 Approval Status: ${
                order.rentApprovalStatus
            }\n🔃 Rent Status: ${order.loanStatus}`;
        });
        bot.sendMessage(query.message.chat.id, summary);
    }

    // INFO: JIKA USER MALKUKAN KONFIRMASI MULAI PEMINJAMAN BARANG\
    if (userActivity.startsWith("confirm-start")) {
        const [_, id] = userActivity.split("#");

        const allowRent = await prisma.rent.update({
            where: {
                id,
            },
            data: {
                loanStatus: "USED",
            },
            select: {
                good: {
                    select: {
                        name: true,
                    },
                },
                startRent: true,
                finishRent: true,
                rentApprovalStatus: true,
                loanStatus: true,
                itemTag: {
                    select: {
                        tagId: true,
                    },
                },
            },
        });

        bot.editMessageText(
            `We confirm that you 🫡 \n\n📦 Goods Name: ${
                allowRent.good[0].name
            }\n\n📅 Start Rent: ${days(
                allowRent.startRent
            )}\n\n⏳ Finish Rent: ${days(allowRent.finishRent)}\n\n📇 Tag ID: ${
                allowRent?.itemTag?.tagId
            }\n\n📔 Approval Status: ${
                allowRent.rentApprovalStatus
            }\n\n🆔 TAG ID: ${
                allowRent.itemTag.tagId
            }\n\nDon't forget to keep items and don't lend them back. And make sure you return the item on the date stated.`,
            opts
        );
    }

    // INFO: JIKA USER TIDAK MENGKONFIRMASI PEMINJAMAN
    if (userActivity.startsWith("reject-start")) {
        const [_, id] = userActivity.split("#");
        const rentData = await prisma.rent.update({
            where: {
                id,
            },
            data: {
                loanStatus: "NOT_STARTED",
            },
            select: {
                good: {
                    select: {
                        name: true,
                    },
                },
                startRent: true,
                finishRent: true,
                rentApprovalStatus: true,
                loanStatus: true,
                itemTag: {
                    select: {
                        tagId: true,
                    },
                },
                user: {
                    select: {
                        username: true,
                        nim: true,
                    },
                },
            },
        });

        bot.editMessageText(
            `We don't confirm that it's you!\n\nThe system will inform the lab keeper that your item was taken by an unauthorized person.\nWe hope that you will take further action by contacting the lab keeper.`,
            opts
        );

        // KIRIM PESAN KE ADMINISTRATOR
        const admins = await prisma.user.findMany({
            where: {
                Role: {
                    name: "ADMIN",
                },
            },
            select: {
                username: true,
                user_chat_id: true,
            },
        });

        admins.forEach((admin) => {
            bot.sendMessage(
                admin.user_chat_id,
                `Attention, please pay attention to the rent data below\n\n📦 Goods Name: ${
                    rentData.good[0].name
                }\n\n🔡 Borrower NIM: ${
                    rentData.user[0].nim
                }\n\n🧑Borrower Username: ${
                    rentData.user[0].username
                }\n\n📅 Start Rent: ${days(
                    rentData.startRent
                )}\n\n⏳ Finish Rent: ${days(
                    rentData.finishRent
                )}\n\n📇 Tag ID: ${
                    rentData?.itemTag?.tagId
                }\n\n📔 Approval Status: ${
                    rentData.rentApprovalStatus
                }\n\n🆔 TAG ID: ${
                    rentData.itemTag.tagId
                }\n\nThe user feels that not taken the item. An unauthorized person takes the item out of the lab.`
            );
        });
    }

    // INFO: JIKA USER MALKUKAN KONFIRMASI MENGEMBALIKAN BARANG PINJAMAN
    if (userActivity.startsWith("confirm-finish")) {
        const [_, id] = userActivity.split("#");

        const allowRent = await prisma.rent.update({
            where: {
                id,
            },
            data: {
                loanStatus: "FINISH",
            },
            select: {
                good: {
                    select: {
                        name: true,
                    },
                },
                startRent: true,
                finishRent: true,
                rentApprovalStatus: true,
                loanStatus: true,
                itemTag: {
                    select: {
                        tagId: true,
                    },
                },
            },
        });

        bot.editMessageText(
            `We confirm that you 🫡 \n\n📦 Goods Name: ${
                allowRent.good[0].name
            }\n\n📅 Start Rent: ${days(
                allowRent.startRent
            )}\n\n⏳ Finish Rent: ${days(allowRent.finishRent)}\n\n📇 Tag ID: ${
                allowRent?.itemTag?.tagId
            }\n\n📔 Approval Status: ${
                allowRent.rentApprovalStatus
            }\n\n🆔 TAG ID: ${
                allowRent.itemTag.tagId
            }\n\nThank you for returning the item completely and on time🤗`,
            opts
        );
    }

    // INFO: JIKA USER TIDAK MENGKONFIRMASI PENGEMBALIAN BARANG
    if (userActivity.startsWith("reject-finish")) {
        const [_, id] = userActivity.split("#");
        const rentData = await prisma.rent.update({
            where: {
                id,
            },
            data: {
                loanStatus: "USED",
            },
            select: {
                good: {
                    select: {
                        name: true,
                    },
                },
                startRent: true,
                finishRent: true,
                rentApprovalStatus: true,
                loanStatus: true,
                itemTag: {
                    select: {
                        tagId: true,
                    },
                },
                user: {
                    select: {
                        username: true,
                        nim: true,
                    },
                },
            },
        });

        bot.editMessageText(
            `We don't confirm that it's you!\n\nThe system will inform the lab keeper. that your item was returned by an unauthorized person\nWe hope that you will take further action by contacting the lab keeper.`,
            opts
        );

        // KIRIM PESAN KE ADMINISTRATOR
        const admins = await prisma.user.findMany({
            where: {
                Role: {
                    name: "ADMIN",
                },
            },
            select: {
                username: true,
                user_chat_id: true,
            },
        });

        admins.forEach((admin) => {
            bot.sendMessage(
                admin.user_chat_id,
                `Attention, please pay attention to the rent data below\n\n📦 Goods Name: ${
                    rentData.good[0].name
                }\n\n🔡 Borrower NIM: ${
                    rentData.user[0].nim
                }\n\n🧑Borrower Username: ${
                    rentData.user[0].username
                }\n\n📅 Start Rent: ${days(
                    rentData.startRent
                )}\n\n⏳ Finish Rent: ${days(
                    rentData.finishRent
                )}\n\n📇 Tag ID: ${
                    rentData?.itemTag?.tagId
                }\n\n📔 Approval Status: ${
                    rentData.rentApprovalStatus
                }\n\n🆔 TAG ID: ${
                    rentData.itemTag.tagId
                }\n\nThe user feels that not taken the item. The user feels that he has not returned the item. But the item data goes into inventory. Please check and reconfirm the item.`
            );
        });
    }

    // INFO: ADMIN SECTION
    // JIKA ADMIN INGIN MELIHAT SEMUA DAFTAR PEMINJAM YANG BELUM DISETUJUI
    if (userActivity == "admin-confirmationlist") {
        const dataPlaceholder = [];
        const data = await prisma.rent.findMany({
            where: { rentApprovalStatus: "WAITING" },
            select: {
                good: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        username: true,
                    },
                },
                id: true,
            },
        });
        data.forEach((item) => {
            dataPlaceholder.push([
                {
                    text: `${item.good[0].name} by ${item.user[0].username}`,
                    callback_data: `detail-order#${item.id}`,
                },
            ]);
            dataPlaceholder.push([
                {
                    text: `✅`,
                    callback_data: `confirm-order#${item.id}`,
                },
                {
                    text: `❌`,
                    callback_data: `reject-order#${item.id}`,
                },
            ]);
        });

        opts["reply_markup"] = JSON.stringify({
            inline_keyboard: dataPlaceholder,
        });

        bot.editMessageText(
            "The following shows a list of items and users who want to borrow these items.\n\nYou can confirm quickly by pressing the tick or cross under the item name.\n\nIf you want to see details of the loan, press the name of the item.",
            opts
        );
    }

    // JIKA ADMIN MENYETUJUI PEMINJAMAN
    if (userActivity.startsWith("confirm-order")) {
        const [_, id] = userActivity.split("#");

        // CEK APAKAH ID TELAH DIKONFIRMASI
        const approvalStatus = await prisma.rent.findUnique({
            where: {
                id,
            },
            select: {
                rentApprovalStatus: true,
            },
        });

        if (approvalStatus.rentApprovalStatus !== "WAITING") {
            bot.editMessageText(
                `User order with id ${id} already confirm`,
                opts
            );

            return;
        }

        // AMBIL RANDOM DATA TAG, UBAH STATUS TAG MENJADI BOOKED BY USER
        const goodsTagId = await prisma.tagId.findFirst({
            where: {
                status: "READY_IN_INVENTORY",
            },
            orderBy: {
                createdAt: "asc",
            },
            select: {
                tagId: true,
            },
        });

        // UBAH STATUS PEMINJAMAN MENJADI ALLOWED
        const allowRent = await prisma.rent.update({
            where: {
                id,
            },
            data: {
                rentApprovalStatus: "ALLOWED",
                itemTag: {
                    connect: {
                        tagId: goodsTagId.tagId,
                    },
                },
            },
            select: {
                id: true,
                startRent: true,
                finishRent: true,
                rentApprovalStatus: true,
                user: {
                    select: {
                        user_chat_id: true,
                        username: true,
                    },
                },
                good: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        });

        // UBAH STATUS TAG
        await prisma.tagId.update({
            where: { tagId: goodsTagId.tagId },
            data: {
                status: "BOOKED_BY_USER",
            },
            select: {
                tagId: true,
            },
        });

        // KIRIM PESAN TERHADAP USER
        bot.sendMessage(
            allowRent.user[0].user_chat_id,
            `Your order with the details below has been approved:\n\n📦 Goods Name: ${
                allowRent.good[0].name
            }\n\n📅 Start Rent: ${days(
                allowRent.startRent
            )}\n\n⏳ Finish Rent: ${days(
                allowRent.finishRent
            )}\n\n📔 Approval Status: ${
                allowRent.rentApprovalStatus
            }\n\n🆔 TAG ID: ${
                goodsTagId.tagId
            } \n\n ⚠️ PLEASE NOTE, YOU MUST TAKE THE SAME ITEM AS THE TAG ID SHOWS. ⚠️\n\nNow you can pick up the item on the set date. Don't forget to keep items and don't lend them back. And make sure you return the item on the date stated.`
        );

        // KIRIM FEEDBACK KE ADMIN
        bot.editMessageText(
            `You have just approved the order made by ${
                allowRent.user[0].user_chat_id
            }. Item borrowed is a ${
                allowRent.good[0].name
            }. The loan period starts from ${days(
                allowRent.startRent
            )} until ${days(allowRent.finishRent)}.`,
            opts
        );

        // LAKUKAN PENGECEKAN APAKAH ADA USER YANG MEMINJAM BARANG TETAPI STOK BARANG SUDAH HABIS, JIKA ADA KIRIMKAN PESAN

        // Hitung sluruh tag di db
        const availableTagId = await prisma.tagId.count({
            where: {
                Goods: {
                    id: allowRent.good[0].id,
                },
                status: "READY_IN_INVENTORY",
            },
        });

        if (availableTagId == 0) {
            // Cari semua user yang meminjam barang
            const autoRejectedUser = await prisma.rent.findMany({
                where: {
                    good: {
                        every: {
                            id: allowRent.good[0].id,
                        },
                    },
                    rentApprovalStatus: "WAITING",
                },
                select: {
                    id: true,
                    startRent: true,
                    finishRent: true,
                    good: {
                        select: {
                            name: true,
                        },
                    },
                    user: {
                        select: {
                            username: true,
                            user_chat_id: true,
                        },
                    },
                },
            });

            autoRejectedUser.forEach(async (user) => {
                await prisma.rent.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        rentApprovalStatus: "REJECTED",
                    },
                });
                bot.sendMessage(
                    user.user[0].user_chat_id,
                    `Sorry your order with detail bellow:\n\n🆔Order ID: ${
                        user.id
                    }\n\n📦 Goods Name: ${
                        user.good[0].name
                    }\n\n📅 Start Rent: ${days(
                        user.startRent
                    )}\n\n⏳ Finish Rent: ${days(
                        user.finishRent
                    )}\n\n📔 Approval Status: Auto Rjected by System\n\nSorry, there are no more items you can borrow. The administrator just approved another request, and unfortunately it was the last item in inventory. You will have to wait a few days for the item to be returned and you can make a new request.`
                );
            });
        }
    }

    // JIKA ADMIN MENOLAK PEMINJAMAN
    if (userActivity.startsWith("reject-order")) {
        const [_, id] = userActivity.split("#");

        // CEK APAKAH ID TELAH DIKONFIRMASI
        const approvalStatus = await prisma.rent.findUnique({
            where: {
                id,
            },
            select: {
                rentApprovalStatus: true,
            },
        });

        if (approvalStatus.rentApprovalStatus !== "WAITING") {
            bot.editMessageText(
                `User order with id ${id} already confirm`,
                opts
            );

            return;
        }

        // UBAH STATUS PEMINJAMAN MENJADI REJECTED
        const allowRent = await prisma.rent.update({
            where: {
                id,
            },
            data: {
                rentApprovalStatus: "REJECTED",
            },
            select: {
                id: true,
                startRent: true,
                finishRent: true,
                rentApprovalStatus: true,
                user: {
                    select: {
                        user_chat_id: true,
                        username: true,
                    },
                },
                good: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
            },
        });

        // KIRIM PESAN TERHADAP USER
        bot.sendMessage(
            allowRent.user[0].user_chat_id,
            `Your order with the details below has been approved:\n\n📦 Goods Name: ${
                allowRent.good[0].name
            }\n\n📅 Start Rent: ${days(
                allowRent.startRent
            )}\n\n⏳ Finish Rent: ${days(
                allowRent.finishRent
            )}\n\n Sorry your order rejected by administrator 😔. If you want to keep applying for a rent, please make another application`
        );

        // KIRIM FEEDBACK KE ADMIN
        bot.editMessageText(
            `You have just reject the order made by ${
                allowRent.user[0].user_chat_id
            }. Item borrowed is a ${
                allowRent.good[0].name
            }. The loan period starts from ${days(
                allowRent.startRent
            )} until ${days(allowRent.finishRent)}.`,
            opts
        );
    }
});

module.exports = bot;
