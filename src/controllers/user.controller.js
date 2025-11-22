// src/controllers/user.controller.js
import User from "../models/User.js";
import Sale from "../models/Sale.js";
import mongoose from "mongoose";

/**
 * List users (admin)
 */
export const listUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Create user (admin)
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role = "user", source = "web" } = req.body;
        if (!name) return res.status(400).json({ msg: "Name required" });
        if (email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ msg: "Email already in use" });
        }
        const user = await User.create({ name, email, password, role, source });
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt } });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Get user by id (admin)
 */
export const getUserById = async (req, res) => {
    try {
        const u = await User.findById(req.params.id).select("-password");
        if (!u) return res.status(404).json({ msg: "User not found" });
        res.json(u);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Update user (admin)
 */
export const updateUser = async (req, res) => {
    try {
        const { name, email, role, status, avatar } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (email && email !== user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ msg: "Email already in use" });
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.role = role ?? user.role;
        user.status = status ?? user.status;
        user.avatar = avatar ?? user.avatar;

        if (req.body.password) user.password = req.body.password; // will be hashed by pre-save

        await user.save();
        res.json({ msg: "User updated", user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status } });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Change status (suspend/reactivate)
 */
export const changeStatus = async (req, res) => {
    try {
        const { status } = req.body; // "active" | "suspended"
        if (!["active", "suspended"].includes(status)) return res.status(400).json({ msg: "Invalid status" });

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.status = status;
        await user.save();
        res.json({ msg: "Status updated", status: user.status });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Delete user (admin)
 */
export const deleteUser = async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ msg: "User not found" });
        res.json({ msg: "User deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * GET /users/stats
 * Returns aggregated stats per user: { _id: userId, totalCompras, totalGastado }
 */
export const getUserStats = async (req, res) => {
    try {
        const stats = await Sale.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalCompras: { $sum: 1 },
                    totalGastado: { $sum: "$total" }
                }
            }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * GET /users/:id/profile
 * Returns profile + aggregated metrics + recent sales
 */
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ msg: "Invalid id" });

        const user = await User.findById(userId).select("-password");
        if (!user) return res.status(404).json({ msg: "User not found" });

        // stats
        const agg = await Sale.aggregate([
            { $match: { userId: userId } },
            {
                $group: {
                    _id: "$userId",
                    totalCompras: { $sum: 1 },
                    totalGastado: { $sum: "$total" }
                }
            }
        ]);

        const userStats = agg[0] || { totalCompras: 0, totalGastado: 0 };

        // recent sales (last 20)
        const recentSales = await Sale.find({ userId }).sort({ createdAt: -1 }).limit(20).populate("items.productId");

        // spending by month (last 12 months)
        const now = new Date();
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth() + 1, 1);
        const byMonth = await Sale.aggregate([
            { $match: { userId: userId, createdAt: { $gte: lastYear } } },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    total: { $sum: "$total" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        res.json({
            user,
            stats: userStats,
            recentSales,
            byMonth
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

/**
 * GET /users/:id/sales?page=&limit=
 * Paginated user sales
 */
export const getUserSales = async (req, res) => {
    try {
        const userId = req.params.id;
        const page = Math.max(1, Number(req.query.page || 1));
        const limit = Math.min(100, Number(req.query.limit || 20));
        const skip = (page - 1) * limit;

        const sales = await Sale.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("items.productId");

        const total = await Sale.countDocuments({ userId });

        res.json({ sales, page, limit, total });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
