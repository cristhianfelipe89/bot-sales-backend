// src/routes/auth.routes.js
import express from "express";
import { register, login, telegramAuth } from "../controllers/auth.controller.js";
import { estadoUsuario } from "../controllers/auth.controller.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/telegram", telegramAuth);
router.get("/estado", estadoUsuario);

export default router;