// src/routes/cart.routes.js
import express from "express";
import { getCart, addToCart, updateCartItem, clearCart } from "../controllers/cart.controller.js";
const router = express.Router();

router.get("/:userId", getCart);
router.post("/add", addToCart);
router.put("/:userId/item", updateCartItem);
router.delete("/:userId", clearCart);

export default router;
