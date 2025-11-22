// src/services/recommendationEngine.js
import Product from "../models/Product.js";

const guessCategoryFromText = (text = "") => {
    const t = text.toLowerCase();
    if (t.includes("auricular") || t.includes("audífono")) return "Tecnología";
    if (t.includes("camisa") || t.includes("pantalón") || t.includes("ropa")) return "Ropa";
    return null;
};

const recommendationEngine = {
    async suggestFromMessage(text = "", limit = 5) {
        const cat = guessCategoryFromText(text);
        if (!cat) return Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 }).limit(limit).exec();
        return Product.find({ category: cat, stock: { $gt: 0 } }).limit(limit).exec();
    },
    async suggestFromCart(cart, limit = 5) {
        if (!cart || !cart.items || cart.items.length === 0) return Product.find({ stock: { $gt: 0 } }).sort({ createdAt: -1 }).limit(limit).exec();
        const categories = new Set();
        for (const it of cart.items) { const p = it.productId; if (p && p.category) categories.add(p.category); }
        const arr = Array.from(categories);
        if (arr.length === 0) return [];
        return Product.find({ category: { $in: arr }, stock: { $gt: 0 } }).limit(limit).exec();
    }
};

export default recommendationEngine;
