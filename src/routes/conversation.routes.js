// src/routes/conversation.routes.js
import express from "express";
import { getAllConversations, getConversationByUser, createOrAppendMessage, deleteConversation } from "../controllers/conversation.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
const router = express.Router();

router.get("/", authMiddleware, adminOnly, getAllConversations);
router.get("/:userId", authMiddleware, getConversationByUser);
router.post("/", createOrAppendMessage); // called by n8n / chatwoot / telegram webhook
router.delete("/:userId", authMiddleware, adminOnly, deleteConversation);

export default router;
