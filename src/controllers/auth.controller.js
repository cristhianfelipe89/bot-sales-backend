import User from "../models/User.js";
import UserLog from "../models/UserLog.js"; // <--- Importar Logs
import generateToken from "../utils/generateToken.js";

/**
 * Registro Web (ADMIN)
 */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ msg: "Faltan campos" });

        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ msg: "El correo ya está registrado" });

        // Crear Admin Web
        const user = await User.create({ name, email, password, role: "admin", source: "web" });

        // LOG
        await UserLog.create({
            userId: user._id,
            action: "REGISTER",
            source: "web",
            details: "Registro de Admin desde Panel Web",
            ip: req.ip
        });

        const token = generateToken(user);
        res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Login Web (ADMIN)
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ msg: "Faltan campos" });

        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(400).json({ msg: "Credenciales inválidas" });

        const match = await user.matchPassword(password);
        if (!match) return res.status(400).json({ msg: "Credenciales inválidas" });

        if (user.role !== "admin") return res.status(403).json({ msg: "Acceso denegado: Solo admins" });

        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();

        // LOG
        await UserLog.create({
            userId: user._id,
            action: "LOGIN",
            source: "web",
            details: "Login exitoso en Dashboard",
            ip: req.ip
        });

        const token = generateToken(user);
        res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role }, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: err.message });
    }
};

/**
 * Telegram Auth (USER)
 * Logica unificada: Login si existe, Register si no.
 */
export const telegramAuth = async (req, res) => {
    try {
        // Recibimos más datos ahora: email, password, avatar
        const { telegramId, telegramUsername, name, email, password, avatar } = req.body;

        if (!telegramId) return res.status(400).json({ msg: "telegramId requerido" });

        // 1. Buscar si ya existe por telegramId
        let user = await User.findOne({ telegramId });

        if (user) {
            // SEGURIDAD: Si es un admin web, no dejarlo entrar por el flujo del bot como usuario
            if (user.source === "web" || user.role === "admin") {
                return res.status(403).json({ msg: "Cuenta administrativa. Use el panel web." });
            }

            // Actualizar datos
            user.lastLogin = new Date();
            if (avatar) user.avatar = avatar;
            if (password) user.password = password; // Actualiza pass si se envía
            
            await user.save();

            // LOG LOGIN
            await UserLog.create({
                userId: user._id,
                action: "LOGIN",
                source: "telegram",
                details: `Acceso desde Bot (User: ${telegramUsername || name})`
            });

            const token = generateToken(user);
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

        // 2. Si no existe, validamos email para evitar duplicados con admins
        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ msg: "Este correo ya está registrado en el sistema." });
            }
        }

        // 3. Crear nuevo Usuario Telegram
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

        // LOG REGISTER
        await UserLog.create({
            userId: newUser._id,
            action: "REGISTER",
            source: "telegram",
            details: "Nuevo registro desde Telegram"
        });

        const token = generateToken(newUser);
        res.status(201).json({ 
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
