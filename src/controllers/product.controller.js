// src/controllers/product.controller.js
import Product from "../models/Product.js";
import Category from "../models/Category.js";

// 📌 LISTAR PRODUCTOS
export const listProducts = async (req, res) => {
    try {
        const { category, search, sort } = req.query;

        const q = {};
        if (category) q.category = category;
        if (search) q.name = { $regex: search, $options: "i" };

        let query = Product.find(q);

        const sortMap = {
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 },
            stock_asc: { stock: 1 },
            stock_desc: { stock: -1 },
        };

        if (sort && sortMap[sort]) query.sort(sortMap[sort]);
        else query.sort({ createdAt: -1 });

        const products = await query.exec();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// 📌 OBTENER PRODUCTO POR ID
export const getProductById = async (req, res) => {
    try {
        const p = await Product.findById(req.params.id);
        if (!p) return res.status(404).json({ msg: "Producto no encontrado" });
        res.json(p);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// 📌 CREAR PRODUCTO
export const createProduct = async (req, res) => {
    try {
        const { name, description, category, price, stock } = req.body;

        const catExists = await Category.findOne({ name: category });
        if (!catExists) return res.status(400).json({ msg: "La categoría no existe" });

        const p = await Product.create({ name, description, category, price, stock });
        res.json(p);

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// 📌 ACTUALIZAR PRODUCTO
export const updateProduct = async (req, res) => {
    try {
        const { name, description, category, price, stock } = req.body;

        const catExists = await Category.findOne({ name: category });
        if (!catExists) return res.status(400).json({ msg: "La categoría no existe" });

        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { name, description, category, price, stock },
            { new: true }
        );

        if (!updated) return res.status(404).json({ msg: "Producto no encontrado" });

        res.json(updated);

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// 📌 ELIMINAR PRODUCTO
export const deleteProduct = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ msg: "Producto no encontrado" });

        res.json({ msg: "Producto eliminado" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// 📌 MÉTRICAS DEL INVENTARIO
export const getProductMetrics = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const lowStock = await Product.find({ stock: { $lte: 5, $gt: 0 } })
            .select("name stock category");
        const outOfStock = await Product.find({ stock: 0 })
            .select("name stock category");

        res.json({
            totalProducts,
            lowStock,
            outOfStock
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
