import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    from: { type: String }, // 'user' or 'bot'
    text: { type: String },
    metadata: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

const convSchema = new mongoose.Schema({
    userId: { type: String }, // telegram id
    channel: { type: String, default: "telegram" },
    messages: [messageSchema],
    context: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
});

export default mongoose.model("Conversation", convSchema);
