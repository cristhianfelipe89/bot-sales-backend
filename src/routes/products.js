import express from "express";
import { getProducts, createProduct, getProductById } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/", getProducts); // public
router.get("/:id", getProductById);
router.post("/", authMiddleware, async (req, res, next) => {
    // only admin can create
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Forbidden" });
    next();
}, createProduct);

export default router;
