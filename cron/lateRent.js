const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getAllRent() {
    try {
        const rent = await prisma.rent.findMany({
            include: {
                itemTag: true,
                user: true,
                good: true,
            },
        });
        return rent;
    } catch (error) {
        console.error("Error retrieving peminjaman:", error);
        throw error;
    }
}

async function checkRentExpired() {
    const allRent = await getAllRent();

    const currentTime = new Date();

    allRent.forEach((rent) => {
        const finishRent = new Date(rent.finishRent);

        if (currentTime > finishRent) {
            console.log(
                `Peminjaman ID ${rent.id} sudah melewati waktu pengembalian.`
            );
            // Additional logic to handle late returns can be added here
        } else {
            console.log(
                `Peminjaman ID ${rent.id} masih dalam waktu peminjaman.`
            );
        }
    });
}

module.exports = {
    checkRentExpired,
};
