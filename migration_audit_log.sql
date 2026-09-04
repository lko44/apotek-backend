CREATE TABLE `audit_log` (
    `id_log` INTEGER NOT NULL AUTO_INCREMENT,
    `id_user` INTEGER NOT NULL,
    `aksi` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_id_user_fkey`(`id_user`),
    PRIMARY KEY (`id_log`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `audit_log`
ADD CONSTRAINT `AuditLog_id_user_fkey`
FOREIGN KEY (`id_user`) REFERENCES `user`(`id_user`)
ON DELETE RESTRICT ON UPDATE CASCADE;