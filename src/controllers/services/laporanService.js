const prisma = require("../../lib/prisma");

exports.getProdukTerlaris = async () => {
    const result = await prisma.$queryRaw`
        SELECT
            p.id_produk,
            p.nama_produk,
            k.nama_kategori AS kategori,
            SUM(td.qty) AS total_terjual,
            SUM(td.subtotal) AS total_omzet

        FROM transaksidetail td

        INNER JOIN transaksi t
            ON t.id_transaksi = td.id_transaksi

        INNER JOIN produk p
            ON p.id_produk = td.id_produk

        INNER JOIN kategori k
            ON k.id_kategori = p.id_kategori

        WHERE t.status = 'SELESAI'

        GROUP BY
            p.id_produk,
            p.nama_produk,
            k.nama_kategori

        ORDER BY total_terjual DESC;
    `;

    return result.map(item => ({
        ...item,
        total_terjual: Number(item.total_terjual),
        total_omzet: Number(item.total_omzet)
    }));
};

exports.getLaporanPenjualan = async (tanggal) => {
    const filterTanggal = tanggal
        ? Prisma.sql`AND DATE(t.tanggal_transaksi) = ${tanggal}`
        : Prisma.sql``;

    const result = await prisma.$queryRaw`
        SELECT
            t.tanggal_transaksi AS tanggal,
            t.no_transaksi AS no_faktur,
            SUM(td.qty) AS item_terjual,
            t.total,
            t.metode_bayar AS metode,
            'Sukses' AS status

        FROM transaksi t

        INNER JOIN transaksidetail td
            ON td.id_transaksi = t.id_transaksi

        WHERE t.status = 'SELESAI'
        ${filterTanggal}

        GROUP BY
            t.id_transaksi,
            t.tanggal_transaksi,
            t.no_transaksi,
            t.total,
            t.metode_bayar

        ORDER BY t.tanggal_transaksi DESC;
    `;

    return result.map(item => ({
        ...item,
        item_terjual: Number(item.item_terjual),
        total: Number(item.total)
    }));
};

exports.getProdukTidakLaku = async (hari, page, limit) => {
    const skip = (page - 1) * limit;

    // Hanya menghitung produk yang PERNAH memiliki stok
    // dan tidak memiliki transaksi penjualan dalam X hari terakhir.
    const totalResult = await prisma.$queryRaw`
        SELECT COUNT(*) AS total
        FROM produk p
        WHERE EXISTS (
            SELECT 1
            FROM batchproduk bp
            WHERE bp.id_produk = p.id_produk
        )
        AND NOT EXISTS (
            SELECT 1
            FROM transaksidetail td
            INNER JOIN transaksi t
                ON t.id_transaksi = td.id_transaksi
            WHERE td.id_produk = p.id_produk
              AND t.status = 'SELESAI'
              AND t.tanggal_transaksi >= DATE_SUB(NOW(), INTERVAL ${hari} DAY)
        );
    `;

    const total = Number(totalResult[0].total);

    const data = await prisma.$queryRaw`
        SELECT
            p.id_produk,
            p.nama_produk,
            k.nama_kategori,

            COALESCE(SUM(bp.qty_sisa), 0) AS stok,

            MAX(
                CASE
                    WHEN t.status = 'SELESAI'
                    THEN t.tanggal_transaksi
                    ELSE NULL
                END
            ) AS terakhir_terjual,

            DATEDIFF(
                NOW(),
                MAX(
                    CASE
                        WHEN t.status = 'SELESAI'
                        THEN t.tanggal_transaksi
                        ELSE NULL
                    END
                )
            ) AS durasi_tidak_laku

        FROM produk p

        INNER JOIN kategori k
            ON k.id_kategori = p.id_kategori

        INNER JOIN batchproduk bp
            ON bp.id_produk = p.id_produk

        LEFT JOIN transaksidetail td
            ON td.id_produk = p.id_produk

        LEFT JOIN transaksi t
            ON t.id_transaksi = td.id_transaksi
            AND t.status = 'SELESAI'

        GROUP BY
            p.id_produk,
            p.nama_produk,
            k.nama_kategori

        HAVING
            MAX(
                CASE
                    WHEN t.status = 'SELESAI'
                    THEN t.tanggal_transaksi
                    ELSE NULL
                END
            ) IS NULL

            OR

            MAX(
                CASE
                    WHEN t.status = 'SELESAI'
                    THEN t.tanggal_transaksi
                    ELSE NULL
                END
            ) < DATE_SUB(NOW(), INTERVAL ${hari} DAY)

        ORDER BY
            p.nama_produk ASC

        LIMIT ${limit}
        OFFSET ${skip};
    `;

    return {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: data.map(item => ({
            ...item,
            stok: Number(item.stok),
            durasi_tidak_laku:
                item.durasi_tidak_laku === null
                    ? null
                    : Number(item.durasi_tidak_laku)
        }))
    };
};

exports.getKinerjaKasir = async () => {
    const result = await prisma.$queryRaw`
        SELECT
            u.id_user,
            u.nama AS nama_kasir,
            s.id_shift,
            s.waktu_buka,
            s.waktu_tutup,
            s.status AS status_shift,
            COUNT(t.id_transaksi) AS jumlah_transaksi,
            COALESCE(SUM(t.total), 0) AS total_omzet

        FROM shift s

        INNER JOIN user u
            ON u.id_user = s.id_user

        LEFT JOIN transaksi t
            ON t.id_shift = s.id_shift
            AND t.status = 'SELESAI'

        GROUP BY
            s.id_shift, u.id_user, u.nama, s.waktu_buka, s.waktu_tutup, s.status

        ORDER BY s.waktu_buka DESC;
    `;

    return result.map(item => ({
        ...item,
        jumlah_transaksi: Number(item.jumlah_transaksi),
        total_omzet: Number(item.total_omzet)
    }));
};