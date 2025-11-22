// src/routes/sale.routes.js
import express from "express";
import { createSale, getSales, getMetrics } from "../controllers/sale.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.post("/", createSale); // called by bot/n8n (protect with x-api-secret at router-level if desired)
router.get("/", authMiddleware, adminOnly, getSales);
router.get("/metrics", authMiddleware, adminOnly, getMetrics);

export default router;

