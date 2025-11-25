import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    price: Number
});

const saleSchema = new mongoose.Schema({
    // RELACIÓN DEFINITIVA: ObjectId ref User
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [saleItemSchema],
    total: { type: Number, required: true },
    payment: {
        method: String,
        status: { type: String, enum: ["pending", "paid", "failed"], default: "paid" },
        metadata: { type: Object }
    },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" }
}, { timestamps: true });

export default mongoose.model("Sale", saleSchema);