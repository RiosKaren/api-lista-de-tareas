import { Tarea } from "./model";

// Capa de acceso a datos: la única que habla con la base. Solo lee y escribe.
export const buscarTodas = (filtro: object = {}) =>
  Tarea.find(filtro).sort({ fechaLimite: 1 }).populate("usuario", "nombre email");

export const buscarPorId = (id: string) => Tarea.findById(id).populate("usuario", "nombre email");

export const crear = (datos: object) => Tarea.create(datos);

export const actualizar = (id: string, datos: object) =>
  Tarea.findByIdAndUpdate(id, datos, { new: true, runValidators: true }).populate("usuario", "nombre email");

export const eliminar = (id: string) => Tarea.findByIdAndDelete(id);
