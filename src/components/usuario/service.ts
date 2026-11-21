import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dao from "./dao";
import { HttpError } from "../../utils/httpError";

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface DatosRegistro {
  nombre?: string;
  email?: string;
  clave?: string;
}

export const registrar = async (datos: DatosRegistro) => {
  const nombre = datos.nombre?.trim();
  const email = datos.email?.trim().toLowerCase();
  const clave = datos.clave;


  if (!nombre || !email || !clave) {
    throw new HttpError(400, "Nombre, email y clave son obligatorios");
  }
  if (!REGEX_EMAIL.test(email)) throw new HttpError(400, "El email no tiene un formato válido");
  if (clave.length < 6) throw new HttpError(400, "La clave debe tener al menos 6 caracteres");

  const existe = await dao.buscarPorEmail(email);
  if (existe) throw new HttpError(400, "El email ya está registrado");


  const rol: "usuario" | "admin" =
    email === process.env.ADMIN_EMAIL?.trim().toLowerCase() ? "admin" : "usuario";

  const hash = await bcrypt.hash(clave, 10); // 10 = rondas de salt
  return dao.crear({ nombre, email, clave: hash, rol });
};

export const iniciarSesion = async (datos: { email?: string; clave?: string }) => {
  if (!datos.email || !datos.clave) {
    throw new HttpError(400, "Email y clave son obligatorios");
  }

  const usuario = await dao.buscarPorEmail(datos.email.trim());
  if (!usuario || !(await bcrypt.compare(datos.clave, usuario.clave))) {
    throw new HttpError(401, "Credenciales inválidas");
  }

 
  const token = jwt.sign(
    { id: usuario._id.toString(), rol: usuario.rol },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  return { token, usuario };
};

export const obtenerPerfil = async (id: string) => {
  const usuario = await dao.buscarPorId(id);
  if (!usuario) throw new HttpError(404, "Usuario no encontrado");
  return usuario;
};
