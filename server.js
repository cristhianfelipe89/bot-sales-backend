import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./src/config/db.js";

// Load env variables at the top
dotenv.config();

// Connect Database
await connectDB();

import authRoutes from "./src/routes/auth.js";
import userRoutes from "./src/routes/users.js";
import productRoutes from "./src/routes/products.js";
import salesRoutes from "./src/routes/sales.js";
import cartRoutes from "./src/routes/cart.js";
import conversationRoutes from "./src/routes/conversations.js";

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ 
    origin: process.env.FRONTEND_URL || "*",
    credentials: true 
}));
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/conversations", conversationRoutes);

// Default Route
app.get("/", (req, res) => res.json({ ok: true }));

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ message: "Internal server error" });
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
