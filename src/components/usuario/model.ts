import { Schema, model } from "mongoose";

export interface IUsuario {
  nombre: string;
  email: string;
  clave: string;
  rol: "usuario" | "admin";
}

const usuarioSchema = new Schema<IUsuario>(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    clave: { type: String, required: true }, 
    rol: { type: String, enum: ["usuario", "admin"], default: "usuario" },
  },
  { timestamps: { createdAt: "creadoEl", updatedAt: "actualizadoEl" } }
);

usuarioSchema.set("toJSON", {
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.clave;
    delete ret.__v;
    return ret;
  },
});

export const Usuario = model<IUsuario>("Usuario", usuarioSchema, "usuarios");
