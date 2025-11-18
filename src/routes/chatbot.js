import express from "express";
import { receiveMessage, toolExecutor } from "../controllers/chatbotController.js";

const router = express.Router();

/**
 * Endpoint principal que n8n puede llamar para guardar el mensaje y obtener
 * un resumen/contexto para el LLM (n8n incluirá este contexto en el prompt).
 */
router.post("/message", receiveMessage);

/**
 * Endpoint genérico para ejecutar "tools" desde n8n si prefieres centralizar.
 * Ej: POST /api/chatbot/tool/addToCart  with body { userId, productId, quantity }
 */
router.post("/tool/:toolName", toolExecutor);

export default router;
