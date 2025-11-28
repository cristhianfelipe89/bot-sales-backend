// src/routes/sale.routes.js
import express from "express";
import { createSale, getSales, getMetrics } from "../controllers/sale.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

// CAMBIO: ahora el endpoint tiene nombre explícito
router.post("/ventas", createSale); 
router.get("/", authMiddleware, adminOnly, getSales);
router.get("/metrics", authMiddleware, adminOnly, getMetrics);

export default router;

