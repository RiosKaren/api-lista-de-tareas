import { Response } from "express";
import * as servicio from "./service";
import { RequestAutenticado } from "../../middlewares/auth";
import { manejarError } from "../../utils/httpError";

// GET /api/tareas  (admite filtros: ?prioridad=alta&completada=false&buscar=texto)
export const obtenerTodas = async (req: RequestAutenticado, res: Response) => {
  try {
    const tareas = await servicio.obtenerTodas(req.usuario!, req.query);
    res.status(200).json(tareas);
  } catch (error) {
    manejarError(error, res);
  }
};

// GET /api/tareas/:id
export const obtenerPorId = async (req: RequestAutenticado, res: Response) => {
  try {
    const tarea = await servicio.obtenerPorId(req.params.id as string, req.usuario!);
    res.status(200).json(tarea);
  } catch (error) {
    manejarError(error, res); // 404 si no existe
  }
};

// POST /api/tareas
export const crear = async (req: RequestAutenticado, res: Response) => {
  try {
    const tarea = await servicio.crear(req.body ?? {}, req.usuario!);
    res.status(201).json(tarea); // 201: creado
  } catch (error) {
    manejarError(error, res); // 400 si falla una validación
  }
};

// PUT /api/tareas/:id
export const actualizar = async (req: RequestAutenticado, res: Response) => {
  try {
    const tarea = await servicio.actualizar(req.params.id as string, req.body ?? {}, req.usuario!);
    res.status(200).json(tarea);
  } catch (error) {
    manejarError(error, res); // 400 validación, 404 no existe
  }
};

// DELETE /api/tareas/:id (solo admin)
export const eliminar = async (req: RequestAutenticado, res: Response) => {
  try {
    const tarea = await servicio.eliminar(req.params.id as string);
    res.status(200).json({ mensaje: "Tarea eliminada", tarea });
  } catch (error) {
    manejarError(error, res); // 404 no existe
  }
};
