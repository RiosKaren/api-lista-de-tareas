import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Datos que guardamos en el token (nada sensible: ni email ni contraseña)
export interface DatosToken {
  id: string;
  rol: "usuario" | "admin";
}

// Request con el usuario autenticado
export interface RequestAutenticado extends Request {
  usuario?: DatosToken;
}

// Verifica el JWT del header "Authorization: Bearer <token>"
export const verificarToken = (req: RequestAutenticado, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET as string) as DatosToken;
    req.usuario = { id: datos.id, rol: datos.rol };
    next(); // sigue al controlador
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
};

// Solo deja pasar a usuarios con rol admin (se usa después de verificarToken)
export const esAdmin = (req: RequestAutenticado, res: Response, next: NextFunction) => {
  if (req.usuario?.rol !== "admin") {
    return res.status(403).json({ error: "Solo un administrador puede realizar esta acción" });
  }
  next();
};
