const prisma = require("./prisma");

exports.logAksi = async (id_user, aksi, deskripsi) => {
    try {
        await prisma.audit_log.create({
            data: { id_user, aksi, deskripsi }
        });
    } catch (error) {
        // A logging failure should never break the actual action it's logging.
        console.error("AUDIT_LOG_ERROR:", error);
    }
};