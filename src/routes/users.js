import express from "express";
import { listUsers, getUserById, promoteToAdmin } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, listUsers);
router.get("/:id", authMiddleware, adminMiddleware, getUserById);
router.put("/:id/promote", authMiddleware, adminMiddleware, promoteToAdmin);

export default router;
