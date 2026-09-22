-- Tambah kolom baru ke tabel pembelian
ALTER TABLE `pembelian` 
  ADD COLUMN `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `nilai_ppn` INT NOT NULL DEFAULT 11,
  ADD COLUMN `jenis_ppn` VARCHAR(20) NOT NULL DEFAULT 'tambah_ppn',
  ADD COLUMN `cashback` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `jenis_pembayaran` VARCHAR(20) NOT NULL DEFAULT 'Tunai',
  ADD COLUMN `akun_kas` VARCHAR(50) NULL,
  ADD COLUMN `no_surat_pesanan` VARCHAR(100) NULL,
  ADD COLUMN `catatan` TEXT NULL;

-- Tambah kolom baru ke tabel pembeliandetail
ALTER TABLE `pembeliandetail` 
  ADD COLUMN `diskon` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  ADD COLUMN `diskon_tipe` VARCHAR(5) NOT NULL DEFAULT '%',
  ADD COLUMN `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0.00;

-- Tambah kolom baru ke tabel batchproduk
ALTER TABLE `batchproduk`
  ADD COLUMN `id_pembelian_detail` INT NULL,
  ADD COLUMN `no_batch` VARCHAR(100) NULL;