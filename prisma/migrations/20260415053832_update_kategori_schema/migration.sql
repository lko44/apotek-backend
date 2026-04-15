/*
  Warnings:

  - You are about to alter the column `harga_jual` on the `produk` table. The data in that column could be lost. The data in that column will be cast from `Decimal(15,2)` to `Decimal(65,30)`.
  - A unique constraint covering the columns `[nama_kategori]` on the table `Kategori` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `kategori` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `produk` MODIFY `harga_jual` DECIMAL(65, 30) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Kategori_nama_kategori_key` ON `Kategori`(`nama_kategori`);
