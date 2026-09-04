const laporanService = require("./services/laporanService");

exports.getProdukTerlaris = async (req, res) => {
    try {
        const data = await laporanService.getProdukTerlaris();

        res.json({
            message: "Berhasil mengambil produk terlaris",
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil produk terlaris",
            error: error.message
        });
    }
};

exports.getLaporanPenjualan = async (req, res) => {
    try {
        const { tanggal } = req.query;

        if (tanggal && !/^\d{4}-\d{2}-\d{2}$/.test(tanggal)) {
            return res.status(400).json({ message: "Format tanggal harus YYYY-MM-DD" });
        }

        const data = await laporanService.getLaporanPenjualan(tanggal);

        res.json({
            message: tanggal
                ? `Berhasil mengambil laporan penjualan tanggal ${tanggal}`
                : "Berhasil mengambil laporan penjualan",
            data
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal mengambil laporan penjualan", error: error.message });
    }
};

exports.getProdukTidakLaku = async (req, res) => {
    try {
        const hari = Math.max(parseInt(req.query.hari) || 30, 1);
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 10, 1);

        const result = await laporanService.getProdukTidakLaku(
            hari,
            page,
            limit
        );

        res.json({
            message: `Berhasil mengambil produk yang tidak laku ${hari} hari terakhir`,
            ...result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil laporan produk tidak laku",
            error: error.message
        });
    }
};

exports.getKinerjaKasir = async (req, res) => {
    try {
        const data = await laporanService.getKinerjaKasir();
        res.json({ message: "Berhasil mengambil data kinerja kasir", data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Gagal mengambil data kinerja kasir", error: error.message });
    }
};

exports.getAuditLog = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.max(parseInt(req.query.limit) || 20, 1);

        const result = await laporanService.getAuditLog(page, limit);

        res.json({
            message: "Berhasil mengambil audit log",
            ...result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil audit log",
            error: error.message
        });
    }
};