import { Request, Response } from "express";
import * as servicio from "./service";
import { RequestAutenticado } from "../../middlewares/auth";
import { manejarError } from "../../utils/httpError";

// POST /api/usuarios/registro
export const registrar = async (req: Request, res: Response) => {
  try {
    const usuario = await servicio.registrar(req.body ?? {});
    res.status(201).json({ mensaje: "Usuario registrado", usuario }); // 201: creado
  } catch (error) {
    manejarError(error, res); 
  }
};

// POST /api/usuarios/login
export const iniciarSesion = async (req: Request, res: Response) => {
  try {
    const { token, usuario } = await servicio.iniciarSesion(req.body ?? {});
    res.status(200).json({ mensaje: "Inicio de sesión exitoso", token, usuario });
  } catch (error) {
    manejarError(error, res); 
  }
};

// GET /api/usuarios/perfil (con token)
export const perfil = async (req: RequestAutenticado, res: Response) => {
  try {
    const usuario = await servicio.obtenerPerfil(req.usuario!.id);
    res.status(200).json(usuario);
  } catch (error) {
    manejarError(error, res);
  }
};
