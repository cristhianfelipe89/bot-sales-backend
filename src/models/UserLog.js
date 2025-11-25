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
    ip: { type: String, default: "" },
    
    // CAMPO EXTRA PARA LECTURA HUMANA EN BD
    dateString: { type: String }

}, { timestamps: true });

// Hook para guardar la fecha legible en hora colombiana
userLogSchema.pre("save", function(next) {
    this.dateString = new Date().toLocaleString("es-CO", { 
        timeZone: "America/Bogota",
        dateStyle: "medium",
        timeStyle: "medium"
    });
    next();
});

export default mongoose.model("UserLog", userLogSchema);