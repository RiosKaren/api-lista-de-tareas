import { Request, Response, NextFunction } from "express";

// Muestra en consola el método, la URL, el código de respuesta y cuánto tardó
export const logger = (req: Request, res: Response, next: NextFunction) => {
  const inicio = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - inicio;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`);
  });
  next();
};
