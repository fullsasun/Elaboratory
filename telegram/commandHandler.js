const { identifyUser } = require("../prisma/util");
const prisma = require("../prisma/client");
const bot = require("./telegramClient");
const { Keyboard } = require("../util/defaultInlineKeyboardLayout");

bot.onText(/\/start/, async (data) => {
    let text;
    let options;
    const userChatId = data.chat.id;
    const strUserChatId = String(data.chat.id);
    const userStatus = await identifyUser(data);

    // START GIVE USER ID and TRACK ACTIVITY
    if (userStatus) {
        // Take user
        const user = await prisma.user.findUnique({
            where: {
                user_chat_id: strUserChatId,
            },
        });

        options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        { text: "Detail Profil", callback_data: "profil" },
                        { text: "Fill Up Profil", callback_data: "fillprofil" },
                    ],
                    [
                        {
                            text: "Inventory List",
                            callback_data: "inventorylist",
                        },
                        { text: "Order Good", callback_data: "peminjaman" },
                    ],
                    [{ text: "My Order", callback_data: "myorder" }],
                ],
            }),
        };

        // If User Empty Recomend User To Fill Up The Profil
        if (!user) {
            text =
                "Hello, you seem to have been here before, but we still don't really know you 🙄. You can choose the Fill Up Profile menu to complete your personal data 🤜🏽🤛🏽.";
        }

        // If User Already Have Profil, over them with other menu
        if (user) {
            text = `Welcome back ${
                user?.first_name || user?.last_name || user?.username
            }, to our Inventory Telegram bot! ✨\n
            We're glad to see you back and hope that our bot has been helping you manage your inventory efficiently.\n
            As a reminder you can use the list item menu to get a list of all the items you can borrow. The My Rent menu is a list of tools that you have borrowed or are currently borrowing.`;
        }
    }

    if (!userStatus) {
        options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [
                        { text: "Detail Profil", callback_data: "profil" },
                        { text: "Fill Up Profil", callback_data: "fillprofil" },
                    ],
                    [
                        {
                            text: "Inventory List",
                            callback_data: "inventorylist",
                        },
                        { text: "Order Good", callback_data: "peminjaman" },
                    ],
                    [{ text: "My Rent Order", callback_data: "myorder" }],
                ],
            }),
        };
        text = `Welcome to our Inventory Telegram bot! We're thrilled to have you on board. Our bot is designed to help you manage your inventory and keep track of your stock levels. 
        With our easy-to-use interface and powerful features, you'll be able to manage your inventory with ease and efficiency.`;
    }

    bot.sendMessage(userChatId, text, options);
});

module.exports = bot;
