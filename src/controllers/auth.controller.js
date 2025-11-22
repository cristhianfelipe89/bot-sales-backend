// src/controllers/auth.controller.js
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

/**
 * register (web) => admin by default (or role provided if you want)
 * body: { name, email, password }
 */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ msg: "Missing fields" });
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: "Email already registered" });
        const user = await User.create({ name, email, password, role: "admin", source: "web" });
        const token = generateToken(user);
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

/**
 * login web (email/password)
 * body: { email, password }
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ msg: "Missing fields" });
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(400).json({ msg: "Invalid credentials" });
        const match = await user.matchPassword(password);
        if (!match) return res.status(400).json({ msg: "Invalid credentials" });
        if (user.role !== "admin") return res.status(403).json({ msg: "Access denied" });
        const token = generateToken(user);
        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Telegram register / login combined:
 * POST /api/auth/telegram
 * body: { telegramId, telegramUsername, name }
 * If user exists -> return token, else create user role=user and return token
 */
export const telegramAuth = async (req, res) => {
    try {
        const { telegramId, telegramUsername, name } = req.body;
        if (!telegramId) return res.status(400).json({ msg: "telegramId required" });
        let user = await User.findOne({ telegramId });
        if (user) {
            const token = generateToken(user);
            return res.json({ user: { id: user._id, name: user.name, telegramId: user.telegramId, role: user.role }, token });
        }
        // create user with role user
        const newUser = await User.create({ name: name || `tg_${telegramId}`, telegramId, telegramUsername, role: "user", source: "telegram" });
        const token = generateToken(newUser);
        res.status(201).json({ user: { id: newUser._id, name: newUser.name, telegramId: newUser.telegramId, role: newUser.role }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};
