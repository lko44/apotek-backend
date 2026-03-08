-- CreateTable
CREATE TABLE `Kategori` (
    `id_kategori` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kategori` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Produk` (
    `id_produk` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_produk` VARCHAR(191) NOT NULL,
    `barcode` VARCHAR(191) NOT NULL,
    `id_kategori` INTEGER NOT NULL,
    `satuan` VARCHAR(191) NOT NULL,
    `stok_minimum` INTEGER NOT NULL,
    `harga_jual` DECIMAL(15, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Produk_barcode_key`(`barcode`),
    PRIMARY KEY (`id_produk`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'STAFF', 'KASIR') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Supplier` (
    `id_supplier` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_supplier` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `telepon` VARCHAR(191) NULL,
    `alamat` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_supplier`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Pembelian` (
    `id_pembelian` INTEGER NOT NULL AUTO_INCREMENT,
    `no_faktur` VARCHAR(191) NOT NULL,
    `tanggal_faktur` DATETIME(3) NOT NULL,
    `tanggal_jatuh_tempo` DATETIME(3) NULL,
    `status` ENUM('LUNAS', 'BELUM_DIBAYAR', 'DIKEMBALIKAN') NOT NULL,
    `total` DECIMAL(15, 2) NOT NULL,
    `id_supplier` INTEGER NOT NULL,
    `id_user` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Pembelian_no_faktur_key`(`no_faktur`),
    PRIMARY KEY (`id_pembelian`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PembelianDetail` (
    `id_pembelian_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pembelian` INTEGER NOT NULL,
    `id_produk` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `harga_beli` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id_pembelian_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BatchProduk` (
    `id_batch` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produk` INTEGER NOT NULL,
    `id_pembelian` INTEGER NOT NULL,
    `expired_date` DATETIME(3) NOT NULL,
    `qty_masuk` INTEGER NOT NULL,
    `qty_sisa` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_batch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaksi` (
    `id_transaksi` INTEGER NOT NULL AUTO_INCREMENT,
    `no_transaksi` VARCHAR(191) NOT NULL,
    `tanggal_transaksi` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `metode_bayar` ENUM('TUNAI', 'QRIS', 'TRANSFER') NOT NULL,
    `total` DECIMAL(15, 2) NOT NULL,
    `id_user` INTEGER NOT NULL,

    UNIQUE INDEX `Transaksi_no_transaksi_key`(`no_transaksi`),
    PRIMARY KEY (`id_transaksi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransaksiDetail` (
    `id_transaksi_detail` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `id_produk` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `harga_jual` DECIMAL(15, 2) NOT NULL,
    `subtotal` DECIMAL(15, 2) NOT NULL,

    PRIMARY KEY (`id_transaksi_detail`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransaksiBatch` (
    `id_transaksi_batch` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi_detail` INTEGER NOT NULL,
    `id_batch` INTEGER NOT NULL,
    `qty_keluar` INTEGER NOT NULL,

    PRIMARY KEY (`id_transaksi_batch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogStok` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `id_produk` INTEGER NOT NULL,
    `tipe` ENUM('MASUK', 'KELUAR', 'KOREKSI') NOT NULL,
    `qty` INTEGER NOT NULL,
    `sumber` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Produk` ADD CONSTRAINT `Produk_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `Kategori`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembelian` ADD CONSTRAINT `Pembelian_id_supplier_fkey` FOREIGN KEY (`id_supplier`) REFERENCES `Supplier`(`id_supplier`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Pembelian` ADD CONSTRAINT `Pembelian_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PembelianDetail` ADD CONSTRAINT `PembelianDetail_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `Pembelian`(`id_pembelian`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PembelianDetail` ADD CONSTRAINT `PembelianDetail_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `Produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchProduk` ADD CONSTRAINT `BatchProduk_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `Produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BatchProduk` ADD CONSTRAINT `BatchProduk_id_pembelian_fkey` FOREIGN KEY (`id_pembelian`) REFERENCES `Pembelian`(`id_pembelian`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaksi` ADD CONSTRAINT `Transaksi_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransaksiDetail` ADD CONSTRAINT `TransaksiDetail_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `Transaksi`(`id_transaksi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransaksiDetail` ADD CONSTRAINT `TransaksiDetail_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `Produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransaksiBatch` ADD CONSTRAINT `TransaksiBatch_id_transaksi_detail_fkey` FOREIGN KEY (`id_transaksi_detail`) REFERENCES `TransaksiDetail`(`id_transaksi_detail`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransaksiBatch` ADD CONSTRAINT `TransaksiBatch_id_batch_fkey` FOREIGN KEY (`id_batch`) REFERENCES `BatchProduk`(`id_batch`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogStok` ADD CONSTRAINT `LogStok_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `Produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;
