import { Router } from "express";
import * as controlador from "./controller";
import { verificarToken, esAdmin } from "../../middlewares/auth";

const router = Router();

// Todas las rutas de tareas piden token: cada usuario trabaja solo con sus tareas
router.get("/", verificarToken, controlador.obtenerTodas);               // GET    /api/tareas
router.get("/:id", verificarToken, controlador.obtenerPorId);            // GET    /api/tareas/:id
router.post("/", verificarToken, controlador.crear);                     // POST   /api/tareas
router.put("/:id", verificarToken, controlador.actualizar);              // PUT    /api/tareas/:id
router.delete("/:id", verificarToken, esAdmin, controlador.eliminar);    // DELETE /api/tareas/:id (solo admin)

export default router;
