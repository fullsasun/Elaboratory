const prisma = require("./client");

async function identifyUser(msg) {
    try {
        // GET USER CHAT FROM USER ACTIVITY DB
        const user = await prisma.userActivity.findUnique({
            where: {
                user_chat_id: String(msg.chat.id),
            },
        });

        console.log(user);
        // JIKA SUDAH TERDAPAT USER, MAKA STATUS MENJADI WELCOME_BACK
        if (user) {
            await prisma.userActivity.update({
                where: {
                    user_chat_id: String(msg.chat.id),
                },
                data: {
                    activity: "WELCOME_BACK",
                },
            });
            return true;
        }

        // JIKA TIDAK TERDAPAT USER, MAKA STATUS MENJADI WELCOME NEW USER
        if (!user) {
            await prisma.userActivity.create({
                data: {
                    user_chat_id: String(msg.chat.id),
                    activity: "WELCOME_NEW_USER",
                },
            });
            return false;
        }
    } catch (error) {
        console.log(error);
    }
}

async function setUserActivity(msg, activity) {
    await prisma.userActivity.update({
        where: {
            user_chat_id: String(msg.chat.id),
        },
        data: {
            activity: String(activity),
        },
    });
}

async function getUserActivity(msg) {
    const data = await prisma.userActivity.findUnique({
        where: {
            user_chat_id: String(msg.chat.id),
        },
    });

    return data?.activity;
}

async function isUserExist(msg) {
    try {
        // GET USER CHAT FROM USER ACTIVITY DB
        const user = await prisma.user.findUnique({
            where: {
                user_chat_id: String(msg.chat.id),
            },
        });

        console.log(user);
        // JIKA SUDAH TERDAPAT USER, MAKA RETURN TRUE
        if (user) {
            return true;
        }

        // JIKA TIDAK TERDAPAT USER, MAKA RETURN FALSE
        if (!user) {
            return false;
        }
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    identifyUser,
    setUserActivity,
    getUserActivity,
    isUserExist,
};
