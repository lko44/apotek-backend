-- AlterTable
ALTER TABLE `transaksi` ADD COLUMN `id_shift` INTEGER NULL;

-- CreateTable
CREATE TABLE `pembayaran` (
    `id_pembayaran` INTEGER NOT NULL AUTO_INCREMENT,
    `id_transaksi` INTEGER NOT NULL,
    `jenis` ENUM('TUNAI', 'QRIS', 'TRANSFER') NOT NULL,
    `nominal` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Pembayaran_id_transaksi_fkey`(`id_transaksi`),
    PRIMARY KEY (`id_pembayaran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shift` (
    `id_shift` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `status` ENUM('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `modal_awal` DECIMAL(15, 2) NOT NULL,
    `modal_akhir` DECIMAL(15, 2) NULL,
    `waktu_buka` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `waktu_tutup` DATETIME(3) NULL,

    INDEX `Shift_id_user_fkey`(`id_user`),
    PRIMARY KEY (`id_shift`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hold` (
    `id_hold` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_pelanggan` VARCHAR(191) NOT NULL,
    `alasan` TEXT NULL,
    `status` ENUM('HELD', 'RECALLED', 'CANCELLED') NOT NULL DEFAULT 'HELD',
    `id_user` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Hold_id_user_fkey`(`id_user`),
    PRIMARY KEY (`id_hold`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hold_item` (
    `id_hold_item` INTEGER NOT NULL AUTO_INCREMENT,
    `id_hold` INTEGER NOT NULL,
    `id_produk` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `harga_jual` DECIMAL(15, 2) NOT NULL,

    INDEX `HoldItem_id_hold_fkey`(`id_hold`),
    INDEX `HoldItem_id_produk_fkey`(`id_produk`),
    PRIMARY KEY (`id_hold_item`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Transaksi_id_shift_fkey` ON `transaksi`(`id_shift`);

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `Pembayaran_id_transaksi_fkey` FOREIGN KEY (`id_transaksi`) REFERENCES `transaksi`(`id_transaksi`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `Transaksi_id_shift_fkey` FOREIGN KEY (`id_shift`) REFERENCES `shift`(`id_shift`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `shift` ADD CONSTRAINT `Shift_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hold` ADD CONSTRAINT `Hold_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hold_item` ADD CONSTRAINT `HoldItem_id_hold_fkey` FOREIGN KEY (`id_hold`) REFERENCES `hold`(`id_hold`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hold_item` ADD CONSTRAINT `HoldItem_id_produk_fkey` FOREIGN KEY (`id_produk`) REFERENCES `produk`(`id_produk`) ON DELETE RESTRICT ON UPDATE CASCADE;

