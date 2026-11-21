import { Router } from "express";
import * as controlador from "./controller";
import { verificarToken } from "../../middlewares/auth";

const router = Router();

router.post("/registro", controlador.registrar);              // POST /api/usuarios/registro
router.post("/login", controlador.iniciarSesion);             // POST /api/usuarios/login
router.get("/perfil", verificarToken, controlador.perfil);    // GET  /api/usuarios/perfil 
export default router;
