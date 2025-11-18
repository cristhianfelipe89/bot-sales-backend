// /src/controllers/conversationController.js
import Conversation from "../models/Conversation.js";

/**
 * 🔹 1. Obtener todas las conversaciones (ADMIN ONLY)
 */
export const getAllConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find()
            .populate("userId", "name email")
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * 🔹 2. Obtener conversación por usuario (para chatbot o admin)
 */
export const getConversationByUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const conv = await Conversation.findOne({ userId }).populate("userId", "name email");
        if (!conv) return res.status(404).json({ msg: "Conversation not found" });
        res.json(conv);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * 🔹 3. Crear una nueva conversación o agregar mensaje
 * Usado por N8N o Webhook desde Chatwoot/Telegram
 */
export const createOrAppendMessage = async (req, res) => {
    try {
        const { userId, from, text, metadata } = req.body;

        if (!userId || !from || !text) 
            return res.status(400).json({ msg: "Missing required fields" });

        let conv = await Conversation.findOne({ userId });

        if (!conv) {
            conv = await Conversation.create({
                userId,
                messages: [{ from, text, metadata }],
                updatedAt: new Date(),
            });
        } else {
            conv.messages.push({ from, text, metadata });
            conv.updatedAt = new Date();
            await conv.save();
        }

        res.json(conv);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * 🔹 4. (Opcional) Eliminar conversación
 * Admin puede limpiar historial
 */
export const deleteConversation = async (req, res) => {
    const { userId } = req.params;
    try {
        const deleted = await Conversation.findOneAndDelete({ userId });
        if (!deleted) return res.status(404).json({ msg: "Conversation not found" });
        res.json({ msg: "Conversation deleted", deleted });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
