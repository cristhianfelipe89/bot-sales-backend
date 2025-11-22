// src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        email: {
            type: String,
            unique: true,
            sparse: true,
        },

        telegramId: {
            type: String,
            unique: true,
            sparse: true,
        },

        password: { type: String }, // requerido solo para usuarios web

        role: {
            type: String,
            enum: ["admin", "user"],
            default: "user",
        },

        source: {
            type: String,
            enum: ["web", "telegram"],
            default: "web",
        },

        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
        },

        avatar: {
            type: String,
            default: "",
        },

        lastLogin: {
            type: Date,
        }
    },
    { timestamps: true }
);

// Hash de contraseña
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    if (this.password) this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Comparar contraseñas
userSchema.methods.matchPassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
