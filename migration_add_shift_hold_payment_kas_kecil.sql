-- ============================================================
-- SHIFT + PAYMENT + HOLD/RECALL + AUDIT LOG + KAS KECIL
-- ============================================================

-- ============================================================
-- 1. SHIFT
-- ============================================================

CREATE TABLE `shift` (
    `id_shift` INT NOT NULL AUTO_INCREMENT,
    `id_user` INT NOT NULL,
    `waktu_buka` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `waktu_tutup` DATETIME NULL,
    `modal_awal` DECIMAL(15,2) NOT NULL,
    `total_omzet` DECIMAL(15,2) NOT NULL DEFAULT 0,
    `status` ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'OPEN',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id_shift`),
    INDEX `Shift_id_user_fkey` (`id_user`),

    CONSTRAINT `Shift_id_user_fkey`
        FOREIGN KEY (`id_user`)
        REFERENCES `user` (`id_user`)
) ENGINE=InnoDB;


-- ============================================================
-- 2. TAMBAHKAN SHIFT + STATUS KE TRANSAKSI
-- ============================================================

ALTER TABLE `transaksi`
    ADD COLUMN `id_shift` INT NULL,
    ADD COLUMN `status` ENUM('DRAFT','SELESAI','DIBATALKAN')
        NOT NULL DEFAULT 'SELESAI';

CREATE INDEX `Transaksi_id_shift_fkey`
    ON `transaksi` (`id_shift`);

ALTER TABLE `transaksi`
    ADD CONSTRAINT `Transaksi_id_shift_fkey`
        FOREIGN KEY (`id_shift`)
        REFERENCES `shift` (`id_shift`);


-- ============================================================
-- 3. PEMBAYARAN
-- ============================================================

CREATE TABLE `pembayaran` (
    `id_pembayaran` INT NOT NULL AUTO_INCREMENT,
    `id_transaksi` INT NOT NULL,
    `metode_bayar` ENUM('TUNAI','QRIS','TRANSFER') NOT NULL,
    `nominal` DECIMAL(15,2) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id_pembayaran`),
    INDEX `Pembayaran_id_transaksi_fkey` (`id_transaksi`),

    CONSTRAINT `Pembayaran_id_transaksi_fkey`
        FOREIGN KEY (`id_transaksi`)
        REFERENCES `transaksi` (`id_transaksi`)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- ============================================================
-- 4. HOLD / RECALL
-- ============================================================

CREATE TABLE `hold` (
    `id_hold` INT NOT NULL AUTO_INCREMENT,
    `nama_pelanggan` VARCHAR(255) NOT NULL,
    `alasan` TEXT NULL,
    `waktu` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `id_user` INT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id_hold`),
    INDEX `Hold_id_user_fkey` (`id_user`),

    CONSTRAINT `Hold_id_user_fkey`
        FOREIGN KEY (`id_user`)
        REFERENCES `user` (`id_user`)
) ENGINE=InnoDB;


CREATE TABLE `hold_item` (
    `id_hold_item` INT NOT NULL AUTO_INCREMENT,
    `id_hold` INT NOT NULL,
    `id_produk` INT NOT NULL,
    `qty` INT NOT NULL,
    `harga_jual` DECIMAL(15,2) NOT NULL,

    PRIMARY KEY (`id_hold_item`),
    INDEX `HoldItem_id_hold_fkey` (`id_hold`),
    INDEX `HoldItem_id_produk_fkey` (`id_produk`),

    CONSTRAINT `HoldItem_id_hold_fkey`
        FOREIGN KEY (`id_hold`)
        REFERENCES `hold` (`id_hold`)
        ON DELETE CASCADE,

    CONSTRAINT `HoldItem_id_produk_fkey`
        FOREIGN KEY (`id_produk`)
        REFERENCES `produk` (`id_produk`)
) ENGINE=InnoDB;


-- ============================================================
-- 5. AUDIT LOG
-- ============================================================

CREATE TABLE `audit_log` (
    `id_audit` INT NOT NULL AUTO_INCREMENT,
    `id_user` INT NULL,
    `aksi` VARCHAR(100) NOT NULL,
    `tabel` VARCHAR(100) NULL,
    `id_data` INT NULL,
    `detail` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id_audit`),
    INDEX `AuditLog_id_user_fkey` (`id_user`),

    CONSTRAINT `AuditLog_id_user_fkey`
        FOREIGN KEY (`id_user`)
        REFERENCES `user` (`id_user`)
) ENGINE=InnoDB;


-- ============================================================
-- 6. KAS KECIL
-- ============================================================

CREATE TABLE `kas_kecil` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `id_shift` INT NOT NULL,
    `id_user` INT NOT NULL,
    `tipe` ENUM('masuk','keluar') NOT NULL,
    `nominal` DECIMAL(15,2) NOT NULL,
    `keterangan` TEXT NULL,
    `waktu_transaksi` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `KasKecil_id_shift_fkey` (`id_shift`),
    INDEX `KasKecil_id_user_fkey` (`id_user`),

    CONSTRAINT `KasKecil_id_shift_fkey`
        FOREIGN KEY (`id_shift`)
        REFERENCES `shift` (`id_shift`),

    CONSTRAINT `KasKecil_id_user_fkey`
        FOREIGN KEY (`id_user`)
        REFERENCES `user` (`id_user`)
) ENGINE=InnoDB;