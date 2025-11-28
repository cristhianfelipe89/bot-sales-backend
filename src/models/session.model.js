import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    telegramId: { type: String, required: true, unique: true },
    token: { type: String, required: true },
    expiraEn: { type: Number, required: true }, // timestamp UNIX
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

export default mongoose.model("Session", sessionSchema);