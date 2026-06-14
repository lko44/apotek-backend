const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const suppliers = [
    { nama_supplier: "PT Kimia Farma Tbk", email: "info@kimiafarma.co.id", telepon: "0213847709", alamat: "Jl. Veteran No. 9, Jakarta Pusat" },
    { nama_supplier: "PT Kalbe Farma Tbk", email: "contact@kalbe.co.id", telepon: "0214287388", alamat: "Kawasan Industri Delta Silicon, Cikarang" },
    { nama_supplier: "PT Sanbe Farma", email: "sales@sanbe-farma.com", telepon: "0226034115", alamat: "Jl. Industri Cimareme No. 8, Bandung" },
    { nama_supplier: "PT Dexa Medica", email: "corporate@dexa-medica.com", telepon: "0217456383", alamat: "Titan Center, Bintaro Jaya Sektor 7" },
    { nama_supplier: "PT Pharos Indonesia", email: "pharos@pharos.co.id", telepon: "0217200981", alamat: "Jl. Limo No. 40, Permata Hijau, Jakarta" },
    { nama_supplier: "PT Tempo Scan Pacific Tbk", email: "corsec@temposcan.com", telepon: "0212921888", alamat: "Tempo Scan Tower, Kuningan, Jakarta" },
    { nama_supplier: "PT Darya-Varia Laboratoria", email: "info@darya-varia.com", telepon: "0215203415", alamat: "South Quarter Tower C, Jakarta Selatan" },
    { nama_supplier: "PT Interbat", email: "support@interbat.co.id", telepon: "0318914201", alamat: "Jl. HR Muhammad, Surabaya" },
    { nama_supplier: "PT Konimex", email: "konimex@konimex.com", telepon: "0271716246", alamat: "Desa Sanggrahan, Sukoharjo, Jawa Tengah" },
    { nama_supplier: "PT Bio Farma (Persero)", email: "mail@biofarma.co.id", telepon: "0222033755", alamat: "Jl. Pasteur No. 28, Bandung" },
    { nama_supplier: "PT Dankos Farma", email: "dankos@kalbe.co.id", telepon: "0214600158", alamat: "Kawasan Industri Pulogadung, Jakarta Timur" },
    { nama_supplier: "PT Combiphar", email: "care@combiphar.com", telepon: "0215701835", alamat: "Office 8 Lantai 26, Sudirman, Jakarta" },
    { nama_supplier: "PT Bernofarm", email: "bernofarm@bernofarm.com", telepon: "0318961730", alamat: "Jl. Tjhampel No. 18, Sidoarjo" },
    { nama_supplier: "PT Soho Industri Pharmasi", email: "corporate@soho.co.id", telepon: "0214605550", alamat: "Jl. Pulogadung No. 6, Jakarta Timur" },
    { nama_supplier: "PT Mahakam Beta Farma", email: "info@mahakam_beta.com", telepon: "0218711311", alamat: "Jl. Pulo Kambing II, Pulogadung" },
    { nama_supplier: "PT Ferron Par Pharmaceuticals", email: "ferron@ferron-pharma.com", telepon: "0217456345", alamat: "Jababeka Industrial Estate, Cikarang" },
    { nama_supplier: "PT Novartis Indonesia", email: "novartis.indo@novartis.com", telepon: "02152912900", alamat: "Avania Building, Gatot Subroto, Jakarta" },
    { nama_supplier: "PT Bayer Indonesia", email: "bayer.indonesia@bayer.com", telepon: "02130491111", alamat: "Menara Astra, Jl. Jend. Sudirman" },
    { nama_supplier: "PT Pfizer Indonesia", email: "pfizerindo@pfizer.com", telepon: "0218711077", alamat: "Jl. Raya Bogor Km 28, Pekayon, Jakarta" },
    { nama_supplier: "PT Merck Tbk", email: "merck@merckgroup.com", telepon: "0212528888", alamat: "Jl. T.B. Simatupang No. 8, Pasar Rebo" }
  ];

  console.log("Sedang memasukkan 20 data supplier...");
  // createMany hanya didukung jika databasemu bukan SQLite asli tanpa ekstensi, aman pakai loop
  for (const s of suppliers) {
    await prisma.supplier.create({ data: s });
  }
  console.log("Selesai! 20 Supplier berhasil masuk.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());