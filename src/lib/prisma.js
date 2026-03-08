const { PrismaClient } = require('@prisma/client');

// Jangan tambahkan parameter apa pun di dalam PrismaClient()
const prisma = new PrismaClient();

console.log("✅ Database Apotek Siap Digunakan!");

module.exports = prisma;