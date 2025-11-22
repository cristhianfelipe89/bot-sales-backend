// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    try {
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) token = authHeader.split(" ")[1];
        else if (req.headers["x-access-token"]) token = req.headers["x-access-token"];

        if (!token) return res.status(401).json({ msg: "No token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(401).json({ msg: "User not found" });

        req.user = user;
        next();
    } catch (err) {
        console.error("auth error", err);
        res.status(401).json({ msg: "Invalid or expired token" });
    }
};
