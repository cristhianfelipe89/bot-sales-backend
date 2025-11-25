import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema({
    // RELACIÓN DEFINITIVA: ObjectId ref User
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [itemSchema],
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Cart", cartSchema);

