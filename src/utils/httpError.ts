import { Response } from "express";

// Error con código de estado HTTP.
// El servicio lo lanza (por ejemplo, 400 o 404) y el controlador lo usa para responder.
export class HttpError extends Error {
  estado: number;

  constructor(estado: number, mensaje: string) {
    super(mensaje);
    this.estado = estado;
  }
}

// Respuesta de error común para todos los controladores (se llama dentro del catch)
export const manejarError = (error: unknown, res: Response) => {
  if (error instanceof HttpError) {
    return res.status(error.estado).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: "Error del servidor" });
};
