// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./src/config/db.js";

dotenv.config();

process.env.TZ = process.env.TZ || 'America/Bogota';

await connectDB();

import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";
import productRoutes from "./src/routes/product.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";
import saleRoutes from "./src/routes/sale.routes.js";
import cartRoutes from "./src/routes/cart.routes.js";
import convoRoutes from "./src/routes/conversation.routes.js";
import chatbotRoutes from "./src/routes/chatbot.routes.js";

const app = express();

app.use(helmet());

// 🟦  CORS PROFESIONAL — múltiples dominios desde el .env
const allowedOrigins = process.env.FRONTEND_URLS
    ? process.env.FRONTEND_URLS.split(",").map(origin => origin.trim())
    : [];

console.log("🌐 Allowed Origins:", allowedOrigins);

app.use(
    cors({
        origin: (origin, callback) => {
            // Permitir requests sin origen (Postman, cron, servidores)
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                console.warn("❌ CORS bloqueado para origen:", origin);
                return callback(new Error("Not allowed by CORS"), false);
            }
        },
        credentials: true,
    })
);

app.use(express.json());
app.use(morgan("dev"));

app.use((req, res, next) => {
    req.requestSource = req.headers["x-request-source"] || req.body?.source || "web";
    next();
});

// rate limit auth
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use("/api/auth", authLimiter);

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/conversations", convoRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.get("/", (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
    console.error("🔥 Error no manejado:", err.message);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
