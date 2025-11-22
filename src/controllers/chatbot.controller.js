// src/controllers/chatbot.controller.js
import Conversation from "../models/Conversation.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import recommendationEngine from "../services/recommendationEngine.js";
import { addToCart } from "./cart.controller.js";
import { createSale } from "./sale.controller.js";
import chatbotFormatter from "../services/chatbotFormatter.js";

/**
 * Receive message (n8n will call this to gather context to include in prompt)
 */
export const receiveMessage = async (req, res) => {
    try {
        const { userId, message, metadata } = req.body;
        if (!userId || !message) return res.status(400).json({ msg: "Missing userId or message" });

        let conv = await Conversation.findOne({ userId });
        if (!conv) conv = await Conversation.create({ userId, messages: [{ from: "user", text: message, metadata }] });
        else { conv.messages.push({ from: "user", text: message, metadata }); conv.updatedAt = new Date(); await conv.save(); }

        const cart = await Cart.findOne({ userId }).populate("items.productId");
        const recommended = await recommendationEngine.suggestFromMessage(message);

        const formatted = chatbotFormatter.formatForAgent({ conversation: conv, latestMessage: message, cart, recommended });
        res.json(formatted);
    } catch (err) { res.status(500).json({ msg: err.message }); }
};

/**
 * tool executor (will be protected by checkSecret in routes)
 */
export const toolExecutor = async (req, res) => {
    try {
        const { toolName } = req.params;
        const payload = req.body;

        if (toolName === "addToCart") {
            // call cart controller logic
            const fakeReq = { body: payload };
            const fakeRes = {
                json: (d) => d,
                status: (s) => ({ json: (d) => { throw { status: s, data: d }; } })
            };
            try {
                const result = await addToCart(fakeReq, fakeRes);
                return res.json({ ok: true, result });
            } catch (err) {
                return res.status(err.status || 500).json(err.data || { msg: err.message || "error" });
            }
        }

        if (toolName === "createSale") {
            const fakeReq = { body: payload };
            const fakeRes = { json: (d) => d, status: (s) => ({ json: (d) => { throw { status: s, data: d }; } }) };
            try {
                const result = await createSale(fakeReq, fakeRes);
                return res.json({ ok: true, result });
            } catch (err) {
                return res.status(err.status || 500).json(err.data || { msg: err.message || "error" });
            }
        }

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
    } catch (err) { res.status(500).json({ msg: err.message }); }
};
