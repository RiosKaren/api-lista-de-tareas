import { Schema, model, Types } from "mongoose";

export const PRIORIDADES = ["baja", "media", "alta"] as const;

export interface ITarea {
  titulo: string;
  descripcion: string;
  prioridad: (typeof PRIORIDADES)[number];
  fechaLimite: Date;
  completada: boolean;
  usuario: Types.ObjectId;
}

const tareaSchema = new Schema<ITarea>(
  {
    titulo: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true, default: "" },
    prioridad: { type: String, enum: PRIORIDADES, default: "media" },
    fechaLimite: { type: Date, required: true },
    completada: { type: Boolean, default: false },
    // Relación entre modelos: cada tarea pertenece al usuario que la creó
    usuario: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  },
  { timestamps: { createdAt: "creadaEl", updatedAt: "actualizadaEl" }, versionKey: false }
);

export const Tarea = model<ITarea>("Tarea", tareaSchema, "tareas");
