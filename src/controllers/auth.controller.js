import User from "../models/User.js";
import UserLog from "../models/UserLog.js";
import Session from "../models/session.model.js";  // NUEVO
import generateToken from "../utils/generateToken.js";
import jwt from "jsonwebtoken";

// -----------------------------------------------------
//  REGISTRO WEB
// -----------------------------------------------------
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ msg: "Faltan campos" });

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: "Email registrado" });

        const user = await User.create({
            name,
            email,
            password,
            role: "admin",
            source: "web"
        });

        await UserLog.create({
            userId: user._id,
            action: "REGISTER",
            source: "web",
            details: "Admin registrado en Web",
            ip: req.ip
        });

        const token = generateToken(user);

        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// -----------------------------------------------------
//  LOGIN WEB
// -----------------------------------------------------
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ msg: "Faltan campos" });

        const user = await User.findOne({ email }).select("+password");
        if (!user)
            return res.status(400).json({ msg: "Credenciales inválidas" });

        const match = await user.matchPassword(password);
        if (!match)
            return res.status(400).json({ msg: "Credenciales inválidas" });

        if (user.role !== "admin")
            return res.status(403).json({ msg: "Acceso denegado" });

        user.lastLogin = new Date();
        await user.save();

        await UserLog.create({
            userId: user._id,
            action: "LOGIN",
            source: "web",
            details: "Login en Dashboard",
            ip: req.ip
        });

        const token = generateToken(user);

        res.json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// -----------------------------------------------------
//  TELEGRAM AUTH (Login + Registro)
//  + Guarda sesión JWT en base de datos
// -----------------------------------------------------
export const telegramAuth = async (req, res) => {
    try {
        const {
            telegramId,
            telegramUsername,
            name,
            email,
            password,
            avatar
        } = req.body;

        if (!telegramId)
            return res.status(400).json({ msg: "telegramId required" });

        let user = await User.findOne({ telegramId });

        // -------------------------------------------------
        // LOGIN EXISTENTE
        // -------------------------------------------------
        if (user) {
            if (user.source === "web" || user.role === "admin") {
                return res
                    .status(403)
                    .json({ msg: "Cuenta administrativa. Use panel web." });
            }

            user.lastLogin = new Date();
            if (avatar) user.avatar = avatar;
            if (password) user.password = password;

            await user.save();

            await UserLog.create({
                userId: user._id,
                action: "LOGIN",
                source: "telegram",
                details: `Login bot: ${telegramUsername || name}`
            });

            const token = generateToken(user);
            const decoded = jwt.decode(token);

            // GUARDAR SESIÓN
            await Session.findOneAndUpdate(
                { telegramId: user.telegramId },
                {
                    telegramId: user.telegramId,
                    token,
                    expiraEn: decoded.exp,
                    userId: user._id
                },
                { upsert: true, new: true }
            );

            return res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    telegramId: user.telegramId,
                    role: user.role,
                    avatar: user.avatar
                },
                token
            });
        }

        // -------------------------------------------------
        //  REGISTRO NUEVO
        // -------------------------------------------------
        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists)
                return res.status(400).json({ msg: "Email ya registrado." });
        }

        const newUser = await User.create({
            name: name || `tg_${telegramId}`,
            telegramId,
            telegramUsername,
            email,
            password,
            avatar: avatar || "",
            role: "user",
            source: "telegram",
            lastLogin: new Date()
        });

        await UserLog.create({
            userId: newUser._id,
            action: "REGISTER",
            source: "telegram",
            details: "Registro desde Telegram"
        });

        const token = generateToken(newUser);
        const decoded = jwt.decode(token);

        // GUARDAR SESIÓN NUEVA
        await Session.findOneAndUpdate(
            { telegramId },
            {
                telegramId,
                token,
                expiraEn: decoded.exp,
                userId: newUser._id
            },
            { upsert: true, new: true }
        );

        return res.status(201).json({
            user: {
                id: newUser._id,
                name: newUser.name,
                telegramId: newUser.telegramId,
                role: newUser.role,
                avatar: newUser.avatar
            },
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

// -----------------------------------------------------
//  ESTADO BÁSICO DEL USUARIO (EXISTE / REGISTRADO)
// -----------------------------------------------------
export const estadoUsuario = async (req, res) => {
    try {
        const { telegramId } = req.query;

        if (!telegramId)
            return res.status(400).json({ msg: "telegramId requerido" });

        const user = await User.findOne({ telegramId });

        if (!user) {
            return res.json({
                telegramId,
                autenticado: false,
                registrado: false
            });
        }

        return res.json({
            telegramId,
            autenticado: true,
            registrado: true,
            userId: user._id,
            usuario: user.name,
            role: user.role,
            status: user.status
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

// -----------------------------------------------------
//  VERIFICAR SESIÓN POR TOKEN DIRECTO (opcional)
// -----------------------------------------------------
export const verificarSesion = (req, res) => {
    try {
        const { token } = req.query;

        if (!token) return res.json({ sesionVigente: false });

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.json({ sesionVigente: false });

            return res.json({
                sesionVigente: true,
                userId: decoded.id,
                expiraEn: decoded.exp
            });
        });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};

// -----------------------------------------------------
//  VERIFICAR SESIÓN POR TELEGRAM ID (OPCIÓN B COMPLETA)
// -----------------------------------------------------
export const verificarSesionPorTelegram = async (req, res) => {
    try {
        const { telegramId } = req.query;

        if (!telegramId)
            return res.status(400).json({ msg: "telegramId requerido" });

        const session = await Session.findOne({ telegramId });

        if (!session) return res.json({ sesionVigente: false });

        const ahora = Math.floor(Date.now() / 1000);

        if (ahora < session.expiraEn) {
            return res.json({
                sesionVigente: true,
                userId: session.userId,
                expiraEn: session.expiraEn
            });
        }

        return res.json({
            sesionVigente: false,
            expiraEn: session.expiraEn
        });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};


export const logoutTelegram = async (req, res) => {
    try {
        const { telegramId } = req.query;

        if (!telegramId)
            return res.status(400).json({ msg: "telegramId requerido" });

        // Buscar la sesión existente
        const session = await Session.findOne({ telegramId });

        if (!session) {
            return res.json({
                telegramId,
                sesionVigente: false,
                msg: "No existía sesión activa"
            });
        }

        // Eliminar la sesión
        await Session.deleteOne({ telegramId });

        // Crear un LOG opcional
        await UserLog.create({
            userId: session.userId,
            action: "LOGOUT",
            source: "telegram",
            details: "Logout desde N8N"
        });

        return res.json({
            telegramId,
            sesionVigente: false,
            msg: "Sesión cerrada correctamente"
        });

    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};