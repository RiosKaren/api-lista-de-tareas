import "dotenv/config"; 
import express, { Request, Response, NextFunction } from "express";
import { conectarDB } from "./db";
import { logger } from "./middlewares/logger";
import rutasUsuario from "./components/usuario/routes";
import rutasTarea from "./components/tarea/routes";

const app = express();
const PUERTO = process.env.PORT || 3000;

app.use(express.json()); 
app.use(logger); 

app.use("/api/usuarios", rutasUsuario);
app.use("/api/tareas", rutasTarea);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.originalUrl} no encontrada` });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El body no es un JSON válido" });
  }
  console.error(err);
  res.status(500).json({ error: "Error del servidor" });
});

const iniciar = async () => {
  await conectarDB();
  app.listen(PUERTO, () => console.log(`Servidor en http://localhost:${PUERTO}`));
};

iniciar();
