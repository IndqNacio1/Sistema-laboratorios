import mongoose from "mongoose";

const bitacoraSchema = new mongoose.Schema({
    usuario: { 
        type: String, 
        default: "Sistema/Anónimo" 
    },
    accion: { 
        type: String, 
        required: true 
    },
    modulo: { 
        type: String, 
        required: true 
    },
    detalles: { 
        type: mongoose.Schema.Types.Mixed 
    },
    fecha: { 
        type: Date, 
        default: Date.now 
    }
});

export const Bitacora = mongoose.model("Bitacora", bitacoraSchema);