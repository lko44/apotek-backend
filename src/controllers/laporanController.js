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
        const data = await laporanService.getLaporanPenjualan();

        res.json({
            message: "Berhasil mengambil laporan penjualan",
            data
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Gagal mengambil laporan penjualan",
            error: error.message
        });
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