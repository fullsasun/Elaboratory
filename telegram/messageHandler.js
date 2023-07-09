const prisma = require("../prisma/client");
const { getUserActivity, setUserActivity } = require("../prisma/util");
const bot = require("./telegramClient");

bot.on("message", async (data) => {
    console.log("---------------- ⬇NEW MESSAGE⬇ ----------------");
    console.log(data);

    // IGNORE COMMAND
    if (
        data?.entities &&
        data?.entities.length > 0 &&
        data?.entities[0]?.type === "bot_command"
    ) {
        return;
    }

    /**
     * Fungsi ini digunakan untuk menangani pesan yang dikirim oleh user. Cara kerjanya, ketika user mengirim pesan tanpa command
     * Sistem akan melihat aktifitas terakhir user di databse.
     * Fungsi yang akan dijalankan akan sesuai dengan aktifitas terakhir user yang tercatat.
     * EX: User memilih mendafatarkan perangkatnya, pada database aktivitas user akan dicatat sebagai REGISTER_DEVICE
     * ketika bot menerima pesan tanpa konteks, bot akan menjalankan fungsi untuk menyimpan device user ke database dan menautkan nya kepada user
     */

    // JIKA USER MENGIRIM PESAN TANPA KONTEKS, PERIKAS AKTIVITAS TERKINI YANG DILAKUKAN USER
    const userActivity = await getUserActivity(data);
    const userChatId = data.chat.id;
    const strUserChatId = String(data.chat.id);
    const userMessage = data.text;
    const opts = {
        chat_id: userChatId,
        message_id: strUserChatId,
    };

    // JIKA AKTIVITAS TERAKHIR USER ADALAH "FILL_UP_PROFIL" MAKA LAKUKAN FUNGSI DIBAWAH
    if (userActivity === "FILL_UP_PROFIL") {
        const nim = data.text;
        if (nim === null) {
            bot.sendMessage("Please give us the correct NIM", opts);
        }

        if (nim) {
            try {
                // CEK APAKAH NIM SUDAH DIGUNAKAN
                const nimIsExist = await prisma.user.findUnique({
                    where: { nim },
                });
                if (nimIsExist) {
                    bot.sendMessage(
                        data.chat.id,
                        "Sorry this NIM/NIP already register",
                        opts
                    );
                    return;
                }
                await prisma.user.create({
                    data: {
                        username:
                            data.from?.username ||
                            `notidentify-${data.chat.id}`,
                        last_name: data.from?.last_name,
                        first_name: data.from?.first_name,
                        user_chat_id: String(data.chat.id),
                        nim: nim,
                        Role: {
                            connect: {
                                name: "USER",
                            },
                        },
                    },
                });
                setUserActivity(data, "FINISH_FILL_UP_PROFIL");
                bot.sendMessage(
                    data.chat.id,
                    "Yeayy 😎, We are already save your data 📝",
                    opts
                );
            } catch (error) {
                console.log(error);
            }
        }
    }

    // JIKA AKTIVITAS USER BERKAITAN ORDER BARANG
    if (userActivity?.startsWith("ORDER")) {
        // JIKA USER BARU MEMULAI ORDER
        if (userActivity === "ORDER") {
            console.log("USER STARTING ORDER");
        }
    }
});

module.exports = bot;
