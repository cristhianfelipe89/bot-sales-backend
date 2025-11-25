import mongoose from "mongoose";

const userLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    action: { 
        type: String, 
        enum: ["LOGIN", "REGISTER", "LOGOUT", "ERROR"], 
        required: true 
    },
    source: { 
        type: String, 
        enum: ["web", "telegram"], 
        required: true 
    },
    details: { type: String, default: "" },
    ip: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("UserLog", userLogSchema);