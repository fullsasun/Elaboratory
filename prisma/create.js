const prisma = require("./client");

async function main() {
    const args = process.argv;
    const table = args.slice(2)[0];

    switch (table.toUpperCase()) {
        case "ROLE":
            console.log(" [i]: CREATING ROLE");
            const roleName = args.slice(2)[1];
            try {
                const data = await prisma.role.create({
                    data: {
                        name: roleName,
                    },
                });
                console.log(` [i]: Success create data`);
            } catch (error) {
                console.log(` [x]: Failed to create data ${error}`);
            }
            break;

        case "SUPERADMIN":
            console.log(" [i]: CREATING SUPER ADMIN");
            try {
                console.log(` [i]: Success create data`);
            } catch (error) {
                console.log(` [x]: Failed to create data ${error}`);
            }
            break;

        default:
            console.log("COMMAND NOT FOUND");
            break;
    }
}

main()
    .catch((e) => {
        process.exit(1);
    })
    .finally(() => {
        prisma.$disconnect();
    });
