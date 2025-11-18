import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ msg: "No token" });
    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id).select("-password");
        if (!user) return res.status(401).json({ msg: "User not found" });
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Invalid token" });
    }
};
