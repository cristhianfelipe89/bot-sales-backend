import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    description: { type: String },
    category: { type: String, default: "General", index: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
