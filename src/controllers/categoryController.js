import Category from "../models/Category.js";

/**
 * CRUD simple para categorías
 */

export const listCategories = async (req, res) => {
    try {
        const cats = await Category.find().sort({ name: 1 });
        res.json(cats);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ msg: "Name required" });
        const exists = await Category.findOne({ name });
        if (exists) return res.status(400).json({ msg: "Category already exists" });
        const cat = await Category.create({ name, description });
        res.json(cat);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const cat = await Category.findById(id);
        if (!cat) return res.status(404).json({ msg: "Category not found" });
        if (name) cat.name = name;
        if (description) cat.description = description;
        await cat.save();
        res.json(cat);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await Category.findByIdAndDelete(id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
