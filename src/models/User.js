import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "customer", "seller"], default: "customer" },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
