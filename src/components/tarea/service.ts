import { isValidObjectId } from "mongoose";
import * as dao from "./dao";
import { PRIORIDADES } from "./model";
import { HttpError } from "../../utils/httpError";
import { DatosToken } from "../../middlewares/auth";

interface DatosTarea {
  titulo?: unknown;
  descripcion?: unknown;
  prioridad?: unknown;
  fechaLimite?: unknown;
  completada?: unknown;
}

interface FiltrosTarea {
  prioridad?: unknown;
  completada?: unknown;
  buscar?: unknown;
}

// ---------- Validaciones de negocio ----------

// Regla 1: el título es obligatorio y tiene entre 3 y 100 caracteres
const validarTitulo = (titulo: unknown) => {
  if (typeof titulo !== "string" || titulo.trim().length < 3 || titulo.trim().length > 100) {
    throw new HttpError(400, "El título es obligatorio y debe tener entre 3 y 100 caracteres");
  }
  return titulo.trim();
};

// Regla 2: la prioridad solo puede ser baja, media o alta
const validarPrioridad = (prioridad: unknown) => {
  if (!PRIORIDADES.includes(prioridad as any)) {
    throw new HttpError(400, `La prioridad debe ser una de: ${PRIORIDADES.join(", ")}`);
  }
  return prioridad as string;
};

// Regla 3: la fecha límite tiene que ser válida y no puede estar en el pasado
const validarFechaLimite = (fechaLimite: unknown) => {
  const fecha = new Date(fechaLimite as string);
  if (fechaLimite === undefined || fechaLimite === null || fechaLimite === "" || isNaN(fecha.getTime())) {
    throw new HttpError(400, "La fecha límite es obligatoria y debe ser válida (ej: 2026-12-31)");
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fecha < hoy) throw new HttpError(400, "La fecha límite no puede estar en el pasado");
  return fecha;
};

// Regla 4: "completada" tiene que ser true o false
const validarCompletada = (completada: unknown) => {
  if (typeof completada !== "boolean") {
    throw new HttpError(400, "El campo completada debe ser true o false");
  }
  return completada;
};

const validarDescripcion = (descripcion: unknown) => {
  if (typeof descripcion !== "string" || descripcion.length > 500) {
    throw new HttpError(400, "La descripción debe ser un texto de hasta 500 caracteres");
  }
  return descripcion.trim();
};

// Un id con formato inválido se trata como "no existe"
const verificarId = (id: string) => {
  if (!isValidObjectId(id)) throw new HttpError(404, "Tarea no encontrada");
};

// Busca la tarea y verifica que sea del usuario (el admin puede ver todas)
const buscarTareaPropia = async (id: string, usuario: DatosToken) => {
  verificarId(id);
  const tarea = await dao.buscarPorId(id);
  const idDuenio = (tarea?.usuario as any)?._id?.toString();
  if (!tarea || (usuario.rol !== "admin" && idDuenio !== usuario.id)) {
    // 404 también si es de otro usuario, para no revelar que existe
    throw new HttpError(404, "Tarea no encontrada");
  }
  return tarea;
};

// ---------- Casos de uso ----------

// Filtros con req.query: ?prioridad=alta&completada=false&buscar=informe
export const obtenerTodas = (usuario: DatosToken, query: FiltrosTarea) => {
  const filtro: Record<string, unknown> = {};

  // Relación: cada usuario ve solo sus tareas (el admin ve todas)
  if (usuario.rol !== "admin") filtro.usuario = usuario.id;

  if (query.prioridad !== undefined) filtro.prioridad = validarPrioridad(query.prioridad);

  if (query.completada !== undefined) {
    if (query.completada !== "true" && query.completada !== "false") {
      throw new HttpError(400, "El filtro completada debe ser true o false");
    }
    filtro.completada = query.completada === "true";
  }

  if (query.buscar !== undefined) {
    if (typeof query.buscar !== "string") throw new HttpError(400, "El filtro buscar debe ser un texto");
    const escapado = query.buscar.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filtro.titulo = { $regex: escapado, $options: "i" };
  }

  return dao.buscarTodas(filtro);
};

export const obtenerPorId = (id: string, usuario: DatosToken) => buscarTareaPropia(id, usuario);

export const crear = (datos: DatosTarea, usuario: DatosToken) => {
  const tarea: Record<string, unknown> = {
    titulo: validarTitulo(datos.titulo),
    fechaLimite: validarFechaLimite(datos.fechaLimite),
    usuario: usuario.id, // el dueño sale del token, no del body
  };
  if (datos.prioridad !== undefined) tarea.prioridad = validarPrioridad(datos.prioridad);
  if (datos.descripcion !== undefined) tarea.descripcion = validarDescripcion(datos.descripcion);
  if (datos.completada !== undefined) tarea.completada = validarCompletada(datos.completada);

  return dao.crear(tarea);
};

export const actualizar = async (id: string, datos: DatosTarea, usuario: DatosToken) => {
  await buscarTareaPropia(id, usuario); // 404 si no existe o no es suya

  // Solo se actualizan los campos enviados, y cada uno se valida igual que al crear
  const cambios: Record<string, unknown> = {};
  if (datos.titulo !== undefined) cambios.titulo = validarTitulo(datos.titulo);
  if (datos.descripcion !== undefined) cambios.descripcion = validarDescripcion(datos.descripcion);
  if (datos.prioridad !== undefined) cambios.prioridad = validarPrioridad(datos.prioridad);
  if (datos.fechaLimite !== undefined) cambios.fechaLimite = validarFechaLimite(datos.fechaLimite);
  if (datos.completada !== undefined) cambios.completada = validarCompletada(datos.completada);

  if (Object.keys(cambios).length === 0) {
    throw new HttpError(
      400,
      "Enviá al menos un campo para actualizar (titulo, descripcion, prioridad, fechaLimite, completada)"
    );
  }

  return dao.actualizar(id, cambios);
};

// Solo llega acá un admin (lo controla el middleware esAdmin en la ruta)
export const eliminar = async (id: string) => {
  verificarId(id);
  const tarea = await dao.eliminar(id);
  if (!tarea) throw new HttpError(404, "Tarea no encontrada");
  return tarea;
};
