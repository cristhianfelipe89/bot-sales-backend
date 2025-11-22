// src/routes/product.routes.js
import express from "express";
import {
    listProducts,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct,
    getProductMetrics
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/metrics", authMiddleware, adminOnly, getProductMetrics);
router.get("/:id", getProductById);

router.post("/", authMiddleware, adminOnly, createProduct);
router.put("/:id", authMiddleware, adminOnly, updateProduct);
router.delete("/:id", authMiddleware, adminOnly, deleteProduct);

export default router;