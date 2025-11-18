import express from "express";
import { getCart, addToCart, updateCartItem, clearCart } from "../controllers/cartController.js";
const router = express.Router();

router.get("/:userId", getCart);
router.post("/add", addToCart); // body: { userId, productId, quantity }
router.put("/:userId/item", updateCartItem); // body: { productId, quantity }
router.delete("/:userId", clearCart);

export default router;
