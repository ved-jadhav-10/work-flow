const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const authRoutes = require("./routes/auth");
const contactRoutes = require("./routes/contact");
const pricingRoutes = require("./routes/pricing");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/pricing", pricingRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Cognify AI Server is running 🚀" });
});

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Cognify AI Server running on http://localhost:${PORT}`);
});
