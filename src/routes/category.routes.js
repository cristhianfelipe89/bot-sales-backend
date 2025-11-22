// src/routes/category.routes.js
import express from "express";
import { listCategories, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/", listCategories);
router.post("/", authMiddleware, adminOnly, createCategory);
router.put("/:id", authMiddleware, adminOnly, updateCategory);
router.delete("/:id", authMiddleware, adminOnly, deleteCategory);

export default router;
