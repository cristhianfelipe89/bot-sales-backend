import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Conversation from "../models/Conversation.js";

/**
 * Create a sale with multiple items (items: [{productId, quantity}])
 * - Validate stock for each product
 * - Deduct stock
 * - Create sale document
 * - Remove cart (if user had one)
 * - Optionally append sale info to conversation
 */
export const createSale = async (req, res) => {
    try {
        const { userId, items, payment = {}, conversationId } = req.body;
        if (!userId || !items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ msg: "Invalid payload" });

        // Validate & compute total
        let total = 0;
        const preparedItems = [];

        // load all products in parallel
        const productIds = items.map(i => i.productId);
        const products = await Product.find({ _id: { $in: productIds } });

        for (const it of items) {
            const prod = products.find(p => p._id.toString() === it.productId);
            if (!prod) return res.status(400).json({ msg: `Product ${it.productId} not found` });
            if (prod.stock < it.quantity) return res.status(400).json({ msg: `Insufficient stock for ${prod.name}` });
            const linePrice = prod.price * it.quantity;
            total += linePrice;
            preparedItems.push({ productId: prod._id, quantity: it.quantity, price: prod.price });
        }

        // Deduct stock (update many)
        for (const it of items) {
            await Product.findByIdAndUpdate(it.productId, { $inc: { stock: -it.quantity } });
        }

        const sale = await Sale.create({ userId, items: preparedItems, total, payment, conversationId });
        // Remove cart for user
        await Cart.findOneAndDelete({ userId });

        // Append to conversation if provided
        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, { $push: { messages: { from: "bot", text: `Venta registrada: ${sale._id}`, metadata: { saleId: sale._id } } }, updatedAt: new Date() });
        }

        res.json({ sale });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getSales = async (req, res) => {
    try {
        const sales = await Sale.find().sort({ createdAt: -1 }).populate("items.productId");
        res.json(sales);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// Export simple metrics for admin dashboard
export const getMetrics = async (req, res) => {
    try {
        const totalSales = await Sale.countDocuments();
        const totalRevenueAgg = await Sale.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        // sales by category (need to lookup products)
        const byProduct = await Sale.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.productId", qty: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
            { $sort: { qty: -1 } },
            { $limit: 10 }
        ]);
        // populate product names
        const productIds = byProduct.map(b => b._id);
        const prods = await Product.find({ _id: { $in: productIds } });
        const topProducts = byProduct.map(b => {
            const p = prods.find(x => x._id.toString() === b._id.toString());
            return { productId: b._id, name: p?.name || "Desconocido", qty: b.qty, revenue: b.revenue };
        });
        res.json({ totalSales, totalRevenue, topProducts });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
