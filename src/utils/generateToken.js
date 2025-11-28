// src/utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign({
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email || null,
        telegramId: user.telegramId || null,
        source: user.source || "web"
    }, process.env.JWT_SECRET, { expiresIn: "300s" });
};

export default generateToken;
