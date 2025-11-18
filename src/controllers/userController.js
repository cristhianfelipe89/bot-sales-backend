import User from "../models/User.js";

/**
 * Controllers básicos para administración de usuarios.
 * - listUsers (GET /api/users)
 * - getUserById (GET /api/users/:id)
 * - promoteToAdmin (PUT /api/users/:id/promote) opcional
 */

export const listUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const u = await User.findById(id).select("-password");
        if (!u) return res.status(404).json({ msg: "User not found" });
        res.json(u);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const promoteToAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const u = await User.findById(id);
        if (!u) return res.status(404).json({ msg: "User not found" });
        u.role = "admin";
        await u.save();
        res.json({ msg: "User promoted to admin", user: { id: u._id, email: u.email, role: u.role } });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
