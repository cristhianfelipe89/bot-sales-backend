import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

/**
 * Cart operations are keyed by userId (telegram id or internal user id).
 */

export const getCart = async (req, res) => {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) return res.json({ userId, items: [] });
    res.json(cart);
};

export const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;
        if (!userId || !productId) return res.status(400).json({ msg: "Missing data" });

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ msg: "Product not found" });
        if (product.stock < quantity) return res.status(400).json({ msg: "Not enough stock" });

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [{ productId, quantity }] });
        } else {
            const idx = cart.items.findIndex(it => it.productId.toString() === productId);
            if (idx === -1) {
                cart.items.push({ productId, quantity });
            } else {
                cart.items[idx].quantity += quantity;
            }
            cart.updatedAt = new Date();
            await cart.save();
        }
        const populated = await Cart.findById(cart._id).populate("items.productId");
        res.json(populated);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity } = req.body;
        if (!productId) return res.status(400).json({ msg: "Missing productId" });

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ msg: "Cart not found" });

        const item = cart.items.find(it => it.productId.toString() === productId);
        if (!item) return res.status(404).json({ msg: "Item not found in cart" });

        if (quantity <= 0) {
            cart.items = cart.items.filter(it => it.productId.toString() !== productId);
        } else {
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ msg: "Product not found" });
            if (product.stock < quantity) return res.status(400).json({ msg: "Not enough stock" });
            item.quantity = quantity;
        }
        cart.updatedAt = new Date();
        await cart.save();
        const populated = await Cart.findById(cart._id).populate("items.productId");
        res.json(populated);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const clearCart = async (req, res) => {
    try {
        const { userId } = req.params;
        await Cart.findOneAndDelete({ userId });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
