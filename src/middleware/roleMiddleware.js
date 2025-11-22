// src/middleware/roleMiddleware.js

export const adminOnly = (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden: admin only" });
    next();
};

export const telegramOnly = (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: "Unauthorized" });
    if (req.user.source !== "telegram" && req.user.role !== "user") return res.status(403).json({ msg: "Forbidden: telegram users only" });
    next();
};
