/**
 * Utilidades para validar stock.
 * - validateItemsStock(items) : items = [{ productId, quantity }]
 *   -> lanza error con mensaje si hay insuficiente stock, o devuelve lista de productos con stock actualizado.
 */

import Product from "../models/Product.js";

export const validateItemsStock = async (items = []) => {
    if (!Array.isArray(items) || items.length === 0) return { ok: true, details: [] };

    // Cargar productos
    const ids = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: ids } });

    const details = [];

    for (const it of items) {
        const prod = products.find(p => p._id.toString() === it.productId.toString());
        if (!prod) return { ok: false, msg: `Producto ${it.productId} no existe` };
        if (prod.stock < it.quantity) return { ok: false, msg: `Stock insuficiente en ${prod.name}` };
        details.push({ productId: prod._id, stockBefore: prod.stock, willRemain: prod.stock - it.quantity });
    }

    return { ok: true, details };
};

export const deductItemsStock = async (items = []) => {
    // real deduction (use transactions if available/needed)
    for (const it of items) {
        await Product.findByIdAndUpdate(it.productId, { $inc: { stock: -it.quantity } });
    }
};
