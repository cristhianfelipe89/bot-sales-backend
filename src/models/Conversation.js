// src/models/Conversation.js
import mongoose from "mongoose";
const msgSchema = new mongoose.Schema({
    from: String,
    text: String,
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});
const convSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    channel: { type: String, default: "telegram" },
    messages: [msgSchema],
    context: { type: Object, default: {} }
}, { timestamps: true });

export default mongoose.model("Conversation", convSchema);
