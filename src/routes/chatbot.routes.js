// src/routes/chatbot.routes.js
import express from "express";
import { receiveMessage, toolExecutor } from "../controllers/chatbot.controller.js";
import { checkSecret } from "../middleware/checkSecret.js";
const router = express.Router();

router.post("/message", receiveMessage);
router.post("/tool/:toolName", checkSecret, toolExecutor);

export default router;

