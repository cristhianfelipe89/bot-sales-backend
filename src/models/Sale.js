import mongoose from "mongoose";

const SaleItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

const saleSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // telegram id or internal id
    items: [SaleItemSchema],
    total: { type: Number, required: true },
    payment: {
        method: { type: String },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "paid" },
        metadata: { type: Object }
    },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Sale", saleSchema);
