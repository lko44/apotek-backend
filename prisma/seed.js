const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("kasir123", 10);

  const kasir = await prisma.user.upsert({
    where: { username: "kasir" }, // 🔥 HARUS SAMA
    update: {},
    create: {
      nama: "Kasir Utama",
      username: "kasir",
      email: "kasir@apotek.com",
      password_hash: password,
      role: "KASIR",
      is_active: true
    }
  });

  console.log("✅ kasir berhasil disiapkan:", kasir.username);
}

main()
  .catch((e) => {
    console.error("❌ Gagal membuat kasir:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });