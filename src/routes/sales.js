import express from "express";
import { createSale, getSales, getMetrics } from "../controllers/salesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, async (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden" });
    next();
}, getSales);

router.post("/", createSale); // called by n8n/bot (no auth needed if using secret; you can add header token check)
router.get("/metrics", authMiddleware, async (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden" });
    next();
}, getMetrics);

export default router;
