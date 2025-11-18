/**
 * Endpoints pensados para ser llamados desde n8n (Chatwoot -> n8n -> backend)
 * - POST /api/chatbot/message  : recibe { userId, message } y crea/retorna conversación parcial
 * - POST /api/chatbot/tool/:toolName : un endpoint genérico para operaciones que el agent invoque vía n8n (ej. addToCart shortcut)
 *
 * NOTA: En tu flujo real preferirás que n8n haga las llamadas directas a los endpoints específicos
 * (POST /api/cart/add, GET /api/products, POST /api/sales). Aquí ofrezco helpers consolidados que n8n puede usar.
 */

import Conversation from "../models/Conversation.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { addToCart as addToCartLogic } from "./cartController.js"; // reusar lógica
import { createSale as createSaleLogic } from "./salesController.js";
import chatbotFormatter from "../services/chatbotFormatter.js";
import recommendationEngine from "../services/recommendationEngine.js";

/**
 * Recibe mensajes desde n8n. Solo guarda el mensaje y devuelve contexto útil
 * para que el agente lo use. No ejecuta LLM aquí, n8n será quien llame al LLM.
 */
export const receiveMessage = async (req, res) => {
    try {
        const { userId, message, metadata } = req.body;
        if (!userId || !message) return res.status(400).json({ msg: "Missing userId or message" });

        let conv = await Conversation.findOne({ userId });
        if (!conv) {
            conv = await Conversation.create({ userId, messages: [{ from: "user", text: message, metadata }] });
        } else {
            conv.messages.push({ from: "user", text: message, metadata });
            conv.updatedAt = new Date();
            await conv.save();
        }

        // devuelve resumen para que n8n lo incluya al prompt del LLM
        const cart = await Cart.findOne({ userId }).populate("items.productId");
        const recommended = await recommendationEngine.suggestFromMessage(message);

        const formatted = chatbotFormatter.formatForAgent({
            conversation: conv,
            latestMessage: message,
            cart,
            recommended
        });

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Herramienta genérica: ejecuta acciones rápidas según toolName (por si quieres centralizar).
 * Ejemplo de uso en n8n: llamar POST /api/chatbot/tool/addToCart con body { userId, productId, quantity }
 */
export const toolExecutor = async (req, res) => {
    try {
        const { toolName } = req.params;
        const payload = req.body;

        if (toolName === "addToCart") {
            // reutilizamos la lógica de cartController (no duplicar)
            // addToCartLogic espera req.body { userId, productId, quantity }
            const fakeReq = { body: payload };
            const fakeRes = {
                json: (data) => data,
                status: (s) => ({ json: (d) => { throw { status: s, data: d }; } })
            };
            try {
                const result = await addToCartLogic(fakeReq, fakeRes);
                return res.json({ ok: true, result });
            } catch (err) {
                // si addToCartLogic hizo throw via fakeRes, manejar
                return res.status(err.status || 500).json(err.data || { msg: err.message || "error" });
            }
        }

        if (toolName === "createSale") {
            // payload: { userId, items, payment, conversationId }
            const fakeReq = { body: payload };
            const fakeRes = {
                json: (d) => d,
                status: (s) => ({ json: (d) => { throw { status: s, data: d }; } })
            };
            try {
                const result = await createSaleLogic(fakeReq, fakeRes);
                return res.json({ ok: true, result });
            } catch (err) {
                return res.status(err.status || 500).json(err.data || { msg: err.message || "error" });
            }
        }

        // fallback: herramientas simples
        if (toolName === "listProducts") {
            const { search, category, sort, limit } = payload || {};
            const q = {};
            if (category) q.category = category;
            if (search) q.name = { $regex: search, $options: "i" };
            let query = Product.find(q).limit(limit ? Number(limit) : 20);
            if (sort === "price_asc") query = query.sort({ price: 1 });
            if (sort === "price_desc") query = query.sort({ price: -1 });
            const products = await query.exec();
            return res.json({ products });
        }

        return res.status(400).json({ msg: "Tool not recognized" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
