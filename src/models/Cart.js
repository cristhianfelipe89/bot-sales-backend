import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 }
});

const cartSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true }, // store telegram id or internal user id
    items: [CartItemSchema],
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Cart", cartSchema);
