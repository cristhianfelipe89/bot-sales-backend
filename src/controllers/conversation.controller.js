// src/controllers/conversation.controller.js
import Conversation from "../models/Conversation.js";

export const getAllConversations = async (req, res) => {
    try {
        const convs = await Conversation.find().sort({ updatedAt: -1 });
        res.json(convs);
    } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const getConversationByUser = async (req, res) => {
    try {
        const conv = await Conversation.findOne({ userId: req.params.userId });
        if (!conv) return res.status(404).json({ msg: "Not found" });
        res.json(conv);
    } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const createOrAppendMessage = async (req, res) => {
    try {
        const { userId, from, text, metadata } = req.body;
        if (!userId || !from || !text) return res.status(400).json({ msg: "Missing fields" });
        let conv = await Conversation.findOne({ userId });
        if (!conv) conv = await Conversation.create({ userId, messages: [{ from, text, metadata }], channel: req.body.channel || "telegram" });
        else { conv.messages.push({ from, text, metadata }); conv.updatedAt = new Date(); await conv.save(); }
        res.json(conv);
    } catch (err) { res.status(500).json({ msg: err.message }); }
};

export const deleteConversation = async (req, res) => {
    try {
        const d = await Conversation.findOneAndDelete({ userId: req.params.userId });
        if (!d) return res.status(404).json({ msg: "Not found" });
        res.json({ ok: true });
    } catch (err) { res.status(500).json({ msg: err.message }); }
};
