// /src/routes/conversations.js
import express from "express";
import {
    getAllConversations,
    getConversationByUser,
    createOrAppendMessage,
    deleteConversation
} from "../controllers/conversationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// 🟩 Admin: Ver TODAS las conversaciones
router.get("/", authMiddleware, adminMiddleware, getAllConversations);

// 🟦 Get chat by userId (para chatbot o admin)
router.get("/:userId", authMiddleware, getConversationByUser);

// 🟨 Webhook: agregar o crear conversación
router.post("/", createOrAppendMessage);  // sin auth: lo usa N8N o Telegram

// 🟥 Admin: eliminar
router.delete("/:userId", authMiddleware, adminMiddleware, deleteConversation);

export default router;
