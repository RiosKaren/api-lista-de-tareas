import { Usuario } from "./model";

export const buscarPorEmail = (email: string) => Usuario.findOne({ email: email.toLowerCase() });
export const buscarPorId = (id: string) => Usuario.findById(id);
export const crear = (datos: { nombre: string; email: string; clave: string; rol: "usuario" | "admin" }) =>
  Usuario.create(datos);
