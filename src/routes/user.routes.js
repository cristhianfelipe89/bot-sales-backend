// src/routes/users.js
import express from "express";
import {
    listUsers,
    createUser,
    getUserById,
    updateUser,
    changeStatus,
    deleteUser,
    getUserStats,
    getUserProfile,
    getUserSales,
    getUserLogs
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, adminOnly, listUsers);
router.post("/", authMiddleware, adminOnly, createUser);
router.get("/stats", authMiddleware, adminOnly, getUserStats);
router.get("/:id/profile", authMiddleware, getUserProfile);
router.get("/:id/sales", authMiddleware, getUserSales);
router.get("/:id/logs", authMiddleware, adminOnly, getUserLogs); // <--- NUEVO
router.get("/:id", authMiddleware, adminOnly, getUserById);
router.put("/:id", authMiddleware, adminOnly, updateUser);
router.patch("/:id/status", authMiddleware, adminOnly, changeStatus);
router.delete("/:id", authMiddleware, adminOnly, deleteUser);   

export default router;
