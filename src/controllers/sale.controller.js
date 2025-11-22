// src/controllers/sale.controller.js
import mongoose from "mongoose";
import Sale from "../models/Sale.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Conversation from "../models/Conversation.js";

export const createSale = async (req, res) => {
    try {
        const { userId, items, payment = {}, conversationId } = req.body;
        if (!userId || !items || !Array.isArray(items) || items.length === 0) return res.status(400).json({ msg: "Invalid payload" });

        // load products
        const ids = items.map(i => i.productId);
        const products = await Product.find({ _id: { $in: ids } });

        let total = 0;
        const prepared = [];

        for (const it of items) {
            const prod = products.find(p => p._id.toString() === it.productId);
            if (!prod) return res.status(400).json({ msg: `Product ${it.productId} not found` });
            if (prod.stock < it.quantity) return res.status(400).json({ msg: `Insufficient stock for ${prod.name}` });
            prepared.push({ productId: prod._id, quantity: it.quantity, price: prod.price });
            total += prod.price * it.quantity;
        }

        // attempt to decrement stocks atomically with conditional updates
        for (const it of items) {
            const resp = await Product.updateOne({ _id: it.productId, stock: { $gte: it.quantity } }, { $inc: { stock: -it.quantity } });
            if (resp.modifiedCount === 0) return res.status(400).json({ msg: "Stock update failed due to concurrency" });
        }

        const sale = await Sale.create({ userId, items: prepared, total, payment, conversationId });

        // clear cart
        await Cart.findOneAndDelete({ userId });

        // append message to conversation if provided
        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, { $push: { messages: { from: "bot", text: `Venta registrada: ${sale._id}`, metadata: { saleId: sale._id } } } }, { new: true });
        }

        res.json({ sale });
    } catch (err) {
        console.error(err);
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

export const getMetrics = async (req, res) => {
    try {
        const totalSales = await Sale.countDocuments();
        const revenueAgg = await Sale.aggregate([{ $group: { _id: null, total: { $sum: "$total" } } }]);
        const totalRevenue = revenueAgg[0]?.total || 0;

        const byProduct = await Sale.aggregate([
            { $unwind: "$items" },
            { $group: { _id: "$items.productId", qty: { $sum: "$items.quantity" }, revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } } } },
            { $sort: { qty: -1 } },
            { $limit: 10 }
        ]);

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
