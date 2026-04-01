const express = require("express");
const helmet = require("helmet");
const cors = require("cors");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const produkRoutes = require("./src/routes/produkRoutes");
const kategoriRoutes = require("./src/routes/kategoriRoutes");
const supplierRoutes = require("./src/routes/supplierRoutes");
const pembelianRoutes = require("./src/routes/pembelianRoutes");
const transaksiRoutes = require("./src/routes/transaksiRoutes");
const batchRoutes = require("./src/routes/batchRoutes");

// Swagger everyday
const setupSwagger = require("./src/swagger");

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = "/api/v1";


// =====================
// MIDDLEWARE
// =====================
app.use(cors());
app.use(express.json());


// =====================
// ROOT ENDPOINT
// =====================
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Apotek API System V1 is Online",
    docs: "/api-docs"
  });
});

app.get(`${API_PREFIX}`, (req, res) => {
  res.json({
    message: "Welcome to Apotek API V1",
    version: "1.0.0"
  });
});


// =====================
// ROUTES
// =====================
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/produk`, produkRoutes);
app.use(`${API_PREFIX}/kategori`, kategoriRoutes);
app.use(`${API_PREFIX}/supplier`, supplierRoutes);
app.use(`${API_PREFIX}/pembelian`, pembelianRoutes);
app.use(`${API_PREFIX}/transaksi`, transaksiRoutes);
app.use(`${API_PREFIX}/batch`, batchRoutes);


// =====================
// SWAGGER SETUP
// =====================
setupSwagger(app);


// =====================
// SERVER
// =====================
app.listen(PORT, () => {
  console.log(`
✅ Server Aktif!
🚀 API URL     : http://localhost:${PORT}${API_PREFIX}
📖 Swagger Docs: http://localhost:${PORT}/api-docs
  `);
});