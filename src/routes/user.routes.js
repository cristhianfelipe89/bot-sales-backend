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
    getUserSales
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// admin list
router.get("/", authMiddleware, adminOnly, listUsers);
router.post("/", authMiddleware, adminOnly, createUser);

// stats
router.get("/stats", authMiddleware, adminOnly, getUserStats);

// profile (admin or same user allowed)
router.get("/:id/profile", authMiddleware, async (req, res, next) => {
    // allow admin or the same user
    if (req.user.role === "admin" || req.user._id.toString() === req.params.id) return next();
    return res.status(403).json({ msg: "Forbidden" });
}, getUserProfile);

// user sales (admin or same user)
router.get("/:id/sales", authMiddleware, async (req, res, next) => {
    if (req.user.role === "admin" || req.user._id.toString() === req.params.id) return next();
    return res.status(403).json({ msg: "Forbidden" });
}, getUserSales);

// single user CRUD (admin)
router.get("/:id", authMiddleware, adminOnly, getUserById);
router.put("/:id", authMiddleware, adminOnly, updateUser);
router.patch("/:id/status", authMiddleware, adminOnly, changeStatus);
router.delete("/:id", authMiddleware, adminOnly, deleteUser);

export default router;
