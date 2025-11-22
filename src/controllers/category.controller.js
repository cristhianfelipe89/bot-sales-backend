// src/controllers/category.controller.js
import Category from "../models/Category.js";

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
        const c = await Category.create({ name, description });
        res.status(201).json(c);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const c = await Category.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
        if (!c) return res.status(404).json({ msg: "Not found" });
        res.json(c);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const d = await Category.findByIdAndDelete(req.params.id);
        if (!d) return res.status(404).json({ msg: "Not found" });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
